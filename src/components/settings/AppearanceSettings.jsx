import React, { useState, useEffect } from 'react';
import { Palette, Check, Save } from 'lucide-react';

const ACCENTS = [
  { id: 'indigo', name: 'Indigo Aura', colorClass: 'bg-indigo-600' },
  { id: 'violet', name: 'Violet Spark', colorClass: 'bg-violet-600' },
  { id: 'rose', name: 'Rose Petal', colorClass: 'bg-rose-500' },
  { id: 'emerald', name: 'Emerald Forest', colorClass: 'bg-emerald-500' },
  { id: 'blue', name: 'Ocean Blue', colorClass: 'bg-blue-600' },
];

export default function AppearanceSettings() {
  const [accent, setAccent] = useState('indigo');
  const [compactMode, setCompactMode] = useState(false);
  const [enableAnimations, setEnableAnimations] = useState(true);
  const [roundedCorners, setRoundedCorners] = useState(true);
  const [showSavedToast, setShowSavedToast] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('focusflow_appearance_preferences');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.accent !== undefined) setAccent(data.accent);
        if (data.compactMode !== undefined) setCompactMode(data.compactMode);
        if (data.enableAnimations !== undefined) setEnableAnimations(data.enableAnimations);
        if (data.roundedCorners !== undefined) setRoundedCorners(data.roundedCorners);
      } catch (e) {
        console.warn("Failed to load appearance preferences:", e);
      }
    }
  }, []);

  const handleSave = () => {
    const data = { accent, compactMode, enableAnimations, roundedCorners };
    localStorage.setItem('focusflow_appearance_preferences', JSON.stringify(data));
    
    // Dispatch storage event to alert other modules
    window.dispatchEvent(new Event('storage'));

    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          Appearance Preferences
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Personalize typography sizes, layout boundaries, and color schemes
        </p>
      </div>

      {/* Accent Color Selection */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block flex items-center gap-1.5">
          <Palette className="h-4 w-4 text-indigo-500" />
          Accent Theme Color
        </label>
        
        <div className="flex flex-wrap gap-3">
          {ACCENTS.map((item) => (
            <button
              key={item.id}
              onClick={() => setAccent(item.id)}
              className={`w-9 h-9 rounded-full ${item.colorClass} flex items-center justify-center text-white transition-all duration-200 hover:scale-105 ${
                accent === item.id 
                  ? 'ring-4 ring-indigo-500/40 border border-white dark:border-slate-900 scale-105' 
                  : 'border border-transparent'
              }`}
              title={item.name}
            >
              {accent === item.id && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
      </div>

      <hr className="border-slate-100 dark:border-slate-800/80" />

      {/* Toggles */}
      <div className="space-y-3.5">
        <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Interface Layout Settings
        </h4>

        {/* Compact Mode Toggle */}
        <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/20 dark:border-slate-800 dark:bg-slate-950/10 cursor-pointer hover:border-slate-200 dark:hover:border-slate-800 transition-colors">
          <div>
            <span className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 block mb-0.5">
              Compact Layout Density
            </span>
            <span className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500">
              Reduce element padding and margin gaps for complex workspaces
            </span>
          </div>
          <input
            type="checkbox"
            checked={compactMode}
            onChange={(e) => setCompactMode(e.target.checked)}
            className="w-4 h-4 accent-indigo-500 cursor-pointer"
          />
        </label>

        {/* Animation Toggle */}
        <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/20 dark:border-slate-800 dark:bg-slate-950/10 cursor-pointer hover:border-slate-200 dark:hover:border-slate-800 transition-colors">
          <div>
            <span className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 block mb-0.5">
              Enable Transitions and Animations
            </span>
            <span className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500">
              Run fluid panel slides, fading prompts, and list transitions
            </span>
          </div>
          <input
            type="checkbox"
            checked={enableAnimations}
            onChange={(e) => setEnableAnimations(e.target.checked)}
            className="w-4 h-4 accent-indigo-500 cursor-pointer"
          />
        </label>

        {/* Rounded Corners Toggle */}
        <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/20 dark:border-slate-800 dark:bg-slate-950/10 cursor-pointer hover:border-slate-200 dark:hover:border-slate-800 transition-colors">
          <div>
            <span className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 block mb-0.5">
              Rounded Corner Borders
            </span>
            <span className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500">
              Style cards and panels with modern rounded edge frames
            </span>
          </div>
          <input
            type="checkbox"
            checked={roundedCorners}
            onChange={(e) => setRoundedCorners(e.target.checked)}
            className="w-4 h-4 accent-indigo-500 cursor-pointer"
          />
        </label>
      </div>

      {/* Action */}
      <div className="flex justify-end mt-4">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-md shadow-indigo-500/10 hover:scale-102 active:scale-98 transition-all duration-200"
        >
          <Save className="h-4 w-4" />
          Save Preferences
        </button>
      </div>

      {/* Saved Toast */}
      {showSavedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-white font-bold text-xs md:text-sm px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
          <Check className="h-4 w-4 inline" />
          Appearance updated successfully!
        </div>
      )}

    </div>
  );
}
