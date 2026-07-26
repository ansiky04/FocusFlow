import React from 'react';

/**
 * AnalyticsCard component displays a metric with an icon, color gradient, and relative progress trend.
 * @param {Object} props
 * @param {string} props.title - The title of the statistic.
 * @param {string|number} props.value - The current value of the statistic.
 * @param {React.ComponentType} props.icon - The Lucide React icon component to render.
 * @param {string} props.gradient - Tailwind gradient classes for the icon background (e.g. "from-orange-500 to-amber-500").
 * @param {string} [props.trend] - Optional description text of the trend (e.g. "+1.5h vs yesterday").
 * @param {boolean} [props.isPositive=true] - Flag to style the trend label positively or negatively.
 */
export default function AnalyticsCard({ 
  title, 
  value, 
  icon: Icon, 
  gradient, 
  trend, 
  isPositive = true 
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-6 hover:shadow-xl dark:hover:shadow-indigo-950/20 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 hover:scale-[1.02] active:scale-[0.99] transition-all duration-300 ease-out flex flex-col justify-between min-h-[140px]">
      
      {/* Background radial highlight on hover */}
      <div className="absolute -inset-px bg-gradient-to-r from-transparent via-slate-100/30 to-transparent dark:via-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

      <div className="relative z-10 flex flex-col h-full justify-between">
        
        {/* Top row: Icon and Trend */}
        <div className="flex items-center justify-between mb-3">
          <div className={`rounded-xl bg-gradient-to-br ${gradient} p-2.5 text-white shadow-md shadow-slate-100 dark:shadow-none transition-transform group-hover:scale-110 group-hover:rotate-3 duration-300`}>
            <Icon className="h-5 w-5" />
          </div>
          
          {trend && (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors duration-200 ${
              isPositive 
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400' 
                : 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
            }`}>
              {trend}
            </span>
          )}
        </div>

        {/* Info content */}
        <div>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">
            {title}
          </p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight transition-all duration-200">
            {value}
          </h3>
        </div>

      </div>

    </div>
  );
}
