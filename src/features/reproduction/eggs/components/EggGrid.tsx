/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Egg as EggIcon, Plus, Calendar, Eye, Scale, ArrowRight, User, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Egg, EggStatus, EggTimelineEvent } from '../types';
import { EggService } from '../services/EggService';
import { useLanguage } from '../../../../context/LanguageContext';
import { BIO_TRANSLATIONS } from '../../utils/bioTranslations';
import { 
  AppCard, AppButton, AppBadge, AppInput, AppSelect, AppModal, AppEmptyState 
} from '../../../../components/design-system';
import HatchEggModal from '../../hatching/components/HatchEggModal';

interface EggGridProps {
  clutchId: string;
  onRefreshClutches?: () => void;
}

export default function EggGrid({ clutchId, onRefreshClutches }: EggGridProps) {
  const { language } = useLanguage();

  const t = useCallback((key: string, variables?: Record<string, string | number>): string => {
    const dict = BIO_TRANSLATIONS[language] || BIO_TRANSLATIONS['fr'];
    let text = dict[key] || BIO_TRANSLATIONS['fr'][key] || String(key);
    if (variables) {
      Object.entries(variables).forEach(([k, val]) => {
        text = text.replace(new RegExp(`{${k}}`, 'g'), String(val));
      });
    }
    return text;
  }, [language]);

  const eggs = useMemo(() => {
    return EggService.getEggsByClutch(clutchId);
  }, [clutchId]);

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedEgg, setSelectedEgg] = useState<Egg | null>(null);
  const [isHatchOpen, setIsHatchOpen] = useState(false);
  const [hatchEggId, setHatchEggId] = useState<string | null>(null);
  const [hatchEggNumber, setHatchEggNumber] = useState<number>(0);
  
  // New Egg State
  const [layDate, setLayDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [position, setPosition] = useState('Nid');
  const [weight, setWeight] = useState('');
  const [obs, setObs] = useState('');

  // Inspection State
  const [inspDate, setInspDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [inspWeight, setInspWeight] = useState('');
  const [candling, setCandling] = useState<'fertile' | 'clear' | 'uncertain'>('fertile');
  const [airCell, setAirCell] = useState<'small' | 'normal' | 'large'>('normal');
  const [inspNotes, setInspNotes] = useState('');
  const [inspector, setInspector] = useState('');

  // Direct Status Update State
  const [newStatus, setNewStatus] = useState<EggStatus>('Pondu');

  const handleAddEgg = () => {
    if (!layDate) return;
    EggService.addEgg(
      clutchId,
      layDate,
      position,
      weight ? parseFloat(weight) : undefined,
      obs
    );
    setIsAddOpen(false);
    setWeight('');
    setObs('');
    if (onRefreshClutches) onRefreshClutches();
  };

  const handleInspectEgg = () => {
    if (!selectedEgg) return;
    EggService.inspectEgg(
      selectedEgg.id,
      inspDate,
      inspWeight ? parseFloat(inspWeight) : undefined,
      candling,
      airCell,
      inspNotes,
      inspector
    );
    // Reload selected egg to show updated state
    const fresh = EggService.getEggById(selectedEgg.id);
    setSelectedEgg(fresh || null);
    setInspWeight('');
    setInspNotes('');
    if (onRefreshClutches) onRefreshClutches();
  };

  const handleStatusChange = () => {
    if (!selectedEgg) return;
    EggService.updateEggStatus(selectedEgg.id, newStatus, "Mise à jour rapide du statut.");
    const fresh = EggService.getEggById(selectedEgg.id);
    setSelectedEgg(fresh || null);
    if (onRefreshClutches) onRefreshClutches();
  };

  const getStatusBadge = (status: EggStatus) => {
    switch (status) {
      case 'Pondu':
        return <AppBadge variant="outline">{t('eggStatusPondu')}</AppBadge>;
      case 'En incubation':
        return <AppBadge variant="primary">{t('eggStatusIncub')}</AppBadge>;
      case 'Miré':
        return <AppBadge variant="warning">{t('eggStatusMire')}</AppBadge>;
      case 'Fécondé':
        return <AppBadge variant="success" className="bg-amber-100 text-amber-800 border-amber-200">{t('eggStatusFecond')}</AppBadge>;
      case 'Clair':
        return <AppBadge variant="outline" className="bg-slate-100 text-slate-500 border-slate-200">{t('eggStatusClair')}</AppBadge>;
      case 'Arrêt de développement':
        return <AppBadge variant="outline" className="bg-orange-50 text-orange-600 border-orange-100">{t('eggStatusArret')}</AppBadge>;
      case 'Cassé':
        return <AppBadge variant="outline" className="bg-red-50 text-red-600 border-red-100">{t('eggStatusCasse')}</AppBadge>;
      case 'Mort':
        return <AppBadge variant="outline" className="bg-red-100 text-red-800 border-red-200">{t('eggStatusMort')}</AppBadge>;
      case 'Éclos':
        return <AppBadge variant="success">{t('eggStatusEclos')}</AppBadge>;
      case 'Retiré':
        return <AppBadge variant="outline" className="bg-slate-200 text-slate-600 border-slate-300">{t('eggStatusRetire')}</AppBadge>;
      default:
        return <AppBadge variant="outline">{status}</AppBadge>;
    }
  };

  const eggTimeline = useMemo(() => {
    if (!selectedEgg) return [];
    return EggService.getEggTimeline(selectedEgg.id);
  }, [selectedEgg]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
        <h4 className="text-sm font-bold text-slate-800">
          Gestion individuelle des œufs ({eggs.length})
        </h4>
        <AppButton 
          variant="success" 
          size="sm" 
          onClick={() => setIsAddOpen(true)}
          className="text-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          {t('addEggBtn')}
        </AppButton>
      </div>

      {eggs.length === 0 ? (
        <AppEmptyState
          title="Aucun œuf enregistré"
          description="Enregistrez les œufs au fur et à mesure de la ponte."
          className="py-12"
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {eggs.map((egg) => (
            <div 
              key={egg.id}
              onClick={() => {
                setSelectedEgg(egg);
                setNewStatus(egg.status);
              }}
              className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/50 rounded-xl cursor-pointer text-left transition-all hover:shadow-xs group"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-1.5">
                  <div className="p-1.5 bg-amber-50 rounded-lg group-hover:bg-amber-100 text-amber-500">
                    <EggIcon className="w-4 h-4 fill-amber-200" />
                  </div>
                  <span className="font-bold text-slate-800 text-xs">
                    {t('eggNumber', { number: egg.number })}
                  </span>
                </div>
                <ChevronRightIcon className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
              </div>

              <div className="space-y-1 text-[11px] text-slate-500 mt-2.5">
                <div>
                  <span className="text-slate-400 block">{t('eggLayingDate')}</span>
                  <span className="font-semibold text-slate-700">{egg.layingDate}</span>
                </div>
                {egg.weight !== undefined && (
                  <div>
                    <span className="text-slate-400 block">Poids</span>
                    <span className="font-semibold text-slate-700">{egg.weight}g</span>
                  </div>
                )}
                {egg.position && (
                  <div>
                    <span className="text-slate-400 block">Position</span>
                    <span className="font-semibold text-slate-700 truncate block max-w-[120px]">{egg.position}</span>
                  </div>
                )}
              </div>

              <div className="mt-3.5 pt-2 border-t border-slate-200/40">
                {getStatusBadge(egg.status)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add Egg */}
      <AppModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Ajouter un œuf"
        size="md"
      >
        <div className="space-y-4 font-sans text-left">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
              {t('eggLayingDate')}
            </label>
            <AppInput
              type="date"
              value={layDate}
              onChange={(e) => setLayDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                Position dans le nid
              </label>
              <AppInput
                type="text"
                placeholder="Ex: Centre, Bord gauche"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                Poids de l'œuf (grammes)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="Ex: 1.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/30 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
              Observations
            </label>
            <AppInput
              type="text"
              placeholder="Ex: Coquille fine, couleur claire"
              value={obs}
              onChange={(e) => setObs(e.target.value)}
            />
          </div>

          <div className="flex gap-2 justify-end pt-3">
            <AppButton variant="text" onClick={() => setIsAddOpen(false)}>
              Annuler
            </AppButton>
            <AppButton variant="success" onClick={handleAddEgg}>
              Enregistrer l'œuf
            </AppButton>
          </div>
        </div>
      </AppModal>

      {/* Modal Detailed Egg Inspect & History */}
      {selectedEgg && (
        <AppModal
          isOpen={!!selectedEgg}
          onClose={() => setSelectedEgg(null)}
          title={`Suivi de l'œuf n°${selectedEgg.number}`}
          size="lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left font-sans">
            
            {/* Left side: Quick action forms */}
            <div className="space-y-5">
              {/* Card info */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Métriques de l'œuf</span>
                <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 mt-2">
                  <div>
                    <span className="text-slate-400 block">Date de ponte</span>
                    <span className="font-bold text-slate-700">{selectedEgg.layingDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Dernier statut</span>
                    <div className="mt-0.5">{getStatusBadge(selectedEgg.status)}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Poids initial</span>
                    <span className="font-bold text-slate-700">{selectedEgg.weight ? `${selectedEgg.weight}g` : 'Non renseigné'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Position</span>
                    <span className="font-bold text-slate-700">{selectedEgg.position}</span>
                  </div>
                </div>
              </div>

              {/* Hatching Assistant entry button */}
              {selectedEgg.status !== 'Éclos' && selectedEgg.status !== 'Cassé' && selectedEgg.status !== 'Clair' && (
                <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl flex justify-between items-center">
                  <div className="text-xs">
                    <span className="font-bold text-amber-800 block">🐣 L'œuf est en train d'éclore ?</span>
                    <span className="text-slate-500 block text-[10px] mt-0.5">Enregistrez les constantes et créez le poussin.</span>
                  </div>
                  <AppButton 
                    variant="success" 
                    size="sm" 
                    className="text-xs shrink-0"
                    onClick={() => {
                      setHatchEggId(selectedEgg.id);
                      setHatchEggNumber(selectedEgg.number);
                      setIsHatchOpen(true);
                      setSelectedEgg(null);
                    }}
                  >
                    Marquer Éclos
                  </AppButton>
                </div>
              )}

              {/* Inspect / Candle form */}
              <div className="p-4 bg-amber-50/20 border border-amber-100 rounded-xl space-y-3.5">
                <div className="flex items-center gap-1.5 text-amber-600 font-bold text-xs uppercase tracking-wider">
                  <Eye className="w-4 h-4" />
                  <span>Effectuer un mirage ou contrôle</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Résultat de mirage</label>
                    <AppSelect
                      value={candling}
                      onChange={(e) => setCandling(e.target.value as any)}
                      options={[
                        { value: 'fertile', label: 'Fécondé (Fécond)' },
                        { value: 'clear', label: 'Clair (Non fécondé)' },
                        { value: 'uncertain', label: 'Indéterminé (Douteux)' },
                      ]}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Chambre à air</label>
                    <AppSelect
                      value={airCell}
                      onChange={(e) => setAirCell(e.target.value as any)}
                      options={[
                        { value: 'small', label: 'Petite' },
                        { value: 'normal', label: 'Normale' },
                        { value: 'large', label: 'Grande (Fin de cycle)' },
                      ]}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Poids mesuré (g)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Poids"
                      value={inspWeight}
                      onChange={(e) => setInspWeight(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/30 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Inspecteur</label>
                    <AppInput
                      type="text"
                      placeholder="Nom de l'éleveur"
                      value={inspector}
                      onChange={(e) => setInspector(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Notes d'observation</label>
                  <AppInput
                    type="text"
                    placeholder="Vaisseaux sanguins, fêlures..."
                    value={inspNotes}
                    onChange={(e) => setInspNotes(e.target.value)}
                  />
                </div>

                <AppButton
                  variant="success"
                  size="sm"
                  onClick={handleInspectEgg}
                  className="w-full text-xs"
                >
                  Valider l'inspection
                </AppButton>
              </div>

              {/* Direct status updater */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                <span className="block text-xs font-bold text-slate-600 uppercase">Mise à jour directe du statut</span>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <AppSelect
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as EggStatus)}
                      options={[
                        { value: 'Pondu', label: 'Pondu' },
                        { value: 'En incubation', label: 'En incubation' },
                        { value: 'Miré', label: 'Miré' },
                        { value: 'Fécondé', label: 'Fécondé' },
                        { value: 'Clair', label: 'Clair' },
                        { value: 'Arrêt de développement', label: 'Arrêt de développement' },
                        { value: 'Cassé', label: 'Cassé' },
                        { value: 'Mort', label: 'Mort' },
                        { value: 'Éclos', label: 'Éclos' },
                        { value: 'Retiré', label: 'Retiré' },
                      ]}
                    />
                  </div>
                  <AppButton
                    variant="outline"
                    onClick={handleStatusChange}
                    className="text-xs"
                  >
                    Appliquer
                  </AppButton>
                </div>
              </div>
            </div>

            {/* Right side: Egg Timeline */}
            <div className="border-l border-slate-100 pl-4 space-y-4">
              <h5 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-slate-400" />
                {t('eggHistoryTitle')}
              </h5>

              {eggTimeline.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4">Aucun événement enregistré.</p>
              ) : (
                <div className="relative border-l border-slate-100 pl-4 py-1 space-y-4 max-h-[360px] overflow-y-auto">
                  {eggTimeline.map((h) => (
                    <div key={h.id} className="relative">
                      <span className="absolute -left-[21px] top-1 bg-white p-0.5 rounded-full ring-1 ring-slate-100">
                        <span className="block w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                      </span>
                      <div>
                        <span className="block text-[9px] text-slate-400 font-mono">
                          {new Date(h.timestamp).toLocaleDateString(language, { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="block text-xs font-bold text-slate-700">
                          {h.description}
                        </span>
                        {h.notes && (
                          <p className="text-[10px] text-slate-500 mt-0.5 bg-slate-50 p-1.5 rounded-md italic">
                            "{h.notes}"
                          </p>
                        )}
                        {h.operator && (
                          <span className="block text-[9px] text-slate-400 mt-1">Éleveur : {h.operator}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </AppModal>
      )}

      {isHatchOpen && hatchEggId && (
        <HatchEggModal
          isOpen={isHatchOpen}
          onClose={() => {
            setIsHatchOpen(false);
            setHatchEggId(null);
          }}
          eggId={hatchEggId}
          eggNumber={hatchEggNumber}
          onSuccess={() => {
            if (onRefreshClutches) onRefreshClutches();
          }}
        />
      )}
    </div>
  );
}

// Inline fallback icon
function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
