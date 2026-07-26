import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const PRODUCTIVITY_DATA = [
  { day: 'Mon', score: 78 },
  { day: 'Tue', score: 85 },
  { day: 'Wed', score: 82 },
  { day: 'Thu', score: 94 },
  { day: 'Fri', score: 89 },
  { day: 'Sat', score: 95 },
  { day: 'Sun', score: 92 },
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 dark:bg-slate-950/95 border border-slate-200 dark:border-slate-800/80 p-3 rounded-xl shadow-xl backdrop-blur-md">
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
          {payload[0].payload.day} Productivity
        </p>
        <p className="text-sm font-extrabold text-purple-500 dark:text-purple-400">
          {payload[0].value}% Score
        </p>
      </div>
    );
  }
  return null;
};

export default function ProductivityChart({ data }) {
  const chartData = data && data.length > 0 ? data : PRODUCTIVITY_DATA;
  const latestScore = chartData[chartData.length - 1].score;
  const previousScore = chartData.length > 1 ? chartData[chartData.length - 2].score : latestScore;
  const percentageDiff = latestScore - previousScore;
  const isPositive = percentageDiff >= 0;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-6 hover:shadow-xl dark:hover:shadow-indigo-950/20 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300 flex flex-col h-[350px]">
      
      {/* Background glow on hover */}
      <div className="absolute -inset-px bg-gradient-to-r from-transparent via-slate-100/10 to-transparent dark:via-purple-500/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

      {/* Header section */}
      <div className="relative z-10 flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Productivity Score
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Efficiency based on tasks completed and focus duration
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 dark:text-slate-500 block">Today's Score</span>
          <div className="flex items-center gap-1.5 justify-end">
            <span className="text-lg font-black text-slate-900 dark:text-white">{latestScore}%</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              isPositive 
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' 
                : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
            }`}>
              {isPositive ? '+' : ''}{percentageDiff}%
            </span>
          </div>
        </div>
      </div>

      {/* Chart container */}
      <div className="relative z-10 flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 5, left: -25, bottom: 5 }}
          >
            <defs>
              <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f1f5f9"
              className="dark:stroke-slate-800/40"
            />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              stroke="#94a3b8"
              fontSize={11}
              fontWeight={500}
            />
            <YAxis
              domain={[60, 100]}
              tickLine={false}
              axisLine={false}
              stroke="#94a3b8"
              fontSize={11}
              fontWeight={500}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#a855f7"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#purpleGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
