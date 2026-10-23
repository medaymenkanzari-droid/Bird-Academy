/**
 * @license
 * Bird Academy Enterprise — Volière Manager
 * Modale de gestion et modification directe de la photo d'un oiseau
 * Offline-first, zéro dépendance externe.
 */

import React, { useState } from 'react';
import { Camera, Check, X } from 'lucide-react';
import { Canari } from '../../../types';
import { BirdService } from '../services/BirdService';
import { BirdPhotoUploader } from '../../../components/ui/BirdPhotoUploader';
import { AppModal, AppButton } from '../../../components/design-system';
import { useLanguage } from '../../../context/LanguageContext';

export interface BirdPhotoEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  bird: Canari;
  onSave?: (updatedBird: Canari) => void;
}

export const BirdPhotoEditModal: React.FC<BirdPhotoEditModalProps> = ({
  isOpen,
  onClose,
  bird,
  onSave,
}) => {
  const { t, isRtl } = useLanguage();
  const initialPhoto = bird.photo || (bird.photos && bird.photos.length > 0 ? bird.photos[0] : '');
  const [currentPhoto, setCurrentPhoto] = useState<string>(initialPhoto);

  if (!isOpen) return null;

  const handleSave = () => {
    const existingPhotos = bird.photos ? [...bird.photos] : (bird.photo ? [bird.photo] : []);
    let updatedBird: Canari;

    if (currentPhoto && currentPhoto.trim() !== '') {
      // Si une photo est définie (ajout ou remplacement)
      // Conserver les autres photos de la galerie sans doublon
      const otherPhotos = existingPhotos.filter(p => p !== bird.photo && p !== currentPhoto);
      const updatedPhotos = [currentPhoto, ...otherPhotos];
      updatedBird = {
        ...bird,
        photo: currentPhoto,
        photos: updatedPhotos,
      };
    } else {
      // Suppression de la photo principale
      // Conserver la logique existante : si d'autres photos existent, la suivante devient principale
      const remainingPhotos = existingPhotos.filter(p => p !== bird.photo);
      updatedBird = {
        ...bird,
        photo: remainingPhotos[0] || '',
        photos: remainingPhotos,
      };
    }

    // Persistance locale
    BirdService.editBird(updatedBird);
    if (onSave) {
      onSave(updatedBird);
    }
    onClose();
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('birdPhotoSection')}
      size="md"
      className="p-4 sm:p-6 bg-slate-900 border-slate-800 text-white"
    >
      <div className={`space-y-6 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'} data-testid="bird-photo-modal">
        {/* Identité rapide de l'oiseau ciblé */}
        <div className="flex items-center gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>{bird.nom || 'Sans nom'}</span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-emerald-300">
                {bird.bague || 'SANS-BAGUE'}
              </span>
            </div>
            <p className="text-2xs text-slate-400 mt-0.5">
              {t('birdPhotoDesc')}
            </p>
          </div>
        </div>

        {/* Composant Uploader réutilisé */}
        <BirdPhotoUploader
          photo={currentPhoto}
          onChange={(newPhoto) => setCurrentPhoto(newPhoto || '')}
        />

        {/* Actions du footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <AppButton
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            data-testid="bird-photo-cancel-btn"
          >
            <X className="w-4 h-4 mr-1.5" />
            {t('cancel')}
          </AppButton>

          <AppButton
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSave}
            data-testid="bird-photo-save-btn"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
          >
            <Check className="w-4 h-4 mr-1.5" />
            {t('save')}
          </AppButton>
        </div>
      </div>
    </AppModal>
  );
};

export default BirdPhotoEditModal;
