/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY USER - QR CODE SCANNER COMPONENT (V1.3.0 ROOT FIX)
 * Real-time 100% offline camera scanner for LMSE license QR payloads.
 * Supports Android 16 Capacitor WebView & Web browsers.
 */

import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { Capacitor } from '@capacitor/core';
import { BUILD_ID } from '../../../config/appMode';
import { useLanguage } from '../../../context/LanguageContext';
import { AppButton, AppAlert } from '../../../components/design-system';
import { Camera, X, RefreshCw, Upload, Key, Play, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';

export interface QrCodeScannerModalProps {
  onScanSuccess: (qrData: string) => void;
  onCancel: () => void;
  onFallbackToFile?: () => void;
  onFallbackToKey?: () => void;
  isOpen?: boolean;
}

export const QrCodeScannerModal: React.FC<QrCodeScannerModalProps> = ({
  onScanSuccess,
  onCancel,
  onFallbackToFile,
  onFallbackToKey,
}) => {
  const { t, isRtl } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<'idle' | 'requesting' | 'active' | 'denied' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastDiagnosticCode, setLastDiagnosticCode] = useState<string | null>(null);
  const [manualText, setManualText] = useState<string>('');
  const [showManualPaste, setShowManualPaste] = useState<boolean>(false);
  const [isVideoPaused, setIsVideoPaused] = useState<boolean>(false);
  const [isProcessingImage, setIsProcessingImage] = useState<boolean>(false);

  const scanIntervalRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const logDiagnostic = (code: string, details: string) => {
    setLastDiagnosticCode(code);
    console.info(`[QR-DIAGNOSTIC] ${code}: ${details}`);
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      window.clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (animFrameRef.current) {
      window.cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
      setStream(null);
    }
  };

  const startCamera = async () => {
    stopCamera();
    logDiagnostic('QR-01', `component mounted (${BUILD_ID})`);

    const platform = Capacitor.getPlatform();
    logDiagnostic('QR-02', `platform detected: ${platform}`);

    const isAndroid = platform === 'android';
    if (isAndroid) {
      logDiagnostic('QR-03', 'android detected');
    }

    setCameraState('requesting');
    setErrorMessage(null);

    logDiagnostic('QR-04', 'permission requested');

    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        logDiagnostic('QR-05', 'permission result: denied (getUserMedia unavailable)');
        setCameraState('denied');
        setErrorMessage(t('cameraUnavailableDesktop') || 'Caméra non disponible sur cet appareil.');
        return;
      }

      logDiagnostic('QR-06', 'getUserMedia started');

      let mediaStream: MediaStream | null = null;
      
      // Constraint 1: Back camera ideal 720p
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (e1) {
        // Constraint 2: Environment basic
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
            audio: false,
          });
        } catch (e2) {
          // Constraint 3: Any video track
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }
      }

      if (!mediaStream) {
        throw new Error('No media stream produced');
      }

      logDiagnostic('QR-05', 'permission result: granted');
      logDiagnostic('QR-07', `stream received with ${mediaStream.getVideoTracks().length} video track(s)`);

      setStream(mediaStream);
      streamRef.current = mediaStream;
      setCameraState('active');
    } catch (err: any) {
      console.error('Camera access error:', err);
      const isDenied = err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError';
      const isNotFound = err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError';

      if (isDenied) {
        logDiagnostic('QR-05', 'permission result: denied by user or policy');
      } else {
        logDiagnostic('QR-05', `permission result: error (${err?.name || err?.message || 'unknown'})`);
      }

      setCameraState('denied');
      const errTxt = isNotFound
        ? (t('cameraUnavailableDesktop') || 'Aucune caméra disponible sur cet appareil.')
        : isDenied
        ? (t('cameraDeniedError') || 'Permission d\'accès à la caméra refusée.')
        : err?.message || (t('cameraUnavailableDesktop') || 'Impossible d\'accéder à la caméra.');
      setErrorMessage(errTxt);
    }
  };

  // Decode QR Code from Selected Image File (PNG, JPG, JPEG, WebP)
  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingImage(true);
    setErrorMessage(null);
    logDiagnostic('QR-14', `Image file selected: type=${file.type}, size=${file.size}B`);

    try {
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
            
            logDiagnostic('QR-11', 'decoder initialized for image file');
            logDiagnostic('QR-12', 'decoder running on image file');

            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'attemptBoth',
            });

            if (code && code.data && code.data.trim()) {
              const payload = code.data.trim();
              logDiagnostic('QR-13', 'QR detected in image');
              logDiagnostic('QR-14', `payload extracted (length=${payload.length})`);
              URL.revokeObjectURL(objectUrl);
              setIsProcessingImage(false);
              stopCamera();
              logDiagnostic('QR-15', 'payload submitted to LMSE importer');
              onScanSuccess(payload);
              return;
            }
          }

          logDiagnostic('QR-18', 'LMSE validation failure: No QR code found in image');
          setErrorMessage('Aucun QR code lisible trouvé dans cette image. Veuillez sélectionner une photo plus nette.');
        } catch (err: any) {
          logDiagnostic('QR-18', `LMSE validation failure: Image decode error (${err?.message})`);
          setErrorMessage('Erreur lors du décodage de l\'image QR.');
        } finally {
          URL.revokeObjectURL(objectUrl);
          setIsProcessingImage(false);
        }
      };

      img.onerror = () => {
        logDiagnostic('QR-18', 'LMSE validation failure: Failed to load image');
        setErrorMessage('Fichier image invalide ou illisible.');
        URL.revokeObjectURL(objectUrl);
        setIsProcessingImage(false);
      };

      img.src = objectUrl;
    } catch (err: any) {
      logDiagnostic('QR-18', `LMSE validation failure: File load exception (${err?.message})`);
      setErrorMessage('Impossible d\'ouvrir l\'image.');
      setIsProcessingImage(false);
    }
  };

  // Bind video stream & verify metadata & non-zero video dimensions
  useEffect(() => {
    if (cameraState === 'active' && stream && videoRef.current) {
      const video = videoRef.current;
      video.srcObject = stream;
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.autoplay = true;
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');
      video.setAttribute('autoplay', '');

      const verifyAndPlay = async () => {
        try {
          logDiagnostic('QR-08', 'video metadata loaded');
          await video.play();
          logDiagnostic('QR-09', 'video.play completed');

          // Dimension check mandatory according to A4 rules
          if (video.videoWidth > 0 && video.videoHeight > 0) {
            logDiagnostic('QR-10', `video dimensions valid: ${video.videoWidth}x${video.videoHeight}`);
            setIsVideoPaused(false);
            logDiagnostic('QR-11', 'decoder initialized');
            logDiagnostic('QR-12', 'decoder running');
          } else {
            // Wait up to 1.5s for video dimensions to report > 0
            let attempts = 0;
            const checkDimInterval = window.setInterval(() => {
              attempts++;
              if (video.videoWidth > 0 && video.videoHeight > 0) {
                window.clearInterval(checkDimInterval);
                logDiagnostic('QR-10', `video dimensions valid after retry: ${video.videoWidth}x${video.videoHeight}`);
                setIsVideoPaused(false);
                logDiagnostic('QR-11', 'decoder initialized');
                logDiagnostic('QR-12', 'decoder running');
              } else if (attempts >= 15) {
                window.clearInterval(checkDimInterval);
                logDiagnostic('QR-10', 'video dimensions invalid (videoWidth=0) - Camera hardware stream failed');
                setCameraState('error');
                setErrorMessage('La caméra ne transmet aucun flux vidéo valide. Veuillez utiliser le décodage par image QR.');
              }
            }, 100);
          }
        } catch (playErr: any) {
          console.warn('Camera autoplay blocked:', playErr);
          logDiagnostic('QR-09', `video.play error: ${playErr?.message}`);
          setIsVideoPaused(true);
        }
      };

      video.onloadedmetadata = verifyAndPlay;
      video.oncanplay = verifyAndPlay;
      verifyAndPlay();
    }
  }, [stream, cameraState]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // Real-time Camera Frame Decoding Loop
  useEffect(() => {
    if (cameraState !== 'active' || !stream) return;

    const canvas = canvasRef.current || document.createElement('canvas');
    canvasRef.current = canvas;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const scanFrame = () => {
      const video = videoRef.current;
      if (!video || !ctx) return;

      if (video.paused) {
        setIsVideoPaused(true);
        video.play().catch(() => {});
        return;
      } else {
        setIsVideoPaused(false);
      }

      if (video.readyState < video.HAVE_CURRENT_DATA) return;
      if (video.videoWidth === 0 || video.videoHeight === 0) return;

      const rawWidth = video.videoWidth;
      const rawHeight = video.videoHeight;

      const maxDim = 800;
      let targetWidth = rawWidth;
      let targetHeight = rawHeight;
      if (rawWidth > maxDim || rawHeight > maxDim) {
        if (rawWidth >= rawHeight) {
          targetWidth = maxDim;
          targetHeight = Math.round((rawHeight * maxDim) / rawWidth);
        } else {
          targetHeight = maxDim;
          targetWidth = Math.round((rawWidth * maxDim) / rawHeight);
        }
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
      const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);

      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth',
      });

      if (code && code.data && code.data.trim()) {
        const payload = code.data.trim();
        logDiagnostic('QR-13', 'QR detected in live camera frame');
        logDiagnostic('QR-14', `payload extracted (length=${payload.length})`);
        stopCamera();
        logDiagnostic('QR-15', 'payload submitted to LMSE importer');
        onScanSuccess(payload);
      }
    };

    scanIntervalRef.current = window.setInterval(scanFrame, 100);

    return () => {
      if (scanIntervalRef.current) {
        window.clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
    };
  }, [cameraState, stream]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualText.trim()) {
      const payload = manualText.trim();
      logDiagnostic('QR-14', `Manual text payload extracted (length=${payload.length})`);
      stopCamera();
      logDiagnostic('QR-15', 'payload submitted to LMSE importer');
      onScanSuccess(payload);
    }
  };

  const forcePlayVideo = () => {
    if (videoRef.current) {
      videoRef.current.play().then(() => setIsVideoPaused(false)).catch(() => {});
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="space-y-5 bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-800 text-slate-100 shadow-xl"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-indigo-400 shrink-0" />
          <h3 className="font-bold text-white text-base tracking-tight">{t('scanLicenseTitle')}</h3>
        </div>
        <button
          type="button"
          onClick={() => {
            stopCamera();
            onCancel();
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title={t('cancelBtn')}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Camera Live View & Viewfinder */}
      {cameraState === 'active' && (
        <div className="space-y-4">
          <div
            onClick={forcePlayVideo}
            className="relative w-full aspect-square max-w-xs sm:max-w-sm mx-auto bg-slate-950 rounded-2xl overflow-hidden border-2 border-indigo-500/50 shadow-2xl cursor-pointer"
          >
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />

            {/* Target overlay / Viseur */}
            <div className="absolute inset-0 border-[28px] sm:border-[36px] border-slate-950/70 pointer-events-none flex items-center justify-center">
              <div className="w-48 h-48 sm:w-56 sm:h-56 border-2 border-indigo-400 rounded-2xl relative shadow-[0_0_20px_rgba(99,102,241,0.6)]">
                {/* Corner markers */}
                <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-indigo-400 rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-indigo-400 rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-indigo-400 rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-indigo-400 rounded-br-lg" />

                {/* Animated scan line */}
                <motion.div
                  animate={{ y: [0, 180, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-full h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_10px_#818cf8]"
                />
              </div>
            </div>

            {/* Click to play prompt if video paused */}
            {isVideoPaused && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-10">
                <div className="w-12 h-12 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center mb-2 text-indigo-400 animate-bounce">
                  <Play className="w-6 h-6 fill-indigo-400" />
                </div>
                <span className="text-xs font-bold text-white">Appuyez pour activer le flux caméra</span>
                <span className="text-[10px] text-slate-400 mt-1">(Autorisation vidéo Android WebView)</span>
              </div>
            )}

            <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none z-20">
              <span className="bg-slate-950/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold text-emerald-400 border border-emerald-500/40 shadow-md">
                ● 100% Hors Ligne
              </span>
            </div>
          </div>

          <p className="text-center text-xs sm:text-sm text-slate-200 font-semibold">
            {t('scanQrFrameInstruction')}
          </p>
        </div>
      )}

      {/* Requesting Camera State */}
      {cameraState === 'requesting' && (
        <div className="p-8 text-center space-y-3 bg-slate-950 border border-slate-800 rounded-2xl">
          <div className="w-14 h-14 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400 animate-pulse">
            <Camera className="w-7 h-7" />
          </div>
          <p className="text-sm font-bold text-white">{t('cameraPermissionPrompt')}</p>
          <p className="text-xs text-slate-400">Initialisation du matériel vidéo Android...</p>
        </div>
      )}

      {/* Denied / Error State - Immediate Option to Import Image QR */}
      {(cameraState === 'denied' || cameraState === 'error') && (
        <div className="space-y-4">
          <AppAlert type="danger" title={t('invalidLicense')}>
            {errorMessage || t('cameraDeniedError')}
          </AppAlert>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <p className="text-xs text-slate-200 font-semibold flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-indigo-400" />
              <span>Accès caméra non disponible. Choisissez une alternative :</span>
            </p>

            <div className="pt-1">
              <AppButton
                variant="primary"
                type="button"
                disabled={isProcessingImage}
                onClick={() => fileInputRef.current?.click()}
                className="w-full text-xs py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center gap-2 rounded-xl"
              >
                <Upload className="w-4 h-4 text-white" />
                <span>{isProcessingImage ? 'Décodage de l\'image...' : 'Importer une Image QR (PNG, JPG, WebP)'}</span>
              </AppButton>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {onFallbackToFile && (
                <AppButton
                  variant="secondary"
                  onClick={onFallbackToFile}
                  className="w-full text-xs py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold flex items-center justify-center gap-1.5 rounded-xl"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{t('importLmseFile')}</span>
                </AppButton>
              )}

              {onFallbackToKey && (
                <AppButton
                  variant="secondary"
                  onClick={onFallbackToKey}
                  className="w-full text-xs py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold flex items-center justify-center gap-1.5 rounded-xl"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>{t('licenseKey')}</span>
                </AppButton>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Manual Paste toggle & input fallback */}
      <div className="pt-3 border-t border-slate-800 space-y-3">
        <div className="flex justify-between items-center text-xs">
          <button
            type="button"
            onClick={() => setShowManualPaste(!showManualPaste)}
            className="text-indigo-400 hover:text-indigo-300 font-semibold underline cursor-pointer"
          >
            {showManualPaste ? 'Masquer la saisie manuelle QR' : 'Saisir / Coller le contenu QR manuellement'}
          </button>

          {cameraState !== 'active' && (
            <button
              type="button"
              onClick={startCamera}
              className="text-slate-300 hover:text-white flex items-center gap-1 font-semibold cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Réessayer la caméra</span>
            </button>
          )}
        </div>

        {showManualPaste && (
          <form onSubmit={handleManualSubmit} className="space-y-3 pt-1">
            <textarea
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder='{"format":"bird-academy-lmse", ...}'
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-amber-300 focus:outline-none focus:border-indigo-500"
            />
            <AppButton
              variant="primary"
              type="submit"
              disabled={!manualText.trim()}
              className="w-full text-xs py-2.5 bg-indigo-600 hover:bg-indigo-500 font-bold text-white rounded-xl"
            >
              Valider le texte QR
            </AppButton>
          </form>
        )}

        {/* Hidden File Input for QR Image Decoding */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={handleImageFileSelect}
          className="hidden"
        />

        {/* QR Image Upload Option Button (Active when camera is running too) */}
        {cameraState === 'active' && (
          <div className="pt-2">
            <AppButton
              variant="secondary"
              type="button"
              disabled={isProcessingImage}
              onClick={() => fileInputRef.current?.click()}
              className="w-full text-xs py-2.5 bg-indigo-950/60 hover:bg-indigo-900/50 border border-indigo-500/40 text-indigo-200 font-semibold flex items-center justify-center gap-2 rounded-xl"
            >
              <Upload className="w-4 h-4 text-indigo-400" />
              <span>{isProcessingImage ? 'Décodage de l\'image QR...' : 'Importer une Image QR (PNG, JPG, WebP)'}</span>
            </AppButton>
          </div>
        )}

        <div className="flex justify-end pt-1">
          <AppButton
            variant="secondary"
            onClick={() => {
              stopCamera();
              onCancel();
            }}
            className="text-xs py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl"
          >
            {t('cancelBtn')}
          </AppButton>
        </div>
      </div>
    </motion.div>
  );
};
