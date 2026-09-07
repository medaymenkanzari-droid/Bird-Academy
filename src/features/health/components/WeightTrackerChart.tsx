/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Scale, TrendingUp, TrendingDown, Minus, Calendar, Plus, Info } from 'lucide-react';
import { WeightLogEntry } from '../../birds/models/passport';
import { AppButton } from '../../../components/design-system';

export interface WeightTrackerChartProps {
  logs: WeightLogEntry[];
  onAddWeightClick?: () => void;
  className?: string;
}

export const WeightTrackerChart: React.FC<WeightTrackerChartProps> = ({
  logs,
  onAddWeightClick,
  className = ''
}) => {
  const [timeRange, setTimeRange] = useState<'30D' | '90D' | 'ALL'>('90D');
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    entry: WeightLogEntry;
  } | null>(null);

  // Filter logs based on selected time range and sort chronologically (oldest to newest for the chart)
  const filteredLogs = useMemo(() => {
    if (logs.length === 0) return [];
    const now = Date.now();
    const rangeDays = timeRange === '30D' ? 30 : timeRange === '90D' ? 90 : Infinity;

    const filtered = logs.filter(l => {
      if (rangeDays === Infinity) return true;
      const logTime = new Date(l.date).getTime();
      return (now - logTime) <= (rangeDays * 86400000);
    });

    // Sort ascending by date for left-to-right rendering
    return [...filtered].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [logs, timeRange]);

  // Latest weight metrics & trend calculation
  const latestEntry = logs.length > 0 ? logs[0] : null;
  const previousEntry = logs.length > 1 ? logs[1] : null;

  const trendData = useMemo(() => {
    if (!latestEntry) return { diff: 0, label: 'Aucune donnée', isPositive: false, isZero: true };
    if (!previousEntry) return { diff: 0, label: 'Première pesée', isPositive: false, isZero: true };

    const diff = Number((latestEntry.weightGrams - previousEntry.weightGrams).toFixed(2));
    if (diff === 0) {
      return { diff: 0, label: 'Poids Stable', isPositive: false, isZero: true };
    } else if (diff > 0) {
      return { diff, label: `+${diff}g Prise`, isPositive: true, isZero: false };
    } else {
      return { diff, label: `${diff}g Baisse`, isPositive: false, isZero: false };
    }
  }, [latestEntry, previousEntry]);

  // SVG Chart Dimensions & Computations
  const width = 600;
  const height = 220;
  const padding = { top: 25, right: 30, bottom: 35, left: 45 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Min and Max Weight Bounds for Y-axis (ideal canary scale around 18g - 26g)
  const yMin = 18;
  const yMax = 26;

  const getY = (val: number) => {
    const clamped = Math.max(yMin, Math.min(yMax, val));
    return padding.top + chartHeight - ((clamped - yMin) / (yMax - yMin)) * chartHeight;
  };

  const getX = (index: number, total: number) => {
    if (total <= 1) return padding.left + chartWidth / 2;
    return padding.left + (index / (total - 1)) * chartWidth;
  };

  // Generate SVG path for the curve
  const points = useMemo(() => {
    return filteredLogs.map((entry, idx) => ({
      x: getX(idx, filteredLogs.length),
      y: getY(entry.weightGrams),
      entry
    }));
  }, [filteredLogs]);

  const pathD = useMemo(() => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    return points.reduce((acc, curr, idx, arr) => {
      if (idx === 0) return `M ${curr.x} ${curr.y}`;
      // Smooth cubic bezier curves
      const prev = arr[idx - 1];
      const cpX1 = prev.x + (curr.x - prev.x) / 2;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (curr.x - prev.x) / 2;
      const cpY2 = curr.y;
      return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
    }, '');
  }, [points]);

  const areaD = useMemo(() => {
    if (points.length === 0) return '';
    const bottomY = padding.top + chartHeight;
    const startX = points[0].x;
    const endX = points[points.length - 1].x;
    return `${pathD} L ${endX} ${bottomY} L ${startX} ${bottomY} Z`;
  }, [pathD, points]);

  // Reference Healthy Zone (20g - 24g)
  const zoneTopY = getY(24);
  const zoneBottomY = getY(20);
  const zoneHeight = zoneBottomY - zoneTopY;

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5 text-white ${className}`}>
      
      {/* Header Bar: Latest Weight, Date, Trend, and Range Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        
        {/* Left Stats */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-3xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-amber-400" />
              Suivi Biométrique & Poids
            </span>
            {latestEntry && (
              <span className="text-3xs font-mono text-slate-500">
                • Mesuré le {latestEntry.date}
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-3">
            <div className="text-3xl font-black font-mono tracking-tight text-white">
              {latestEntry ? `${latestEntry.weightGrams}g` : '—'}
            </div>

            {/* Trend Pill */}
            {latestEntry && (
              <div className={`px-2.5 py-0.5 rounded-full text-2xs font-extrabold flex items-center gap-1 border ${
                trendData.isZero
                  ? 'bg-slate-800 text-slate-300 border-slate-700'
                  : trendData.isPositive
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                {trendData.isZero ? (
                  <Minus className="w-3 h-3 text-slate-400" />
                ) : trendData.isPositive ? (
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-amber-400" />
                )}
                <span>{trendData.label}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Controls: Filters & Quick Add */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Time Range Pills */}
          <div className="p-1 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-1 text-2xs font-bold">
            {(['30D', '90D', 'ALL'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  timeRange === range
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Quick Add Button */}
          {onAddWeightClick && (
            <AppButton
              variant="outline"
              size="sm"
              onClick={onAddWeightClick}
              startIcon={<Plus className="w-3.5 h-3.5" />}
              className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs"
            >
              Peser
            </AppButton>
          )}
        </div>

      </div>

      {/* SVG Interactive Chart Area */}
      <div className="relative w-full overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            <Scale className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p>Aucune donnée de pesée pour la période sélectionnée ({timeRange}).</p>
          </div>
        ) : (
          <div className="relative">
            <svg 
              viewBox={`0 0 ${width} ${height}`} 
              className="w-full h-auto select-none overflow-visible"
            >
              <defs>
                {/* Gradient for area fill */}
                <linearGradient id="weightAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>

                {/* Target healthy zone pattern */}
                <linearGradient id="targetZoneGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.04" />
                </linearGradient>
              </defs>

              {/* Shaded Target Healthy Range (20g - 24g) */}
              <rect
                x={padding.left}
                y={zoneTopY}
                width={chartWidth}
                height={zoneHeight}
                fill="url(#targetZoneGradient)"
                stroke="#10b981"
                strokeWidth="0.5"
                strokeDasharray="3 3"
                opacity="0.6"
              />
              <text
                x={padding.left + 8}
                y={zoneTopY + 12}
                fill="#10b981"
                fontSize="9"
                fontWeight="bold"
                opacity="0.8"
              >
                Zone Idéale (20g - 24g)
              </text>

              {/* Horizontal Grid lines */}
              {[18, 20, 22, 24, 26].map(g => {
                const yPos = getY(g);
                return (
                  <g key={g}>
                    <line
                      x1={padding.left}
                      y1={yPos}
                      x2={width - padding.right}
                      y2={yPos}
                      stroke="#334155"
                      strokeWidth="0.5"
                      strokeDasharray={g === 18 || g === 26 ? '' : '2 2'}
                      opacity="0.4"
                    />
                    <text
                      x={padding.left - 8}
                      y={yPos + 3}
                      fill="#64748b"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="end"
                    >
                      {g}g
                    </text>
                  </g>
                );
              })}

              {/* Area Fill */}
              {areaD && (
                <path d={areaD} fill="url(#weightAreaGradient)" />
              )}

              {/* Main Line Path */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Data Points */}
              {points.map((pt, pIdx) => (
                <g 
                  key={pIdx} 
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredPoint?.entry.id === pt.entry.id ? 6 : 4}
                    fill={hoveredPoint?.entry.id === pt.entry.id ? '#60a5fa' : '#1e3a8a'}
                    stroke="#3b82f6"
                    strokeWidth="2"
                    className="transition-all"
                  />
                </g>
              ))}

              {/* X-axis Date Labels */}
              {points.length > 0 && (
                <>
                  <text
                    x={points[0].x}
                    y={height - 10}
                    fill="#64748b"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="start"
                  >
                    {points[0].entry.date}
                  </text>
                  {points.length > 1 && (
                    <text
                      x={points[points.length - 1].x}
                      y={height - 10}
                      fill="#64748b"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="end"
                    >
                      {points[points.length - 1].entry.date}
                    </text>
                  )}
                </>
              )}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredPoint && (
              <div
                className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 bg-slate-950/95 border border-slate-700 p-2.5 rounded-xl shadow-2xl text-xs font-sans space-y-1 min-w-[140px]"
                style={{
                  left: `${(hoveredPoint.x / width) * 100}%`,
                  top: `${(hoveredPoint.y / height) * 100}%`,
                }}
              >
                <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1">
                  <span className="font-mono font-black text-blue-400 text-sm">
                    {hoveredPoint.entry.weightGrams}g
                  </span>
                  <span className="text-3xs uppercase font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                    {hoveredPoint.entry.context || 'routine'}
                  </span>
                </div>
                <div className="text-3xs text-slate-400 font-mono">
                  {hoveredPoint.entry.date}
                </div>
                {hoveredPoint.entry.notes && (
                  <p className="text-3xs text-slate-300 leading-snug pt-0.5">
                    {hoveredPoint.entry.notes}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Legend */}
      <div className="flex items-center justify-between text-3xs text-slate-400 pt-1 border-t border-slate-800/80 flex-wrap gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-blue-500 rounded" /> Évolution du poids réel
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded" /> Plage standard recommandée
          </span>
        </div>
        <span className="font-mono text-slate-500">
          Bird Academy Biomécanique
        </span>
      </div>

    </div>
  );
};

export default WeightTrackerChart;
