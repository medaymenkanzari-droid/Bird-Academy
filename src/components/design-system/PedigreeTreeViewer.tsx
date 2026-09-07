/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  GitBranch, ZoomIn, ZoomOut, RotateCcw, 
  ChevronDown, ChevronRight, User, Layers, ArrowDown, ArrowRight 
} from 'lucide-react';
import { Canari } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

export interface PedigreeNodeData {
  id?: number;
  nom?: string;
  bague?: string;
  sexe?: 'Mâle' | 'Femelle' | 'Male' | 'Female' | 'Indéterminé' | string;
  annee?: number | string;
  date_naissance?: string;
  mutation?: string;
  couleur?: string;
  race?: string;
  photo?: string;
  father?: PedigreeNodeData | null;
  mother?: PedigreeNodeData | null;
  pere?: PedigreeNodeData | null;
  mere?: PedigreeNodeData | null;
  generation?: number;
}

export interface PedigreeTreeViewerProps {
  /**
   * Root bird to display (either full node tree or Canari object).
   */
  rootBird?: Canari | PedigreeNodeData | null;
  /**
   * Root bird ID if passing a flat bird collection.
   */
  rootBirdId?: number | null;
  /**
   * Complete flat bird list to resolve ancestry when rootBird is a simple Canari or ID.
   */
  birds?: Canari[];
  /**
   * Depth of generations to display (2, 3, or 4). Default: 3.
   */
  depth?: number;
  /**
   * Display orientation mode:
   * 'auto': Vertical on mobile (< 768px), Horizontal on desktop (>= 768px)
   * 'horizontal': Always horizontal pedigree
   * 'vertical': Always vertical cascade
   */
  orientation?: 'auto' | 'horizontal' | 'vertical';
  /**
   * Callback fired when a bird card is selected/clicked.
   */
  onSelectBird?: (birdId: number) => void;
  /**
   * Currently selected bird ID for highlighting.
   */
  selectedBirdId?: number | null;
  /**
   * List of ancestor IDs to visually highlight (e.g. common ancestors).
   */
  highlightedAncestorIds?: number[];
  /**
   * Whether to show interactive zoom controls. Default: true.
   */
  showZoomControls?: boolean;
  /**
   * Custom container class.
   */
  className?: string;
}

/**
 * Builds a recursive normalized pedigree tree from flat birds collection.
 */
function buildPedigreeTreeFromList(
  targetId: number,
  birdsMap: Map<number, Canari>,
  maxDepth: number,
  currentGen: number = 0
): PedigreeNodeData | null {
  if (currentGen > maxDepth) return null;

  const bird = birdsMap.get(targetId);
  if (!bird) return null;

  const node: PedigreeNodeData = {
    id: bird.id,
    nom: bird.nom || `Oiseau #${bird.id}`,
    bague: bird.bague || 'Sans bague',
    sexe: bird.sexe,
    annee: (bird as any).annee || (bird.date_naissance ? new Date(bird.date_naissance).getFullYear() : undefined),
    date_naissance: bird.date_naissance,
    mutation: bird.mutation,
    couleur: bird.couleur,
    race: bird.race,
    photo: bird.photo,
    generation: currentGen,
    father: null,
    mother: null,
  };

  if (currentGen < maxDepth) {
    if (bird.pere_id) {
      node.father = buildPedigreeTreeFromList(bird.pere_id, birdsMap, maxDepth, currentGen + 1);
    }
    if (bird.mere_id) {
      node.mother = buildPedigreeTreeFromList(bird.mere_id, birdsMap, maxDepth, currentGen + 1);
    }
  }

  return node;
}

export const PedigreeTreeViewer: React.FC<PedigreeTreeViewerProps> = ({
  rootBird,
  rootBirdId,
  birds = [],
  depth = 3,
  orientation = 'auto',
  onSelectBird,
  selectedBirdId,
  highlightedAncestorIds = [],
  showZoomControls = true,
  className = '',
}) => {
  const { t, currentLanguage, isRtl } = useLanguage();
  const [zoom, setZoom] = useState<number>(100);
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  // Track responsive breakpoint
  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compute resolved orientation
  const resolvedOrientation = useMemo<'horizontal' | 'vertical'>(() => {
    if (orientation === 'horizontal') return 'horizontal';
    if (orientation === 'vertical') return 'vertical';
    return isMobileScreen ? 'vertical' : 'horizontal';
  }, [orientation, isMobileScreen]);

  // Birds map for fast lookup
  const birdsMap = useMemo(() => {
    return new Map<number, Canari>(birds.map(b => [b.id, b]));
  }, [birds]);

  // Build normalized tree
  const treeData = useMemo<PedigreeNodeData | null>(() => {
    if (rootBirdId && birds.length > 0) {
      return buildPedigreeTreeFromList(rootBirdId, birdsMap, depth);
    }
    if (rootBird) {
      // Check if rootBird is already a full tree with father/mother or pere/mere
      const anyBird = rootBird as any;
      if (anyBird.father !== undefined || anyBird.pere !== undefined) {
        return anyBird;
      }
      // If it's a Canari, build from map
      if (anyBird.id && birds.length > 0) {
        return buildPedigreeTreeFromList(anyBird.id, birdsMap, depth);
      }
      return {
        id: anyBird.id,
        nom: anyBird.nom,
        bague: anyBird.bague,
        sexe: anyBird.sexe,
        annee: anyBird.annee,
        mutation: anyBird.mutation,
        couleur: anyBird.couleur,
        generation: 0,
      };
    }
    return null;
  }, [rootBird, rootBirdId, birds, birdsMap, depth]);

  const handleResetZoom = () => setZoom(100);

  // Render a Single Bird Node Card
  const renderBirdCard = (
    node: PedigreeNodeData | null, 
    role: 'root' | 'father' | 'mother' | 'unknown', 
    gen: number
  ) => {
    const isPlaceholder = !node;
    const isMale = node?.sexe === 'Mâle' || node?.sexe === 'Male' || role === 'father';
    const isFemale = node?.sexe === 'Femelle' || node?.sexe === 'Female' || role === 'mother';
    const isHighlighted = Boolean(node?.id && highlightedAncestorIds.includes(node.id));
    const isSelected = Boolean(node?.id && selectedBirdId === node.id);

    // Gender border indicator styling
    const borderGenderClass = isPlaceholder
      ? 'border-dashed border-slate-700/60 bg-slate-900/40 text-slate-500'
      : isMale
        ? 'border-s-4 border-s-blue-500 border-t border-r border-b border-slate-800 bg-slate-900 hover:border-slate-700'
        : isFemale
          ? 'border-s-4 border-s-pink-500 border-t border-r border-b border-slate-800 bg-slate-900 hover:border-slate-700'
          : 'border border-slate-800 bg-slate-900 hover:border-slate-700';

    const highlightRingClass = isHighlighted 
      ? 'ring-2 ring-amber-500/80 shadow-amber-500/10 shadow-lg' 
      : isSelected
        ? 'ring-2 ring-indigo-500/80 shadow-indigo-500/10 shadow-lg'
        : 'shadow-xs';

    if (isPlaceholder) {
      return (
        <div 
          className={`p-3 rounded-2xl border ${borderGenderClass} w-44 sm:w-48 text-center shrink-0 select-none transition-all`}
        >
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            {role === 'father' ? `♂ ${t('genetics.sire')}` : role === 'mother' ? `♀ ${t('genetics.dam')}` : t('genetics.unrecordedAncestor')}
          </div>
          <p className="text-xs text-slate-400 italic mt-1">{t('genetics.unrecordedAncestor')}</p>
          <span className="inline-block text-[9px] font-mono text-slate-400 mt-1">G{gen}</span>
        </div>
      );
    }

    const birthYear = node.annee || (node.date_naissance ? new Date(node.date_naissance).getFullYear() : null);
    const primaryBadge = node.mutation || node.couleur || node.race;

    return (
      <div
        onClick={() => {
          if (node.id && onSelectBird) {
            onSelectBird(node.id);
          }
        }}
        className={`p-3.5 rounded-2xl ${borderGenderClass} ${highlightRingClass} w-44 sm:w-52 shrink-0 select-none transition-all duration-200 ${
          node.id ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md' : ''
        }`}
      >
        {/* Header role + gen badge */}
        <div className="flex items-center justify-between gap-1 mb-1.5">
          <span className={`text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1 ${
            isMale ? 'text-blue-400' : isFemale ? 'text-pink-400' : 'text-slate-400'
          }`}>
            <span>{isMale ? '♂' : isFemale ? '♀' : '•'}</span>
            <span>
              {gen === 0 
                ? t('genetics.subject') 
                : role === 'father' 
                  ? t('genetics.sire') 
                  : t('genetics.dam')}
            </span>
          </span>
          <span className="text-[9px] font-mono font-bold bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded-md border border-slate-800">
            G{gen}
          </span>
        </div>

        {/* Bird Name */}
        <div className="font-bold text-xs text-white truncate tracking-tight" title={node.nom}>
          {node.nom || t('genetics.noName')}
        </div>

        {/* Ring Number */}
        <div className="text-[10px] font-mono font-medium text-slate-400 truncate mt-0.5">
          {t('genetics.ringLabel')} : <span className="text-slate-200">{node.bague || t('genetics.noRing')}</span>
        </div>

        {/* Footer info: Birth Year & Mutation */}
        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1 text-[9px]">
          <span className="text-slate-400 font-mono">
            {birthYear ? t('genetics.bornOnYear', { year: birthYear }) : t('genetics.yearNotRecorded')}
          </span>
          {primaryBadge && (
            <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold truncate max-w-[90px]" title={primaryBadge}>
              {primaryBadge}
            </span>
          )}
        </div>
      </div>
    );
  };

  // Helper to extract father / mother node
  const getParents = (node: PedigreeNodeData | null) => {
    if (!node) return { father: null, mother: null };
    const father = node.father || (node as any).pere || null;
    const mother = node.mother || (node as any).mere || null;
    return { father, mother };
  };

  // Horizontal Tree Recursive Renderer (Desktop)
  const renderHorizontalBranch = (
    node: PedigreeNodeData | null, 
    role: 'root' | 'father' | 'mother' | 'unknown', 
    currentGen: number
  ): React.ReactNode => {
    if (currentGen > depth) return null;

    const { father, mother } = getParents(node);
    const hasNextGen = currentGen < depth;

    return (
      <div className="flex items-center gap-6 my-2 relative">
        {/* Node Card */}
        {renderBirdCard(node, role, currentGen)}

        {/* Recursive Children (Ancestors in horizontal direction) */}
        {hasNextGen && (
          <div className="flex flex-col justify-center gap-4 relative ps-3 border-s-2 border-slate-800">
            {renderHorizontalBranch(father, 'father', currentGen + 1)}
            {renderHorizontalBranch(mother, 'mother', currentGen + 1)}
          </div>
        )}
      </div>
    );
  };

  // Vertical Cascade Recursive Renderer (Mobile)
  const renderVerticalBranch = (
    node: PedigreeNodeData | null, 
    role: 'root' | 'father' | 'mother' | 'unknown', 
    currentGen: number
  ): React.ReactNode => {
    if (currentGen > depth) return null;

    const { father, mother } = getParents(node);
    const hasNextGen = currentGen < depth;

    return (
      <div className="flex flex-col items-center gap-3 my-2 w-full">
        {/* Node Card */}
        {renderBirdCard(node, role, currentGen)}

        {/* Sub-branches in vertical tree */}
        {hasNextGen && (
          <div className="w-full flex flex-col items-center gap-4 pt-2 border-t-2 border-slate-800">
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm justify-items-center">
              {renderVerticalBranch(father, 'father', currentGen + 1)}
              {renderVerticalBranch(mother, 'mother', currentGen + 1)}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`flex flex-col bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden text-slate-200 ${className}`}>
      
      {/* Header bar with controls */}
      <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            {t('genetics.treeTitle', { depth })}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-400">
            {resolvedOrientation === 'horizontal' ? t('genetics.viewHorizontal') : t('genetics.viewVertical')}
          </span>
        </div>

        {/* Zoom & reset controls */}
        {showZoomControls && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setZoom(Math.max(50, zoom - 10))}
              className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors cursor-pointer"
              title={t('genetics.zoomOut')}
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono font-bold text-slate-400 w-10 text-center">
              {zoom}%
            </span>
            <button
              onClick={() => setZoom(Math.min(150, zoom + 10))}
              className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors cursor-pointer"
              title={t('genetics.zoomIn')}
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors cursor-pointer"
              title={t('genetics.resetZoom')}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Canvas Stage */}
      <div className="flex-1 min-h-[380px] p-6 overflow-auto flex items-center justify-center bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
        {treeData ? (
          <div 
            className="origin-center transition-transform duration-200 ease-out flex items-center justify-center p-4"
            style={{ transform: `scale(${zoom / 100})` }}
          >
            {resolvedOrientation === 'horizontal' 
              ? renderHorizontalBranch(treeData, 'root', 0)
              : renderVerticalBranch(treeData, 'root', 0)
            }
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 text-xs">
            <User className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p>{t('genetics.emptyTree')}</p>
          </div>
        )}
      </div>

      {/* Footer Legend */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-4 text-[10px] text-slate-400 flex-wrap">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" /> ♂ {t('genetics.maleLineage')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-pink-500" /> ♀ {t('genetics.femaleLineage')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full border border-dashed border-slate-500" /> {t('genetics.unrecordedAncestor')}
          </span>
        </div>
        <span className="font-mono text-slate-400">
          Bird Academy Pedigree Engine
        </span>
      </div>

    </div>
  );
};

export default PedigreeTreeViewer;
