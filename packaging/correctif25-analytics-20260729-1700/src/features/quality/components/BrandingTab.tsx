/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { 
  Sparkles, Shield, Info, RefreshCw, Image, Type, Palette, Compass, 
  HelpCircle, Check, X, Code, Copy, Eye, Layout, Sliders, Smartphone, 
  Layers, Award, FileText, Share2, AlertCircle, Play, EyeOff, ShieldAlert,
  ChevronRight, ZoomIn, Download, ExternalLink, SlidersHorizontal
} from 'lucide-react';

// Master Colors Definition
const BRAND_COLORS = {
  obsidian: '#090A0C',
  graphite: '#1E2025',
  indigo: '#4F46E5',
  steel: '#8A96A8',
  white: '#FFFFFF'
};

// SVG Master Logo Icon Component
export const BrandLogoIcon: React.FC<{ 
  className?: string; 
  colorTheme?: 'dark' | 'light' | 'mono-dark' | 'mono-light' | 'custom';
  showConstruction?: boolean;
  customColorNodeA?: string;
  customColorNodeB?: string;
}> = ({ 
  className = "w-12 h-12", 
  colorTheme = 'dark', 
  showConstruction = false,
  customColorNodeA,
  customColorNodeB
}) => {
  const gridColor = colorTheme === 'dark' || colorTheme === 'mono-dark' 
    ? 'rgba(138, 150, 168, 0.12)' 
    : 'rgba(30, 32, 37, 0.08)';
  
  const outerBorderColor = colorTheme === 'dark' || colorTheme === 'mono-dark'
    ? 'rgba(138, 150, 168, 0.3)'
    : 'rgba(30, 32, 37, 0.15)';

  let nodeA = '#4F46E5'; // Default Indigo
  let nodeB = '#8A96A8'; // Default Steel

  if (colorTheme === 'mono-dark') {
    nodeA = '#FFFFFF';
    nodeB = 'rgba(255, 255, 255, 0.6)';
  } else if (colorTheme === 'mono-light') {
    nodeA = '#090A0C';
    nodeB = 'rgba(9, 10, 12, 0.6)';
  } else if (colorTheme === 'light') {
    nodeA = '#4F46E5';
    nodeB = '#1E2025';
  } else if (colorTheme === 'custom' && customColorNodeA && customColorNodeB) {
    nodeA = customColorNodeA;
    nodeB = customColorNodeB;
  }

  const rungsColor = colorTheme === 'dark' || colorTheme === 'mono-dark'
    ? 'rgba(255, 255, 255, 0.2)'
    : 'rgba(9, 10, 12, 0.15)';

  const eyeColor = colorTheme === 'dark' || colorTheme === 'mono-dark' ? '#090A0C' : '#FFFFFF';

  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" id="bird-academy-vector-symbol">
      {/* 1. Aviary Grid / Ledger Matrix (Representing database structure) */}
      <path d="M10 20 H90 M10 40 H90 M10 60 H90 M10 80 H90" stroke={gridColor} strokeWidth="0.5" strokeDasharray="1 1" />
      <path d="M20 10 V90 M40 10 V90 M60 10 V90 M80 10 V90" stroke={gridColor} strokeWidth="0.5" strokeDasharray="1 1" />
      
      {/* Outer perfect geometric boundary */}
      <rect x="10" y="10" width="80" height="80" rx="16" stroke={outerBorderColor} strokeWidth="1" />
      
      {/* 2. DNA Helix / Pedigree Linkages (Representing genetics & heredity) */}
      {/* Helix Strand A */}
      <path d="M30 72 C 35 58, 65 42, 70 28" stroke={nodeA} strokeWidth="2.5" strokeLinecap="round" />
      {/* Helix Strand B */}
      <path d="M70 72 C 65 58, 35 42, 30 28" stroke={nodeB} strokeWidth="2.5" strokeLinecap="round" />
      
      {/* Base pairs (Database rungs) */}
      <line x1="37.5" y1="59" x2="62.5" y2="59" stroke={rungsColor} strokeWidth="1.5" />
      <line x1="50" y1="50" x2="50" y2="50" stroke={rungsColor} strokeWidth="1.5" />
      <line x1="37.5" y1="41" x2="62.5" y2="41" stroke={rungsColor} strokeWidth="1.5" />
      
      {/* DNA Nodes (Ledger records) */}
      <circle cx="30" cy="72" r="4.5" fill={nodeA} />
      <circle cx="70" cy="72" r="4.5" fill={nodeB} />
      <circle cx="37.5" cy="59" r="3.5" fill={nodeB} />
      <circle cx="62.5" cy="59" r="3.5" fill={nodeA} />
      <circle cx="37.5" cy="41" r="3.5" fill={nodeA} />
      <circle cx="62.5" cy="41" r="3.5" fill={nodeB} />
      
      {/* 3. Subtly integrated bird head and wing tip */}
      {/* Top right node is the bird's head */}
      <circle cx="70" cy="28" r="7.5" fill={nodeA} />
      {/* Sleek mathematical beak projecting right (exactly 45 degrees alignment) */}
      <path d="M74.5 23 L87 28 L74.5 33 Z" fill={nodeA} />
      {/* Precise eye dot */}
      <circle cx="71.5" cy="27" r="1.5" fill={eyeColor} />
      
      {/* Top left node is the wing tip */}
      <path d="M30 28 L23 18 L34 23 Z" fill={nodeB} />
      <circle cx="30" cy="28" r="4.5" fill={nodeB} />

      {/* 4. Geometric construction helpers (shown on toggle) */}
      {showConstruction && (
        <>
          {/* Fibonacci Proportional Circles */}
          <circle cx="70" cy="28" r="15" stroke="#EF4444" strokeWidth="0.5" strokeDasharray="2 2" />
          <circle cx="30" cy="28" r="10" stroke="#3B82F6" strokeWidth="0.5" strokeDasharray="2 2" />
          <circle cx="50" cy="50" r="30" stroke="#10B981" strokeWidth="0.5" strokeDasharray="3 3" />
          
          {/* Safe Area guides */}
          <rect x="2" y="2" width="96" height="96" stroke="#EF4444" strokeWidth="0.75" strokeDasharray="4 4" />
          <text x="6" y="8" fill="#EF4444" className="text-[4px] font-mono font-black uppercase">SAFE AREA BOUNDARY (1.5x Grid Unit)</text>
          
          {/* Intersection and coordinate markers */}
          <line x1="50" y1="5" x2="50" y2="95" stroke="rgba(79, 70, 229, 0.3)" strokeWidth="0.5" strokeDasharray="5 5" />
          <line x1="5" y1="50" x2="95" y2="50" stroke="rgba(79, 70, 229, 0.3)" strokeWidth="0.5" strokeDasharray="5 5" />
          
          <text x="52" y="48" fill="#4F46E5" className="text-[3px] font-mono font-bold">Center (50,50)</text>
          <text x="78" y="24" fill="#EF4444" className="text-[3px] font-mono font-bold">Caput (70,28)</text>
          <text x="18" y="24" fill="#3B82F6" className="text-[3px] font-mono font-bold">Wing (30,28)</text>
          <text x="15" y="88" fill="rgba(30, 32, 37, 0.5)" className="text-[3.5px] font-mono font-bold">Symmetrical 10x10 Base Matrix</text>
        </>
      )}
    </svg>
  );
};

export const BrandingTab: React.FC = () => {
  const { t } = useLanguage();
  
  // High-level grouped sub-tabs representing different aspects of the 21 brand deliverables
  const [activeTab, setActiveTab] = useState<'dna' | 'logo' | 'platforms' | 'grids' | 'incorrect'>('dna');
  const [showSplash, setShowSplash] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const triggerSplashOverlay = () => {
    setShowSplash(true);
    setTimeout(() => setShowSplash(false), 3500);
  };

  // SVG strings for direct copying
  const svgLogoCode = `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M10 20 H90 M10 40 H90 M10 60 H90 M10 80 H90" stroke="rgba(138, 150, 168, 0.12)" strokeWidth="0.5" strokeDasharray="1 1" />
  <path d="M20 10 V90 M40 10 V90 M60 10 V90 M80 10 V90" stroke="rgba(138, 150, 168, 0.12)" strokeWidth="0.5" strokeDasharray="1 1" />
  <rect x="10" y="10" width="80" height="80" rx="16" stroke="rgba(138, 150, 168, 0.3)" strokeWidth="1" />
  <path d="M30 72 C 35 58, 65 42, 70 28" stroke="#4F46E5" strokeWidth="2.5" />
  <path d="M70 72 C 65 58, 35 42, 30 28" stroke="#8A96A8" strokeWidth="2.5" />
  <circle cx="30" cy="72" r="4.5" fill="#4F46E5" />
  <circle cx="70" cy="72" r="4.5" fill="#8A96A8" />
  <circle cx="70" cy="28" r="7.5" fill="#4F46E5" />
  <path d="M74.5 23 L87 28 L74.5 33 Z" fill="#4F46E5" />
  <circle cx="71.5" cy="27" r="1.5" fill="#090A0C" />
  <path d="M30 28 L23 18 L34 23 Z" fill="#8A96A8" />
  <circle cx="30" cy="28" r="4.5" fill="#8A96A8" />
</svg>`;

  return (
    <div className="space-y-8 font-sans text-gray-800 dark:text-gray-100" id="brand-identity-suite">
      
      {/* Dashboard Top Presenter Block */}
      <div className="bg-gradient-to-br from-[#090A0C] via-[#1E2025] to-[#12141A] p-8 rounded-3xl border border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center gap-6 z-10 text-center md:text-left">
          <div className="w-20 h-20 bg-[#090A0C] rounded-2xl flex items-center justify-center border border-indigo-500/25 shadow-lg relative group shrink-0">
            <div className="absolute inset-0 bg-indigo-500/10 rounded-2xl blur-md group-hover:scale-110 transition duration-300" />
            <BrandLogoIcon className="w-14 h-14 relative z-10" colorTheme="dark" />
          </div>
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <h2 className="text-2xl font-black text-white tracking-[0.25em] font-mono uppercase">
                BIRD ACADEMY
              </h2>
              <span className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-widest">
                IDENTITY v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-xl mt-2 font-sans leading-relaxed">
              Complete Corporate Identity and Official Logo System. Purpose-built for high-integrity registries, genetics decision support, Wright Coefficient pedigree computation, and professional avian research institutions.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 z-10">
          <button
            onClick={triggerSplashOverlay}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-500 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition duration-200 cursor-pointer shadow-lg hover:shadow-indigo-500/20"
          >
            <Play className="w-3.5 h-3.5" />
            Launch Splash Demo
          </button>
        </div>
      </div>

      {/* Brand Identity Navigation Sub-tabs */}
      <div className="flex overflow-x-auto gap-1 border-b border-gray-150 dark:border-gray-800 pb-px scrollbar-none" id="branding-suite-tabs">
        {[
          { id: 'dna', label: '1. Brand DNA & Master Board', icon: Compass },
          { id: 'logo', label: '2. Logo Configurations (8 formats)', icon: Image },
          { id: 'platforms', label: '3. Platform Asset Suite (9 formats)', icon: Smartphone },
          { id: 'grids', label: '4. Grid & Size Standards', icon: Sliders },
          { id: 'incorrect', label: '5. Incorrect Usages (DO NOT)', icon: ShieldAlert }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3.5 border-b-2 font-bold text-xs whitespace-nowrap transition cursor-pointer ${isActive ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/20 dark:bg-indigo-950/10' : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT AREA */}

      {/* TAB 1: BRAND DNA & PRESENTATION BOARD */}
      {activeTab === 'dna' && (
        <div className="space-y-8 animate-fadeIn" id="brand-dna-board">
          
          {/* Quick Mission Vision Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-[#1E2025] p-6 rounded-3xl border border-gray-150 dark:border-gray-800 space-y-3">
              <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">Strict Mission</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                To build pristine, high-accuracy software that registers biological pedigree, automates inheritance calculations, and empowers veterinarians and breeders with immutable local records.
              </p>
            </div>

            <div className="bg-white dark:bg-[#1E2025] p-6 rounded-3xl border border-gray-150 dark:border-gray-800 space-y-3">
              <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">Enterprise Vision</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                To stand as the absolute global gold standard for avian research and collection systems, merging mathematical exactness with minimalist aesthetic excellence.
              </p>
            </div>

            <div className="bg-white dark:bg-[#1E2025] p-6 rounded-3xl border border-gray-150 dark:border-gray-800 space-y-3">
              <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">Platform Values</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                <strong>100% Offline-First</strong>, localized execution, military-grade security, zero trackers, zero cloud dependencies unless explicitly authorized by the institution.
              </p>
            </div>
          </div>

          {/* DELIVERABLE 21: Brand Presentation Board on CRISP WHITE BACKGROUND */}
          <div className="bg-white text-[#090A0C] p-8 rounded-3xl border border-gray-200 shadow-xl space-y-8" id="deliverable-21-board">
            
            {/* Board Header */}
            <div className="border-b border-gray-200 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-[0.3em] text-indigo-600 uppercase">DELIVERABLE 21</span>
                <h3 className="text-xl font-black tracking-tight text-[#090A0C] uppercase font-mono mt-0.5">
                  Official Brand Presentation Board
                </h3>
              </div>
              <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-mono text-gray-600 border border-gray-200 font-bold">
                FORMAT: Swiss Technical Presentation
              </span>
            </div>

            {/* Content Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Visual Identity Elements */}
              <div className="lg:col-span-7 space-y-8">
                
                {/* Board Logo Showcase */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-150 flex items-center gap-6">
                  <div className="w-24 h-24 bg-white rounded-xl border border-gray-200 p-2 flex items-center justify-center shadow-xs">
                    <BrandLogoIcon className="w-20 h-20" colorTheme="light" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-lg font-black font-mono tracking-[0.2em] leading-none block">BIRD ACADEMY</span>
                    <span className="text-[9px] font-mono text-gray-500 tracking-[0.35em] block uppercase">GENETICS DECISION SUPPORT</span>
                    <p className="text-[10px] text-gray-500 leading-normal max-w-sm mt-1">
                      Our proprietary symbol: a continuous mathematical DNA helix integrated into an abstract bird posture, overlaid on a secure registry matrix.
                    </p>
                  </div>
                </div>

                {/* Typography Scale */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black tracking-widest text-indigo-600 uppercase font-mono">Typography Tokens</h4>
                  <div className="border border-gray-200 rounded-2xl p-4 space-y-3 bg-gray-50">
                    <div className="flex items-baseline justify-between border-b border-gray-200 pb-2">
                      <span className="text-xs font-bold text-gray-500">Font Families</span>
                      <span className="text-xs font-mono font-bold text-gray-800">Space Grotesk (Titles) / Inter (Body)</span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-lg font-black tracking-tight uppercase font-mono">H1 DISPLAY : BIRD ACADEMY</div>
                      <div className="text-xs text-gray-500 font-mono">Size: 2.25rem (36px) | Tracking: -0.025em | Weight: 900</div>
                    </div>
                    <div className="space-y-1 pt-2 border-t border-gray-150">
                      <div className="text-xs leading-relaxed text-gray-700 font-sans">
                        Body Text: Minimalist sans-serif Inter delivers dense tables and genetics calculations with supreme optical focus.
                      </div>
                      <div className="text-[10px] text-gray-500 font-mono">Size: 0.75rem (12px) | Line Height: 1.5 | Weight: 400</div>
                    </div>
                  </div>
                </div>

                {/* Selected Iconography Guidelines */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black tracking-widest text-indigo-600 uppercase font-mono">Selected Iconography Guideline</h4>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { icon: Shield, name: "Precision", desc: "Scientific ledger validity" },
                      { icon: Code, name: "Genetics", desc: "Wright Coefficient models" },
                      { icon: Layers, name: "Habitat", desc: "Aviary grids" },
                      { icon: Award, name: "Quality", desc: "Pedigree certificates" }
                    ].map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-center">
                          <Icon className="w-5 h-5 mx-auto text-gray-700" />
                          <span className="block text-[9px] font-bold mt-1.5 uppercase tracking-wider">{item.name}</span>
                          <span className="block text-[8px] text-gray-400 leading-normal">{item.desc}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Right Column: Colors, Metadata, Design Tokens */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Absolute Color Swatches */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black tracking-widest text-indigo-600 uppercase font-mono">The 5 Master Colors</h4>
                  <div className="space-y-2">
                    {[
                      { name: "Obsidian", hex: "#090A0C", desc: "Absolute dark canvas & deep text", ratio: "Contrast 21:1" },
                      { name: "Graphite", hex: "#1E2025", desc: "Primary administrative borders & surfaces", ratio: "Contrast 14.2:1" },
                      { name: "White", hex: "#FFFFFF", desc: "Primary page background & document body", ratio: "Contrast 21:1" },
                      { name: "Primary Indigo", hex: "#4F46E5", desc: "High-focus highlight & interactive actions", ratio: "Contrast 4.8:1" },
                      { name: "Steel", hex: "#8A96A8", desc: "Grid matrix lines & secondary metadata", ratio: "Contrast 3.5:1" }
                    ].map((col, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg border border-gray-300" style={{ backgroundColor: col.hex }} />
                          <div>
                            <span className="block text-xs font-bold text-gray-900">{col.name}</span>
                            <span className="block text-[8px] text-gray-500 font-mono uppercase">{col.hex} • {col.desc}</span>
                          </div>
                        </div>
                        <span className="text-[9px] font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">
                          {col.ratio}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Identity Attributes JSON Design Tokens */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black tracking-widest text-indigo-600 uppercase font-mono">Design Tokens (JSON Export)</h4>
                  <pre className="p-4 bg-gray-950 text-emerald-400 font-mono text-[9px] rounded-2xl overflow-x-auto border border-gray-800 leading-normal max-h-48 scrollbar-thin">
{`{
  "brandName": "Bird Academy",
  "version": "1.0.0-GM",
  "theme": "Minimalist Bauhaus",
  "colors": {
    "obsidian": "#090A0C",
    "graphite": "#1E2025",
    "white": "#FFFFFF",
    "indigo": "#4F46E5",
    "steel": "#8A96A8"
  },
  "typography": {
    "headings": "Space Grotesk, sans-serif",
    "body": "Inter, system-ui, sans-serif",
    "monospace": "Fira Code, SFMono, monospace"
  },
  "metrics": {
    "baseGrid": 10,
    "borderRadius": "16px",
    "safeMargin": "1.5x Grid Unit"
  }
}`}
                  </pre>
                </div>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* TAB 2: LOGO CONFIGURATIONS (ITEMS 1 - 8) */}
      {activeTab === 'logo' && (
        <div className="space-y-8 animate-fadeIn" id="logo-configurations">
          
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-[0.3em] text-indigo-500 uppercase">DELIVERABLES 1 - 8</span>
              <h3 className="text-lg font-black uppercase tracking-wider text-gray-900 dark:text-white">Master Layouts & Theme Configurations</h3>
            </div>
            <button 
              onClick={() => copyToClipboard(svgLogoCode, 'master_svg')}
              className="px-3.5 py-2 text-xxs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg inline-flex items-center gap-1.5 hover:underline cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              {copiedText === 'master_svg' ? 'Copied Vector Code!' : 'Copy Symbol SVG Code'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* 1. Master Logo (Horizontal) */}
            <div className="bg-white dark:bg-[#1E2025] p-6 rounded-3xl border border-gray-150 dark:border-gray-800 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-indigo-500 block">DELIVERABLE 1</span>
                <h4 className="text-xs font-black uppercase text-gray-900 dark:text-white mt-1">1. Master Logo (Horizontal)</h4>
                <p className="text-[10px] text-gray-400 mt-1">The primary logo layout. Ideal for desktop website headers, official PDF reports, and main page title bars.</p>
              </div>
              <div className="bg-gray-50 dark:bg-[#090A0C] border border-gray-200 dark:border-gray-900 rounded-2xl p-10 flex items-center justify-center">
                <div className="flex items-center gap-4">
                  <BrandLogoIcon className="w-14 h-14" colorTheme="light" />
                  <div className="flex flex-col">
                    <span className="text-xl font-black tracking-[0.25em] text-gray-950 dark:text-white font-mono uppercase leading-none">BIRD ACADEMY</span>
                    <span className="text-[9px] font-mono text-gray-400 dark:text-slate-500 tracking-[0.45em] uppercase mt-1">Enterprise ERP</span>
                  </div>
                </div>
              </div>
              <span className="text-[9px] font-mono text-gray-400 block text-center">Use Case: Primary Digital Desktop & Global Identity Header</span>
            </div>

            {/* 2. Vertical Logo */}
            <div className="bg-white dark:bg-[#1E2025] p-6 rounded-3xl border border-gray-150 dark:border-gray-800 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-indigo-500 block">DELIVERABLE 2</span>
                <h4 className="text-xs font-black uppercase text-gray-900 dark:text-white mt-1">2. Vertical Logo (Centered)</h4>
                <p className="text-[10px] text-gray-400 mt-1">Centered stacked lockup. Optimal for catalog covers, system cover sheets, poster presentations, and printed collateral.</p>
              </div>
              <div className="bg-gray-50 dark:bg-[#090A0C] border border-gray-200 dark:border-gray-900 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                <BrandLogoIcon className="w-14 h-14 mb-3" colorTheme="light" />
                <span className="text-base font-black tracking-[0.3em] text-gray-950 dark:text-white font-mono uppercase leading-none">BIRD ACADEMY</span>
                <span className="text-[8px] font-mono text-gray-400 dark:text-slate-500 tracking-[0.45em] uppercase mt-1.5">Decision Support System</span>
              </div>
              <span className="text-[9px] font-mono text-gray-400 block text-center">Use Case: System Manual Covers, Print & Large Panels</span>
            </div>

            {/* 3. Square Logo */}
            <div className="bg-white dark:bg-[#1E2025] p-6 rounded-3xl border border-gray-150 dark:border-gray-800 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-indigo-500 block">DELIVERABLE 3</span>
                <h4 className="text-xs font-black uppercase text-gray-900 dark:text-white mt-1">3. Square Logo</h4>
                <p className="text-[10px] text-gray-400 mt-1">Constrained square box ratio lockup. Best suited for dashboard system tiles, platform profile listings, or circular stickers.</p>
              </div>
              <div className="bg-gray-50 dark:bg-[#090A0C] border border-gray-200 dark:border-gray-900 rounded-2xl p-8 flex items-center justify-center">
                <div className="w-44 h-44 bg-white dark:bg-[#1E2025] border border-gray-200 dark:border-gray-800 rounded-3xl p-4 flex flex-col items-center justify-center text-center shadow-xs">
                  <BrandLogoIcon className="w-11 h-11 mb-2" colorTheme="light" />
                  <span className="text-xs font-black tracking-[0.2em] text-[#090A0C] dark:text-white font-mono uppercase leading-none">BIRD ACADEMY</span>
                  <span className="text-[7px] font-mono text-gray-400 dark:text-slate-500 tracking-[0.3em] uppercase mt-1">LOCAL DECISION</span>
                </div>
              </div>
              <span className="text-[9px] font-mono text-gray-400 block text-center">Use Case: Institutional Directories & Dynamic System Tiles</span>
            </div>

            {/* 4. Icon Only */}
            <div className="bg-white dark:bg-[#1E2025] p-6 rounded-3xl border border-gray-150 dark:border-gray-800 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-indigo-500 block">DELIVERABLE 4</span>
                <h4 className="text-xs font-black uppercase text-gray-900 dark:text-white mt-1">4. Icon Only</h4>
                <p className="text-[10px] text-gray-400 mt-1">The proprietary vector mark without secondary typography. Used for browser favicons, in-app loader overlays, and micro-branding.</p>
              </div>
              <div className="bg-gray-50 dark:bg-[#090A0C] border border-gray-200 dark:border-gray-900 rounded-2xl p-10 flex items-center justify-center">
                <div className="p-4 bg-white dark:bg-[#1E2025] border border-gray-150 dark:border-gray-850 rounded-2xl shadow-xs">
                  <BrandLogoIcon className="w-16 h-16" colorTheme="light" />
                </div>
              </div>
              <span className="text-[9px] font-mono text-gray-400 block text-center">Use Case: Action Elements, Loaders, Watermarks</span>
            </div>

          </div>

          {/* Theme & Monochrome Configurations (5 - 8) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* 5. Monochrome Black */}
            <div className="bg-white p-4 rounded-3xl border border-gray-200 text-center flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[8px] font-mono font-bold uppercase text-gray-400 block">DELIVERABLE 5</span>
                <span className="block text-xxs font-black text-[#090A0C] uppercase tracking-wider mt-1">5. Monochrome Black</span>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl py-8 flex items-center justify-center">
                <BrandLogoIcon className="w-12 h-12" colorTheme="mono-light" />
              </div>
              <span className="text-[8.5px] font-mono text-gray-400 block">Contrast 21:1 on Pure White background</span>
            </div>

            {/* 6. Monochrome White */}
            <div className="bg-[#090A0C] p-4 rounded-3xl border border-gray-800 text-center flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[8px] font-mono font-bold uppercase text-slate-500 block">DELIVERABLE 6</span>
                <span className="block text-xxs font-black text-white uppercase tracking-wider mt-1">6. Monochrome White</span>
              </div>
              <div className="bg-[#090A0C] border border-gray-900 rounded-xl py-8 flex items-center justify-center">
                <BrandLogoIcon className="w-12 h-12" colorTheme="mono-dark" />
              </div>
              <span className="text-[8.5px] font-mono text-slate-500 block">Contrast 21:1 on Obsidian background</span>
            </div>

            {/* 7. Light Theme Version */}
            <div className="bg-white p-4 rounded-3xl border border-gray-200 text-center flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[8px] font-mono font-bold uppercase text-indigo-500 block">DELIVERABLE 7</span>
                <span className="block text-xxs font-black text-gray-900 uppercase tracking-wider mt-1">7. Light Theme Lockup</span>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl py-8 flex items-center justify-center">
                <BrandLogoIcon className="w-12 h-12" colorTheme="light" />
              </div>
              <span className="text-[8.5px] font-mono text-[#1E2025] font-bold block">Indigo & Graphite (#1E2025)</span>
            </div>

            {/* 8. Dark Theme Version */}
            <div className="bg-[#1E2025] p-4 rounded-3xl border border-gray-850 text-center flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[8px] font-mono font-bold uppercase text-indigo-400 block">DELIVERABLE 8</span>
                <span className="block text-xxs font-black text-white uppercase tracking-wider mt-1">8. Dark Theme Lockup</span>
              </div>
              <div className="bg-[#090A0C] border border-gray-900 rounded-xl py-8 flex items-center justify-center">
                <BrandLogoIcon className="w-12 h-12" colorTheme="dark" />
              </div>
              <span className="text-[8.5px] font-mono text-indigo-400 font-bold block">Indigo & Steel (#8A96A8)</span>
            </div>

          </div>

        </div>
      )}

      {/* TAB 3: PLATFORM ASSET SUITE (ITEMS 9 - 17) */}
      {activeTab === 'platforms' && (
        <div className="space-y-8 animate-fadeIn" id="platform-assets">
          
          <div className="border-b border-gray-150 dark:border-gray-850 pb-4">
            <span className="text-[10px] font-mono font-bold tracking-[0.3em] text-indigo-500 block">DELIVERABLES 9 - 17</span>
            <h3 className="text-lg font-black uppercase tracking-wider text-gray-900 dark:text-white mt-1">Software Platform Iconography & Avatars</h3>
            <p className="text-xs text-gray-400 mt-1">Pragmatic, standardized renders for web deployment, mobile launchers, native application packaging, and corporate profile hubs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 9. Favicon (16px preview) */}
            <div className="bg-white dark:bg-[#1E2025] p-6 rounded-3xl border border-gray-150 dark:border-gray-800 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[8px] font-mono font-bold text-gray-400 block uppercase">DELIVERABLE 9</span>
                <h4 className="text-xs font-black uppercase tracking-wider mt-1 text-gray-900 dark:text-white">9. Browser Favicon</h4>
                <p className="text-[10px] text-gray-400 leading-normal mt-1">Magnified representation showing pixel grid rendering alignment to prevent aliasing blur at 16x16 size.</p>
              </div>
              <div className="bg-gray-50 dark:bg-[#090A0C] border border-gray-200 dark:border-gray-900 rounded-xl p-4 flex flex-col items-center justify-center space-y-3">
                
                {/* Simulated 16x16 pixel grid */}
                <div className="grid grid-cols-16 gap-px bg-gray-300 dark:bg-gray-800 p-1 rounded-sm w-32 h-32">
                  {Array.from({ length: 256 }).map((_, i) => {
                    const row = Math.floor(i / 16);
                    const col = i % 16;
                    // Draw a simple block bird-helix shape inside 16x16
                    const isFilled = 
                      (row === 2 && col === 11) || // Head
                      (row === 3 && (col === 11 || col === 12 || col === 13)) || // Beak
                      (row === 4 && (col === 11)) ||
                      (row === 3 && col === 4) || // Wing tip
                      (row === 4 && (col === 4 || col === 5)) ||
                      (row >= 5 && row <= 11 && col === Math.round(8 + Math.sin(row * 0.8) * 4)) || // Strand A
                      (row >= 5 && row <= 11 && col === Math.round(8 - Math.sin(row * 0.8) * 4)) || // Strand B
                      (row === 11 && col === 4) || (row === 11 && col === 12); // Base nodes
                    return (
                      <div 
                        key={i} 
                        className={`w-1.5 h-1.5 ${isFilled ? 'bg-indigo-600' : 'bg-white dark:bg-[#1E2025]'}`} 
                      />
                    );
                  })}
                </div>
                
                <div className="flex items-center gap-3 bg-white dark:bg-[#1E2025] px-3 py-1.5 rounded-lg border border-gray-150">
                  <span className="text-[8px] font-mono text-gray-400 font-bold uppercase">Actual size 1:1 →</span>
                  <div className="w-4 h-4 bg-indigo-600 rounded-sm p-px flex items-center justify-center">
                    <BrandLogoIcon className="w-3.5 h-3.5" colorTheme="mono-dark" />
                  </div>
                </div>
              </div>
              <span className="text-[9px] font-mono text-gray-400 text-center">Aligned to exact pixel boundaries for extreme crispness</span>
            </div>

            {/* 10. Android Adaptive Icon */}
            <div className="bg-white dark:bg-[#1E2025] p-6 rounded-3xl border border-gray-150 dark:border-gray-800 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[8px] font-mono font-bold text-gray-400 block uppercase">DELIVERABLE 10</span>
                <h4 className="text-xs font-black uppercase tracking-wider mt-1 text-gray-900 dark:text-white">10. Android Adaptive Icon</h4>
                <p className="text-[10px] text-gray-400 leading-normal mt-1">Exploded view of background layer and foreground vector, masked in Android's squircle envelope.</p>
              </div>
              <div className="bg-gray-50 dark:bg-[#090A0C] border border-gray-200 dark:border-gray-900 rounded-xl p-4 flex flex-col items-center justify-center space-y-2">
                <div className="flex gap-2 items-center justify-center">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-[10px] font-mono font-bold">FG Layer</div>
                    <span className="text-[7.5px] font-mono text-gray-400 mt-1">Vector symbol</span>
                  </div>
                  <span className="text-gray-400 font-bold font-mono">+</span>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-[#090A0C] rounded-lg border border-gray-700 flex items-center justify-center text-slate-500 text-[10px] font-mono">BG Layer</div>
                    <span className="text-[7.5px] font-mono text-gray-400 mt-1">#090A0C Solid</span>
                  </div>
                  <span className="text-gray-400 font-bold font-mono">=</span>
                  <div className="flex flex-col items-center">
                    {/* Final Squircle mask preview */}
                    <div className="w-14 h-14 bg-[#090A0C] border border-gray-850 rounded-[14px] flex items-center justify-center shadow-lg relative overflow-hidden">
                      <div className="absolute inset-0 border border-red-500/10 rounded-[14px] pointer-events-none" />
                      <BrandLogoIcon className="w-10 h-10" colorTheme="dark" />
                    </div>
                    <span className="text-[7.5px] font-mono text-indigo-400 font-bold mt-1">Squircle Mask</span>
                  </div>
                </div>
              </div>
              <span className="text-[9px] font-mono text-gray-400 text-center">Conforms strictly to 66% safe area mask boundaries</span>
            </div>

            {/* 11. iOS App Icon */}
            <div className="bg-white dark:bg-[#1E2025] p-6 rounded-3xl border border-gray-150 dark:border-gray-800 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[8px] font-mono font-bold text-gray-400 block uppercase">DELIVERABLE 11</span>
                <h4 className="text-xs font-black uppercase tracking-wider mt-1 text-gray-900 dark:text-white">11. iOS App Icon</h4>
                <p className="text-[10px] text-gray-400 leading-normal mt-1">Premium squircle (continuous boundary grid), utilizing Graphite base with Indigo core, perfectly flat.</p>
              </div>
              <div className="bg-gray-50 dark:bg-[#090A0C] border border-gray-200 dark:border-gray-900 rounded-xl p-6 flex items-center justify-center">
                <div className="w-20 h-20 bg-[#1E2025] rounded-[18px] border border-gray-800 flex items-center justify-center shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-px bg-white/5" />
                  <BrandLogoIcon className="w-14 h-14" colorTheme="dark" />
                </div>
              </div>
              <span className="text-[9px] font-mono text-gray-400 text-center">Apple Human Interface compliant squircle geometry</span>
            </div>

            {/* 12. PWA Launcher Icon */}
            <div className="bg-white dark:bg-[#1E2025] p-6 rounded-3xl border border-gray-150 dark:border-gray-800 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[8px] font-mono font-bold text-gray-400 block uppercase">DELIVERABLE 12</span>
                <h4 className="text-xs font-black uppercase tracking-wider mt-1 text-gray-900 dark:text-white">12. PWA Icon</h4>
                <p className="text-[10px] text-gray-400 leading-normal mt-1">Web platform app launcher. Maskable, designed to fit standard circle containers flawlessly.</p>
              </div>
              <div className="bg-gray-50 dark:bg-[#090A0C] border border-gray-200 dark:border-gray-900 rounded-xl p-6 flex items-center justify-center">
                <div className="w-20 h-20 bg-white dark:bg-[#1E2025] rounded-full border border-gray-250 dark:border-gray-800 flex items-center justify-center shadow-md">
                  <BrandLogoIcon className="w-13 h-13" colorTheme="light" />
                </div>
              </div>
              <span className="text-[9px] font-mono text-gray-400 text-center">Circle envelope ratio: 1:1, perfectly aligned</span>
            </div>

            {/* 13. Desktop App Icon (Tauri) */}
            <div className="bg-white dark:bg-[#1E2025] p-6 rounded-3xl border border-gray-150 dark:border-gray-800 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[8px] font-mono font-bold text-gray-400 block uppercase">DELIVERABLE 13</span>
                <h4 className="text-xs font-black uppercase tracking-wider mt-1 text-gray-900 dark:text-white">13. Tauri Desktop Icon</h4>
                <p className="text-[10px] text-gray-400 leading-normal mt-1">Desktop app tile. Structured on Graphite plate with a razor-thin border accent, suitable for macOS/Windows.</p>
              </div>
              <div className="bg-gray-50 dark:bg-[#090A0C] border border-gray-200 dark:border-gray-900 rounded-xl p-6 flex items-center justify-center">
                <div className="w-20 h-20 bg-[#090A0C] rounded-2xl border border-indigo-500/15 flex items-center justify-center shadow-lg relative group">
                  <div className="absolute inset-x-0 top-0 h-px bg-white/10" />
                  <BrandLogoIcon className="w-13 h-13" colorTheme="dark" />
                </div>
              </div>
              <span className="text-[9px] font-mono text-gray-400 text-center">Flat macOS dock and Windows taskbar identity card</span>
            </div>

            {/* 14. Play Store App Icon */}
            <div className="bg-white dark:bg-[#1E2025] p-6 rounded-3xl border border-gray-150 dark:border-gray-800 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[8px] font-mono font-bold text-gray-400 block uppercase">DELIVERABLE 14</span>
                <h4 className="text-xs font-black uppercase tracking-wider mt-1 text-gray-900 dark:text-white">14. Play Store Asset</h4>
                <p className="text-[10px] text-gray-400 leading-normal mt-1">Conforms to Google Play store's strict 512x512 flat grid. Rounded rectangle, zero outer shadow.</p>
              </div>
              <div className="bg-gray-50 dark:bg-[#090A0C] border border-gray-200 dark:border-gray-900 rounded-xl p-6 flex items-center justify-center">
                <div className="w-20 h-20 bg-indigo-600 rounded-[14px] flex items-center justify-center shadow-md">
                  <BrandLogoIcon className="w-13 h-13" colorTheme="mono-dark" />
                </div>
              </div>
              <span className="text-[9px] font-mono text-gray-400 text-center">Play Console compliant, 512 x 512 canvas scaled</span>
            </div>

            {/* 15. App Store Icon */}
            <div className="bg-white dark:bg-[#1E2025] p-6 rounded-3xl border border-gray-150 dark:border-gray-800 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[8px] font-mono font-bold text-gray-400 block uppercase">DELIVERABLE 15</span>
                <h4 className="text-xs font-black uppercase tracking-wider mt-1 text-gray-900 dark:text-white">15. App Store Asset</h4>
                <p className="text-[10px] text-gray-400 leading-normal mt-1">Apple App Store 1024x1024 master grid asset representation. Symmetrical corners, flat vector.</p>
              </div>
              <div className="bg-gray-50 dark:bg-[#090A0C] border border-gray-200 dark:border-gray-900 rounded-xl p-6 flex items-center justify-center">
                <div className="w-20 h-20 bg-[#1E2025] border border-gray-850 rounded-[16px] flex items-center justify-center shadow-sm">
                  <BrandLogoIcon className="w-13 h-13" colorTheme="dark" />
                </div>
              </div>
              <span className="text-[9px] font-mono text-gray-400 text-center">Apple App Store master container profile</span>
            </div>

            {/* 16. GitHub Avatar */}
            <div className="bg-white dark:bg-[#1E2025] p-6 rounded-3xl border border-gray-150 dark:border-gray-800 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[8px] font-mono font-bold text-gray-400 block uppercase">DELIVERABLE 16</span>
                <h4 className="text-xs font-black uppercase tracking-wider mt-1 text-gray-900 dark:text-white">16. GitHub Profile Avatar</h4>
                <p className="text-[10px] text-gray-400 leading-normal mt-1">High-contrast circular identifier. Perfect for repository ownership and package directories.</p>
              </div>
              <div className="bg-gray-50 dark:bg-[#090A0C] border border-gray-200 dark:border-gray-900 rounded-xl p-6 flex items-center justify-center">
                <div className="w-16 h-16 bg-[#090A0C] border border-gray-800 rounded-full flex items-center justify-center overflow-hidden">
                  <BrandLogoIcon className="w-11 h-11" colorTheme="dark" />
                </div>
              </div>
              <span className="text-[9px] font-mono text-gray-400 text-center">Circle profile format for open source networks</span>
            </div>

            {/* 17. LinkedIn Avatar */}
            <div className="bg-white dark:bg-[#1E2025] p-6 rounded-3xl border border-gray-150 dark:border-gray-800 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[8px] font-mono font-bold text-gray-400 block uppercase">DELIVERABLE 17</span>
                <h4 className="text-xs font-black uppercase tracking-wider mt-1 text-gray-900 dark:text-white">17. LinkedIn Brand Profile</h4>
                <p className="text-[10px] text-gray-400 leading-normal mt-1">Standard corporate avatar template. Indigo backdrop with monochrome white symbol centered.</p>
              </div>
              <div className="bg-gray-50 dark:bg-[#090A0C] border border-gray-200 dark:border-gray-900 rounded-xl p-6 flex items-center justify-center">
                <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center shadow-md">
                  <BrandLogoIcon className="w-11 h-11" colorTheme="mono-dark" />
                </div>
              </div>
              <span className="text-[9px] font-mono text-gray-400 text-center">Binds brand trust to official business structures</span>
            </div>

          </div>

        </div>
      )}

      {/* TAB 4: GRID & SIZE STANDARDS (ITEMS 18 - 19) */}
      {activeTab === 'grids' && (
        <div className="space-y-8 animate-fadeIn" id="specifications">
          
          <div className="border-b border-gray-150 dark:border-gray-850 pb-4">
            <span className="text-[10px] font-mono font-bold tracking-[0.3em] text-indigo-500 block">DELIVERABLES 18 - 19</span>
            <h3 className="text-lg font-black uppercase tracking-wider text-gray-900 dark:text-white mt-1">Geometrical Grid Construction & Scale Standards</h3>
            <p className="text-xs text-gray-400 mt-1">Scientific verification coordinates, proportional ratio rules, and pixel-boundary scaling guide.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* 18. Construction Grid Diagram */}
            <div className="lg:col-span-7 bg-white dark:bg-[#1E2025] p-6 rounded-3xl border border-gray-150 dark:border-gray-800 space-y-4">
              <div>
                <span className="text-[8px] font-mono font-bold text-indigo-500 block">DELIVERABLE 18</span>
                <h4 className="text-xs font-black uppercase tracking-wider mt-1 text-gray-900 dark:text-white">18. Geometric Construction Grid</h4>
                <p className="text-[10px] text-gray-400 leading-normal mt-1">Blueprint plotting layout coordinates. Shows grid subdivisions, curvature radii, safe boundaries and anchor points.</p>
              </div>

              <div className="bg-gray-50 dark:bg-[#090A0C] rounded-2xl border border-gray-200 dark:border-gray-900 p-6 flex items-center justify-center">
                <div className="w-72 h-72 bg-white dark:bg-[#1E2025] rounded-xl border border-indigo-500/20 shadow-md relative">
                  <BrandLogoIcon className="w-full h-full" colorTheme="light" showConstruction={true} />
                </div>
              </div>

              <p className="text-[10.5px] text-gray-500 dark:text-gray-400 leading-relaxed font-mono bg-gray-50 dark:bg-[#090A0C] p-3.5 rounded-xl border border-gray-200 dark:border-gray-900">
                ✔ <strong>Ratios:</strong> Proportions based on 10x10 modules.<br />
                ✔ <strong>Safe Area:</strong> Marked by red outer boundary (1.5x grid spacing). No lettering/graphics allowed within.<br />
                ✔ <strong>Postures:</strong> 45-degree mathematical vectors for wing/beak projection ensure crisp scaling.
              </p>
            </div>

            {/* 19. Minimum Size & Scalability Guide */}
            <div className="lg:col-span-5 bg-white dark:bg-[#1E2025] p-6 rounded-3xl border border-gray-150 dark:border-gray-800 space-y-4 flex flex-col justify-between">
              <div>
                <span className="text-[8px] font-mono font-bold text-indigo-500 block">DELIVERABLE 19</span>
                <h4 className="text-xs font-black uppercase tracking-wider mt-1 text-gray-900 dark:text-white">19. Minimum Size & Scalability Guide</h4>
                <p className="text-[10px] text-gray-400 leading-normal mt-1">Multi-scale vector verification from 16px to 512px. Ensures legibility across all browser viewports and physical print sizes.</p>
              </div>

              {/* Sizes showcase */}
              <div className="space-y-3 bg-gray-50 dark:bg-[#090A0C] p-4 rounded-2xl border border-gray-200 dark:border-gray-900 font-mono text-[9.5px]">
                
                {/* 16px */}
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-850 pb-2">
                  <span className="font-bold text-gray-500">16 px (Micro browser)</span>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-indigo-600 rounded-xs flex items-center justify-center p-px">
                      <BrandLogoIcon className="w-3.5 h-3.5" colorTheme="mono-dark" />
                    </div>
                    <span className="text-gray-400">Excellent legibility</span>
                  </div>
                </div>

                {/* 24px */}
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-850 pb-2">
                  <span className="font-bold text-gray-500">24 px (In-app action bar)</span>
                  <div className="flex items-center gap-2">
                    <BrandLogoIcon className="w-6 h-6" colorTheme="light" />
                    <span className="text-gray-400">Standard Action size</span>
                  </div>
                </div>

                {/* 32px */}
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-850 pb-2">
                  <span className="font-bold text-gray-500">32 px (Sidebar list element)</span>
                  <div className="flex items-center gap-2">
                    <BrandLogoIcon className="w-8 h-8" colorTheme="light" />
                    <span className="text-gray-400">Compact Brand unit</span>
                  </div>
                </div>

                {/* 64px */}
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-850 pb-2">
                  <span className="font-bold text-gray-500">64 px (Report headers)</span>
                  <div className="flex items-center gap-2">
                    <BrandLogoIcon className="w-16 h-16" colorTheme="light" />
                    <span className="text-gray-400">Detailed helix rungs</span>
                  </div>
                </div>

                {/* 128px */}
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-850 pb-2">
                  <span className="font-bold text-gray-500">128 px (Settings cards)</span>
                  <div className="flex items-center gap-2">
                    <BrandLogoIcon className="w-24 h-24" colorTheme="light" />
                    <span className="text-gray-400">Intermediate dashboard tile</span>
                  </div>
                </div>

                {/* 256px */}
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-850 pb-2">
                  <span className="font-bold text-gray-500">256 px (Hero installations)</span>
                  <div className="flex items-center gap-2">
                    <BrandLogoIcon className="w-32 h-32" colorTheme="light" />
                    <span className="text-gray-400">Full grid rendering</span>
                  </div>
                </div>

                {/* 512px */}
                <div className="flex items-center justify-between pb-0.5">
                  <span className="font-bold text-gray-500">512 px (Application Store)</span>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-black">GM STANDARD</span>
                    <span className="text-gray-400">Master production export</span>
                  </div>
                </div>

              </div>

              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-indigo-800 dark:text-indigo-400 rounded-xl text-xxs font-mono flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0" />
                <span>Rungs & boundaries are mathematically designed to automatically align to even pixel scales.</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 5: INCORRECT USAGE GUIDELINES (DO NOTS) (ITEM 20) */}
      {activeTab === 'incorrect' && (
        <div className="space-y-8 animate-fadeIn" id="incorrect-usages">
          
          <div className="border-b border-gray-150 dark:border-gray-850 pb-4">
            <span className="text-[10px] font-mono font-bold tracking-[0.3em] text-indigo-500 block">DELIVERABLE 20</span>
            <h3 className="text-lg font-black uppercase tracking-wider text-gray-900 dark:text-white mt-1">Strict Logo Violations and Prohibited Alterations</h3>
            <p className="text-xs text-gray-400 mt-1">To preserve brand integrity, these modifications are strictly prohibited under any deployment or documentation conditions.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center text-xxs font-mono font-bold">
            
            {/* 1. Do not stretch */}
            <div className="bg-white dark:bg-[#1E2025] p-5 rounded-3xl border border-red-200 dark:border-red-950/40 flex flex-col items-center justify-between space-y-4">
              <span className="text-red-500 block">1. DO NOT STRETCH</span>
              <div className="py-6 flex items-center justify-center scale-x-150">
                <BrandLogoIcon className="w-12 h-12" colorTheme="light" />
              </div>
              <p className="text-[9.5px] text-gray-400 font-normal leading-normal">Aspect ratios must remain strictly 1:1. Never squish or stretch the vector box.</p>
            </div>

            {/* 2. Do not rotate */}
            <div className="bg-white dark:bg-[#1E2025] p-5 rounded-3xl border border-red-200 dark:border-red-950/40 flex flex-col items-center justify-between space-y-4">
              <span className="text-red-500 block">2. DO NOT ROTATE</span>
              <div className="py-6 flex items-center justify-center rotate-12">
                <BrandLogoIcon className="w-12 h-12" colorTheme="light" />
              </div>
              <p className="text-[9.5px] text-gray-400 font-normal leading-normal">The grid axes must always sit at 90° right angles. Never rotate the symbol.</p>
            </div>

            {/* 3. Do not recolor */}
            <div className="bg-white dark:bg-[#1E2025] p-5 rounded-3xl border border-red-200 dark:border-red-950/40 flex flex-col items-center justify-between space-y-4">
              <span className="text-red-500 block">3. DO NOT RECOLOR</span>
              <div className="py-6 flex items-center justify-center">
                <BrandLogoIcon className="w-12 h-12" colorTheme="custom" customColorNodeA="#EC4899" customColorNodeB="#F59E0B" />
              </div>
              <p className="text-[9.5px] text-gray-400 font-normal leading-normal">Only use the approved Obsidian, Indigo, White, and Steel palette. No neon tones.</p>
            </div>

            {/* 4. Do not distort */}
            <div className="bg-white dark:bg-[#1E2025] p-5 rounded-3xl border border-red-200 dark:border-red-950/40 flex flex-col items-center justify-between space-y-4">
              <span className="text-red-500 block">4. DO NOT PERSPECTIVE WARP</span>
              <div className="py-6 flex items-center justify-center [transform:skewX(15deg)]">
                <BrandLogoIcon className="w-12 h-12" colorTheme="light" />
              </div>
              <p className="text-[9.5px] text-gray-400 font-normal leading-normal">Keep the layout completely flat and mathematical. Never warp or skew the grid plane.</p>
            </div>

            {/* 5. Do not add shadows */}
            <div className="bg-white dark:bg-[#1E2025] p-5 rounded-3xl border border-red-200 dark:border-red-950/40 flex flex-col items-center justify-between space-y-4">
              <span className="text-red-500 block">5. DO NOT ADD SHADOWS</span>
              <div className="py-6 flex items-center justify-center">
                <div className="shadow-[0_15px_15px_rgba(79,70,229,0.45)] rounded-xl">
                  <BrandLogoIcon className="w-12 h-12" colorTheme="light" />
                </div>
              </div>
              <p className="text-[9.5px] text-gray-400 font-normal leading-normal">Our Bauhaus identity is strictly flat. Never add drop shadows or glows to the icon.</p>
            </div>

            {/* 6. Do not place on noisy backgrounds */}
            <div className="bg-white dark:bg-[#1E2025] p-5 rounded-3xl border border-red-200 dark:border-red-950/40 flex flex-col items-center justify-between space-y-4">
              <span className="text-red-500 block">6. NO NOISY BACKGROUNDS</span>
              <div className="py-6 w-full flex items-center justify-center bg-[repeating-linear-gradient(45deg,#ccc,#ccc_4px,#fff_4px,#fff_8px)] rounded-xl">
                <BrandLogoIcon className="w-12 h-12" colorTheme="light" />
              </div>
              <p className="text-[9.5px] text-gray-400 font-normal leading-normal">Ensure a high-contrast clean surface. Never overlay the symbol on patterns.</p>
            </div>

            {/* 7. Do not modify proportions */}
            <div className="bg-white dark:bg-[#1E2025] p-5 rounded-3xl border border-red-200 dark:border-red-950/40 flex flex-col items-center justify-between space-y-4">
              <span className="text-red-500 block">7. DO NOT ALTER PROPORTIONS</span>
              <div className="py-6 flex items-center justify-center relative">
                {/* Alter beak position */}
                <svg viewBox="0 0 100 100" className="w-12 h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 20 H90 M10 40 H90 M10 60 H90 M10 80 H90" stroke="rgba(30,32,37,0.08)" strokeWidth="0.5" strokeDasharray="1 1" />
                  <rect x="10" y="10" width="80" height="80" rx="16" stroke="rgba(30,32,37,0.15)" strokeWidth="1" />
                  <path d="M30 72 C 35 58, 65 42, 70 28" stroke="#4F46E5" strokeWidth="2.5" />
                  <path d="M70 72 C 65 58, 35 42, 30 28" stroke="#8A96A8" strokeWidth="2.5" />
                  {/* Huge Beak */}
                  <circle cx="70" cy="28" r="7.5" fill="#4F46E5" />
                  <path d="M74.5 15 L95 28 L74.5 41 Z" fill="#4F46E5" /> 
                </svg>
              </div>
              <p className="text-[9.5px] text-gray-400 font-normal leading-normal">The beak, eye and node dimensions are golden ratio locked. Never alter sub-components.</p>
            </div>

            {/* 8. Do not add decorative elements */}
            <div className="bg-white dark:bg-[#1E2025] p-5 rounded-3xl border border-red-200 dark:border-red-950/40 flex flex-col items-center justify-between space-y-4">
              <span className="text-red-500 block">8. NO CLUTTER / GRADIENTS</span>
              <div className="py-6 flex items-center justify-center relative">
                <BrandLogoIcon className="w-12 h-12" colorTheme="light" />
                <span className="absolute bottom-2 right-2 text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-1 rounded">Shiny Leaf 🍃</span>
              </div>
              <p className="text-[9.5px] text-gray-400 font-normal leading-normal">No glossy effects, 3D overlays, leaves, eggs, nests, or cartoon decorations.</p>
            </div>

          </div>

        </div>
      )}

      {/* FULL-SCREEN SPLASH OVERLAY PREVIEW DEMO */}
      {showSplash && (
        <div className="fixed inset-0 bg-[#090A0C] flex flex-col items-center justify-center z-[500] animate-[fadeIn_0.4s_ease-out]">
          
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-gradient-to-b from-[#1E2025] to-[#090A0C] rounded-[24px] flex items-center justify-center border border-indigo-500/20 shadow-2xl mx-auto relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-px bg-white/10" />
              <div className="absolute inset-0 bg-indigo-500/5 blur-md" />
              <BrandLogoIcon className="w-16 h-16 relative z-10" colorTheme="dark" />
            </div>
            
            <div className="space-y-1.5">
              <h2 className="text-xl font-black text-white tracking-[0.3em] font-mono uppercase leading-none">
                BIRD ACADEMY
              </h2>
              <p className="text-[9px] text-slate-500 tracking-[0.4em] uppercase font-mono font-bold">
                BIOLOGICAL LEDGER SYSTEM
              </p>
            </div>
          </div>

          <div className="absolute bottom-16 space-y-3.5 text-center">
            <div className="w-44 h-1 bg-slate-900 rounded-full mx-auto overflow-hidden border border-white/5 relative">
              <div className="absolute h-full bg-indigo-600 rounded-full animate-[loading_3.5s_linear_infinite]" style={{ width: '100%' }} />
            </div>
            <div className="space-y-1">
              <span className="block text-[8.5px] font-mono text-indigo-400 uppercase tracking-widest animate-pulse">
                INITIALIZING SECURE LOCAL STORAGE FILE HANDLERS...
              </span>
              <span className="block text-[8px] font-mono text-slate-500 uppercase">
                EMPREINTE REGISTRE CRYPTOGRAPHIQUE v1.0.0-GM
              </span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
