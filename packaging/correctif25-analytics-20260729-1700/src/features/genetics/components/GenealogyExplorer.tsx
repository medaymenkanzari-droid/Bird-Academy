/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Canari } from '../../../types';
import { GenealogyNode } from '../types';
import { GeneticsEngine } from '../engines/GeneticsEngine';
import { 
  GitBranch, ZoomIn, ZoomOut, RotateCcw, Download, Eye, EyeOff, Search, Info, Check, Printer 
} from 'lucide-react';
import { GenealogySummary } from '../widgets/GeneticsWidgets';

interface GenealogyExplorerProps {
  birds: Canari[];
}

export const GenealogyExplorer: React.FC<GenealogyExplorerProps> = ({ birds }) => {
  const [selectedBirdId, setSelectedBirdId] = useState<number | null>(() => {
    // Default to the first active bird if available
    const active = birds.filter(b => !b.archived);
    return active.length > 0 ? active[0].id : birds.length > 0 ? birds[0].id : null;
  });

  const [depth, setDepth] = useState<number>(3); // 2, 3, or 4 generations
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [viewStyle, setViewStyle] = useState<'compact' | 'detailed'>('detailed');
  const [zoom, setZoom] = useState<number>(100);
  const [searchQuery, setSearchQuery] = useState('');

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
    const active = birds.filter(b => !b.archived);
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

  // Trigger print layout
  const handlePrint = () => {
    window.print();
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
        ? 'bg-sky-50/40 hover:bg-sky-50 dark:bg-sky-950/20 dark:hover:bg-sky-950/30 border-sky-100 dark:border-sky-900/60'
        : isFemale
          ? 'bg-pink-50/40 hover:bg-pink-50 dark:bg-pink-950/20 dark:hover:bg-pink-950/30 border-pink-100 dark:border-pink-900/60'
          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800';

    const textStyle = isPlaceholder 
      ? 'text-slate-400 font-medium italic' 
      : 'text-slate-800 dark:text-slate-100 font-bold';

    return (
      <div className="flex items-center gap-6 my-2 relative">
        {/* Node Card */}
        <div 
          onClick={() => {
            if (node) setSelectedBirdId(node.id);
          }}
          className={`p-3 rounded-xl border w-44 shadow-2xs transition-all shrink-0 select-none ${
            !isPlaceholder ? 'cursor-pointer transform hover:-translate-y-0.5 hover:shadow-xs' : ''
          } ${cardBg}`}
        >
          {isPlaceholder ? (
            <div className="text-[10px] text-center py-2 text-slate-400">Ancêtre non renseigné</div>
          ) : (
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className={`text-[9px] font-bold uppercase tracking-wide ${
                  isMale ? 'text-sky-600 dark:text-sky-400' : isFemale ? 'text-pink-600 dark:text-pink-400' : 'text-slate-500'
                }`}>
                  {node.sexe === 'Mâle' ? '♂ Père' : node.sexe === 'Femelle' ? '♀ Mère' : 'Indéterminé'}
                </span>
                <span className="text-[8px] font-mono font-bold bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded text-slate-500 dark:text-slate-400">
                  G{currentDepth}
                </span>
              </div>
              <p className={`text-[11px] truncate ${textStyle}`} title={node.nom}>
                {node.nom}
              </p>
              <p className="text-[9px] font-mono font-semibold text-slate-400 truncate">
                Bague : {node.bague}
              </p>

              {viewStyle === 'detailed' && (
                <div className="pt-1 mt-1 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[8px] text-slate-400">
                  {/* Small avatar or details */}
                  <span className="truncate">Sujet n°{node.id}</span>
                </div>
              )}
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left sidebar: Bird Selector */}
        <div className="lg:col-span-1 p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col h-[650px] shadow-2xs">
          <div className="flex items-center gap-1.5 pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <GitBranch className="w-4.5 h-4.5 text-indigo-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Choisir un Sujet</h3>
          </div>

          <div className="relative mb-3.5">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher nom, bague..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Birds List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {filteredBirds.length > 0 ? (
              filteredBirds.map((b) => {
                const isSelected = b.id === selectedBirdId;
                return (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBirdId(b.id)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-all border ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-100 text-indigo-950 dark:bg-indigo-950/20 dark:border-indigo-900 dark:text-indigo-300 font-bold'
                        : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold truncate max-w-[110px]">{b.nom || 'Sans nom'}</span>
                      <span className={`text-[8px] px-1.5 py-0.2 rounded-md ${
                        b.sexe === 'Mâle' ? 'bg-sky-50 text-sky-600 dark:bg-sky-950/30' : 'bg-pink-50 text-pink-600 dark:bg-pink-950/30'
                      }`}>
                        {b.sexe}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                      {b.bague}
                    </div>
                  </button>
                );
              })
            ) : (
              <p className="text-[11px] text-slate-400 italic text-center py-8">Aucun oiseau trouvé.</p>
            )}
          </div>
        </div>

        {/* Right Area: Interactive Pedigree Tree Viewer */}
        <div className="lg:col-span-3 space-y-6 flex flex-col h-[650px]">
          
          {/* Controls Bar */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Depth Selector */}
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Profondeur :</span>
                <select 
                  value={depth} 
                  onChange={(e) => setDepth(Number(e.target.value))}
                  className="bg-transparent border-none text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value={2}>2 Générations</option>
                  <option value={3}>3 Générations</option>
                  <option value={4}>4 Générations</option>
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
                  Compact
                </button>
                <button
                  onClick={() => setViewStyle('detailed')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                    viewStyle === 'detailed' 
                      ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-3xs' 
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Détaillé
                </button>
              </div>
            </div>

            {/* Zoom / Print Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom(Math.max(50, zoom - 10))}
                className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-500 border border-slate-100 dark:border-slate-800 cursor-pointer"
                title="Zoomer arrière"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-[10px] font-bold font-mono text-slate-500 w-10 text-center">{zoom}%</span>
              <button
                onClick={() => setZoom(Math.min(150, zoom + 10))}
                className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-500 border border-slate-100 dark:border-slate-800 cursor-pointer"
                title="Zoomer avant"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-500 border border-slate-100 dark:border-slate-800 cursor-pointer"
                title="Réinitialiser zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <div className="w-px h-5 bg-slate-100 dark:bg-slate-800 mx-1" />
              <button
                onClick={handlePrint}
                className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-500 border border-slate-100 dark:border-slate-800 cursor-pointer flex items-center gap-1"
                title="Imprimer"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Pedigree Stage */}
          <div className="flex-1 bg-slate-100/40 dark:bg-slate-950/40 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden relative flex flex-col">
            
            {selectedBird ? (
              <div className="absolute top-4 left-4 z-10 w-64">
                <GenealogySummary
                  birdName={selectedBird.nom || 'Sans nom'}
                  birdRing={selectedBird.bague}
                  completeness={completeness}
                  depth={depth}
                />
              </div>
            ) : null}

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
                <p className="text-xs font-semibold">Aucun sujet sélectionné pour afficher l'arbre.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
