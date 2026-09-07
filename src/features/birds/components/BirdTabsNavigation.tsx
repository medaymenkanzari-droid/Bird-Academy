/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  GitBranch, Award, Activity, Trophy, Image, FileText, User, 
  ChevronRight, Upload, Plus, FileCheck, X, Sparkles, Heart, BookOpen, Home
} from 'lucide-react';
import { Canari, Sante } from '../../../types';
import { AppTabs, TabItem } from '../../../components/design-system/AppTabs';
import { PedigreeTreeViewer } from '../../../components/design-system/PedigreeTreeViewer';
import { BirdBiologicalProfileTab } from './BirdBiologicalProfileTab';
import { BirdStandardComTab } from './BirdStandardComTab';
import { BirdHealthCareTab } from './BirdHealthCareTab';
import { BirdPalmaresTab } from './BirdPalmaresTab';
import { BirdLocationHistoryTab } from './BirdLocationHistoryTab';
import { BirdService } from '../services/BirdService';
import { HabitatService } from '../../habitat/services/HabitatService';
import { AppButton, AppInput, AppSelect } from '../../../components/design-system';
import { useLanguage } from '../../../context/LanguageContext';

export interface BirdTabsNavigationProps {
  bird: Canari;
  allBirds: Canari[];
  santeRecords?: Sante[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  onSelectAncestor?: (bird: Canari) => void;
  onUpdateBird?: (updatedBird: Canari) => void;
  onRefreshHealth?: () => void;
}

export const BirdTabsNavigation: React.FC<BirdTabsNavigationProps> = ({
  bird,
  allBirds,
  santeRecords,
  activeTab: controlledTab,
  onTabChange,
  onSelectAncestor,
  onUpdateBird,
  onRefreshHealth
}) => {
  const { t, language, isRtl } = useLanguage();
  const [internalTab, setInternalTab] = useState<string>('profil_biologique');
  const activeTab = controlledTab || internalTab;

  const handleTabChange = (tabId: string) => {
    setInternalTab(tabId);
    if (onTabChange) onTabChange(tabId);
  };

  // Resolve direct biological parents
  const father = allBirds.find(b => b.id === bird.pere_id) || null;
  const mother = allBirds.find(b => b.id === bird.mere_id) || null;
  const fosterFather = bird.parent_pere_nourricier_id ? allBirds.find(b => b.id === bird.parent_pere_nourricier_id) : null;
  const fosterMother = bird.parent_mere_nourriciere_id ? allBirds.find(b => b.id === bird.parent_mere_nourriciere_id) : null;

  // Documents form state for Tab 5
  const [newDocName, setNewDocName] = useState('');
  const [newDocType, setNewDocType] = useState<'certificat' | 'analyse' | 'facture' | 'autre'>('certificat');
  const [newDocDate, setNewDocDate] = useState(new Date().toISOString().split('T')[0]);
  const [newDocDesc, setNewDocDesc] = useState('');

  // Gallery handlers
  const handleAddPhotoToGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const currentPhotos = bird.photos || (bird.photo ? [bird.photo] : []);
      const updatedPhotos = [...currentPhotos, base64];
      const updated: Canari = {
        ...bird,
        photo: bird.photo || base64,
        photos: updatedPhotos
      };
      BirdService.editBird(updated);
      if (onUpdateBird) onUpdateBird(updated);
    };
    reader.readAsDataURL(file);
  };

  const handleMakePhotoPrincipal = (idx: number) => {
    if (!bird.photos) return;
    const photos = [...bird.photos];
    const [selectedPic] = photos.splice(idx, 1);
    photos.unshift(selectedPic);
    const updated: Canari = {
      ...bird,
      photo: selectedPic,
      photos
    };
    BirdService.editBird(updated);
    if (onUpdateBird) onUpdateBird(updated);
  };

  const handleRemovePhoto = (idx: number) => {
    const photos = [...(bird.photos || (bird.photo ? [bird.photo] : []))];
    photos.splice(idx, 1);
    const updated: Canari = {
      ...bird,
      photo: photos[0] || '',
      photos
    };
    BirdService.editBird(updated);
    if (onUpdateBird) onUpdateBird(updated);
  };

  // Documents handlers
  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) return;
    const newDoc = {
      id: `doc_${Date.now()}`,
      nom: newDocName.trim(),
      type: newDocType,
      date: newDocDate,
      description: newDocDesc.trim()
    };
    const updatedDocs = [...(bird.documents || []), newDoc];
    const updated: Canari = {
      ...bird,
      documents: updatedDocs
    };
    BirdService.editBird(updated);
    if (onUpdateBird) onUpdateBird(updated);
    setNewDocName('');
    setNewDocDesc('');
  };

  const handleRemoveDocument = (docId: string) => {
    if (!bird.documents) return;
    const updatedDocs = bird.documents.filter(d => d.id !== docId);
    const updated: Canari = {
      ...bird,
      documents: updatedDocs
    };
    BirdService.editBird(updated);
    if (onUpdateBird) onUpdateBird(updated);
  };

  // Resolve bird displacement count for badge
  const birdDeplacements = useMemo(() => {
    return HabitatService.getBirdDeplacements(bird.id);
  }, [bird.id]);

  // Tabs definitions with full internationalization
  const tabs: TabItem[] = [
    {
      id: 'profil_biologique',
      label: t('passportBioProfileTab'),
      icon: BookOpen
    },
    {
      id: 'habitat_mouvements',
      label: t('passportHabitatTab'),
      icon: Home,
      badge: birdDeplacements.length > 0 ? birdDeplacements.length : undefined
    },
    {
      id: 'genealogie',
      label: t('passportGenealogyTab'),
      icon: GitBranch
    },
    {
      id: 'standard_com',
      label: t('passportStandardComTab'),
      icon: Award
    },
    {
      id: 'sante',
      label: t('passportHealthTab'),
      icon: Activity
    },
    {
      id: 'palmares',
      label: t('passportPalmaresTab'),
      icon: Trophy
    },
    {
      id: 'galerie_docs',
      label: t('passportGalleryDocsTab'),
      icon: Image,
      badge: (bird.photos?.length || (bird.photo ? 1 : 0)) + (bird.documents?.length || 0)
    }
  ];

  return (
    <div className={`space-y-6 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* AppTabs Navigation */}
      <AppTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={handleTabChange}
        variant="pills"
        className="mb-2"
      />

      {/* Tab 0: Fiche Biologique de l'Espèce (Centrale) */}
      {activeTab === 'profil_biologique' && (
        <div className="animate-fadeIn">
          <BirdBiologicalProfileTab bird={bird} />
        </div>
      )}

      {/* Tab: Habitat & Déplacements (Traçabilité) */}
      {activeTab === 'habitat_mouvements' && (
        <div className="animate-fadeIn">
          <BirdLocationHistoryTab bird={bird} />
        </div>
      )}

      {/* Tab 1: Généalogie & Pedigree */}
      {activeTab === 'genealogie' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Direct Parents Cards Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Biological Father */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xs font-extrabold uppercase tracking-widest text-blue-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  {t('fatherBiological')}
                </span>
                <span className="text-3xs font-mono text-slate-500">{t('paternalLineage')}</span>
              </div>

              {father ? (
                <div 
                  onClick={() => onSelectAncestor && onSelectAncestor(father)}
                  className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-blue-500/50 flex items-center justify-between gap-3 cursor-pointer transition-all hover:scale-[1.01]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                      ♂
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-white leading-tight">
                        {father.nom || `${t('speciesCanari')} #${father.id}`}
                      </h4>
                      <div className="text-3xs font-mono text-emerald-400 mt-0.5">
                        {father.bague}
                      </div>
                      <div className="text-3xs text-slate-400 mt-0.5">
                        {father.mutation || father.race || ''}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-slate-500 ${isRtl ? 'rotate-180' : ''}`} />
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 text-center text-xs text-slate-500 italic">
                  {t('founderFatherUnknown')}
                </div>
              )}
            </div>

            {/* Biological Mother */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xs font-extrabold uppercase tracking-widest text-pink-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-pink-500" />
                  {t('motherBiological')}
                </span>
                <span className="text-3xs font-mono text-slate-500">{t('maternalLineage')}</span>
              </div>

              {mother ? (
                <div 
                  onClick={() => onSelectAncestor && onSelectAncestor(mother)}
                  className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-pink-500/50 flex items-center justify-between gap-3 cursor-pointer transition-all hover:scale-[1.01]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-xs shrink-0">
                      ♀
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-white leading-tight">
                        {mother.nom || `${t('speciesCanari')} #${mother.id}`}
                      </h4>
                      <div className="text-3xs font-mono text-emerald-400 mt-0.5">
                        {mother.bague}
                      </div>
                      <div className="text-3xs text-slate-400 mt-0.5">
                        {mother.mutation || mother.race || ''}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-slate-500 ${isRtl ? 'rotate-180' : ''}`} />
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 text-center text-xs text-slate-500 italic">
                  {t('founderMotherUnknown')}
                </div>
              )}
            </div>

          </div>

          {/* Foster Parents if present */}
          {(fosterFather || fosterMother) && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-2">
              <div className="text-2xs font-extrabold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5" />
                {t('fosterLineage')}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                {fosterFather && <div>{t('fosterFather')} : <span className="font-bold text-white">{fosterFather.nom} ({fosterFather.bague})</span></div>}
                {fosterMother && <div>{t('fosterMother')} : <span className="font-bold text-white">{fosterMother.nom} ({fosterMother.bague})</span></div>}
              </div>
            </div>
          )}

          {/* Integrated PedigreeTreeViewer */}
          <div className="space-y-2">
            <PedigreeTreeViewer
              rootBird={bird}
              birds={allBirds}
              depth={3}
              onSelectBird={(selectedId) => {
                const target = allBirds.find(b => b.id === selectedId);
                if (target && onSelectAncestor) {
                  onSelectAncestor(target);
                }
              }}
              className="shadow-2xl border-slate-800"
            />
          </div>

        </div>
      )}

      {/* Tab 2: Standard C.O.M. */}
      {activeTab === 'standard_com' && (
        <div className="animate-fadeIn">
          <BirdStandardComTab bird={bird} />
        </div>
      )}

      {/* Tab 3: Santé & Soins */}
      {activeTab === 'sante' && (
        <div className="animate-fadeIn">
          <BirdHealthCareTab 
            bird={bird} 
            santeRecords={santeRecords} 
            onRefreshHealth={onRefreshHealth} 
          />
        </div>
      )}

      {/* Tab 4: Palmarès & Concours */}
      {activeTab === 'palmares' && (
        <div className="animate-fadeIn">
          <BirdPalmaresTab bird={bird} />
        </div>
      )}

      {/* Tab 5: Galerie & Documents */}
      {activeTab === 'galerie_docs' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
          
          {/* Photos Gallery */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Image className="w-4 h-4 text-emerald-400" />
                  {t('passportGalleryDocsTab')} ({bird.photos?.length || (bird.photo ? 1 : 0)})
                </h3>
                <p className="text-3xs text-slate-400 mt-0.5">
                  {language === 'fr' 
                    ? 'La première image est la photo principale du passeport.' 
                    : language === 'ar'
                    ? 'الصورة الأولى هي الصورة الرئيسية للجواز.'
                    : 'The first image is the main passport photo.'}
                </p>
              </div>

              <label className="text-xs font-bold bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-800 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0">
                <Upload className="w-3.5 h-3.5" />
                {language === 'fr' ? 'Ajouter' : language === 'ar' ? 'إضافة' : 'Add'}
                <input type="file" accept="image/*" onChange={handleAddPhotoToGallery} className="hidden" />
              </label>
            </div>

            {(!bird.photos || bird.photos.length === 0) && !bird.photo ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                <Image className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                <p>{language === 'fr' ? 'Aucune photo enregistrée pour cet oiseau.' : language === 'ar' ? 'لا توجد صور مسجلة لهذا الطائر.' : 'No photos recorded for this bird.'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3.5">
                {(bird.photos || (bird.photo ? [bird.photo] : [])).map((pic, idx) => (
                  <div key={idx} className="group relative rounded-2xl overflow-hidden border border-slate-800 aspect-square bg-slate-950">
                    <img src={pic} alt="" className="w-full h-full object-cover" />
                    
                    <div className="absolute top-2 start-2 px-2 py-0.5 bg-slate-950/80 backdrop-blur-md rounded-md text-3xs font-mono font-bold text-white border border-slate-800">
                      {idx === 0 ? '★' : `#${idx + 1}`}
                    </div>

                    <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
                      {idx > 0 && (
                        <button
                          onClick={() => handleMakePhotoPrincipal(idx)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-3xs font-bold uppercase transition-colors"
                        >
                          {language === 'fr' ? 'Définir principale' : language === 'ar' ? 'تعيين رئيسية' : 'Make main'}
                        </button>
                      )}
                      <button
                        onClick={() => handleRemovePhoto(idx)}
                        className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-3xs font-bold uppercase transition-colors"
                      >
                        {t('delete')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attached Documents */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                {language === 'fr' ? 'Pièces Jointes & Certificats' : language === 'ar' ? 'المرفقات والشهادات' : 'Attachments & Certificates'} ({bird.documents?.length || 0})
              </h3>
              <p className="text-3xs text-slate-400 mt-0.5">
                {language === 'fr' 
                  ? 'Certificats de sexage ADN, analyses vétérinaires et factures.'
                  : language === 'ar'
                  ? 'شهادات تحديد الجنس ADN، التحاليل البيطرية والفواتير.'
                  : 'DNA sexing certificates, veterinary tests and invoices.'}
              </p>
            </div>

            {/* Add Document Form */}
            <form onSubmit={handleAddDocument} className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="text-2xs font-extrabold uppercase tracking-wider text-slate-400">
                {language === 'fr' ? 'Associer un document' : language === 'ar' ? 'إرفاق وثيقة' : 'Attach Document'}
              </div>

              <AppInput
                label={language === 'fr' ? 'Intitulé du document *' : language === 'ar' ? 'عنوان الوثيقة *' : 'Document title *'}
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
                placeholder="ex. DNA Certificate"
              />

              <div className="grid grid-cols-2 gap-3">
                <AppSelect
                  label={language === 'fr' ? 'Type de document' : language === 'ar' ? 'نوع الوثيقة' : 'Document type'}
                  value={newDocType}
                  onChange={(e: any) => setNewDocType(e.target.value)}
                  options={[
                    { value: 'certificat', label: language === 'fr' ? 'Certificat sexage / cession' : language === 'ar' ? 'شهادة جنس / تنازل' : 'Certificate' },
                    { value: 'analyse', label: language === 'fr' ? 'Analyse vétérinaire' : language === 'ar' ? 'تحليل بيطري' : 'Lab Test' },
                    { value: 'facture', label: language === 'fr' ? 'Facture d\'achat' : language === 'ar' ? 'فاتورة شراء' : 'Invoice' },
                    { value: 'autre', label: language === 'fr' ? 'Document libre' : language === 'ar' ? 'وثيقة أخرى' : 'Other' }
                  ]}
                />

                <AppInput
                  label={language === 'fr' ? 'Date du document' : language === 'ar' ? 'التاريخ' : 'Date'}
                  type="date"
                  value={newDocDate}
                  onChange={(e) => setNewDocDate(e.target.value)}
                />
              </div>

              <AppInput
                label={language === 'fr' ? 'Description / Notes complémentaires' : language === 'ar' ? 'ملاحظات إضافية' : 'Notes'}
                value={newDocDesc}
                onChange={(e) => setNewDocDesc(e.target.value)}
                placeholder=""
              />

              <AppButton
                type="submit"
                variant="primary"
                size="sm"
                fullWidth
                startIcon={<Plus className="w-3.5 h-3.5" />}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
              >
                {t('save')}
              </AppButton>
            </form>

            {/* Documents List */}
            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pe-1">
              {(!bird.documents || bird.documents.length === 0) ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  {language === 'fr' ? 'Aucun document joint à ce passeport.' : language === 'ar' ? 'لا توجد وثائق مرفقة بهذا الجواز.' : 'No documents attached to this passport.'}
                </div>
              ) : (
                bird.documents.map(doc => (
                  <div 
                    key={doc.id}
                    className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start justify-between gap-3 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <FileCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <h5 className="font-bold text-xs text-white">{doc.nom}</h5>
                        <div className="flex items-center gap-2 text-3xs text-slate-400 font-mono">
                          <span className="uppercase">{doc.type}</span>
                          <span>•</span>
                          <span>{doc.date}</span>
                        </div>
                        {doc.description && (
                          <p className="text-3xs text-slate-400 pt-0.5">{doc.description}</p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveDocument(doc.id)}
                      className="p-1 rounded-lg text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                      title={t('delete')}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default BirdTabsNavigation;
