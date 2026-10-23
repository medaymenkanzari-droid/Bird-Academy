/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — MISSION V1.9.6
 * MODAL DE DÉPLACEMENT CONTRÔLÉ & PROGRESSIF : ZONE -> VOLIÈRE -> CAGE
 * Fichier : src/features/habitat/components/BirdMoveModal.tsx
 * 
 * Affiche clairement avant validation :
 * - Oiseau actuel : Zone -> Volière -> Cage
 * - Nouvelle destination : Zone -> Volière -> Cage
 * Explications factuelles en cas de non-disponibilité.
 */

import React, { useState, useEffect } from 'react';
import { 
  ArrowRightLeft, ArrowRight, ShieldAlert, CheckCircle, 
  AlertTriangle, Home, User, Check, X 
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { AppModal, AppButton, AppInput, AppSelect } from '../../../components/design-system';
import { 
  Zone, Aviary, HabitatCage, Canari, QuarantineArea 
} from '../../../types';
import { HabitatIntegrityService } from '../services/HabitatIntegrityService';
import { HabitatService } from '../services/HabitatService';
import { calculateCageOccupancy } from '../utils/cageOccupancy';

interface BirdMoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  birds: Canari[];
  zones: Zone[];
  aviaries: Aviary[];
  cages: HabitatCage[];
  quarantineAreas: QuarantineArea[];
  preselectedBird?: Canari | null;
  onMoveSuccess?: () => void;
}

export const BirdMoveModal: React.FC<BirdMoveModalProps> = ({
  isOpen,
  onClose,
  birds,
  zones,
  aviaries,
  cages,
  quarantineAreas,
  preselectedBird,
  onMoveSuccess
}) => {
  const { t, language, isRtl } = useLanguage();
  const [selectedBirdId, setSelectedBirdId] = useState<string>('');
  const [destinationType, setDestinationType] = useState<'cage' | 'aviary' | 'zone' | 'quarantineArea'>('cage');
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [selectedAviaryId, setSelectedAviaryId] = useState<string>('');
  const [selectedCageId, setSelectedCageId] = useState<string>('');
  const [motif, setMotif] = useState<string>("Ajustement d'hébergement");
  const [comment, setComment] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Synchronise oiseau présélectionné
  useEffect(() => {
    if (preselectedBird) {
      setSelectedBirdId(String(preselectedBird.id));
    } else if (birds.length > 0 && !selectedBirdId) {
      setSelectedBirdId(String(birds[0].id));
    }
  }, [preselectedBird, birds]);

  // Synchronise zone par défaut
  useEffect(() => {
    if (zones.length > 0 && !selectedZoneId) {
      setSelectedZoneId(zones[0].id);
    }
  }, [zones]);

  const currentBird = birds.find(b => String(b.id) === selectedBirdId);

  // Résolution du chemin d'origine de l'oiseau
  const originPath = currentBird
    ? HabitatIntegrityService.resolveBreadcrumbPath(currentBird, zones, aviaries, cages)
    : null;

  // Filtrage contextuel progressif des volières et cages
  const availableAviaries = aviaries.filter(a => a.zoneId === selectedZoneId);
  const availableCages = cages.filter(c => {
    if (c.zoneId !== selectedZoneId) return false;
    if (selectedAviaryId) {
      return c.aviaryId === selectedAviaryId;
    }
    return true;
  });

  // Résolution du libellé de destination visuelle
  const destZone = zones.find(z => z.id === selectedZoneId);
  const destAviary = aviaries.find(a => a.id === selectedAviaryId);
  const destCage = cages.find(c => c.id === selectedCageId);
  const destQArea = quarantineAreas.find(q => q.id === selectedCageId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedBirdId) {
      setErrorMsg("Veuillez sélectionner un oiseau à déplacer.");
      return;
    }

    let finalDestType: 'cage' | 'aviary' | 'zone' | 'quarantineArea' = destinationType;
    let finalDestId = '';

    if (destinationType === 'cage') {
      if (!selectedCageId) {
        setErrorMsg("Veuillez sélectionner une cage de destination.");
        return;
      }
      finalDestId = selectedCageId;
    } else if (destinationType === 'aviary') {
      if (!selectedAviaryId) {
        setErrorMsg("Veuillez sélectionner une volière de destination.");
        return;
      }
      finalDestId = selectedAviaryId;
    } else if (destinationType === 'zone') {
      if (!selectedZoneId) {
        setErrorMsg("Veuillez sélectionner une zone de destination.");
        return;
      }
      finalDestId = selectedZoneId;
    } else if (destinationType === 'quarantineArea') {
      if (!selectedCageId) {
        setErrorMsg("Veuillez choisir un espace de quarantaine.");
        return;
      }
      finalDestId = selectedCageId;
    }

    const birdIdNum = parseInt(selectedBirdId, 10);
    const resp = HabitatService.moveBird(
      birdIdNum,
      finalDestType,
      finalDestId,
      motif,
      "Éleveur",
      comment
    );

    if (!resp.success) {
      setErrorMsg(resp.message + (resp.error ? ` : ${resp.error}` : ''));
      return;
    }

    if (onMoveSuccess) {
      onMoveSuccess();
    }
    onClose();
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={language === 'ar' ? "نقل طائر بتحكم سياقي" : "Déplacement d'Oiseau Contextuel"}
    >
      <form onSubmit={handleSubmit} className="space-y-4" dir={isRtl ? 'rtl' : 'ltr'} data-testid="bird-move-modal-form">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. Sélection de l'oiseau */}
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
            {language === 'ar' ? "الطائر المراد نقله" : "Oiseau à déplacer"}
          </label>
          <AppSelect
            value={selectedBirdId}
            onChange={(e) => setSelectedBirdId(e.target.value)}
            required
          >
            <option value="">Sélectionner un oiseau</option>
            {birds.map(b => (
              <option key={b.id} value={b.id}>
                {b.nom || 'Sans nom'} ({b.bague || 'Sans bague'}) - {b.statut_sante || 'Actif'}
              </option>
            ))}
          </AppSelect>
        </div>

        {/* 2. RECAPITULATIF COMPARATIF ÉTAPE 8 (Origine vs Destination) */}
        {currentBird && originPath && (
          <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              {language === 'ar' ? "مقارنة المسار قبل التأكيد" : "Comparatif de localisation avant validation"}
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Origine */}
              <div className="p-2.5 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                <span className="text-[10px] font-bold text-slate-400 block mb-1">
                  {language === 'ar' ? "الموقع الحالي :" : "Oiseau actuel :"}
                </span>
                <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 flex-wrap">
                  <span className="text-slate-600 dark:text-slate-300">{originPath.zoneNom}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="text-slate-600 dark:text-slate-300">{originPath.aviaryNom}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="font-bold text-amber-600">{originPath.cageNom}</span>
                </div>
              </div>

              {/* Destination */}
              <div className="p-2.5 bg-amber-50/70 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800/60">
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 block mb-1">
                  {language === 'ar' ? "الوجهة الجديدة :" : "Nouvelle destination :"}
                </span>
                <div className="font-semibold text-amber-900 dark:text-amber-100 flex items-center gap-1.5 flex-wrap">
                  <span>{destZone ? destZone.nom : 'Zone ?'}</span>
                  <ArrowRight className="w-3 h-3 text-amber-500" />
                  <span>{destAviary ? destAviary.nom : 'Hors volière'}</span>
                  <ArrowRight className="w-3 h-3 text-amber-500" />
                  <span className="font-bold text-amber-700 dark:text-amber-400">
                    {destinationType === 'cage' ? (destCage ? destCage.nom : 'Cage ?') : (destinationType === 'aviary' ? 'Volière entière' : (destinationType === 'quarantineArea' ? 'Quarantaine' : 'Zone libre'))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. TYPE DE DESTINATION */}
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
            {language === 'ar' ? "نوع الإيواء المستهدف" : "Type d'hébergement cible"}
          </label>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => { setDestinationType('cage'); setSelectedCageId(''); }}
              className={`p-2 rounded-lg font-bold border transition-colors cursor-pointer ${destinationType === 'cage' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white dark:bg-slate-700 border-slate-200 text-slate-700 dark:text-slate-200'}`}
            >
              Cage
            </button>
            <button
              type="button"
              onClick={() => { setDestinationType('aviary'); setSelectedCageId(''); }}
              className={`p-2 rounded-lg font-bold border transition-colors cursor-pointer ${destinationType === 'aviary' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white dark:bg-slate-700 border-slate-200 text-slate-700 dark:text-slate-200'}`}
            >
              Volière
            </button>
            <button
              type="button"
              onClick={() => { setDestinationType('quarantineArea'); setSelectedCageId(quarantineAreas[0]?.id || ''); }}
              className={`p-2 rounded-lg font-bold border transition-colors cursor-pointer ${destinationType === 'quarantineArea' ? 'bg-rose-600 text-white border-rose-600' : 'bg-white dark:bg-slate-700 border-slate-200 text-slate-700 dark:text-slate-200'}`}
            >
              Quarantaine
            </button>
          </div>
        </div>

        {/* 4. SÉLECTION PROGRESSIVE : ZONE -> VOLIÈRE -> CAGE */}
        {destinationType !== 'quarantineArea' ? (
          <div className="space-y-3 p-3 bg-slate-50/60 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
            {/* Zone */}
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                1. {language === 'ar' ? "المنطقة" : "Zone de destination"}
              </label>
              <AppSelect
                value={selectedZoneId}
                onChange={(e) => {
                  setSelectedZoneId(e.target.value);
                  setSelectedAviaryId('');
                  setSelectedCageId('');
                }}
                required
              >
                <option value="">Sélectionner la zone</option>
                {zones.map(z => (
                  <option key={z.id} value={z.id}>{z.nom}</option>
                ))}
              </AppSelect>
            </div>

            {/* Volière (Optionnel ou requis si type=aviary) */}
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                2. {language === 'ar' ? "السلاكة (اختياري)" : "Volière parente"} {destinationType === 'cage' ? "(Optionnelle)" : ""}
              </label>
              <AppSelect
                value={selectedAviaryId}
                onChange={(e) => {
                  setSelectedAviaryId(e.target.value);
                  setSelectedCageId('');
                }}
                required={destinationType === 'aviary'}
              >
                <option value="">{destinationType === 'cage' ? "Toutes les cages de la zone / Cage autonome" : "Sélectionner une volière"}</option>
                {availableAviaries.map(a => (
                  <option key={a.id} value={a.id}>{a.nom} (Cap. {a.capacite_max || 'Non renseignée'})</option>
                ))}
              </AppSelect>
            </div>

            {/* Cage (Requis si type=cage) */}
            {destinationType === 'cage' && (
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  3. {language === 'ar' ? "القفص المحدد" : "Cage spécifique"}
                </label>
                <AppSelect
                  value={selectedCageId}
                  onChange={(e) => setSelectedCageId(e.target.value)}
                  required
                >
                  <option value="">Sélectionner la cage</option>
                  {availableCages.map(c => {
                    const occ = calculateCageOccupancy(c, birds, []);
                    const availableSlots = Math.max(0, occ.capacity - occ.presentBirds.length);
                    const isFull = availableSlots <= 0 && occ.capacity > 0;
                    return (
                      <option key={c.id} value={c.id} disabled={isFull}>
                        {c.nom} — {occ.presentBirds.length}/{c.capacite_max || occ.capacity || 6} places {isFull ? '(COMPLET)' : ''}
                      </option>
                    );
                  })}
                </AppSelect>
                {availableCages.length === 0 && (
                  <span className="text-[10px] text-amber-600 font-semibold block mt-1">
                    ⚠️ Aucune cage disponible dans cette sélection.
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
              {language === 'ar' ? "مساحة العزل الصحي" : "Espace de quarantaine sanitaire"}
            </label>
            <AppSelect
              value={selectedCageId}
              onChange={(e) => setSelectedCageId(e.target.value)}
              required
            >
              <option value="">Choisir l'espace de quarantaine</option>
              {quarantineAreas.map(q => (
                <option key={q.id} value={q.id}>{q.nom} (Cap. {q.capacite_max || 10})</option>
              ))}
            </AppSelect>
          </div>
        )}

        {/* 5. Motif & Commentaire */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Motif</label>
            <AppSelect
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
            >
              <option value="Ajustement d'hébergement">Ajustement d'hébergement</option>
              <option value="Optimisation de couple">Optimisation de couple</option>
              <option value="Nettoyage et Maintenance">Nettoyage / Maintenance</option>
              <option value="Isolement Sanitaire">Isolement Sanitaire</option>
              <option value="Autre">Autre</option>
            </AppSelect>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Commentaire</label>
            <AppInput
              placeholder="Précisions éventuelles..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>

        {/* Bouton de validation */}
        <AppButton 
          type="submit" 
          variant="primary" 
          className="w-full cursor-pointer py-2.5 font-bold"
        >
          <ArrowRightLeft className="w-4 h-4 mr-2" />
          {language === 'ar' ? "تأكيد نقل الطائر" : "Confirmer le déplacement de l'oiseau"}
        </AppButton>
      </form>
    </AppModal>
  );
};
