import React from 'react';

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
