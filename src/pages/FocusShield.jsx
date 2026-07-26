import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Clock,
  Plus,
  Search,
  Trash2,
  Edit3,
  Save,
  X,
  Globe,
  Sparkles,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatTime } from '../utils/helpers';

const CATEGORIES = [
  'Social Media',
  'Entertainment',
  'Gaming',
  'Shopping',
  'News',
  'Productivity',
  'General'
];

const RECOMMENDED_SITES = [
  { domain: 'youtube.com', category: 'Entertainment' },
  { domain: 'instagram.com', category: 'Social Media' },
  { domain: 'facebook.com', category: 'Social Media' },
  { domain: 'x.com', category: 'Social Media' },
  { domain: 'reddit.com', category: 'Social Media' },
  { domain: 'discord.com', category: 'Social Media' },
  { domain: 'netflix.com', category: 'Entertainment' },
  { domain: 'primevideo.com', category: 'Entertainment' },
  { domain: 'hotstar.com', category: 'Entertainment' },
  { domain: 'spotify.com', category: 'Entertainment' },
  { domain: 'web.whatsapp.com', category: 'Social Media' },
  { domain: 'chess.com', category: 'Gaming' },
  { domain: 'lichess.org', category: 'Gaming' },
  { domain: 'poki.com', category: 'Gaming' },
  { domain: 'crazygames.com', category: 'Gaming' },
  { domain: 'amazon.in', category: 'Shopping' },
  { domain: 'flipkart.com', category: 'Shopping' }
];

export default function FocusShield() {
  const { token, activeSession, timeLeft } = useApp();
  const [blockedSites, setBlockedSites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  
  // Form input states
  const [websiteInput, setWebsiteInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('General');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Inline editing states
  const [editingId, setEditingId] = useState(null);
  const [editingWebsite, setEditingWebsite] = useState('');
  const [editingCategory, setEditingCategory] = useState('General');

  // Fetch blocked websites on mount
  useEffect(() => {
    const fetchBlockedSites = async () => {
      if (!token) return;
      try {
        const response = await fetch('http://localhost:5000/api/block-sites', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.sites) {
          setBlockedSites(data.sites);
        }
      } catch (err) {
        console.error('Failed to load blocked websites:', err);
      }
    };
    fetchBlockedSites();
  }, [token]);

  const handleAddWebsite = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!websiteInput.trim()) {
      setErrorMessage('Please enter a website domain.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/block-sites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          website: websiteInput.trim(),
          category: categoryInput
        })
      });

      const data = await response.json();
      if (data.success && data.site) {
        setBlockedSites(prev => [data.site, ...prev]);
        setWebsiteInput('');
        setCategoryInput('General');
        setSuccessMessage(`Successfully blocked ${data.site.website}!`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(data.message || 'Failed to add website to blocker list.');
      }
    } catch (err) {
      setErrorMessage('Network connection error. Try again.');
    }
  };

  const handleAddRecommended = async (site) => {
    setErrorMessage('');
    try {
      const response = await fetch('http://localhost:5000/api/block-sites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          website: site.domain,
          category: site.category
        })
      });

      const data = await response.json();
      if (data.success && data.site) {
        setBlockedSites(prev => [data.site, ...prev]);
        setSuccessMessage(`Added ${site.domain} to block list!`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(data.message || 'Failed to add website.');
      }
    } catch (err) {
      setErrorMessage('Network error occurred.');
    }
  };

  const handleToggleEnabled = async (site) => {
    try {
      const response = await fetch(`http://localhost:5000/api/block-sites/${site._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ enabled: !site.enabled })
      });
      const data = await response.json();
      if (data.success && data.site) {
        setBlockedSites(prev =>
          prev.map(s => (s._id === site._id ? data.site : s))
        );
      }
    } catch (err) {
      console.error('Failed to toggle active block status:', err);
    }
  };

  const handleStartEdit = (site) => {
    setEditingId(site._id);
    setEditingWebsite(site.website);
    setEditingCategory(site.category);
  };

  const handleSaveEdit = async (id) => {
    if (!editingWebsite.trim()) return;

    try {
      const response = await fetch(`http://localhost:5000/api/block-sites/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          website: editingWebsite.trim(),
          category: editingCategory
        })
      });
      const data = await response.json();
      if (data.success && data.site) {
        setBlockedSites(prev =>
          prev.map(s => (s._id === id ? data.site : s))
        );
        setEditingId(null);
      } else {
        setErrorMessage(data.message || 'Update failed.');
      }
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const handleDeleteSite = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/block-sites/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setBlockedSites(prev => prev.filter(s => s._id !== id));
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const isShieldRunning = activeSession && activeSession.status === 'active' && activeSession.sessionType === 'Focus' && timeLeft > 0;
  
  // Filter lists based on search string and category dropdown selection
  const filteredSites = blockedSites.filter(site => {
    const matchesSearch = site.website.includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'All' || site.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalEnabledBlockedCount = blockedSites.filter(s => s.enabled).length;

  return (
    <div className="flex-1 overflow-y-auto px-8 py-10 transition-colors duration-300 font-sans">
      
      {/* Header section */}
      <div className="mb-10 animate-fade-in">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <ShieldAlert className="h-8 w-8 text-indigo-500 animate-pulse" />
          <span>Focus <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Blocker</span></span>
        </h1>
        <p className="text-base mt-2 text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          Create and manage your own custom website block list. When you trigger a Focus Session, every enabled domain in your list will automatically be shielded.
        </p>
      </div>

      <div className="max-w-4xl space-y-8">
        
        {/* Status Dashboard Panel */}
        <section className={`relative overflow-hidden rounded-3xl border transition-all duration-500 p-8 shadow-xl ${
          isShieldRunning
            ? 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/2 shadow-emerald-500/5'
            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40'
        }`}>
          {isShieldRunning && (
            <div className="absolute top-[-50%] right-[-10%] w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
          )}

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                  isShieldRunning
                    ? 'bg-emerald-500/20 text-emerald-500'
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800/80 dark:text-slate-400'
                }`}>
                  {isShieldRunning ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
                  {isShieldRunning ? 'Shield Active' : 'Shield Inactive'}
                </span>
                
                {isShieldRunning && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider bg-indigo-500/20 text-indigo-400 animate-pulse">
                    Blocking Enabled
                  </span>
                )}
              </div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {isShieldRunning
                  ? 'Your blocked websites are currently active'
                  : 'Start a Focus Session to activate website blocking'}
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                {isShieldRunning
                  ? 'Keep concentrating! Websites on your block list will show the FocusFlow redirection shield page.'
                  : 'Open the Timer, set a Focus Duration, and hit Start. Your custom block list will protect your session.'}
              </p>
            </div>

            {/* Metrics */}
            <div className="flex flex-wrap items-center gap-4">
              {isShieldRunning && (
                <div className="bg-slate-950/50 backdrop-blur-md border border-slate-800 rounded-2xl px-5 py-3 text-center">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1 justify-center mb-0.5">
                    <Clock className="h-3 w-3" /> Time Left
                  </div>
                  <div className="text-lg font-black text-emerald-400 tracking-wider">
                    {formatTime(timeLeft)}
                  </div>
                </div>
              )}

              <div className="bg-slate-950/50 backdrop-blur-md border border-slate-800 rounded-2xl px-5 py-3 text-center">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">
                  Blocked Sites
                </span>
                <span className="text-lg font-black text-white">
                  {totalEnabledBlockedCount} active
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Add Website Block Form */}
        <section className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Plus className="h-4.5 w-4.5 text-indigo-500" />
            <span>Add New Blocked Website</span>
          </h3>

          <form onSubmit={handleAddWebsite} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="e.g. twitter.com, youtube.com"
                value={websiteInput}
                onChange={(e) => setWebsiteInput(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs md:text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-100"
              />
            </div>
            
            <div className="w-full sm:w-48">
              <select
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs md:text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-100 cursor-pointer"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs md:text-sm rounded-xl transition-colors shadow-md shadow-indigo-600/10 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="h-4 w-4" /> Add Website
            </button>
          </form>

          {errorMessage && (
            <p className="text-xs text-rose-500 font-semibold mt-3.5 flex items-center gap-1 animate-pulse">
              ⚠️ {errorMessage}
            </p>
          )}

          {successMessage && (
            <p className="text-xs text-emerald-500 font-semibold mt-3.5 flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5" /> {successMessage}
            </p>
          )}
        </section>

        {/* Filters and Table list */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Globe className="h-4 w-4" /> Custom Block list ({filteredSites.length})
            </h3>
            
            {/* Search and Category filters */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search domains..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-100"
                />
              </div>

              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-100 cursor-pointer"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table List Cards */}
          {filteredSites.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-250 dark:border-slate-800 rounded-2xl text-slate-400 dark:text-slate-500 font-semibold text-xs md:text-sm bg-white dark:bg-slate-900/10">
              No blocked websites found matching the parameters. Add one above!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSites.map((site) => {
                const isEditing = site._id === editingId;

                return (
                  <div
                    key={site._id}
                    className={`group relative overflow-hidden rounded-2xl border p-4.5 transition-all duration-200 flex items-center justify-between hover:shadow-lg ${
                      site.enabled
                        ? 'border-indigo-500/20 bg-indigo-500/5 dark:bg-indigo-950/10'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 opacity-70'
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      {isEditing ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editingWebsite}
                            onChange={(e) => setEditingWebsite(e.target.value)}
                            className="w-full text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-950 px-2 py-1.5 rounded border border-indigo-500 focus:outline-none"
                          />
                          <select
                            value={editingCategory}
                            onChange={(e) => setEditingCategory(e.target.value)}
                            className="w-full text-xs text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-950 px-2 py-1.5 rounded border border-slate-200 dark:border-slate-800"
                          >
                            {CATEGORIES.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div>
                          <h4 className="text-xs md:text-sm font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                            <span className={site.enabled ? 'text-indigo-650 dark:text-indigo-400' : 'text-slate-500'}>
                              {site.website}
                            </span>
                            <a
                              href={`https://${site.website}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-300 p-0.5 rounded transition-colors"
                              title="Visit website"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </h4>
                          <span className="inline-block text-[9px] font-black tracking-widest uppercase text-slate-450 dark:text-slate-500 bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 px-1.5 py-0.5 rounded-full mt-1.5">
                            {site.category}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(site._id)}
                            className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-colors cursor-pointer"
                            title="Save"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                            title="Cancel"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          {/* Enable/Disable Toggle */}
                          <button
                            onClick={() => handleToggleEnabled(site)}
                            className={`w-9 h-5 rounded-full p-0.5 transition-all duration-200 cursor-pointer relative ${
                              site.enabled ? 'bg-indigo-650' : 'bg-slate-250 dark:bg-slate-850'
                            }`}
                            title={site.enabled ? 'Disable block rule' : 'Enable block rule'}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 transform ${
                              site.enabled ? 'translate-x-4' : 'translate-x-0'
                            }`} />
                          </button>

                          <button
                            onClick={() => handleStartEdit(site)}
                            className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 rounded-xl transition-colors cursor-pointer"
                            title="Edit Website"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteSite(site._id)}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800/40 rounded-xl transition-colors cursor-pointer"
                            title="Remove Website"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Recommended sites section */}
        <section className="space-y-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-250/70 dark:border-slate-850/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span>Recommended Websites to Block</span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1.5">
            {RECOMMENDED_SITES.map((site) => {
              const alreadyBlocked = blockedSites.some(s => s.website === site.domain);

              return (
                <button
                  key={site.domain}
                  disabled={alreadyBlocked}
                  onClick={() => handleAddRecommended(site)}
                  className={`text-[10px] font-bold px-2.5 py-1.5 rounded-full border transition-all duration-150 flex items-center gap-1 ${
                    alreadyBlocked
                      ? 'bg-slate-100/50 dark:bg-slate-900/30 text-slate-400 border-slate-200 dark:border-slate-800 cursor-not-allowed'
                      : 'bg-white hover:bg-indigo-50 dark:bg-slate-900/40 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-350 border-slate-250 dark:border-slate-800 hover:border-indigo-400 cursor-pointer'
                  }`}
                >
                  <span>{site.domain}</span>
                  {alreadyBlocked ? (
                    <span className="text-[9px] text-emerald-500">✓ Added</span>
                  ) : (
                    <span className="text-[9px] text-indigo-500 font-black">+ Block</span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
