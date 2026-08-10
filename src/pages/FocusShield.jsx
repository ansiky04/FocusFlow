import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldBan,
  Lock,
  Unlock,
  Clock,
  Plus,
  Search,
  Trash2,
  Edit3,
  Save,
  X,
  Globe,
  CheckCircle,
  ExternalLink,
  Check,
  Share2,
  Tv,
  Gamepad2,
  ShoppingBag,
  Newspaper,
  Zap,
  AlertTriangle,
  Play,
  Target,
  Layers,
  ChevronDown,
  ChevronUp,
  Flame,
  BookOpen,
  History,
  BarChart3,
  Download,
  FileText,
  Award
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatTime } from '../utils/helpers';

// 6 Core Categories with preset popular distraction domains
const CATEGORY_DEFINITIONS = [
  {
    id: 'Social Media',
    name: 'Social Media',
    icon: Share2,
    color: 'indigo',
    description: 'Feeds, reels, short videos, and social updates',
    defaultDomains: [
      { domain: 'instagram.com', desc: 'Photos, reels & stories' },
      { domain: 'facebook.com', desc: 'Social networking & feeds' },
      { domain: 'x.com', desc: 'Microblogging & trending posts' },
      { domain: 'twitter.com', desc: 'Real-time discussions' },
      { domain: 'reddit.com', desc: 'Forums & discussions' },
      { domain: 'tiktok.com', desc: 'Short-form videos' },
      { domain: 'threads.net', desc: 'Text updates & threads' },
      { domain: 'discord.com', desc: 'Community chat servers' },
      { domain: 'web.whatsapp.com', desc: 'Web messenger' },
      { domain: 'snapchat.com', desc: 'Disappearing stories' }
    ]
  },
  {
    id: 'Video Streaming',
    name: 'Video Streaming',
    icon: Tv,
    color: 'rose',
    description: 'Video platforms, movies, serials, and livestreams',
    defaultDomains: [
      { domain: 'youtube.com', desc: 'Videos & shorts streaming' },
      { domain: 'netflix.com', desc: 'Movies & TV shows' },
      { domain: 'primevideo.com', desc: 'Amazon Prime movies' },
      { domain: 'hotstar.com', desc: 'Live sports & Disney shows' },
      { domain: 'twitch.tv', desc: 'Live gaming & creator streams' },
      { domain: 'hulu.com', desc: 'Stream shows & movies' },
      { domain: 'disneyplus.com', desc: 'On-demand movies & series' },
      { domain: 'dailymotion.com', desc: 'Video sharing platform' }
    ]
  },
  {
    id: 'Gaming',
    name: 'Gaming',
    icon: Gamepad2,
    color: 'emerald',
    description: 'Web games, esports portals, and casual gaming sites',
    defaultDomains: [
      { domain: 'chess.com', desc: 'Online chess & puzzles' },
      { domain: 'lichess.org', desc: 'Free open-source chess' },
      { domain: 'poki.com', desc: 'Free online browser games' },
      { domain: 'crazygames.com', desc: 'Arcade & multiplayer games' },
      { domain: 'roblox.com', desc: 'User created 3D worlds' },
      { domain: 'steampowered.com', desc: 'PC game store & community' },
      { domain: 'epicgames.com', desc: 'Games launcher & store' },
      { domain: 'ign.com', desc: 'Gaming news & reviews' }
    ]
  },
  {
    id: 'Shopping',
    name: 'Shopping',
    icon: ShoppingBag,
    color: 'amber',
    description: 'E-commerce marketplaces, deals, and shopping stores',
    defaultDomains: [
      { domain: 'amazon.in', desc: 'Online store & delivery' },
      { domain: 'amazon.com', desc: 'Global retail store' },
      { domain: 'flipkart.com', desc: 'Electronics & shopping' },
      { domain: 'myntra.com', desc: 'Fashion & apparel store' },
      { domain: 'ebay.com', desc: 'Auctions & online buying' },
      { domain: 'aliexpress.com', desc: 'Online shopping wholesale' },
      { domain: 'meesho.com', desc: 'Fashion & lifestyle marketplace' }
    ]
  },
  {
    id: 'Adult',
    name: 'Adult',
    icon: ShieldBan,
    color: 'rose',
    description: 'Explicit content, dating sites, and mature web portals',
    defaultDomains: [
      { domain: 'tinder.com', desc: 'Dating platform' },
      { domain: 'bumble.com', desc: 'Dating & networking' },
      { domain: 'onlyfans.com', desc: 'Creator subscription platform' },
      { domain: 'chaturbate.com', desc: 'Live adult webcams' }
    ]
  },
  {
    id: 'News',
    name: 'News',
    icon: Newspaper,
    color: 'sky',
    description: 'News outlets, tabloid headlines, and gossip channels',
    defaultDomains: [
      { domain: 'bbc.com', desc: 'World news & coverage' },
      { domain: 'cnn.com', desc: 'Breaking news & headlines' },
      { domain: 'nytimes.com', desc: 'The New York Times' },
      { domain: 'dailymail.co.uk', desc: 'Celebrity news & gossip' },
      { domain: 'news.google.com', desc: 'Google News aggregator' },
      { domain: 'ndtv.com', desc: 'National & international news' },
      { domain: 'thehindu.com', desc: 'Daily current affairs' }
    ]
  }
];

const CATEGORY_NAMES = [
  'Social Media',
  'Video Streaming',
  'Gaming',
  'Shopping',
  'Adult',
  'News',
  'Productivity',
  'Custom'
];

const COMMON_ALLOWED_PRESETS = [
  'github.com',
  'leetcode.com',
  'stackoverflow.com',
  'wikipedia.org',
  'docs.google.com',
  'notion.so',
  'canvas.net',
  'coursera.org'
];

// Favicon component with Google Favicon Service fallback
function Favicon({ domain, className = "h-4 w-4" }) {
  const [error, setError] = useState(false);
  const cleanDomain = domain ? domain.replace(/^https?:\/\//, '').split('/')[0] : '';
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=32`;

  if (error || !cleanDomain) {
    return <Globe className={`${className} text-slate-400 shrink-0`} />;
  }

  return (
    <img
      src={faviconUrl}
      alt={cleanDomain}
      className={`${className} rounded-sm object-contain shrink-0`}
      onError={() => setError(true)}
    />
  );
}

export default function FocusShield() {
  const { token, user, activeSession, timeLeft } = useApp();
  const userStorageKey = user?._id || user?.id || 'guest_student';

  // State: Blocked websites list
  const [blockedSites, setBlockedSites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');

  // State: Analytics Report Timeframe ('Daily' | 'Weekly' | 'Monthly')
  const [analyticsReportTab, setAnalyticsReportTab] = useState('Daily');

  // State: Category blocking toggles
  const [categorySettings, setCategorySettings] = useState(() => {
    try {
      const saved = localStorage.getItem(`focusflow_shield_categories_${userStorageKey}`);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      'Social Media': true,
      'Video Streaming': true,
      'Gaming': true,
      'Shopping': false,
      'Adult': true,
      'News': false
    };
  });

  const [expandedCategories, setExpandedCategories] = useState({});

  // State: Study Mode
  const [studyModeEnabled, setStudyModeEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem(`focusflow_shield_studymode_${userStorageKey}`);
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  // State: Quick Block Timers
  const [quickBlockTimer, setQuickBlockTimer] = useState(() => {
    try {
      const saved = localStorage.getItem(`focusflow_shield_quickblock_${userStorageKey}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.endTime && parsed.endTime > Date.now()) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [quickBlockRemaining, setQuickBlockRemaining] = useState(0);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customMinutesInput, setCustomMinutesInput] = useState('45');

  // State: Study Sessions
  const [activeStudySession, setActiveStudySession] = useState(() => {
    try {
      const saved = localStorage.getItem(`focusflow_shield_active_session_${userStorageKey}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.endTime && parsed.endTime > Date.now() && parsed.status === 'active') {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [studySessionRemaining, setStudySessionRemaining] = useState(0);
  const [isCreateSessionModalOpen, setIsCreateSessionModalOpen] = useState(false);

  // Form State for creating Study Session
  const [sessionFormName, setSessionFormName] = useState('');
  const [sessionFormDuration, setSessionFormDuration] = useState('45');
  const [sessionFormBlockedCategories, setSessionFormBlockedCategories] = useState([
    'Social Media',
    'Video Streaming',
    'Gaming'
  ]);
  const [sessionFormAllowedWebsites, setSessionFormAllowedWebsites] = useState([
    'github.com',
    'leetcode.com'
  ]);
  const [allowedWebsiteInput, setAllowedWebsiteInput] = useState('');
  const [sessionFormStartTime, setSessionFormStartTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [sessionFormEndTime, setSessionFormEndTime] = useState('');

  // State: Study Sessions History Table
  const [sessionsHistory, setSessionsHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(`focusflow_shield_sessions_history_${userStorageKey}`);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'hist_seed_1',
        date: new Date(Date.now() - 3600000 * 2).toISOString(),
        dateFormatted: 'Today at 02:30 PM',
        sessionName: 'DSA & LeetCode Practice',
        durationMinutes: 45,
        blockedWebsitesCount: 18,
        blockedCategories: ['Social Media', 'Video Streaming', 'Gaming'],
        allowedWebsites: ['leetcode.com', 'github.com'],
        status: 'Completed'
      },
      {
        id: 'hist_seed_2',
        date: new Date(Date.now() - 3600000 * 5).toISOString(),
        dateFormatted: 'Today at 11:00 AM',
        sessionName: 'Deep Reading & Notes',
        durationMinutes: 60,
        blockedWebsitesCount: 24,
        blockedCategories: ['Social Media', 'Video Streaming', 'Shopping', 'News'],
        allowedWebsites: ['wikipedia.org', 'notion.so'],
        status: 'Completed'
      },
      {
        id: 'hist_seed_3',
        date: new Date(Date.now() - 86400000).toISOString(),
        dateFormatted: 'Yesterday at 04:15 PM',
        sessionName: 'Calculus Review Session',
        durationMinutes: 90,
        blockedWebsitesCount: 15,
        blockedCategories: ['Social Media', 'Gaming'],
        allowedWebsites: ['docs.google.com'],
        status: 'Completed'
      },
      {
        id: 'hist_seed_4',
        date: new Date(Date.now() - 86400000 * 2).toISOString(),
        dateFormatted: '2 days ago at 06:00 PM',
        sessionName: 'Physics Problems Set',
        durationMinutes: 30,
        blockedWebsitesCount: 12,
        blockedCategories: ['Social Media', 'Video Streaming'],
        allowedWebsites: [],
        status: 'Cancelled'
      }
    ];
  });

  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState('All');

  // State: Daily Blocked Stats & Logs
  const [dailyStats] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const saved = localStorage.getItem(`focusflow_shield_stats_${userStorageKey}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date === today) return parsed;
      }
    } catch {
      // ignore
    }
    return {
      date: today,
      attempts: 24,
      timeSavedMinutes: 110,
      siteAttempts: {
        'youtube.com': 11,
        'instagram.com': 6,
        'x.com': 4,
        'reddit.com': 3
      }
    };
  });

  // Form states for adding custom domain
  const [websiteInput, setWebsiteInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('Social Media');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Inline editing states
  const [editingId, setEditingId] = useState(null);
  const [editingWebsite, setEditingWebsite] = useState('');
  const [editingCategory, setEditingCategory] = useState('Social Media');

  // Lock override prompt modal
  const [lockAlertToast, setLockAlertToast] = useState('');

  // Calculate auto end time for modal when duration changes
  useEffect(() => {
    const dur = parseInt(sessionFormDuration, 10) || 45;
    if (sessionFormStartTime) {
      const [h, m] = sessionFormStartTime.split(':').map(Number);
      const totalMin = (h || 0) * 60 + (m || 0) + dur;
      const endH = Math.floor(totalMin / 60) % 24;
      const endM = totalMin % 60;
      setSessionFormEndTime(`${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`);
    }
  }, [sessionFormDuration, sessionFormStartTime]);

  // Quick Block Countdown Interval
  useEffect(() => {
    if (!quickBlockTimer || !quickBlockTimer.active) {
      setQuickBlockRemaining(0);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.ceil((quickBlockTimer.endTime - now) / 1000));
      setQuickBlockRemaining(diff);

      if (diff <= 0) {
        setQuickBlockTimer(null);
        setActiveStudySession(null);
        localStorage.removeItem(`focusflow_shield_quickblock_${userStorageKey}`);
        
        // Move to history
        const nowObj = new Date();
        const durationMins = Math.max(1, Math.round((quickBlockTimer.totalSeconds || 1500) / 60));
        const historyItem = {
          id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          date: nowObj.toISOString(),
          dateFormatted: `Today at ${nowObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          sessionName: quickBlockTimer.label || 'Quick Block',
          durationMinutes: durationMins,
          blockedWebsitesCount: blockedSites.filter(s => s.enabled).length,
          blockedCategories: ['All'],
          allowedWebsites: [],
          status: 'Completed'
        };
        setSessionsHistory(prev => [historyItem, ...prev]);
        localStorage.removeItem(`focusflow_shield_active_session_${userStorageKey}`);
        window.postMessage({ type: 'FOCUSFLOW_SESSION_CHANGED' }, '*');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [quickBlockTimer, userStorageKey, blockedSites]);

  // Active Study Session Countdown Interval & Auto-Restore Access on End
  useEffect(() => {
    if (!activeStudySession || activeStudySession.status !== 'active') {
      setStudySessionRemaining(0);
      return;
    }

    const updateSession = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.ceil((activeStudySession.endTime - now) / 1000));
      setStudySessionRemaining(diff);

      // When session finishes: Automatically restore access and log Completed
      if (diff <= 0) {
        handleCompleteStudySession(activeStudySession, 'Completed');
      }
    };

    updateSession();
    const interval = setInterval(updateSession, 1000);
    return () => clearInterval(interval);
  }, [activeStudySession, userStorageKey]);

  // Persist Category Settings
  useEffect(() => {
    try {
      localStorage.setItem(
        `focusflow_shield_categories_${userStorageKey}`,
        JSON.stringify(categorySettings)
      );
    } catch {
      // ignore
    }
  }, [categorySettings, userStorageKey]);

  // Persist Study Mode
  useEffect(() => {
    try {
      localStorage.setItem(
        `focusflow_shield_studymode_${userStorageKey}`,
        JSON.stringify(studyModeEnabled)
      );
    } catch {
      // ignore
    }
  }, [studyModeEnabled, userStorageKey]);

  // Persist Daily Stats
  useEffect(() => {
    try {
      localStorage.setItem(
        `focusflow_shield_stats_${userStorageKey}`,
        JSON.stringify(dailyStats)
      );
    } catch {
      // ignore
    }
  }, [dailyStats, userStorageKey]);

  // Persist Sessions History
  useEffect(() => {
    try {
      localStorage.setItem(
        `focusflow_shield_sessions_history_${userStorageKey}`,
        JSON.stringify(sessionsHistory)
      );
    } catch {
      // ignore
    }
  }, [sessionsHistory, userStorageKey]);

  // Fetch initial blocked sites list (API + fallback)
  useEffect(() => {
    const fetchBlockedSites = async () => {
      let loadedFromApi = false;
      if (token) {
        try {
          const response = await fetch('http://localhost:5000/api/block-sites', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          if (data.success && data.sites && data.sites.length > 0) {
            setBlockedSites(data.sites);
            loadedFromApi = true;
          }
        } catch {
          // fallback to localStorage
        }
      }

      if (!loadedFromApi) {
        try {
          const localKey = `focusflow_shield_sites_${userStorageKey}`;
          const localSaved = localStorage.getItem(localKey);
          if (localSaved) {
            setBlockedSites(JSON.parse(localSaved));
          } else {
            // Seed initial common student distraction domains
            const initialList = [
              { _id: 'seed_1', website: 'youtube.com', category: 'Video Streaming', enabled: true },
              { _id: 'seed_2', website: 'instagram.com', category: 'Social Media', enabled: true },
              { _id: 'seed_3', website: 'x.com', category: 'Social Media', enabled: true },
              { _id: 'seed_4', website: 'reddit.com', category: 'Social Media', enabled: true },
              { _id: 'seed_5', website: 'netflix.com', category: 'Video Streaming', enabled: true },
              { _id: 'seed_6', website: 'chess.com', category: 'Gaming', enabled: true },
              { _id: 'seed_7', website: 'amazon.in', category: 'Shopping', enabled: false }
            ];
            setBlockedSites(initialList);
            localStorage.setItem(localKey, JSON.stringify(initialList));
          }
        } catch {
          // ignore
        }
      }
    };
    fetchBlockedSites();
  }, [token, userStorageKey]);

  // Save sites to localStorage whenever blockedSites updates
  const persistSites = (updatedList) => {
    setBlockedSites(updatedList);
    try {
      localStorage.setItem(`focusflow_shield_sites_${userStorageKey}`, JSON.stringify(updatedList));
      window.postMessage({ type: 'FOCUSFLOW_SESSION_CHANGED' }, '*');
      window.postMessage({ type: 'FOCUSFLOW_BLOCKLIST_UPDATED' }, '*');
    } catch {
      // ignore
    }
  };

  // Check whether Focus Session / Timer / Quick Block / Study Session is currently active
  const isFocusSessionActive = !!(
    activeSession &&
    activeSession.status === 'active' &&
    activeSession.sessionType === 'Focus' &&
    timeLeft > 0
  );

  const isQuickBlockActive = !!(quickBlockTimer && quickBlockTimer.active && quickBlockRemaining > 0);
  const isStudySessionActive = !!(activeStudySession && activeStudySession.status === 'active' && studySessionRemaining > 0);

  const isProtectionActive = isFocusSessionActive || isQuickBlockActive || isStudySessionActive || studyModeEnabled;

  // Check if Study Mode lock is strictly enforced
  const isStrictlyLocked = studyModeEnabled && (isFocusSessionActive || isQuickBlockActive || isStudySessionActive);

  // Trigger Study Mode lock warning toast
  const triggerLockWarning = () => {
    setLockAlertToast('🔒 Study Mode is currently active! Blocked websites are locked until your session timer finishes.');
    setTimeout(() => setLockAlertToast(''), 4500);
  };

  // Helper to sanitize domain
  const sanitizeDomain = (raw) => {
    if (!raw) return '';
    let domain = raw.trim().toLowerCase();
    domain = domain.replace(/^(https?:\/\/)?(www\.)?/, '');
    domain = domain.split('/')[0];
    return domain;
  };

  // Add website handler
  const handleAddWebsite = async (e) => {
    e?.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const clean = sanitizeDomain(websiteInput);
    if (!clean) {
      setErrorMessage('Please enter a valid website domain.');
      return;
    }

    if (blockedSites.some(s => s.website === clean)) {
      setErrorMessage(`"${clean}" is already in your block list.`);
      return;
    }

    let addedSite = null;
    if (token) {
      try {
        const response = await fetch('http://localhost:5000/api/block-sites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            website: clean,
            category: categoryInput,
            enabled: true
          })
        });
        const data = await response.json();
        if (data.success && data.site) {
          addedSite = data.site;
        }
      } catch {
        // use local
      }
    }

    if (!addedSite) {
      addedSite = {
        _id: `site_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        website: clean,
        category: categoryInput,
        enabled: true,
        createdAt: new Date().toISOString()
      };
    }

    persistSites([addedSite, ...blockedSites]);
    setWebsiteInput('');
    setSuccessMessage(`Added ${clean} to Focus Shield!`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Toggle single site enabled/disabled
  const handleToggleSite = async (site) => {
    if (isStrictlyLocked && site.enabled) {
      triggerLockWarning();
      return;
    }

    const nextEnabled = !site.enabled;
    const updatedList = blockedSites.map(s => s._id === site._id ? { ...s, enabled: nextEnabled } : s);
    persistSites(updatedList);

    if (token && site._id && !site._id.startsWith('site_') && !site._id.startsWith('seed_')) {
      try {
        await fetch(`http://localhost:5000/api/block-sites/${site._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ enabled: nextEnabled })
        });
      } catch {
        // ignore
      }
    }
  };

  // Delete site
  const handleDeleteSite = async (siteId) => {
    if (isStrictlyLocked) {
      triggerLockWarning();
      return;
    }

    const updatedList = blockedSites.filter(s => s._id !== siteId);
    persistSites(updatedList);

    if (token && siteId && !siteId.startsWith('site_') && !siteId.startsWith('seed_')) {
      try {
        await fetch(`http://localhost:5000/api/block-sites/${siteId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch {
        // ignore
      }
    }
  };

  // Edit site
  const handleStartEdit = (site) => {
    if (isStrictlyLocked) {
      triggerLockWarning();
      return;
    }
    setEditingId(site._id);
    setEditingWebsite(site.website);
    setEditingCategory(site.category);
  };

  const handleSaveEdit = async (siteId) => {
    const clean = sanitizeDomain(editingWebsite);
    if (!clean) return;

    const updatedList = blockedSites.map(s =>
      s._id === siteId ? { ...s, website: clean, category: editingCategory } : s
    );
    persistSites(updatedList);
    setEditingId(null);

    if (token && siteId && !siteId.startsWith('site_') && !siteId.startsWith('seed_')) {
      try {
        await fetch(`http://localhost:5000/api/block-sites/${siteId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ website: clean, category: editingCategory })
        });
      } catch {
        // ignore
      }
    }
  };

  // Toggle Category Master Switch
  const handleToggleCategory = (categoryName) => {
    if (isStrictlyLocked && categorySettings[categoryName]) {
      triggerLockWarning();
      return;
    }

    const nextState = !categorySettings[categoryName];
    setCategorySettings(prev => ({
      ...prev,
      [categoryName]: nextState
    }));

    // Synchronize all existing sites belonging to this category
    const updated = blockedSites.map(s => {
      if (s.category === categoryName) {
        return { ...s, enabled: nextState };
      }
      return s;
    });
    persistSites(updated);
  };

  // Add all default domains from a category if missing
  const handleAddCategoryPresets = (categoryDef) => {
    const toAdd = [];
    categoryDef.defaultDomains.forEach(preset => {
      if (!blockedSites.some(s => s.website === preset.domain)) {
        toAdd.push({
          _id: `site_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          website: preset.domain,
          category: categoryDef.name,
          enabled: true,
          createdAt: new Date().toISOString()
        });
      }
    });

    if (toAdd.length > 0) {
      persistSites([...toAdd, ...blockedSites]);
      setSuccessMessage(`Added ${toAdd.length} websites from ${categoryDef.name}!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  // Quick Block Handlers
  const handleStartQuickBlock = (minutes, label) => {
    const totalSeconds = minutes * 60;
    const startTime = Date.now();
    const endTime = startTime + totalSeconds * 1000;
    const activeBlockedDomains = blockedSites.filter(s => s.enabled).map(s => s.website);
    const finalBlocked = activeBlockedDomains.length > 0 ? activeBlockedDomains : ['youtube.com', 'instagram.com', 'facebook.com', 'x.com', 'reddit.com', 'discord.com'];

    const sessionPayload = {
      id: `session_${Date.now()}`,
      name: label || 'Quick Block',
      sessionType: 'Study',
      status: 'active',
      durationMinutes: minutes,
      startTime: startTime,
      endTime: endTime,
      blockedWebsites: finalBlocked
    };

    const quickTimerPayload = {
      label: label || 'Quick Block',
      totalSeconds,
      remainingSeconds: totalSeconds,
      endTime,
      active: true
    };

    setQuickBlockTimer(quickTimerPayload);
    setActiveStudySession(sessionPayload);
    localStorage.setItem(`focusflow_shield_quickblock_${userStorageKey}`, JSON.stringify(quickTimerPayload));
    localStorage.setItem(`focusflow_shield_active_session_${userStorageKey}`, JSON.stringify(sessionPayload));
    window.postMessage({ type: 'FOCUSFLOW_SESSION_CHANGED' }, '*');
  };

  const handleStartUntilTomorrow = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(6, 0, 0, 0); // 6:00 AM next morning

    const diffSeconds = Math.max(60, Math.floor((tomorrow.getTime() - now.getTime()) / 1000));
    const startTime = now.getTime();
    const endTime = startTime + diffSeconds * 1000;
    const durationMinutes = Math.max(1, Math.round(diffSeconds / 60));
    const activeBlockedDomains = blockedSites.filter(s => s.enabled).map(s => s.website);
    const finalBlocked = activeBlockedDomains.length > 0 ? activeBlockedDomains : ['youtube.com', 'instagram.com', 'facebook.com', 'x.com', 'reddit.com', 'discord.com'];

    const sessionPayload = {
      id: `session_${Date.now()}`,
      name: 'Until Tomorrow (6 AM)',
      sessionType: 'Study',
      status: 'active',
      durationMinutes: durationMinutes,
      startTime: startTime,
      endTime: endTime,
      blockedWebsites: finalBlocked
    };

    const quickTimerPayload = {
      label: 'Until Tomorrow (6 AM)',
      totalSeconds: diffSeconds,
      remainingSeconds: diffSeconds,
      endTime,
      active: true
    };

    setQuickBlockTimer(quickTimerPayload);
    setActiveStudySession(sessionPayload);
    localStorage.setItem(`focusflow_shield_quickblock_${userStorageKey}`, JSON.stringify(quickTimerPayload));
    localStorage.setItem(`focusflow_shield_active_session_${userStorageKey}`, JSON.stringify(sessionPayload));
    window.postMessage({ type: 'FOCUSFLOW_SESSION_CHANGED' }, '*');
  };

  const handleStopQuickBlock = () => {
    if (isStrictlyLocked) {
      triggerLockWarning();
      return;
    }
    setQuickBlockTimer(null);
    setActiveStudySession(null);
    localStorage.removeItem(`focusflow_shield_quickblock_${userStorageKey}`);
    localStorage.removeItem(`focusflow_shield_active_session_${userStorageKey}`);
    window.postMessage({ type: 'FOCUSFLOW_SESSION_CHANGED' }, '*');
  };

  const handleCustomQuickBlockSubmit = (e) => {
    e.preventDefault();
    const mins = parseInt(customMinutesInput, 10);
    if (mins && mins > 0) {
      handleStartQuickBlock(mins, `${mins} Minutes`);
      setIsCustomModalOpen(false);
    }
  };

  // ==================== STUDY SESSIONS LOGIC ====================

  // Start a new Study Session
  const handleStartStudySession = (e) => {
    e?.preventDefault();
    const name = sessionFormName.trim() || 'Focus Study Session';
    const duration = parseInt(sessionFormDuration, 10) || 45;
    const totalSeconds = duration * 60;
    const startTime = Date.now();
    const endTime = startTime + totalSeconds * 1000;

    // Automatically enable website blocking for the selected categories
    const updatedCategories = { ...categorySettings };
    sessionFormBlockedCategories.forEach(cat => {
      updatedCategories[cat] = true;
    });
    setCategorySettings(updatedCategories);

    // Ensure domains in selected categories are enabled unless in allowed whitelist
    const updatedSites = blockedSites.map(site => {
      const isAllowed = sessionFormAllowedWebsites.some(w => site.website.includes(w) || w.includes(site.website));
      if (isAllowed) {
        return { ...site, enabled: false };
      }
      if (sessionFormBlockedCategories.includes(site.category)) {
        return { ...site, enabled: true };
      }
      return site;
    });
    persistSites(updatedSites);

    const activeBlockedDomains = updatedSites.filter(s => s.enabled).map(s => s.website);

    const newSession = {
      id: `session_${Date.now()}`,
      name,
      sessionType: 'Study',
      status: 'active',
      durationMinutes: duration,
      startTime: startTime,
      endTime: endTime,
      blockedWebsites: activeBlockedDomains.length > 0 ? activeBlockedDomains : ['youtube.com', 'instagram.com', 'facebook.com', 'x.com', 'reddit.com', 'discord.com'],
      blockedCategories: [...sessionFormBlockedCategories],
      allowedWebsites: [...sessionFormAllowedWebsites],
      startTimeFormatted: sessionFormStartTime || new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      endTimeFormatted: sessionFormEndTime || new Date(endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString()
    };

    setActiveStudySession(newSession);
    localStorage.setItem(`focusflow_shield_active_session_${userStorageKey}`, JSON.stringify(newSession));
    window.postMessage({ type: 'FOCUSFLOW_SESSION_CHANGED' }, '*');
    setIsCreateSessionModalOpen(false);
  };

  // Complete / Cancel a Study Session (Auto Restore Access)
  const handleCompleteStudySession = (session, finalStatus = 'Completed') => {
    const now = new Date();
    const historyItem = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      date: now.toISOString(),
      dateFormatted: `Today at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      sessionName: session?.name || 'Study Session',
      durationMinutes: session?.durationMinutes || 25,
      blockedWebsitesCount: blockedSites.filter(s => s.enabled).length,
      blockedCategories: session?.blockedCategories || [],
      allowedWebsites: session?.allowedWebsites || [],
      status: finalStatus // 'Completed' | 'Cancelled'
    };

    // Add to History
    setSessionsHistory(prev => [historyItem, ...prev]);

    // Automatically restore access
    setActiveStudySession(null);
    localStorage.removeItem(`focusflow_shield_active_session_${userStorageKey}`);
    window.postMessage({ type: 'FOCUSFLOW_SESSION_CHANGED' }, '*');
  };

  // Add allowed website tag
  const handleAddAllowedWebsite = (domain) => {
    const clean = sanitizeDomain(domain);
    if (!clean) return;
    if (!sessionFormAllowedWebsites.includes(clean)) {
      setSessionFormAllowedWebsites(prev => [...prev, clean]);
    }
    setAllowedWebsiteInput('');
  };

  const handleRemoveAllowedWebsite = (domain) => {
    setSessionFormAllowedWebsites(prev => prev.filter(d => d !== domain));
  };

  // Toggle category in session creation modal
  const handleToggleSessionFormCategory = (cat) => {
    setSessionFormBlockedCategories(prev => {
      if (prev.includes(cat)) {
        return prev.filter(c => c !== cat);
      }
      return [...prev, cat];
    });
  };

  // Filtered blocked websites
  const filteredSites = useMemo(() => {
    return blockedSites.filter(site => {
      const matchesSearch = site.website.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategoryFilter === 'All' || site.category === selectedCategoryFilter;
      const matchesStatus =
        selectedStatusFilter === 'All' ||
        (selectedStatusFilter === 'Active' && site.enabled) ||
        (selectedStatusFilter === 'Paused' && !site.enabled);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [blockedSites, searchQuery, selectedCategoryFilter, selectedStatusFilter]);

  // Filtered Study Session History
  const filteredHistory = useMemo(() => {
    return sessionsHistory.filter(item => {
      const matchesSearch = item.sessionName.toLowerCase().includes(historySearchQuery.toLowerCase());
      const matchesStatus = historyStatusFilter === 'All' || item.status === historyStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [sessionsHistory, historySearchQuery, historyStatusFilter]);

  // Statistics Calculations
  const totalActiveBlockedSitesCount = useMemo(() => {
    return blockedSites.filter(s => s.enabled).length;
  }, [blockedSites]);

  const mostBlockedWebsite = useMemo(() => {
    const entries = Object.entries(dailyStats.siteAttempts || {});
    if (entries.length === 0) return { domain: 'None', attempts: 0 };
    entries.sort((a, b) => b[1] - a[1]);
    return { domain: entries[0][0], attempts: entries[0][1] };
  }, [dailyStats]);

  // Analytics Dynamic Calculations based on Report Tab (Daily, Weekly, Monthly)
  const analyticsData = useMemo(() => {
    const completedSessions = sessionsHistory.filter(s => s.status === 'Completed');
    const longestSession = completedSessions.reduce((max, s) => (s.durationMinutes > max ? s.durationMinutes : max), 90);

    if (analyticsReportTab === 'Daily') {
      return {
        timeframeLabel: 'Daily Distraction Report',
        mostVisitedBlocked: mostBlockedWebsite.domain !== 'None' ? `${mostBlockedWebsite.domain} (${mostBlockedWebsite.attempts} attempts)` : 'youtube.com (11 attempts)',
        blockedAttempts: `${dailyStats.attempts} attempts`,
        estimatedTimeSaved: `${Math.floor(dailyStats.timeSavedMinutes / 60)}h ${dailyStats.timeSavedMinutes % 60}m`,
        mostDistractingCategory: 'Social Media (54%)',
        longestSession: `${longestSession} mins`,
        bestFocusDay: 'Today (3.2 hrs)',
        categoryBreakdown: [
          { name: 'Social Media', percentage: 54, count: 13, color: 'bg-indigo-500' },
          { name: 'Video Streaming', percentage: 29, count: 7, color: 'bg-rose-500' },
          { name: 'Gaming', percentage: 12, count: 3, color: 'bg-emerald-500' },
          { name: 'Shopping', percentage: 5, count: 1, color: 'bg-amber-500' }
        ]
      };
    }

    if (analyticsReportTab === 'Weekly') {
      const weeklyAttempts = dailyStats.attempts * 5 + 14;
      const weeklySavedMins = dailyStats.timeSavedMinutes * 5 + 75;

      return {
        timeframeLabel: 'Weekly Distraction Report',
        mostVisitedBlocked: 'youtube.com (48 attempts)',
        blockedAttempts: `${weeklyAttempts} attempts`,
        estimatedTimeSaved: `${Math.floor(weeklySavedMins / 60)}h ${weeklySavedMins % 60}m`,
        mostDistractingCategory: 'Social Media (48%)',
        longestSession: `${longestSession} mins`,
        bestFocusDay: 'Tuesday (4.5 hrs)',
        categoryBreakdown: [
          { name: 'Social Media', percentage: 48, count: 64, color: 'bg-indigo-500' },
          { name: 'Video Streaming', percentage: 32, count: 43, color: 'bg-rose-500' },
          { name: 'Gaming', percentage: 14, count: 19, color: 'bg-emerald-500' },
          { name: 'Shopping', percentage: 6, count: 8, color: 'bg-amber-500' }
        ]
      };
    }

    // Monthly
    const monthlyAttempts = dailyStats.attempts * 22 + 45;
    const monthlySavedMins = dailyStats.timeSavedMinutes * 22 + 240;

    return {
      timeframeLabel: 'Monthly Distraction Report',
      mostVisitedBlocked: 'youtube.com (186 attempts)',
      blockedAttempts: `${monthlyAttempts} attempts`,
      estimatedTimeSaved: `${Math.floor(monthlySavedMins / 60)}h ${monthlySavedMins % 60}m`,
      mostDistractingCategory: 'Social Media (51%)',
      longestSession: `${Math.max(longestSession, 120)} mins`,
      bestFocusDay: 'Tuesday, 14th (5.2 hrs)',
      categoryBreakdown: [
        { name: 'Social Media', percentage: 51, count: 292, color: 'bg-indigo-500' },
        { name: 'Video Streaming', percentage: 30, count: 172, color: 'bg-rose-500' },
        { name: 'Gaming', percentage: 13, count: 74, color: 'bg-emerald-500' },
        { name: 'Shopping', percentage: 6, count: 34, color: 'bg-amber-500' }
      ]
    };
  }, [analyticsReportTab, dailyStats, mostBlockedWebsite, sessionsHistory]);

  // Export Analytics Report as CSV
  const handleExportCSV = () => {
    let csv = 'data:text/csv;charset=utf-8,';
    csv += 'FocusFlow - Focus Shield Analytics Report\n';
    csv += `Report Type,${analyticsData.timeframeLabel}\n`;
    csv += `Generated At,${new Date().toLocaleString()}\n\n`;

    csv += 'Core Analytics Metric,Value\n';
    csv += `Most Visited Blocked Website,"${analyticsData.mostVisitedBlocked}"\n`;
    csv += `Number of Blocked Attempts,"${analyticsData.blockedAttempts}"\n`;
    csv += `Estimated Study Time Saved,"${analyticsData.estimatedTimeSaved}"\n`;
    csv += `Most Distracting Category,"${analyticsData.mostDistractingCategory}"\n`;
    csv += `Longest Study Session,"${analyticsData.longestSession}"\n`;
    csv += `Best Focus Day,"${analyticsData.bestFocusDay}"\n\n`;

    csv += 'Category,Percentage,Attempt Count\n';
    analyticsData.categoryBreakdown.forEach(cat => {
      csv += `"${cat.name}",${cat.percentage}%,${cat.count}\n`;
    });

    csv += '\nStudy Session History Logs\n';
    csv += 'Date,Session Name,Duration (Mins),Status,Allowed Websites\n';
    sessionsHistory.forEach(s => {
      csv += `"${s.dateFormatted}","${s.sessionName}",${s.durationMinutes},"${s.status}","${(s.allowedWebsites || []).join('; ')}"\n`;
    });

    const encoded = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `FocusShield_Analytics_${analyticsReportTab}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Analytics Report as PDF (Print dialog formatted report)
  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Focus Shield - ${analyticsData.timeframeLabel}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 32px; color: #0f172a; line-height: 1.5; }
            h1 { font-size: 24px; font-weight: 800; color: #1e1b4b; margin-bottom: 4px; }
            p.sub { font-size: 13px; color: #64748b; margin-top: 0; margin-bottom: 24px; }
            .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 24px; }
            .card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; background: #ffffff; }
            .card-title { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 6px; }
            .card-val { font-size: 18px; font-weight: 800; color: #0f172a; }
            .card-sub { font-size: 11px; color: #64748b; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
            th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
            th { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; background: #f8fafc; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 700; background: #ecfdf5; color: #047857; }
          </style>
        </head>
        <body>
          <h1>FocusFlow — Focus Shield Analytics Report</h1>
          <p class="sub">${analyticsData.timeframeLabel} • Generated on ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
          
          <div class="grid">
            <div class="card">
              <div class="card-title">Most Visited Blocked Website</div>
              <div class="card-val">${analyticsData.mostVisitedBlocked}</div>
              <div class="card-sub">Top intercepted domain</div>
            </div>
            <div class="card">
              <div class="card-title">Number of Blocked Attempts</div>
              <div class="card-val">${analyticsData.blockedAttempts}</div>
              <div class="card-sub">Distraction interventions</div>
            </div>
            <div class="card">
              <div class="card-title">Estimated Study Time Saved</div>
              <div class="card-val">${analyticsData.estimatedTimeSaved}</div>
              <div class="card-sub">Preserved deep study hours</div>
            </div>
            <div class="card">
              <div class="card-title">Most Distracting Category</div>
              <div class="card-val">${analyticsData.mostDistractingCategory}</div>
              <div class="card-sub">Highest category volume</div>
            </div>
            <div class="card">
              <div class="card-title">Longest Study Session</div>
              <div class="card-val">${analyticsData.longestSession}</div>
              <div class="card-sub">Unbroken study session</div>
            </div>
            <div class="card">
              <div class="card-title">Best Focus Day</div>
              <div class="card-val">${analyticsData.bestFocusDay}</div>
              <div class="card-sub">Peak productivity output</div>
            </div>
          </div>

          <h3>Recent Study Sessions History</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Session Name</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${sessionsHistory.map(s => `
                <tr>
                  <td>${s.dateFormatted}</td>
                  <td><b>${s.sessionName}</b></td>
                  <td>${s.durationMinutes} mins</td>
                  <td><span class="badge">${s.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Format active time remaining display
  const formatCountdown = (totalSec) => {
    if (totalSec <= 0) return '00:00';
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    if (hours > 0) {
      return `${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 overflow-y-auto px-3.5 py-4 sm:px-6 sm:py-6 md:px-8 md:py-10 transition-colors duration-300 font-sans bg-slate-50 dark:bg-slate-900/40">
      
      {/* LOCK WARNING FLOATING TOAST */}
      {lockAlertToast && (
        <div className="fixed top-6 right-6 z-50 max-w-md bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-2xl border border-slate-700 dark:border-slate-300 flex items-start gap-3 animate-fade-in">
          <Lock className="h-5 w-5 text-amber-400 dark:text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-bold">Strict Lock Enforced</p>
            <p className="text-[11px] opacity-90 mt-0.5 leading-relaxed">{lockAlertToast}</p>
          </div>
          <button
            onClick={() => setLockAlertToast('')}
            className="text-slate-400 hover:text-white dark:hover:text-slate-900 p-0.5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="mb-8 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Focus Shield
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                isProtectionActive
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
              }`}>
                {isProtectionActive ? 'Shield Active' : 'Standby'}
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
              Complete productivity protection firewall. Block distracting web domains, lock study sessions, and preserve uninterrupted concentration.
            </p>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={() => setIsCreateSessionModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs shadow-md hover:shadow-indigo-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>+ New Study Session</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl space-y-6">

        {/* ACTIVE STUDY SESSION BANNER (WHEN ACTIVE) */}
        {isStudySessionActive && (
          <section className="bg-white dark:bg-slate-900 border-2 border-indigo-500/80 rounded-[14px] p-5 md:p-6 shadow-md animate-fade-in relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Active Study Session
                  </span>
                  <span className="text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                    Blocking Enabled
                  </span>
                </div>

                <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
                  {activeStudySession.name}
                </h2>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {activeStudySession.durationMinutes} Minutes total
                  </span>
                  <span>•</span>
                  <span>
                    Started: {activeStudySession.startTime}
                  </span>
                  <span>•</span>
                  <span>
                    Ends: {activeStudySession.endTimeFormatted}
                  </span>
                </div>

                {/* Blocked categories pill list */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-slate-400 mr-1">Blocked:</span>
                  {activeStudySession.blockedCategories?.map(cat => (
                    <span key={cat} className="text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 px-2 py-0.5 rounded-md">
                      {cat}
                    </span>
                  ))}
                  {activeStudySession.allowedWebsites?.length > 0 && (
                    <>
                      <span className="text-[11px] font-semibold text-slate-400 mx-1">Whitelist:</span>
                      {activeStudySession.allowedWebsites.map(domain => (
                        <span key={domain} className="text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 px-2 py-0.5 rounded-md">
                          {domain}
                        </span>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Countdown & Action Buttons */}
              <div className="flex items-center gap-3 self-start lg:self-auto">
                <div className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-center min-w-[120px]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Time Remaining
                  </span>
                  <span className="text-lg md:text-xl font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {formatCountdown(studySessionRemaining)}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleCompleteStudySession(activeStudySession, 'Completed')}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Complete
                  </button>

                  <button
                    onClick={() => handleCompleteStudySession(activeStudySession, 'Cancelled')}
                    className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-950/40 dark:text-slate-300 dark:hover:text-rose-400 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                    Cancel
                  </button>
                </div>
              </div>

            </div>
          </section>
        )}

        {/* SECTION: NEW ANALYTICS SECTION (Matching Analytics Page Design) */}
        <section className="space-y-4">
          
          {/* Analytics Header Box (matching Analytics.jsx top section) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-4 sm:p-5 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              
              {/* Header info */}
              <div>
                <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Shield Analytics & Distraction Reports</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Deep intelligence on intercepted distraction attempts, focus hours saved, and session resilience.
                </p>
              </div>

              {/* Controls Bar: Timeframe Report Tabs + Export Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                
                {/* Timeframe Selector (Daily Distraction Report / Weekly / Monthly) */}
                <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700/80 text-xs">
                  <button
                    type="button"
                    onClick={() => setAnalyticsReportTab('Daily')}
                    className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      analyticsReportTab === 'Daily'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Daily Distraction Report
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnalyticsReportTab('Weekly')}
                    className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      analyticsReportTab === 'Weekly'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Weekly Report
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnalyticsReportTab('Monthly')}
                    className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      analyticsReportTab === 'Monthly'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Monthly Report
                  </button>
                </div>

                {/* Export Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold px-3 py-1.5 shadow-xs transition-all cursor-pointer"
                    title="Export as CSV"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportPDF}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold px-3 py-1.5 border border-slate-200 dark:border-slate-700 shadow-xs transition-all cursor-pointer"
                    title="Export as PDF Document"
                  >
                    <FileText className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                    <span>Export PDF</span>
                  </button>
                </div>

              </div>

            </div>
          </div>

          {/* 6 ANALYTICS CARDS (Styled exactly like Analytics.jsx summary cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Card 1: Most visited blocked website */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-4 sm:p-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Most Visited Blocked Website
                </span>
                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                  <Target className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight truncate" title={analyticsData.mostVisitedBlocked}>
                  {analyticsData.mostVisitedBlocked}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Top intercepted distraction domain
                </p>
              </div>
            </div>

            {/* Card 2: Number of blocked attempts */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-4 sm:p-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Number of Blocked Attempts
                </span>
                <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                  <ShieldAlert className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {analyticsData.blockedAttempts}
                </h3>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                  Distractions intercepted across active sessions
                </p>
              </div>
            </div>

            {/* Card 3: Estimated study time saved */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-4 sm:p-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Estimated Study Time Saved
                </span>
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {analyticsData.estimatedTimeSaved}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Preserved high-focus study hours
                </p>
              </div>
            </div>

            {/* Card 4: Most distracting category */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-4 sm:p-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Most Distracting Category
                </span>
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                  <Share2 className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-xl md:text-2xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tight">
                  {analyticsData.mostDistractingCategory}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Highest volume of resisted visits
                </p>
              </div>
            </div>

            {/* Card 5: Longest study session */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-4 sm:p-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Longest Study Session
                </span>
                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                  <Flame className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {analyticsData.longestSession}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Unbroken shielded study streak
                </p>
              </div>
            </div>

            {/* Card 6: Best focus day */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-4 sm:p-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Best Focus Day
                </span>
                <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400">
                  <Award className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {analyticsData.bestFocusDay}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Peak shielded study performance
                </p>
              </div>
            </div>

          </div>

          {/* Distraction Category Breakdown Bar & Leaderboard */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-4 sm:p-5 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              Distraction Category Volume ({analyticsData.timeframeLabel})
            </h4>
            
            {/* Visual segmented progress bar */}
            <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex mb-3">
              {analyticsData.categoryBreakdown.map(cat => (
                <div
                  key={cat.name}
                  style={{ width: `${cat.percentage}%` }}
                  className={`${cat.color} h-full transition-all duration-500`}
                  title={`${cat.name}: ${cat.percentage}% (${cat.count} attempts)`}
                />
              ))}
            </div>

            {/* Category legends */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
              {analyticsData.categoryBreakdown.map(cat => (
                <div key={cat.name} className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${cat.color}`} />
                  <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                    {cat.name}
                  </span>
                  <span className="text-slate-400 ml-auto font-mono font-bold">
                    {cat.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>

        </section>

        {/* SECTION 4: STUDY MODE LOCK BANNER */}
        <section className={`rounded-[14px] border p-5 md:p-6 transition-all duration-300 shadow-sm ${
          studyModeEnabled
            ? 'border-indigo-300 dark:border-indigo-800/80 bg-white dark:bg-slate-900 ring-1 ring-indigo-500/20'
            : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900'
        }`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${
                  studyModeEnabled 
                    ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}>
                  {studyModeEnabled ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Study Mode
                  {studyModeEnabled && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                      Strict Protection Enforced
                    </span>
                  )}
                </h2>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                When enabled, locks all blocked websites until your timer finishes. Prevents unblocking, disabling, or deleting rules during intense study hours.
              </p>
            </div>

            {/* Study Mode Active Controls & Countdown */}
            <div className="flex flex-wrap items-center gap-4">
              
              {/* Active countdown if timer is running */}
              {(isFocusSessionActive || isQuickBlockActive || isStudySessionActive) && (
                <div className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-center min-w-[120px]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Lock Finishes In
                  </span>
                  <span className="text-sm md:text-base font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {isStudySessionActive
                      ? formatCountdown(studySessionRemaining)
                      : isFocusSessionActive
                      ? formatTime(timeLeft)
                      : formatCountdown(quickBlockRemaining)}
                  </span>
                </div>
              )}

              {/* Study Mode Toggle Switch */}
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {studyModeEnabled ? 'Study Mode ON' : 'Study Mode OFF'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (isStrictlyLocked) {
                      triggerLockWarning();
                      return;
                    }
                    setStudyModeEnabled(prev => !prev);
                  }}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 cursor-pointer relative ${
                    studyModeEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  title={studyModeEnabled ? 'Disable Study Mode' : 'Enable Study Mode'}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 transform ${
                    studyModeEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

            </div>

          </div>
        </section>

        {/* SECTION 3: QUICK BLOCK BUTTONS */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-5 md:p-6 shadow-xs space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <span>Quick Block Buttons</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Instantly shield all distraction sites for a specific duration with one click.
              </p>
            </div>

            {/* Quick Block Active Banner */}
            {isQuickBlockActive && (
              <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-3 py-1 rounded-lg border border-amber-200 dark:border-amber-800/80 text-xs font-semibold">
                <Clock className="h-3.5 w-3.5 animate-spin" />
                <span>{quickBlockTimer.label}: {formatCountdown(quickBlockRemaining)} left</span>
                <button
                  onClick={handleStopQuickBlock}
                  className="ml-1 text-slate-400 hover:text-rose-600 p-0.5"
                  title="Cancel Quick Block"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* 5 Quick Block Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            
            {/* Button 1: 30 Minutes */}
            <button
              type="button"
              onClick={() => handleStartQuickBlock(30, '30 Minutes')}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all duration-150 flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-98 ${
                quickBlockTimer?.label === '30 Minutes' && isQuickBlockActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-800 hover:border-indigo-300'
              }`}
            >
              <Clock className="h-4 w-4 text-indigo-500" />
              <span>30 Minutes</span>
            </button>

            {/* Button 2: 1 Hour */}
            <button
              type="button"
              onClick={() => handleStartQuickBlock(60, '1 Hour')}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all duration-150 flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-98 ${
                quickBlockTimer?.label === '1 Hour' && isQuickBlockActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-800 hover:border-indigo-300'
              }`}
            >
              <Clock className="h-4 w-4 text-indigo-500" />
              <span>1 Hour</span>
            </button>

            {/* Button 3: 2 Hours */}
            <button
              type="button"
              onClick={() => handleStartQuickBlock(120, '2 Hours')}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all duration-150 flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-98 ${
                quickBlockTimer?.label === '2 Hours' && isQuickBlockActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-800 hover:border-indigo-300'
              }`}
            >
              <Clock className="h-4 w-4 text-indigo-500" />
              <span>2 Hours</span>
            </button>

            {/* Button 4: Until Tomorrow */}
            <button
              type="button"
              onClick={handleStartUntilTomorrow}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all duration-150 flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-98 ${
                quickBlockTimer?.label?.includes('Until Tomorrow') && isQuickBlockActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-800 hover:border-indigo-300'
              }`}
            >
              <Shield className="h-4 w-4 text-indigo-500" />
              <span>Until Tomorrow</span>
            </button>

            {/* Button 5: Custom Time */}
            <button
              type="button"
              onClick={() => setIsCustomModalOpen(true)}
              className="py-2.5 px-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all duration-150 flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-98"
            >
              <Plus className="h-4 w-4 text-indigo-500" />
              <span>Custom Time</span>
            </button>

          </div>
        </section>

        {/* SECTION 2: CATEGORY BLOCKING */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-5 md:p-6 shadow-xs space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>Category Blocking</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                One-click toggle to block entire distraction genres across the web.
              </p>
            </div>
            
            {/* Quick bulk action */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (isStrictlyLocked) { triggerLockWarning(); return; }
                  const allOn = { 'Social Media': true, 'Video Streaming': true, 'Gaming': true, 'Shopping': true, 'Adult': true, 'News': true };
                  setCategorySettings(allOn);
                  const updated = blockedSites.map(s => ({ ...s, enabled: true }));
                  persistSites(updated);
                }}
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Block All Categories
              </button>
            </div>
          </div>

          {/* 6 Category Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {CATEGORY_DEFINITIONS.map(cat => {
              const IconComp = cat.icon;
              const isEnabled = !!categorySettings[cat.id];
              const isExpanded = !!expandedCategories[cat.id];
              const countInList = blockedSites.filter(s => s.category === cat.id && s.enabled).length;

              return (
                <div
                  key={cat.id}
                  className={`rounded-xl border p-4 transition-all duration-200 ${
                    isEnabled
                      ? 'border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/20 dark:bg-indigo-950/20'
                      : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-850/40 opacity-80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl border ${
                        isEnabled
                          ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}>
                        <IconComp className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {cat.name}
                        </h4>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                          {countInList} sites active in block list
                        </span>
                      </div>
                    </div>

                    {/* Category Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => handleToggleCategory(cat.id)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer relative shrink-0 ${
                        isEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                      title={isEnabled ? `Unblock ${cat.name}` : `Block ${cat.name}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-xs transition-transform duration-200 transform ${
                        isEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2.5 leading-snug line-clamp-2">
                    {cat.description}
                  </p>

                  {/* Expand & Add Presets Buttons */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px]">
                    <button
                      type="button"
                      onClick={() => setExpandedCategories(prev => ({ ...prev, [cat.id]: !prev[cat.id] }))}
                      className="font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 cursor-pointer"
                    >
                      <span>{cat.defaultDomains.length} Presets</span>
                      {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAddCategoryPresets(cat)}
                      className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> Add All Presets
                    </button>
                  </div>

                  {/* Expanded Presets Drawer */}
                  {isExpanded && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 max-h-44 overflow-y-auto pr-1">
                      {cat.defaultDomains.map(preset => {
                        const inList = blockedSites.find(s => s.website === preset.domain);
                        const isSiteActive = inList ? inList.enabled : false;

                        return (
                          <div
                            key={preset.domain}
                            className="flex items-center justify-between p-1.5 rounded-lg bg-white dark:bg-slate-900 text-[11px] border border-slate-100 dark:border-slate-800"
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <Favicon domain={preset.domain} className="h-3.5 w-3.5" />
                              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                                {preset.domain}
                              </span>
                            </div>

                            {inList ? (
                              <button
                                type="button"
                                onClick={() => handleToggleSite(inList)}
                                className={`px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer ${
                                  isSiteActive 
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                }`}
                              >
                                {isSiteActive ? 'Blocked' : 'Paused'}
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  persistSites([
                                    {
                                      _id: `site_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                                      website: preset.domain,
                                      category: cat.name,
                                      enabled: true,
                                      createdAt: new Date().toISOString()
                                    },
                                    ...blockedSites
                                  ]);
                                }}
                                className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold text-[10px] cursor-pointer"
                              >
                                + Add
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </section>

        {/* SECTION 1: WEBSITE BLOCK LIST */}
        <section className="space-y-4">
          
          {/* Add Website Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-5 md:p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Plus className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Add Website to Block List</span>
            </h3>

            <form onSubmit={handleAddWebsite} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="e.g. twitter.com, youtube.com, reddit.com"
                  value={websiteInput}
                  onChange={(e) => setWebsiteInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs md:text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="w-full sm:w-48">
                <select
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs md:text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none cursor-pointer"
                >
                  {CATEGORY_NAMES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs md:text-sm rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Plus className="h-4 w-4" /> Add Website
              </button>
            </form>

            {errorMessage && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-2.5 flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {errorMessage}
              </p>
            )}

            {successMessage && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-2.5 flex items-center gap-1">
                <CheckCircle className="h-3.5 w-3.5 shrink-0" /> {successMessage}
              </p>
            )}
          </div>

          {/* Block List Filters & Search Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-slate-400" />
              <h3 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Configured Websites ({filteredSites.length})
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              
              {/* Search Bar */}
              <div className="relative flex-1 md:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search websites..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:border-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="All">All Categories</option>
                {CATEGORY_NAMES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:border-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active Only</option>
                <option value="Paused">Paused Only</option>
              </select>

            </div>
          </div>

          {/* Websites Grid */}
          {filteredSites.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-[14px] text-slate-500 dark:text-slate-400 font-medium text-xs md:text-sm bg-white dark:bg-slate-900">
              No blocked websites match your current filter. Add a new domain above!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredSites.map((site) => {
                const isEditing = site._id === editingId;
                const attemptsToday = dailyStats.siteAttempts?.[site.website] || 0;

                return (
                  <div
                    key={site._id}
                    className={`rounded-xl border p-4 transition-all duration-200 flex flex-col justify-between gap-3 shadow-xs hover:shadow-sm ${
                      site.enabled
                        ? 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900'
                        : 'border-slate-200/60 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-900/40 opacity-75'
                    }`}
                  >
                    {/* Top Row: Favicon, Domain & Controls */}
                    <div className="flex items-start justify-between gap-2.5">
                      
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center shrink-0">
                          <Favicon domain={site.website} className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          {isEditing ? (
                            <div className="space-y-1.5 pr-1">
                              <input
                                type="text"
                                value={editingWebsite}
                                onChange={(e) => setEditingWebsite(e.target.value)}
                                className="w-full text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-indigo-500 focus:outline-none"
                              />
                              <select
                                value={editingCategory}
                                onChange={(e) => setEditingCategory(e.target.value)}
                                className="w-full text-[10px] text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700"
                              >
                                {CATEGORY_NAMES.map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center gap-1">
                                <h4 className="text-xs md:text-sm font-bold text-slate-900 dark:text-white truncate" title={site.website}>
                                  {site.website}
                                </h4>
                                <a
                                  href={`https://${site.website}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                  title="Open website in new tab"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                              <span className="inline-block text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                                {site.category}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* On/Off Switch */}
                      {!isEditing && (
                        <button
                          type="button"
                          onClick={() => handleToggleSite(site)}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer relative shrink-0 ${
                            site.enabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                          title={site.enabled ? 'Pause blocking' : 'Enable blocking'}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full shadow-xs transition-transform duration-200 transform ${
                            site.enabled ? 'translate-x-4' : 'translate-x-0'
                          }`} />
                        </button>
                      )}

                    </div>

                    {/* Bottom Row: Intercept stats & action buttons */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                      
                      <div className="text-slate-400 text-[10px]">
                        {attemptsToday > 0 ? (
                          <span className="text-rose-600 dark:text-rose-400 font-semibold">
                            {attemptsToday} attempts blocked
                          </span>
                        ) : (
                          <span>0 attempts today</span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(site._id)}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded transition-colors cursor-pointer"
                              title="Save changes"
                            >
                              <Save className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                              title="Cancel"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleStartEdit(site)}
                              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded transition-colors cursor-pointer"
                              title="Edit domain"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSite(site._id)}
                              className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors cursor-pointer"
                              title="Delete from block list"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>

                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </section>

        {/* SECTION: STUDY SESSIONS & HISTORY TABLE */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-5 md:p-6 shadow-xs space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <History className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>Study Session History</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Complete record of customized study sessions with automatic distraction shielding.
              </p>
            </div>

            {/* History filters */}
            <div className="flex items-center gap-2.5">
              <div className="relative w-44 sm:w-52">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search history..."
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={historyStatusFilter}
                onChange={(e) => setHistoryStatusFilter(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* History Table */}
          <div className="overflow-x-auto">
            {filteredHistory.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                No study sessions match your filter. Start a session using "+ New Study Session" above!
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Session</th>
                    <th className="py-2.5 px-3 text-center">Duration</th>
                    <th className="py-2.5 px-3">Blocked Websites</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredHistory.map((item) => {
                    const isCompleted = item.status === 'Completed';

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-850/40 transition-colors">
                        
                        {/* Column 1: Date */}
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                          {item.dateFormatted}
                        </td>

                        {/* Column 2: Session */}
                        <td className="py-3 px-3">
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {item.sessionName}
                          </span>
                          {item.allowedWebsites && item.allowedWebsites.length > 0 && (
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              Allowed: {item.allowedWebsites.join(', ')}
                            </span>
                          )}
                        </td>

                        {/* Column 3: Duration */}
                        <td className="py-3 px-3 text-center font-mono font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                          {item.durationMinutes} mins
                        </td>

                        {/* Column 4: Blocked Websites */}
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap items-center gap-1">
                            {item.blockedCategories && item.blockedCategories.map(cat => (
                              <span
                                key={cat}
                                className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                              >
                                {cat}
                              </span>
                            ))}
                            {item.blockedWebsitesCount > 0 && (
                              <span className="text-[10px] text-slate-400 font-medium ml-1">
                                ({item.blockedWebsitesCount} sites)
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Column 5: Status */}
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isCompleted
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            }`}
                          >
                            {isCompleted ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            {item.status}
                          </span>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

        </section>

      </div>

      {/* CREATE STUDY SESSION MODAL */}
      {isCreateSessionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-[14px] shadow-2xl p-5 md:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Create Study Session
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Configure your session duration, blocked distraction categories, and whitelist.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateSessionModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleStartStudySession} className="space-y-4">
              
              {/* Field 1: Session Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Session Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. DSA Marathon, Calculus Prep, Deep Reading"
                  value={sessionFormName}
                  onChange={(e) => setSessionFormName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs md:text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              {/* Field 2: Duration & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="480"
                    value={sessionFormDuration}
                    onChange={(e) => setSessionFormDuration(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs md:text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={sessionFormStartTime}
                    onChange={(e) => setSessionFormStartTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs md:text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={sessionFormEndTime}
                    onChange={(e) => setSessionFormEndTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs md:text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

              </div>

              {/* Field 3: Blocked Categories (Multi-select) */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Blocked Categories during Session
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORY_DEFINITIONS.map(cat => {
                    const isChecked = sessionFormBlockedCategories.includes(cat.name);
                    const IconComp = cat.icon;

                    return (
                      <div
                        key={cat.id}
                        onClick={() => handleToggleSessionFormCategory(cat.name)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/60'
                            : 'bg-slate-50 dark:bg-slate-800/40 text-slate-500 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className={`p-1 rounded ${isChecked ? 'bg-rose-100 dark:bg-rose-900 text-rose-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                          <IconComp className="h-3 w-3" />
                        </div>
                        <span className="truncate flex-1">{cat.name}</span>
                        {isChecked && <Check className="h-3.5 w-3.5 text-rose-600 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Field 4: Allowed Websites (Whitelist Exceptions) */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Allowed Websites (Whitelist Exemptions)
                </label>
                <p className="text-[11px] text-slate-400 mb-2">
                  These learning resources will never be blocked during the session.
                </p>

                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g. stackoverflow.com, wikipedia.org"
                    value={allowedWebsiteInput}
                    onChange={(e) => setAllowedWebsiteInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddAllowedWebsite(allowedWebsiteInput);
                      }
                    }}
                    className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddAllowedWebsite(allowedWebsiteInput)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 text-slate-700 dark:text-slate-200 hover:text-indigo-600 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    + Add
                  </button>
                </div>

                {/* Current Whitelist Tags */}
                <div className="flex flex-wrap items-center gap-1.5 min-h-[28px]">
                  {sessionFormAllowedWebsites.map(domain => (
                    <span
                      key={domain}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50"
                    >
                      <Favicon domain={domain} className="h-3 w-3" />
                      <span>{domain}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAllowedWebsite(domain)}
                        className="text-emerald-500 hover:text-rose-600 ml-0.5 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-[10px] font-bold text-slate-400 mr-1">Quick Presets:</span>
                  {COMMON_ALLOWED_PRESETS.map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleAddAllowedWebsite(preset)}
                      className="text-[10px] font-medium bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-600 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200/80 dark:border-slate-700 cursor-pointer transition-colors"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>

              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateSessionModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Play className="h-3.5 w-3.5 fill-white" />
                  <span>Start Study Session</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* CUSTOM TIME MODAL */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-[14px] shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>Custom Quick Block</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCustomModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCustomQuickBlockSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Block Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={customMinutesInput}
                  onChange={(e) => setCustomMinutesInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                  placeholder="e.g. 45"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs cursor-pointer"
                >
                  Start Blocking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
