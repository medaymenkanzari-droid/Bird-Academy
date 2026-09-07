/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Plus, Grid, User, ArrowRightLeft, AlertTriangle, Check, X, ShieldAlert, CheckCircle, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { Cage, Canari } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { AppModal } from './design-system';
import { calculateCageOccupancy } from '../features/habitat/utils/cageOccupancy';

interface CagesProps {
  cages: Cage[];
  canaris: Canari[];
  onAddCage: (nom: string, description: string, capacite_max: number) => void;
  onEditCage: (id: number, nom: string, description: string, capacite_max: number) => void;
  onDeleteCage: (id: number) => boolean | string;
  onTransferCanari: (canariId: number, targetCageId: number) => void;
}

export default function Cages({
  cages,
  canaris,
  onAddCage,
  onEditCage,
  onDeleteCage,
  onTransferCanari
}: CagesProps) {
  const { t } = useLanguage();
  const [selectedCageId, setSelectedCageId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cage fields
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [capaciteMax, setCapaciteMax] = useState<number>(4);

  // Edit fields
  const [isEditing, setIsEditing] = useState(false);
  const [editNom, setEditNom] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCapaciteMax, setEditCapaciteMax] = useState<number>(4);
  const [actionError, setActionError] = useState<string | null>(null);

  // Transfer bird fields
  const [transferringBirdId, setTransferringBirdId] = useState<number | null>(null);
  const [targetCageId, setTargetCageId] = useState<number | null>(null);

  // Handle Android back button / popstate navigation for returning to cage list
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.cageDetail !== undefined) {
        setSelectedCageId(event.state.cageDetail);
        setIsEditing(false);
      } else {
        setSelectedCageId(null);
        setIsEditing(false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!nom.trim()) {
      setErrorMsg(t('cageNameRequired'));
      return;
    }

    onAddCage(nom.trim(), description.trim(), Number(capaciteMax));
    setIsFormOpen(false);
    setNom('');
    setDescription('');
    setCapaciteMax(4);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);

    if (!editNom.trim()) {
      setActionError(t('cageNameRequired'));
      return;
    }

    if (selectedCage) {
      onEditCage(selectedCage.id, editNom.trim(), editDescription.trim(), Number(editCapaciteMax));
      setIsEditing(false);
    }
  };

  const handleDeleteCage = (id: number) => {
    setActionError(null);
    if (window.confirm(t('cageDeleteConfirm'))) {
      const result = onDeleteCage(id);
      if (typeof result === 'string') {
        setActionError(result);
      } else {
        const remainingCages = cages.filter(c => c.id !== id);
        setSelectedCageId(remainingCages[0]?.id || null);
        setIsEditing(false);
      }
    }
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transferringBirdId && targetCageId) {
      onTransferCanari(transferringBirdId, targetCageId);
      setTransferringBirdId(null);
      setTargetCageId(null);
    }
  };

  // Get current residents of a cage
  const getResidents = (cageId: number) => {
    const targetCage = cages.find(c => c.id === cageId);
    if (!targetCage) return [];
    return canaris.filter(bird => {
      if (!bird || bird.archived || bird.statut_sante === 'Décédé') return false;
      const birdCageIdStr = bird.cageId !== undefined && bird.cageId !== null ? String(bird.cageId) : undefined;
      const birdCage_idStr = bird.cage_id !== undefined && bird.cage_id !== null ? String(bird.cage_id) : undefined;
      const targetStr = String(cageId);
      return String(bird.cage_id) === targetStr || String(bird.cageId) === targetStr || birdCageIdStr === targetStr || birdCage_idStr === targetStr;
    });
  };

  const selectedCage = cages.find(c => String(c.id) === String(selectedCageId));
  const residents = selectedCage ? getResidents(selectedCage.id) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{t('cagesTitle')}</h2>
          <p className="text-xs text-slate-500">
            {t('cagesSub')}
          </p>
        </div>
        <button
          onClick={() => {
            setErrorMsg(null);
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl transition-colors text-sm cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" /> {t('newCage')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column(s): Grid of Cages */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cages.map((cage) => {
              const occ = calculateCageOccupancy(cage, canaris);
              const residentsCount = occ.presentBirds.length;
              const isOverpopulated = occ.isOverpopulated;
              const fillPercentage = Math.min(occ.occupancyPercentage, 100);
              const isSelected = selectedCageId === cage.id;

              return (
                <div
                  key={cage.id}
                  onClick={() => {
                    if (selectedCageId !== cage.id) {
                      setSelectedCageId(cage.id);
                      setIsEditing(false);
                      setActionError(null);
                      if (!window.history.state?.cageDetail) {
                        window.history.pushState({ cageDetail: cage.id }, '');
                      } else {
                        window.history.replaceState({ cageDetail: cage.id }, '');
                      }
                    }
                  }}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-400 shadow-xs'
                      : 'bg-white border-slate-100 hover:border-slate-200 shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-800 text-md leading-tight">{cage.nom}</h3>
                      <Grid className={`w-5 h-5 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                    </div>
                    {cage.description && (
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{cage.description}</p>
                    )}
                  </div>

                  {/* Occupancy Indicator */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className={`${isOverpopulated ? 'text-red-600 font-bold' : 'text-slate-600'}`}>
                        {t('occupancyLabel', { residents: residentsCount, max: cage.capacite_max })}
                      </span>
                      {isOverpopulated && (
                        <span className="text-red-600 bg-red-100 px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-0.5 animate-pulse">
                          <AlertTriangle className="w-3 h-3" /> {t('overpopulation')}
                        </span>
                      )}
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isOverpopulated
                            ? 'bg-red-500'
                            : fillPercentage >= 75
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${fillPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Residents management & Transfer */}
        <div>
          {selectedCage ? (
            /* RESIDENTS LIST & TRANSFER UTILITY */
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex justify-between items-center flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCageId(null);
                      setIsEditing(false);
                      if (window.history.state?.cageDetail) {
                        window.history.back();
                      }
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{t('backToCages') || t('back')}</span>
                  </button>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-400 font-mono">{t('occupancyDetails')}</span>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-md">{selectedCage.nom}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setEditNom(selectedCage.nom);
                      setEditDescription(selectedCage.description || '');
                      setEditCapaciteMax(selectedCage.capacite_max);
                      setIsEditing(true);
                      setActionError(null);
                    }}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer"
                    title={t('edit')}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCage(selectedCage.id)}
                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                    title={t('delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {actionError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 rounded-xl text-xs border border-red-200 dark:border-red-900 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              {/* Residents Sub-list */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{t('currentResidents', { count: residents.length })}</h4>
                
                {residents.length === 0 ? (
                  <p className="text-xs italic text-slate-400 py-6 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                    {t('emptyCage')}
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                    {residents.map((bird) => (
                      <div key={bird.id} className="p-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{bird.nom}</span>
                          <span className="block text-[10px] text-slate-400 font-mono mt-0.5">{bird.bague}</span>
                        </div>
                        
                        <button
                          onClick={() => {
                            setTransferringBirdId(bird.id);
                            const otherCages = cages.filter(c => c.id !== selectedCage.id);
                            setTargetCageId(otherCages[0]?.id || null);
                          }}
                          className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-white dark:hover:bg-slate-700 rounded-lg border border-transparent hover:border-slate-150 transition-colors"
                          title={t('transferBird')}
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-400 flex flex-col justify-center items-center h-full min-h-[300px]">
              <Grid className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-sm font-semibold">{t('cagesTitle')}</p>
              <p className="text-xs mt-1">{t('cagesEmptyDesc')}</p>
            </div>
          )}
        </div>
      </div>

      {/* CREATE CAGE MODAL */}
      <AppModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={t('createCage')}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-900 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">{t('cageNameLabel')}</label>
            <input
              type="text"
              required
              placeholder={t('cageNamePlaceholder')}
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Description</label>
            <textarea
              placeholder={t('cageDescriptionPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 h-20"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">{t('cageCapacityLabel')}</label>
            <input
              type="number"
              required
              min={1}
              value={capaciteMax}
              onChange={(e) => setCapaciteMax(Number(e.target.value))}
              className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-4 h-4" /> {t('saveCage')}
            </button>
          </div>
        </form>
      </AppModal>

      {/* EDIT CAGE MODAL */}
      {selectedCage && (
        <AppModal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          title={t('editCageTitle', { name: selectedCage.nom })}
          size="md"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
            {actionError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-900 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">{t('cageNameLabel')}</label>
              <input
                type="text"
                required
                value={editNom}
                onChange={(e) => setEditNom(e.target.value)}
                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Description</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 h-20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">{t('cageCapacityLabel')}</label>
              <input
                type="number"
                required
                min={1}
                value={editCapaciteMax}
                onChange={(e) => setEditCapaciteMax(Number(e.target.value))}
                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Check className="w-4 h-4" /> {t('save')}
              </button>
            </div>
          </form>
        </AppModal>
      )}

      {/* TRANSFER BIRD MODAL */}
      {selectedCage && (
        <AppModal
          isOpen={transferringBirdId !== null}
          onClose={() => {
            setTransferringBirdId(null);
            setTargetCageId(null);
          }}
          title={t('transferBird')}
          size="md"
        >
          <form onSubmit={handleTransferSubmit} className="space-y-4 text-xs">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('transferBirdDesc', { name: canaris.find(b => b.id === transferringBirdId)?.nom || '' })}
            </p>

            <div>
              <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">{t('targetCageLabel')}</label>
              <select
                required
                value={targetCageId || ''}
                onChange={(e) => setTargetCageId(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-950 dark:text-slate-100 p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
              >
                {cages.filter(c => c.id !== selectedCage.id).map(c => (
                  <option key={c.id} value={c.id}>{c.nom} (occupation: {getResidents(c.id).length}/{c.capacite_max})</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setTransferringBirdId(null);
                  setTargetCageId(null);
                }}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Check className="w-4 h-4" /> {t('confirmTransfer')}
              </button>
            </div>
          </form>
        </AppModal>
      )}
    </div>
  );
}
