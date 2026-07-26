import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

const WEEKLY_DATA = [
  { day: 'Mon', hours: 4.2 },
  { day: 'Tue', hours: 5.8 },
  { day: 'Wed', hours: 3.5 },
  { day: 'Thu', hours: 6.5 },
  { day: 'Fri', hours: 4.8 },
  { day: 'Sat', hours: 7.2 },
  { day: 'Sun', hours: 5.0 },
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 dark:bg-slate-950/95 border border-slate-200 dark:border-slate-800/80 p-3 rounded-xl shadow-xl backdrop-blur-md">
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
          {payload[0].payload.day} Focus
        </p>
        <p className="text-sm font-extrabold text-indigo-500 dark:text-indigo-400">
          {payload[0].value.toFixed(1)} hrs
        </p>
      </div>
    );
  }
  return null;
};

export default function WeeklyChart({ data }) {
  const chartData = data && data.length > 0 ? data : WEEKLY_DATA;
  const totalHours = chartData.reduce((acc, curr) => acc + curr.hours, 0);
  const avgHours = (totalHours / chartData.length).toFixed(1);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-6 hover:shadow-xl dark:hover:shadow-indigo-950/20 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300 flex flex-col h-[350px]">
      
      {/* Background glow on hover */}
      <div className="absolute -inset-px bg-gradient-to-r from-transparent via-slate-100/10 to-transparent dark:via-indigo-500/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

      {/* Header section with metrics summary */}
      <div className="relative z-10 flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Weekly Focus Time
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitored focus sessions this week
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 dark:text-slate-500 block">Weekly Avg</span>
          <span className="text-lg font-black text-slate-900 dark:text-white">{avgHours}h/day</span>
        </div>
      </div>

      {/* Chart container */}
      <div className="relative z-10 flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
             data={chartData}
            margin={{ top: 5, right: 5, left: -25, bottom: 5 }}
          >
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.6} />
              </linearGradient>
              <linearGradient id="hoverBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#818cf8" stopOpacity={1} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.8} />
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
              tickLine={false}
              axisLine={false}
              stroke="#94a3b8"
              fontSize={11}
              fontWeight={500}
              tickFormatter={(v) => `${v}h`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.05)', radius: 8 }} />
            <Bar
              dataKey="hours"
              fill="url(#barGradient)"
              radius={[6, 6, 0, 0]}
              maxBarSize={45}
            >
              {WEEKLY_DATA.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  className="transition-all duration-300 hover:opacity-90"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
