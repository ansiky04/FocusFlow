import React, { useRef, useState } from 'react';
import { Download, Upload, Trash2, AlertTriangle, Check, ShieldAlert } from 'lucide-react';

const LOCALSTORAGE_KEYS = [
  'focusflow_profile_settings',
  'focusflow_study_goals',
  'focusflow_timer_settings',
  'focusflow_sound_settings',
  'focusflow_theme_selection',
  'focusflow_appearance_preferences',
  'focusflow_notification_settings',
];

export default function BackupSettings() {
  const fileInputRef = useRef(null);
  const [showToast, setShowToast] = useState(null); // { type: 'success'|'error', text: '' }

  const triggerToast = (type, text) => {
    setShowToast({ type, text });
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleExport = () => {
    const backupData = {};
    LOCALSTORAGE_KEYS.forEach(key => {
      const val = localStorage.getItem(key);
      if (val) {
        backupData[key] = val;
      }
    });

    try {
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(backupData, null, 2)
      )}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', 'focusflow_backup_settings.json');
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      triggerToast('success', 'Backup exported successfully!');
    } catch (err) {
      console.error(err);
      triggerToast('error', 'Failed to export backup data.');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result);
        let importedCount = 0;
        
        Object.keys(data).forEach(key => {
          if (LOCALSTORAGE_KEYS.includes(key)) {
            localStorage.setItem(key, data[key]);
            importedCount++;
          }
        });

        if (importedCount > 0) {
          triggerToast('success', `Imported ${importedCount} configurations! Reloading...`);
          setTimeout(() => window.location.reload(), 1500);
        } else {
          triggerToast('error', 'No valid FocusFlow settings found in file.');
        }
      } catch (err) {
        console.error(err);
        triggerToast('error', 'Invalid backup file structure.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input selection
  };

  const handleResetAll = () => {
    if (window.confirm("ARE YOU SURE? This will delete all your local configurations, study goals, custom timer limits, and chat histories, and restore factory defaults.")) {
      localStorage.clear();
      triggerToast('success', 'All configurations cleared! Reloading...');
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          Backup & Data Settings
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Save, restore, or wipe clean all application databases stored in your browser
        </p>
      </div>

      {/* Grid options */}
      <div className="space-y-4">
        {/* Export/Import panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Export card */}
          <div className="p-5 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/20 flex flex-col justify-between items-start gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest block mb-1">
                Export Settings
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                Download a JSON backup containing all profile configurations, timer durations, sound volume, and study goals.
              </p>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 text-xs font-bold rounded-xl transition-all"
            >
              <Download className="h-4 w-4" />
              Download Backup
            </button>
          </div>

          {/* Import card */}
          <div className="p-5 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/20 flex flex-col justify-between items-start gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest block mb-1">
                Import Settings
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                Upload a previously saved `.json` file to restore all your profiles and focus session parameters.
              </p>
            </div>
            <div className="w-full">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportFile}
                accept=".json"
                className="hidden"
              />
              <button
                onClick={handleImportClick}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 text-xs font-bold rounded-xl transition-all"
              >
                <Upload className="h-4 w-4" />
                Upload Backup file
              </button>
            </div>
          </div>

        </div>

        {/* Reset Warning Section */}
        <div className="p-5 rounded-xl border border-rose-500/20 bg-rose-500/[0.02] flex flex-col md:flex-row items-start md:items-center justify-between gap-5 mt-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 text-rose-500 rounded-lg flex-shrink-0 mt-0.5 md:mt-0">
              <AlertTriangle className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-widest block mb-1">
                Danger Zone: Factory Reset
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
                This action is permanent. It instantly deletes all focus timer records, profile details, sound presets, and offline chat databases stored inside your browser.
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAll}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-500/10 hover:scale-102 active:scale-98 transition-all flex-shrink-0"
          >
            <Trash2 className="h-4 w-4" />
            Wipe & Reset All
          </button>
        </div>
      </div>

      {/* Floating Status Notification */}
      {showToast && (
        <div className={`fixed bottom-6 right-6 z-50 text-white font-bold text-xs md:text-sm px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-bounce ${
          showToast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-600'
        }`}>
          {showToast.type === 'success' ? <Check className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
          {showToast.text}
        </div>
      )}

    </div>
  );
}
