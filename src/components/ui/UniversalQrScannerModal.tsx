/**
 * @license
 * Bird Academy Enterprise — Volière Manager
 * Modal de Lecture et Scan Universel de QR Codes (Chantier 2)
 * 
 * Supporte :
 * 1. Flux caméra en direct via getUserMedia et jsQR (Web, Electron Desktop, Android Capacitor)
 * 2. Bascule caméra arrière / avant
 * 3. Import / décodage d'image de QR code (PNG, JPG, WebP)
 * 4. Saisie ou collage manuel direct du code BA:...
 * 5. Gestion sécurisée des permissions et erreurs matérielles sans crash
 * 6. Résolution 100% hors ligne via SmartQrCodeResolver
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import { 
  Camera, X, RefreshCw, Upload, Sparkles, AlertCircle, CheckCircle2, 
  HelpCircle, QrCode, FlipHorizontal, ArrowRight, CornerDownLeft
} from 'lucide-react';
import { AppModal, AppButton, AppAlert, AppInput } from '../design-system';
import { useLanguage } from '../../context/LanguageContext';
import { 
  SmartQrCodeResolver, 
  SmartQrResolutionResult, 
  SmartQrResolutionSuccess 
} from '../../features/qr/services/SmartQrCodeResolver';
import { CameraPermissionService } from '../../features/qr/services/CameraPermissionService';

export interface UniversalQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResolved: (result: SmartQrResolutionSuccess) => void;
}

export const UniversalQrScannerModal: React.FC<UniversalQrScannerModalProps> = ({
  isOpen,
  onClose,
  onResolved
}) => {
  const { t, isRtl } = useLanguage();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<'idle' | 'requesting' | 'active' | 'denied' | 'unavailable' | 'error'>('idle');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState<string>('');
  const [isProcessingImage, setIsProcessingImage] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<SmartQrResolutionResult | null>(null);

  const animFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isResolvingRef = useRef<boolean>(false);
  const isAcquiringRef = useRef<boolean>(false);

  // Arrêt complet et propre du flux caméra (stable, sans dépendance stream)
  const stopCamera = useCallback(() => {
    if (animFrameRef.current) {
      window.cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try { track.stop(); } catch (_) {}
      });
      streamRef.current = null;
    }
    setStream(null);
  }, []);

  // Traitement d'un code QR décodé
  const handleDecodedString = useCallback((decoded: string) => {
    if (isResolvingRef.current) return;
    isResolvingRef.current = true;

    const result = SmartQrCodeResolver.resolve(decoded);
    setScanResult(result);

    if (result.success) {
      // Succès : arrêt immédiat de la caméra et notification
      stopCamera();
      setTimeout(() => {
        onResolved(result);
        onClose();
        isResolvingRef.current = false;
      }, 500);
    } else {
      // Erreur de format ou introuvable : avertissement utilisateur sans crash
      setErrorMessage(result.message);
      setTimeout(() => {
        isResolvingRef.current = false;
      }, 1500);
    }
  }, [onResolved, onClose, stopCamera]);

  // Démarrage du flux caméra avec gestion Android / Web / Desktop (un seul getUserMedia direct)
  const startCamera = useCallback(async (mode: 'environment' | 'user' = 'environment') => {
    if (isAcquiringRef.current) return;
    isAcquiringRef.current = true;

    try {
      stopCamera();
      setCameraState('requesting');
      setErrorMessage(null);
      setScanResult(null);

      const isAndroid = CameraPermissionService.isAndroidNative();

      // 1. Vérification préalable de la permission (sans acquisition concurrente de flux)
      const permResult = await CameraPermissionService.requestCameraPermission();
      if (!permResult.granted) {
        if (permResult.state === 'denied') {
          setCameraState('denied');
          setErrorMessage(isAndroid ? t('qrCameraDeniedAndroid') : t('qrCameraDeniedWeb'));
        } else {
          setCameraState('unavailable');
          setErrorMessage(t('qrCameraUnavailable'));
        }
        return;
      }

      // 2. Vérification de la disponibilité de getUserMedia
      if (!navigator?.mediaDevices?.getUserMedia) {
        setCameraState('unavailable');
        setErrorMessage(t('qrCameraUnavailable'));
        return;
      }

      // 3. Unique acquisition du flux vidéo avec contraintes souples (ideal)
      let mediaStream: MediaStream | null = null;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
      } catch (err1) {
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: mode }
            },
            audio: false
          });
        } catch (err2) {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
        }
      }

      if (!mediaStream) {
        throw new Error('Aucun flux vidéo obtenu');
      }

      streamRef.current = mediaStream;
      setStream(mediaStream);
      setCameraState('active');
    } catch (err: any) {
      const errName = err?.name || '';
      const isDenied = errName === 'NotAllowedError' || errName === 'PermissionDeniedError';
      const isNotFound = errName === 'NotFoundError' || errName === 'DevicesNotFoundError';
      const isNotReadable = errName === 'NotReadableError' || errName === 'TrackStartError';
      const isAbort = errName === 'AbortError';
      const isOverconstrained = errName === 'OverconstrainedError';

      if (isDenied) {
        setCameraState('denied');
        const isAndroid = CameraPermissionService.isAndroidNative();
        setErrorMessage(isAndroid ? t('qrCameraDeniedAndroid') : t('qrCameraDeniedWeb'));
      } else if (isNotFound) {
        setCameraState('unavailable');
        setErrorMessage(t('qrCameraUnavailable'));
      } else if (isNotReadable) {
        setCameraState('error');
        setErrorMessage('La caméra est occupée ou n\'a pas pu démarrer. Veuillez réessayer.');
      } else if (isAbort) {
        setCameraState('error');
        setErrorMessage('L\'initialisation de la caméra a été interrompue. Veuillez réessayer.');
      } else if (isOverconstrained) {
        setCameraState('error');
        setErrorMessage('Les contraintes vidéo demandées ne sont pas supportées par cet appareil.');
      } else {
        setCameraState('error');
        setErrorMessage(err?.message ? `Erreur caméra (${errName}): ${err.message}` : `Erreur d'accès à la caméra (${errName || 'inconnue'}).`);
      }
    } finally {
      isAcquiringRef.current = false;
    }
  }, [stopCamera, t]);

  // Boucle de scan de frames avec jsQR
  useEffect(() => {
    if (cameraState !== 'active' || !stream || !videoRef.current) return;

    const video = videoRef.current;
    video.srcObject = stream;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('autoplay', '');
    video.play().catch(() => {});

    let isScanning = true;

    const scanFrame = () => {
      if (!isScanning) return;

      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0 && video.videoHeight > 0) {
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          try {
            const code = jsQR(imgData.data, imgData.width, imgData.height, {
              inversionAttempts: 'attemptBoth'
            });

            if (code && code.data && code.data.trim()) {
              handleDecodedString(code.data.trim());
            }
          } catch (e) {
            // Ignorer les erreurs d'une frame isolée
          }
        }
      }

      if (isScanning && !isResolvingRef.current) {
        animFrameRef.current = window.requestAnimationFrame(scanFrame);
      }
    };

    animFrameRef.current = window.requestAnimationFrame(scanFrame);

    return () => {
      isScanning = false;
      if (animFrameRef.current) {
        window.cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [cameraState, stream, handleDecodedString]);

  // Déclencheur au montage / ouverture
  useEffect(() => {
    if (isOpen) {
      isResolvingRef.current = false;
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  // Décodage d'un fichier image (PNG, JPG, WebP)
  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingImage(true);
    setErrorMessage(null);

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        let w = img.width;
        let h = img.height;
        const maxDim = 1200;
        if (w > maxDim || h > maxDim) {
          if (w >= h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;

        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const imageData = ctx.getImageData(0, 0, w, h);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth'
          });

          if (code && code.data && code.data.trim()) {
            handleDecodedString(code.data.trim());
            return;
          }
        }
        setErrorMessage('Aucun QR code lisible trouvé dans cette image.');
      } catch (err: any) {
        setErrorMessage('Erreur lors du décodage de l’image.');
      } finally {
        URL.revokeObjectURL(objectUrl);
        setIsProcessingImage(false);
      }
    };

    img.onerror = () => {
      setErrorMessage('Fichier image invalide ou illisible.');
      URL.revokeObjectURL(objectUrl);
      setIsProcessingImage(false);
    };

    img.src = objectUrl;
  };

  // Soumission manuelle
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleDecodedString(manualCode.trim());
  };

  const handleToggleFacingMode = () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    startCamera(next);
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={() => {
        stopCamera();
        onClose();
      }}
      title="Scanner un Smart QR Code"
      size="md"
    >
      <div 
        data-testid="universal-qr-scanner-modal"
        className={`space-y-4 text-slate-100 font-sans ${isRtl ? 'rtl' : 'ltr'}`} 
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Instruction Header */}
        <p className="text-xs text-slate-400 text-center">
          Placez le QR Code généré par Bird Academy dans le cadre pour ouvrir instantanément sa fiche.
        </p>

        {/* Feedback / Alert */}
        {errorMessage && (
          <div data-testid="qr-scanner-error-alert">
            <AppAlert type="warning" title="Notification">
              {errorMessage}
            </AppAlert>
          </div>
        )}

        {scanResult?.success && (
          <div data-testid="qr-scanner-success-alert" className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-bold">{scanResult.message} ({scanResult.label})</span>
          </div>
        )}

        {/* Viewport Caméra */}
        <div className="relative w-full aspect-square max-w-[340px] mx-auto rounded-3xl overflow-hidden bg-slate-950 border-2 border-slate-800 shadow-2xl flex items-center justify-center">
          {cameraState === 'active' ? (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
                autoPlay
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Cadre de visée animé */}
              <div className="absolute inset-8 pointer-events-none flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl shadow-xs shadow-emerald-500/50" />
                  <div className="w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl shadow-xs shadow-emerald-500/50" />
                </div>
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />
                <div className="flex justify-between">
                  <div className="w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl shadow-xs shadow-emerald-500/50" />
                  <div className="w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-xl shadow-xs shadow-emerald-500/50" />
                </div>
              </div>

              {/* Bouton bascule caméra */}
              <button
                type="button"
                onClick={handleToggleFacingMode}
                className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/50 cursor-pointer shadow-md transition-all"
                title="Basculer la caméra"
                aria-label="Basculer la caméra"
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>
            </>
          ) : cameraState === 'requesting' ? (
            <div className="flex flex-col items-center gap-3 p-6 text-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
              <span className="text-xs font-semibold">{t('qrCameraInitializing')}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 p-6 text-center text-slate-400">
              <Camera className="w-10 h-10 text-slate-600" />
              <span className="text-xs font-medium text-amber-300/90 max-w-[280px]">
                {cameraState === 'denied'
                  ? (CameraPermissionService.isAndroidNative() ? t('qrCameraDeniedAndroid') : t('qrCameraDeniedWeb'))
                  : cameraState === 'unavailable'
                  ? t('qrCameraUnavailable')
                  : (errorMessage || t('qrCameraUnavailable'))}
              </span>
              <AppButton
                variant="outline"
                size="sm"
                onClick={() => startCamera(facingMode)}
                className="mt-1"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                {t('qrCameraRetry')}
              </AppButton>
            </div>
          )}
        </div>

        {/* Fallbacks : Import Image ou Saisie manuelle */}
        <div className="pt-2 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageFileSelect}
            />
            <button
              type="button"
              data-testid="scanner-upload-image-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessingImage}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span>{isProcessingImage ? 'Analyse...' : 'Importer une image'}</span>
            </button>
          </div>

          {/* Formulaire de saisie/simulation de code */}
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              data-testid="qr-manual-input"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="ex. BA:BIRD:FR-2024-0101 ou BA:CAGE:1"
              className="flex-1 text-xs bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 outline-none focus:border-blue-500 font-mono"
            />
            <AppButton
              type="submit"
              variant="primary"
              size="sm"
              data-testid="qr-manual-submit-btn"
              disabled={!manualCode.trim()}
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </AppButton>
          </form>
        </div>

        {/* Bouton Annuler */}
        <div className="pt-2 flex justify-end">
          <AppButton
            variant="outline"
            size="md"
            data-testid="qr-scanner-cancel-btn"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-full sm:w-auto"
          >
            Annuler
          </AppButton>
        </div>
      </div>
    </AppModal>
  );
};

export default UniversalQrScannerModal;
