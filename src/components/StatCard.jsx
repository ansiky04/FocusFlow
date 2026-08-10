import React from 'react';

/**
 * StatCard component displays a metric with an icon, soft background, and relative progress trend.
 * @param {Object} props
 * @param {string} props.title - The title of the statistic.
 * @param {string|number} props.value - The current value of the statistic.
 * @param {React.ComponentType} props.icon - The Lucide React icon component to render.
 * @param {string} [props.iconBg] - Icon background styling classes.
 * @param {string} [props.trend] - Optional description text of the trend.
 * @param {boolean} [props.isPositiveTrend=true] - Flag to style the trend label.
 */
export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  iconBg = 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400', 
  trend, 
  isPositiveTrend = true 
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-4 shadow-sm hover:shadow transition-shadow flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-[10px] ${iconBg}`}>
          <Icon className="h-5 w-5" />
        </div>
        
        {trend && (
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
            isPositiveTrend 
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' 
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
          }`}>
            {trend}
          </span>
        )}
      </div>

      <div>
        <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {value}
        </div>
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
          {title}
        </div>
      </div>
    </div>
  );
}

