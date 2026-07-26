import React, { useState, useEffect } from 'react';
import { User, Mail, Save, RotateCcw, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const AVATAR_COLORS = [
  { id: 'indigo', label: 'Indigo Glow', classes: 'from-indigo-500 to-purple-600' },
  { id: 'rose', label: 'Rose Dawn', classes: 'from-rose-500 to-pink-600' },
  { id: 'emerald', label: 'Emerald Mint', classes: 'from-emerald-500 to-teal-600' },
  { id: 'amber', label: 'Amber Sunny', classes: 'from-amber-400 to-orange-500' },
  { id: 'cyan', label: 'Cyan Ocean', classes: 'from-cyan-400 to-blue-500' },
];

export default function ProfileSettings() {
  const { user, setUser } = useApp();
  const [name, setName] = useState(user?.fullName || 'John Doe');
  const [email, setEmail] = useState(user?.email || 'john.doe@example.com');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || 'indigo');
  const [showSavedToast, setShowSavedToast] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.fullName);
      setEmail(user.email);
      setSelectedAvatar(user.avatar || 'indigo');
    }
  }, [user]);

  const handleSave = () => {
    const data = { name, avatar: selectedAvatar };
    localStorage.setItem('focusflow_profile_settings', JSON.stringify(data));
    
    // Sync state locally into the global user object context
    if (user) {
      setUser({ ...user, fullName: name, avatar: selectedAvatar });
    }

    // Broadcast change to Navbar/Header if they read name
    window.dispatchEvent(new Event('storage'));
    
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);
  };

  const handleReset = () => {
    setName(user?.fullName || 'John Doe');
    setSelectedAvatar(user?.avatar || 'indigo');
  };

  const currentAvatarColor = AVATAR_COLORS.find(c => c.id === selectedAvatar) || AVATAR_COLORS[0];

  return (
    <div className="space-y-6">
      
      {/* Profile Section Heading */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          Profile Settings
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Customize your public user details and select an avatar theme
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        
        {/* Avatar Display and Selector */}
        <div className="flex flex-col items-center gap-4 flex-shrink-0">
          <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${currentAvatarColor.classes} flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-indigo-500/10`}>
            {name ? name.charAt(0).toUpperCase() : 'J'}
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Current Avatar
          </span>
        </div>

        {/* Form fields */}
        <div className="flex-1 w-full space-y-5">
          {/* Display Name Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
              Display Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-100 dark:focus:border-indigo-500/80"
                placeholder="Enter your name"
              />
            </div>
          </div>

          {/* Email (Read-Only) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
              Email Address (Read-Only)
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={email}
                disabled
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-sm cursor-not-allowed select-none dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-500"
              />
            </div>
          </div>

          {/* Avatar Color Picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
              Avatar Theme Color
            </label>
            <div className="flex flex-wrap gap-3">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setSelectedAvatar(color.id)}
                  className={`w-9 h-9 rounded-full bg-gradient-to-br ${color.classes} flex items-center justify-center text-white transition-all duration-200 hover:scale-105 ${
                    selectedAvatar === color.id 
                      ? 'ring-4 ring-indigo-500/40 border border-white dark:border-slate-900 scale-105' 
                      : 'border border-transparent'
                  }`}
                  title={color.label}
                >
                  {selectedAvatar === color.id && <Check className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Divider */}
      <hr className="border-slate-100 dark:border-slate-800/80 my-2" />

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60 rounded-xl transition-all duration-200"
        >
          <RotateCcw className="h-4 w-4" />
          Reset Form
        </button>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-md shadow-indigo-500/10 hover:scale-102 active:scale-98 transition-all duration-200"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </button>
      </div>

      {/* Success Toast */}
      {showSavedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-white font-bold text-xs md:text-sm px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
          <Check className="h-4 w-4" />
          Profile settings saved successfully!
        </div>
      )}

    </div>
  );
}
