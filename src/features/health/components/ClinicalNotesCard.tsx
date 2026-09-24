/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileText, Plus, User, Calendar, AlertTriangle, CheckCircle2, 
  Trash2, ChevronDown, ChevronUp, Image, Upload, X, ShieldAlert, Tag 
} from 'lucide-react';
import { Canari } from '../../../types';
import { ClinicalNote } from '../models/health';
import { ClinicalNotesService } from '../services/ClinicalNotesService';
import { AppButton, AppInput, AppSelect, AppModal } from '../../../components/design-system';
import { useLanguage } from '../../../context/LanguageContext';

export interface ClinicalNotesCardProps {
  bird: Canari;
  className?: string;
}

export const ClinicalNotesCard: React.FC<ClinicalNotesCardProps> = ({
  bird,
  className = ''
}) => {
  const { t, isRtl } = useLanguage();
  const [notes, setNotes] = useState<ClinicalNote[]>(() => 
    ClinicalNotesService.getNotesForBird(bird.id)
  );
  const [expandedNoteIds, setExpandedNoteIds] = useState<Set<string>>(new Set());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<string | null>(null);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newAuthor, setNewAuthor] = useState('Éleveur Référent');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newSeverity, setNewSeverity] = useState<ClinicalNote['severity']>('normal');
  const [newTagsStr, setNewTagsStr] = useState('');
  const [newPhotoBase64, setNewPhotoBase64] = useState<string | undefined>(undefined);

  const toggleExpand = (id: string) => {
    setExpandedNoteIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewPhotoBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const tags = newTagsStr.split(',').map(t => t.trim()).filter(Boolean);
    const added = ClinicalNotesService.addNote({
      birdId: bird.id,
      title: newTitle.trim(),
      content: newContent.trim(),
      author: newAuthor.trim() || 'Éleveur Référent',
      date: newDate,
      severity: newSeverity,
      tags: tags.length > 0 ? tags : undefined,
      photoUrl: newPhotoBase64
    });

    setNotes(prev => [added, ...prev]);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewContent('');
    setNewTagsStr('');
    setNewPhotoBase64(undefined);
  };

  const handleDeleteNote = (id: string) => {
    ClinicalNotesService.deleteNote(id);
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5 text-white ${className}`}>
      
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            <h3 className="font-extrabold text-sm text-white tracking-tight">
              Observations & Notes Cliniques ({notes.length})
            </h3>
          </div>
          <p className="text-3xs text-slate-400">
            Dossier d'observations médicales, bilans visuels et photos cliniques.
          </p>
        </div>

        <AppButton
          variant="primary"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          startIcon={<Plus className="w-3.5 h-3.5" />}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
        >
          Ajouter une Note
        </AppButton>
      </div>

      {/* Notes List */}
      {notes.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-xs">
          <FileText className="w-10 h-10 text-slate-700 mx-auto mb-2" />
          <p>Aucune observation clinique enregistrée pour cet oiseau.</p>
        </div>
      ) : (
        <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
          {notes.map(note => {
            const isExpanded = expandedNoteIds.has(note.id);
            const isCritical = note.severity === 'critical';
            const isAttention = note.severity === 'attention';

            return (
              <div
                key={note.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 transition-all space-y-3 shadow-lg"
              >
                {/* Note Header: Title, Author, Date & Severity */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-extrabold text-sm text-white tracking-tight">
                      {note.title}
                    </h4>

                    {/* Severity Pill */}
                    <span className={`px-2.5 py-0.5 rounded-full text-3xs font-extrabold uppercase tracking-wider border flex items-center gap-1 ${
                      isCritical
                        ? 'bg-red-500/20 text-red-300 border-red-500/40'
                        : isAttention
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}>
                      {isCritical ? <ShieldAlert className="w-3 h-3 text-red-400" /> : isAttention ? <AlertTriangle className="w-3 h-3 text-amber-400" /> : <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                      <span>{isCritical ? 'Critique' : isAttention ? 'Vigilance' : 'Normal'}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-3xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-500" />
                      {note.author}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {note.date}
                    </span>
                  </div>
                </div>

                {/* Content preview or expanded */}
                <p className={`text-xs text-slate-300 leading-relaxed font-sans ${isExpanded ? '' : 'line-clamp-2'}`}>
                  {note.content}
                </p>

                {/* Attached Photo Preview */}
                {note.photoUrl && (
                  <div className="pt-1">
                    <div 
                      onClick={() => setSelectedPhotoPreview(note.photoUrl!)}
                      className="inline-flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-colors"
                      title="Cliquer pour agrandir la photo clinique"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-950 shrink-0">
                        <img src={note.photoUrl} alt="Aperçu clinique" className="w-full h-full object-cover" />
                      </div>
                      <div className="text-3xs text-slate-400 font-semibold pr-2 flex items-center gap-1">
                        <Image className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Aperçu photo joint</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tags & Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 flex-wrap gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {note.tags && note.tags.map((tag, tIdx) => (
                      <span 
                        key={tIdx} 
                        className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 border border-slate-800 text-3xs font-mono"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleExpand(note.id)}
                      className="text-3xs text-slate-400 hover:text-white flex items-center gap-1 font-bold transition-colors cursor-pointer"
                    >
                      <span>{isExpanded ? 'Réduire' : 'Lire la suite'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                      title="Supprimer la note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Ajouter une note clinique */}
      {isAddModalOpen && (
        <AppModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Ajouter une observation clinique"
          size="md"
        >
          <form onSubmit={handleAddNoteSubmit} className="space-y-4">
            <AppInput
              label="Motif / Titre de l'observation *"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="ex. Bilan respiratoire & Bréchet"
              autoFocus
            />

            <div className="grid grid-cols-2 gap-3">
              <AppInput
                label="Auteur / Référant"
                value={newAuthor}
                onChange={(e) => setNewAuthor(e.target.value)}
                placeholder="ex. Dr. Vétérinaire ou Éleveur"
              />

              <AppInput
                label={t('clinicalObservationDate')}
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <AppSelect
                label="Niveau de gravité"
                value={newSeverity}
                onChange={(e: any) => setNewSeverity(e.target.value)}
                options={[
                  { value: 'normal', label: '🟢 Normal / Conforme' },
                  { value: 'attention', label: '🟡 Vigilance / À surveiller' },
                  { value: 'critical', label: '🔴 Critique / Soins urgents' }
                ]}
              />

              <AppInput
                label="Tags (séparés par des virgules)"
                value={newTagsStr}
                onChange={(e) => setNewTagsStr(e.target.value)}
                placeholder="ex. Respiration, Fientes, Bréchet"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400">Contenu détaillé de la note *</label>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={4}
                required
                placeholder="Observations sur le comportement, l'état des muqueuses, le tonus..."
                className="w-full text-xs text-slate-200 bg-slate-950 border border-slate-800 rounded-xl p-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
              />
            </div>

            {/* Photo upload attachment */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <Image className="w-3.5 h-3.5" />
                Pièce jointe photo (optionnelle)
              </label>
              
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl border border-slate-700 transition-colors cursor-pointer flex items-center gap-2">
                  <Upload className="w-4 h-4 text-indigo-400" />
                  {newPhotoBase64 ? 'Remplacer la photo' : 'Choisir une photo'}
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>

                {newPhotoBase64 && (
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
                    <img src={newPhotoBase64} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setNewPhotoBase64(undefined)}
                      className="absolute top-0.5 right-0.5 p-0.5 bg-black/80 rounded-full text-white hover:text-red-400 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <AppButton variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
                Annuler
              </AppButton>
              <AppButton type="submit" variant="primary" size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold">
                Enregistrer la note
              </AppButton>
            </div>
          </form>
        </AppModal>
      )}

      {/* Lightbox Modal for Photo Preview */}
      {selectedPhotoPreview && (
        <AppModal
          isOpen={Boolean(selectedPhotoPreview)}
          onClose={() => setSelectedPhotoPreview(null)}
          title="Aperçu de la photo clinique"
          size="lg"
        >
          <div className="p-2 flex flex-col items-center">
            <div className="max-h-[60vh] max-w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
              <img src={selectedPhotoPreview} alt="Agrandissement clinique" className="w-full h-full object-contain" />
            </div>
            <div className="mt-4 flex justify-end w-full">
              <AppButton variant="secondary" size="sm" onClick={() => setSelectedPhotoPreview(null)}>
                Fermer l'aperçu
              </AppButton>
            </div>
          </div>
        </AppModal>
      )}

    </div>
  );
};

export default ClinicalNotesCard;
