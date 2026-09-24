/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo } from 'react';
import { Canari } from '../../../types';
import { HealthEngine } from '../../../business/HealthEngine';
import { GenealogyNode } from '../types';
import { GeneticsEngine } from '../engines/GeneticsEngine';
import { 
  GitBranch, ZoomIn, ZoomOut, RotateCcw, Download, Eye, EyeOff, Search, Info, Check, Printer 
} from 'lucide-react';
import { GenealogySummary } from '../widgets/GeneticsWidgets';
import { printDocument, exportDocumentAsPDF } from '../../../utils/printUtils';

import { useLanguage } from '../../../context/LanguageContext';

interface GenealogyExplorerProps {
  birds: Canari[];
}

export const GenealogyExplorer: React.FC<GenealogyExplorerProps> = ({ birds }) => {
  const { t, isRtl, currentLanguage } = useLanguage();
  const [selectedBirdId, setSelectedBirdId] = useState<number | null>(() => {
    // Default to the first active bird if available
    const active = birds.filter(HealthEngine.isEligiblePatient);
    return active.length > 0 ? active[0].id : birds.length > 0 ? birds[0].id : null;
  });

  const [depth, setDepth] = useState<number>(3); // 2, 3, or 4 generations
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [viewStyle, setViewStyle] = useState<'compact' | 'detailed'>('detailed');
  const [zoom, setZoom] = useState<number>(100);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (selectedBirdId !== null || birds.length === 0) return;
    const firstEligible = birds.find(HealthEngine.isEligiblePatient);
    setSelectedBirdId(firstEligible?.id ?? null);
  }, [birds, selectedBirdId]);

  // Find selected bird
  const selectedBird = useMemo(() => {
    return birds.find(b => b.id === selectedBirdId) || null;
  }, [birds, selectedBirdId]);

  // Build the pedigree tree
  const pedigreeTree = useMemo(() => {
    if (!selectedBirdId) return null;
    return GeneticsEngine.buildAscentTree(selectedBirdId, birds, depth);
  }, [selectedBirdId, birds, depth]);

  // Completeness score
  const completeness = useMemo(() => {
    if (!selectedBirdId) return 0;
    return GeneticsEngine.calculatePedigreeCompleteness(selectedBirdId, birds, depth);
  }, [selectedBirdId, birds, depth]);

  // Filter birds for the selection list
  const filteredBirds = useMemo(() => {
    const active = birds.filter(HealthEngine.isEligiblePatient);
    if (!searchQuery) return active;
    const lowerQuery = searchQuery.toLowerCase();
    return active.filter(
      b => 
        (b.nom && b.nom.toLowerCase().includes(lowerQuery)) || 
        b.bague.toLowerCase().includes(lowerQuery)
    );
  }, [birds, searchQuery]);

  // Reset zoom & pan
  const handleResetZoom = () => {
    setZoom(100);
  };

  // Export SVG pedigree
  const handleExportSVG = () => {
    if (!selectedBird) return;
    const svgContent = document.getElementById('pedigree-tree-svg')?.outerHTML;
    if (!svgContent) return;

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pedigree_${selectedBird.bague}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger print layout and native PDF generation
  const handlePrint = async () => {
    printDocument('printable-area');
    if (selectedBird) {
      const fatherNode = pedigreeTree?.father;
      const motherNode = pedigreeTree?.mother;
      const unknownMale = t('genealogy.unknownMale');
      const unknownFemale = t('genealogy.unknownFemale');

      await exportDocumentAsPDF({
        title: `${t('genealogy.pdfTitle')} - ${selectedBird.nom}`,
        subtitle: `${t('genealogy.labelRing')}: ${selectedBird.bague} | ${t('genealogy.labelSex')}: ${selectedBird.sexe}`,
        language: currentLanguage,
        isRtl,
        sections: [
          {
            title: t('genealogy.secIdentity'),
            metrics: [
              { label: t('genealogy.labelName'), value: selectedBird.nom },
              { label: t('genealogy.labelRing'), value: selectedBird.bague },
              { label: t('genealogy.labelSex'), value: selectedBird.sexe },
              { label: t('genealogy.labelYear'), value: `${(selectedBird as any).annee || (selectedBird.date_naissance ? new Date(selectedBird.date_naissance).getFullYear() : new Date().getFullYear())}` },
            ],
          },
          {
            title: t('genealogy.secAscendance'),
            metrics: [
              { label: t('genealogy.labelFather'), value: fatherNode ? `${fatherNode.nom} (${fatherNode.bague})` : unknownMale },
              { label: t('genealogy.labelMother'), value: motherNode ? `${motherNode.nom} (${motherNode.bague})` : unknownFemale },
            ],
          },
        ],
      });
    }
  };

  // Helper to render tree nodes recursively in SVG or pure CSS
  // A clean horizontal flex rendering of the tree is extremely responsive and robust:
  const renderHorizontalTree = (node: GenealogyNode | null, currentDepth: number): React.ReactNode => {
    if (!node && currentDepth > depth) return null;

    const isPlaceholder = !node;
    const isMale = node?.sexe === 'Mâle';
    const isFemale = node?.sexe === 'Femelle';

    const cardBg = isPlaceholder 
      ? 'bg-slate-50/50 dark:bg-slate-900/40 border-dashed border-slate-200 dark:border-slate-800'
      : isMale 
        ? 'border-s-4 border-s-blue-500 bg-sky-50/40 hover:bg-sky-50 dark:bg-slate-900 dark:hover:bg-slate-850 border-sky-100 dark:border-slate-800'
        : isFemale
          ? 'border-s-4 border-s-pink-500 bg-pink-50/40 hover:bg-pink-50 dark:bg-slate-900 dark:hover:bg-slate-850 border-pink-100 dark:border-slate-800'
          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800';

    const textStyle = isPlaceholder 
      ? 'text-slate-400 font-medium italic' 
      : 'text-slate-800 dark:text-slate-100 font-bold';

    // Find the full bird object for extra badges if present
    const birdObj = node?.id ? birds.find(b => b.id === node.id) : null;
    const birthYear = (birdObj as any)?.annee || (birdObj?.date_naissance ? new Date(birdObj.date_naissance).getFullYear() : null);
    const mutationBadge = birdObj?.mutation || birdObj?.couleur;

    return (
      <div className="flex items-center gap-6 my-2 relative">
        {/* Node Card */}
        <div 
          onClick={() => {
            if (node) setSelectedBirdId(node.id);
          }}
          className={`p-3.5 rounded-2xl border w-44 sm:w-48 shadow-2xs transition-all shrink-0 select-none ${
            !isPlaceholder ? 'cursor-pointer transform hover:-translate-y-0.5 hover:shadow-xs' : ''
          } ${cardBg}`}
        >
          {isPlaceholder ? (
            <div className="text-[10px] text-center py-2 text-slate-400">{t('genetics.unrecordedAncestor')}</div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className={`text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1 ${
                  isMale ? 'text-blue-600 dark:text-blue-400' : isFemale ? 'text-pink-600 dark:text-pink-400' : 'text-slate-500'
                }`}>
                  <span>{isMale ? '♂' : isFemale ? '♀' : '•'}</span>
                  <span>{currentDepth === 0 ? t('genetics.subject') : isMale ? t('genetics.sire') : isFemale ? t('genetics.dam') : t('undetermined')}</span>
                </span>
                <span className="text-[8px] font-mono font-bold bg-slate-100 dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  G{currentDepth}
                </span>
              </div>
              <p className={`text-xs truncate ${textStyle}`} title={node.nom}>
                {node.nom || t('genetics.noName')}
              </p>
              <p className="text-[10px] font-mono font-semibold text-slate-400 truncate">
                {t('genetics.ringLabel')} : <span className="text-slate-700 dark:text-slate-300">{node.bague || t('genetics.noRing')}</span>
              </p>

              {/* Extra badges: Birth Year & Mutation */}
              <div className="pt-1.5 mt-1 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[8px] text-slate-400">
                <span className="font-mono">{birthYear ? t('genetics.bornOnYear', { year: birthYear }) : `ID #${node.id}`}</span>
                {mutationBadge && (
                  <span className="px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold truncate max-w-[80px]">
                    {mutationBadge}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Render ancestors side-by-side if not reached max depth */}
        {currentDepth < depth && (
          <div className="flex flex-col justify-center gap-4 relative">
            {/* Draw connectors or group cards */}
            {renderHorizontalTree(node?.father || null, currentDepth + 1)}
            {renderHorizontalTree(node?.mother || null, currentDepth + 1)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div id="printable-area" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left sidebar: Bird Selector */}
        <div className="lg:col-span-1 p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col h-[650px] shadow-2xs">
          <div className="flex items-center gap-1.5 pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <GitBranch className="w-4.5 h-4.5 text-indigo-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">{t('genetics.chooseSubject')}</h3>
          </div>

          <div className="relative mb-3.5">
            <Search className="absolute start-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={t('genetics.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full ps-9 pe-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Birds List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pe-1">
            {filteredBirds.length > 0 ? (
              filteredBirds.map((b) => {
                const isSelected = b.id === selectedBirdId;
                return (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBirdId(b.id)}
                    className={`w-full text-start p-2.5 rounded-xl text-xs transition-all border ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-100 text-indigo-950 dark:bg-indigo-950/20 dark:border-indigo-900 dark:text-indigo-300 font-bold'
                        : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold truncate max-w-[110px]">{b.nom || t('genetics.noName')}</span>
                      <span className={`text-[8px] px-1.5 py-0.2 rounded-md ${
                        b.sexe === 'Mâle' ? 'bg-sky-50 text-sky-600 dark:bg-sky-950/30' : 'bg-pink-50 text-pink-600 dark:bg-pink-950/30'
                      }`}>
                        {b.sexe === 'Mâle' ? t('male') : b.sexe === 'Femelle' ? t('female') : t('undetermined')}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                      {b.bague}
                    </div>
                  </button>
                );
              })
            ) : (
              <p className="text-[11px] text-slate-400 italic text-center py-8">{t('genetics.noBirdFound')}</p>
            )}
          </div>
        </div>

        {/* Right Area: Interactive Pedigree Tree Viewer */}
        <div className="lg:col-span-3 space-y-4 flex flex-col min-h-[650px]">
          
          {/* Summary Box (Stacked Above Canvas, NO absolute overlay) */}
          {selectedBird && (
            <div className="w-full max-w-[calc(100%-2rem)]">
              <GenealogySummary
                birdName={selectedBird.nom || t('genetics.noName')}
                birdRing={selectedBird.bague}
                completeness={completeness}
                depth={depth}
              />
            </div>
          )}

          {/* Controls Bar */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Depth Selector */}
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('genetics.treeDepth')} :</span>
                <select 
                  value={depth} 
                  onChange={(e) => setDepth(Number(e.target.value))}
                  className="bg-transparent border-none text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value={2}>{t('genetics.generationsCount', { count: 2 })}</option>
                  <option value={3}>{t('genetics.generationsCount', { count: 3 })}</option>
                  <option value={4}>{t('genetics.generationsCount', { count: 4 })}</option>
                </select>
              </div>

              {/* View style selector */}
              <div className="flex items-center bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-100 dark:border-slate-800/80">
                <button
                  onClick={() => setViewStyle('compact')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                    viewStyle === 'compact' 
                      ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-3xs' 
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {t('genetics.viewCompact')}
                </button>
                <button
                  onClick={() => setViewStyle('detailed')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                    viewStyle === 'detailed' 
                      ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-3xs' 
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {t('genetics.viewDetailed')}
                </button>
              </div>
            </div>

            {/* Zoom / Print Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom(Math.max(50, zoom - 10))}
                className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-500 border border-slate-100 dark:border-slate-800 cursor-pointer"
                title={t('genetics.zoomOut')}
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-[10px] font-bold font-mono text-slate-500 w-10 text-center">{zoom}%</span>
              <button
                onClick={() => setZoom(Math.min(150, zoom + 10))}
                className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-500 border border-slate-100 dark:border-slate-800 cursor-pointer"
                title={t('genetics.zoomIn')}
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-500 border border-slate-100 dark:border-slate-800 cursor-pointer"
                title={t('genetics.resetZoom')}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <div className="w-px h-5 bg-slate-100 dark:bg-slate-800 mx-1" />
              <button
                onClick={handlePrint}
                className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-500 border border-slate-100 dark:border-slate-800 cursor-pointer flex items-center gap-1"
                title={t('print')}
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Pedigree Stage (Independent canvas, no absolute overlap) */}
          <div className="flex-1 min-h-[450px] bg-slate-100/40 dark:bg-slate-950/40 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden relative flex flex-col">
            {pedigreeTree ? (
              <div className="flex-1 overflow-auto p-8 flex items-center justify-center cursor-grab active:cursor-grabbing print:overflow-visible print:bg-white">
                <div 
                  className="origin-center transition-all duration-300 flex items-center justify-center p-4 print:transform-none print:scale-100"
                  style={{ transform: `scale(${zoom / 100})` }}
                >
                  {/* Ascending genealogy list */}
                  <div className="flex flex-col justify-center items-center">
                    {renderHorizontalTree(pedigreeTree, 0)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Info className="w-8 h-8 text-slate-300" />
                <p className="text-xs font-semibold">{t('genetics.emptyTree')}</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
