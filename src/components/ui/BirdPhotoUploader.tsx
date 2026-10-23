/**
 * @license
 * Bird Academy Enterprise — Volière Manager
 * Composant de capture et sélection de photo d'oiseau (Chantier 3)
 * Offline-first, zéro dépendance externe, multi-plateforme (Android, Windows, Web).
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Image as ImageIcon, Trash2, RefreshCw, X, Check, AlertCircle } from 'lucide-react';
import { AppButton, AppAlert } from '../design-system';
import { ImageOptimizer } from '../../utils/imageOptimizer';
import { useLanguage } from '../../context/LanguageContext';

export interface BirdPhotoUploaderProps {
  photo?: string;
  onChange: (photo: string | undefined) => void;
  disabled?: boolean;
}

export const BirdPhotoUploader: React.FC<BirdPhotoUploaderProps> = ({
  photo,
  onChange,
  disabled = false,
}) => {
  const { t, isRtl } = useLanguage();

  // Mode caméra actif
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraState, setCameraState] = useState<'idle' | 'requesting' | 'active' | 'denied' | 'unavailable'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Arrêt propre du flux vidéo
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setCameraState('idle');
  }, []);

  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Lancement de la caméra
  const startCamera = async (mode: 'environment' | 'user' = 'environment') => {
    stopCamera();
    setErrorMessage(null);
    setCameraState('requesting');
    setIsCameraActive(true);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraState('unavailable');
      setErrorMessage(t('cameraUnavailable'));
      return;
    }

    try {
      let mediaStream: MediaStream | null = null;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch {
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: mode },
            audio: false,
          });
        } catch {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }
      }

      if (!mediaStream) {
        throw new Error('STREAM_EMPTY');
      }

      streamRef.current = mediaStream;
      setCameraState('active');

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.playsInline = true;
        videoRef.current.muted = true;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      const isDenied = err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError';
      if (isDenied) {
        setCameraState('denied');
        setErrorMessage(t('cameraDenied'));
      } else {
        setCameraState('unavailable');
        setErrorMessage(t('cameraUnavailable'));
      }
    }
  };

  // Capture instantanée de la photo depuis la caméra
  const handleCapturePhoto = () => {
    if (!videoRef.current || cameraState !== 'active') return;

    try {
      setIsProcessing(true);
      const compressedDataUrl = ImageOptimizer.captureFrameFromVideo(videoRef.current, {
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.82,
      });

      onChange(compressedDataUrl);
      stopCamera();
    } catch (err) {
      setErrorMessage(t('invalidImageFile'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Bascule caméra frontale / dorsale
  const handleToggleFacingMode = () => {
    const nextMode = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextMode);
    startCamera(nextMode);
  };

  // Sélection de fichier image depuis le disque (Windows / Android / Web)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const compressedDataUrl = await ImageOptimizer.compressImageFile(file, {
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.82,
      });

      onChange(compressedDataUrl);
    } catch (err) {
      setErrorMessage(t('invalidImageFile'));
    } finally {
      setIsProcessing(false);
      // Réinitialiser le input pour permettre de sélectionner à nouveau le même fichier si besoin
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Suppression de la photo existante
  const handleRemovePhoto = () => {
    onChange(undefined);
    setErrorMessage(null);
  };

  return (
    <div className={`space-y-3 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header section avec avertissement documentaire */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {t('birdPhotoSection')}
          </label>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {t('birdPhotoDesc')}
          </p>
        </div>

        {photo && !isCameraActive && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            <Check className="w-3.5 h-3.5" />
            {t('photoAttachedSuccess')}
          </span>
        )}
      </div>

      {/* Message d'erreur non bloquant */}
      {errorMessage && (
        <div data-testid="bird-photo-error-alert">
          <AppAlert type="warning" onClose={() => setErrorMessage(null)}>
            {errorMessage}
          </AppAlert>
        </div>
      )}

      {/* Vue live caméra */}
      {isCameraActive ? (
        <div 
          data-testid="bird-photo-camera-container"
          className="relative bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex flex-col items-center justify-center min-h-[260px] max-h-[360px]"
        >
          <video
            ref={videoRef}
            data-testid="bird-photo-camera-video"
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover max-h-[320px]"
          />

          {cameraState === 'requesting' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 text-white gap-2">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
              <span className="text-xs font-medium">{t('photoProcessing')}</span>
            </div>
          )}

          {/* Contrôles caméra superposés */}
          <div className="absolute bottom-3 inset-x-3 flex items-center justify-between gap-2 z-10 bg-slate-900/80 backdrop-blur-xs p-2 rounded-xl border border-slate-800">
            <AppButton
              type="button"
              variant="outline"
              size="sm"
              onClick={handleToggleFacingMode}
              title={t('cameraSwitch')}
              disabled={isProcessing}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              {t('cameraSwitch')}
            </AppButton>

            <button
              type="button"
              data-testid="bird-photo-capture-btn"
              onClick={handleCapturePhoto}
              disabled={isProcessing || cameraState !== 'active'}
              className="py-2 px-5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-transform"
            >
              <Camera className="w-4 h-4" />
              {t('capturePhotoAction')}
            </button>

            <AppButton
              type="button"
              variant="outline"
              size="sm"
              data-testid="bird-photo-camera-cancel-btn"
              onClick={stopCamera}
              disabled={isProcessing}
            >
              <X className="w-4 h-4 mr-1" />
              {t('cancel')}
            </AppButton>
          </div>
        </div>
      ) : (
        /* Zone d'affichage et sélection de photo */
        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          
          {/* Cadre d'aperçu de la photo */}
          <div 
            data-testid="bird-photo-preview-frame"
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-800 flex items-center justify-center shrink-0 shadow-inner relative group"
          >
            {photo ? (
              <>
                <img
                  src={photo}
                  alt="Aperçu oiseau"
                  data-testid="bird-photo-preview-img"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  data-testid="bird-photo-remove-btn"
                  onClick={handleRemovePhoto}
                  disabled={disabled}
                  className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-rose-600/90 hover:bg-rose-500 text-white shadow-md cursor-pointer transition-opacity"
                  title={t('removePhoto')}
                  aria-label={t('removePhoto')}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-slate-400 dark:text-slate-500 text-center p-2">
                <ImageIcon className="w-8 h-8" />
                <span className="text-[10px] font-semibold">{t('noPhotoAvailable')}</span>
              </div>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="flex-1 flex flex-col justify-center gap-2.5 w-full sm:w-auto">
            {/* Input fichier caché pour l'import */}
            <input
              ref={fileInputRef}
              type="file"
              data-testid="bird-photo-file-input"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
              disabled={disabled || isProcessing}
            />

            <div className="flex flex-wrap gap-2">
              {/* Bouton Prendre une photo */}
              <button
                type="button"
                data-testid="bird-photo-take-btn"
                onClick={() => startCamera(cameraFacing)}
                disabled={disabled || isProcessing}
                className="flex-1 sm:flex-none py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
                {t('takePhoto')}
              </button>

              {/* Bouton Choisir / Importer une photo */}
              <button
                type="button"
                data-testid="bird-photo-choose-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isProcessing}
                className="flex-1 sm:flex-none py-2 px-3.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-300 dark:border-slate-700 disabled:opacity-50"
              >
                <ImageIcon className="w-4 h-4 text-emerald-500" />
                {photo ? t('replacePhoto') : t('choosePhoto')}
              </button>

              {/* Bouton Supprimer direct */}
              {photo && (
                <button
                  type="button"
                  data-testid="bird-photo-delete-action-btn"
                  onClick={handleRemovePhoto}
                  disabled={disabled || isProcessing}
                  className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-rose-200 dark:border-rose-900/50 disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {t('removePhoto')}
                </button>
              )}
            </div>

            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Formats supportés : JPG, PNG, WebP. Compression automatique appliquée côté client.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
