/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area, 
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';

// Default modern color palettes matching our design system
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#06b6d4'];
const DARK_COLORS = ['#818cf8', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#f472b6', '#2dd4bf', '#22d3ee'];

interface ChartProps {
  data: any[];
  xKey?: string;
  yKey?: string;
  yKey2?: string;
  height?: number;
  isDark?: boolean;
  isRtl?: boolean;
  currentLabel?: string;
  previousLabel?: string;
}

// 1. Line Chart
export const AnalyticsLineChart: React.FC<ChartProps> = ({
  data,
  xKey = 'name',
  yKey = 'value',
  yKey2,
  height = 240,
  isDark = false,
  isRtl = false,
  currentLabel = 'Current',
  previousLabel = 'Previous',
}) => {
  const currentColors = isDark ? DARK_COLORS : COLORS;
  return (
    <div className="w-full max-w-full min-w-0 overflow-hidden" style={{ width: '100%', height }} dir={isRtl ? 'rtl' : 'ltr'}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#f1f5f9'} />
          <XAxis 
            dataKey={xKey} 
            stroke={isDark ? '#94a3b8' : '#64748b'} 
            fontSize={10} 
            reversed={isRtl}
          />
          <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={10} orientation={isRtl ? 'right' : 'left'} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? '#0f172a' : '#ffffff', 
              borderColor: isDark ? '#334155' : '#e2e8f0',
              borderRadius: '8px',
              fontSize: '11px',
              color: isDark ? '#ffffff' : '#000000'
            }} 
          />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
          <Line 
            type="monotone" 
            dataKey={yKey} 
            name={currentLabel}
            stroke={currentColors[0]} 
            strokeWidth={2.5} 
            dot={{ r: 3 }} 
            activeDot={{ r: 5 }} 
          />
          {yKey2 && (
            <Line 
              type="monotone" 
              dataKey={yKey2} 
              name={previousLabel}
              stroke={currentColors[1]} 
              strokeWidth={1.5} 
              strokeDasharray="5 5" 
              dot={{ r: 2 }} 
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// 2. Bar Chart
export const AnalyticsBarChart: React.FC<ChartProps> = ({
  data,
  xKey = 'name',
  yKey = 'value',
  height = 240,
  isDark = false,
  isRtl = false,
}) => {
  const currentColors = isDark ? DARK_COLORS : COLORS;
  return (
    <div className="w-full max-w-full min-w-0 overflow-hidden" style={{ width: '100%', height }} dir={isRtl ? 'rtl' : 'ltr'}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#f1f5f9'} />
          <XAxis dataKey={xKey} stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={10} reversed={isRtl} />
          <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={10} orientation={isRtl ? 'right' : 'left'} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? '#0f172a' : '#ffffff', 
              borderColor: isDark ? '#334155' : '#e2e8f0',
              borderRadius: '8px',
              fontSize: '11px'
            }} 
          />
          <Bar dataKey={yKey} fill={currentColors[0]} radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={currentColors[index % currentColors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// 3. Area Chart
export const AnalyticsAreaChart: React.FC<ChartProps> = ({
  data,
  xKey = 'name',
  yKey = 'value',
  height = 240,
  isDark = false,
  isRtl = false,
}) => {
  const currentColors = isDark ? DARK_COLORS : COLORS;
  return (
    <div className="w-full max-w-full min-w-0 overflow-hidden" style={{ width: '100%', height }} dir={isRtl ? 'rtl' : 'ltr'}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={currentColors[0]} stopOpacity={0.4}/>
              <stop offset="95%" stopColor={currentColors[0]} stopOpacity={0.0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#f1f5f9'} />
          <XAxis dataKey={xKey} stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={10} reversed={isRtl} />
          <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={10} orientation={isRtl ? 'right' : 'left'} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? '#0f172a' : '#ffffff', 
              borderColor: isDark ? '#334155' : '#e2e8f0',
              borderRadius: '8px',
              fontSize: '11px'
            }} 
          />
          <Area type="monotone" dataKey={yKey} stroke={currentColors[0]} fillOpacity={1} fill="url(#colorArea)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// 4. Pie Chart
export const AnalyticsPieChart: React.FC<ChartProps> = ({
  data,
  xKey = 'name',
  yKey = 'value',
  height = 240,
  isDark = false,
}) => {
  const currentColors = isDark ? DARK_COLORS : COLORS;
  return (
    <div className="w-full max-w-full min-w-0 overflow-hidden" style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={3}
            dataKey={yKey}
            nameKey={xKey}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={currentColors[index % currentColors.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? '#0f172a' : '#ffffff', 
              borderColor: isDark ? '#334155' : '#e2e8f0',
              borderRadius: '8px',
              fontSize: '11px'
            }} 
          />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// 5. Radar Chart
export const AnalyticsRadarChart: React.FC<ChartProps> = ({
  data,
  xKey = 'name',
  yKey = 'value',
  height = 240,
  isDark = false,
}) => {
  const currentColors = isDark ? DARK_COLORS : COLORS;
  return (
    <div className="w-full max-w-full min-w-0 overflow-hidden" style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke={isDark ? '#334155' : '#e2e8f0'} />
          <PolarAngleAxis dataKey={xKey} stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={9} />
          <PolarRadiusAxis stroke={isDark ? '#334155' : '#cbd5e1'} fontSize={8} />
          <Radar name="Intensité" dataKey={yKey} stroke={currentColors[0]} fill={currentColors[0]} fillOpacity={0.3} />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

// 6. Scatter Chart
export const AnalyticsScatterChart: React.FC<ChartProps> = ({
  data,
  xKey = 'x',
  yKey = 'y',
  height = 240,
  isDark = false,
}) => {
  const currentColors = isDark ? DARK_COLORS : COLORS;
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#f1f5f9'} />
          <XAxis type="number" dataKey={xKey} name="Âge" unit="j" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={10} />
          <YAxis type="number" dataKey={yKey} name="COI" unit="%" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={10} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter name="Oiseaux" data={data} fill={currentColors[2]} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

// 7. Stacked Bar Chart
export const AnalyticsStackedBarChart: React.FC<ChartProps> = ({
  data,
  xKey = 'name',
  yKey = 'value',
  yKey2 = 'value2',
  height = 240,
  isDark = false,
  isRtl = false,
}) => {
  const currentColors = isDark ? DARK_COLORS : COLORS;
  return (
    <div style={{ width: '100%', height }} dir={isRtl ? 'rtl' : 'ltr'}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#f1f5f9'} />
          <XAxis dataKey={xKey} stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={10} reversed={isRtl} />
          <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={10} orientation={isRtl ? 'right' : 'left'} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
          <Bar dataKey={yKey} name="Fécondés" stackId="a" fill={currentColors[1]} />
          <Bar dataKey={yKey2} name="Clairs" stackId="a" fill={currentColors[3]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// 8. Histogram
export const AnalyticsHistogram: React.FC<ChartProps> = ({
  data,
  xKey = 'range',
  yKey = 'count',
  height = 240,
  isDark = false,
  isRtl = false,
}) => {
  const currentColors = isDark ? DARK_COLORS : COLORS;
  return (
    <div style={{ width: '100%', height }} dir={isRtl ? 'rtl' : 'ltr'}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap={1} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#f1f5f9'} />
          <XAxis dataKey={xKey} stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={10} reversed={isRtl} />
          <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={10} orientation={isRtl ? 'right' : 'left'} />
          <Tooltip />
          <Bar dataKey={yKey} name="Effectif" fill={currentColors[4]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// 9. Heat Map component (simulated via an elegant localized density grid)
export const AnalyticsHeatMap: React.FC<{
  gridData: { label: string; values: number[] }[];
  columnLabels?: string[];
  eventLabel?: string;
  isDark?: boolean;
}> = ({
  gridData,
  columnLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  eventLabel = 'events',
  isDark = false,
}) => {
  return (
    <div className="w-full min-w-0 max-w-full overflow-x-auto">
      <div className="space-y-2 text-xs min-w-[280px]">
        <div className="flex items-center gap-2 font-mono text-[9px] text-slate-400">
          <span className="w-16 shrink-0" />
          <div className="flex-1 grid grid-cols-5 gap-1.5 text-center">
            {columnLabels.map(label => <span key={label} className="truncate">{label}</span>)}
          </div>
        </div>
        {gridData.map((row, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="w-16 shrink-0 font-semibold text-[10px] text-slate-500 truncate">{row.label}</span>
            <div className="flex-1 grid grid-cols-5 gap-1.5">
              {row.values.map((v, i) => {
                let bg = "bg-slate-100 dark:bg-slate-800";
                if (v > 0 && v <= 2) bg = "bg-indigo-100 dark:bg-indigo-950 text-indigo-700";
                else if (v > 2 && v <= 5) bg = "bg-indigo-300 dark:bg-indigo-800 text-indigo-950";
                else if (v > 5) bg = "bg-indigo-600 text-white font-bold";
                return (
                  <div 
                    key={i} 
                    className={`h-7 rounded-lg flex items-center justify-center text-[10px] transition-all hover:scale-[1.05] ${bg}`}
                    title={`${row.label} - ${columnLabels[i]}: ${v} ${eventLabel}`}
                  >
                    {v}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 10. Timeline of biological milestones
export const AnalyticsTimeline: React.FC<{ items: { title: string; date: string; tag: string }[] }> = ({ items }) => {
  return (
    <div className="relative pl-4 border-l-2 border-slate-100 dark:border-slate-800 space-y-4">
      {items.map((item, idx) => (
        <div key={idx} className="relative">
          <div className="absolute -left-5.5 top-1 w-3 h-3 bg-indigo-500 rounded-full ring-4 ring-white dark:ring-slate-900" />
          <div className="space-y-0.5">
            <span className="px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 font-bold text-[8px] uppercase tracking-wider">
              {item.tag}
            </span>
            <h5 className="text-xs font-black text-slate-700 dark:text-slate-300">{item.title}</h5>
            <p className="text-[10px] text-slate-400 font-mono">{item.date}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
