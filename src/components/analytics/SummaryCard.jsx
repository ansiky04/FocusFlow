import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, Coffee, Target, CheckCircle, Compass } from 'lucide-react';

const SUMMARY_STATS = [
  { label: 'Study Time', value: '4.5 hrs', icon: Clock, color: 'text-orange-500' },
  { label: 'Break Time', value: '45 mins', icon: Coffee, color: 'text-indigo-500' },
  { label: 'Sessions Completed', value: '9 / 10', icon: Target, color: 'text-purple-500' },
  { label: 'Tasks Finished', value: '12 / 15', icon: CheckCircle, color: 'text-emerald-500' },
  { label: 'Remaining Goal', value: '1.5 hrs', icon: Compass, color: 'text-rose-500' },
];

const TASK_PIE_DATA = [
  { name: 'Completed Tasks', value: 12, color: '#10b981' },
  { name: 'Pending Tasks', value: 3, color: '#6366f1' },
];

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 dark:bg-slate-950/95 border border-slate-200 dark:border-slate-800/80 p-2.5 rounded-lg shadow-md backdrop-blur-sm">
        <p className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
          <span 
            className="w-2.5 h-2.5 rounded-full inline-block" 
            style={{ backgroundColor: payload[0].payload.color }} 
          />
          {payload[0].name}: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

export default function SummaryCard() {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-6 hover:shadow-xl dark:hover:shadow-indigo-950/20 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300 flex flex-col md:flex-row gap-6 md:items-center">
      
      {/* Background glow on hover */}
      <div className="absolute -inset-px bg-gradient-to-r from-transparent via-slate-100/10 to-transparent dark:via-indigo-500/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

      {/* Left Column: Metrics List */}
      <div className="relative z-10 flex-1 space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Today's Summary
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Your metrics and tasks at a glance
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SUMMARY_STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div 
                key={i} 
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 hover:scale-[1.01] transition-transform duration-200"
              >
                <div className={`${stat.color} p-2 bg-white dark:bg-slate-950 rounded-lg shadow-sm`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">
                    {stat.label}
                  </span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {stat.value}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Divider line for md+ screens */}
      <div className="hidden md:block w-px h-36 bg-slate-100 dark:bg-slate-800" />

      {/* Right Column: Pie Chart representing completed/pending tasks */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full md:w-56 h-48 md:h-full">
        <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
          Task Distribution
        </h4>
        <div className="w-full h-32 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomPieTooltip />} />
              <Pie
                data={TASK_PIE_DATA}
                cx="50%"
                cy="50%"
                innerRadius={32}
                outerRadius={46}
                paddingAngle={4}
                dataKey="value"
              >
                {TASK_PIE_DATA.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    className="transition-all duration-300 hover:opacity-90 cursor-pointer"
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold leading-none">Done</span>
            <span className="text-lg font-black text-slate-800 dark:text-white mt-0.5">80%</span>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex gap-4 text-xs font-semibold mt-2">
          {TASK_PIE_DATA.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: item.color }} />
              <span className="text-slate-600 dark:text-slate-400">{item.value} {item.name.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
