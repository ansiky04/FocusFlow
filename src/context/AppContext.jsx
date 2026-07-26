import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const AppContext = createContext(undefined);

/**
 * AppProvider component to wrap the React application tree.
 */
export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('focusflow_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  const [userSettings, setUserSettings] = useState(() => {
    const saved = localStorage.getItem('focusflow_timer_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          focusDuration: parsed.focusDuration || 25,
          shortBreak: parsed.shortBreak || 5,
          longBreak: parsed.longBreak || 15,
          autoStartBreak: parsed.autoStartBreak ?? false,
          autoStartNextSession: parsed.autoStartNextSession ?? false,
          enableNotifications: parsed.enableNotifications ?? true,
        };
      } catch (e) {
        console.warn("Failed to load user settings from localStorage:", e);
      }
    }
    return {
      focusDuration: 25,
      shortBreak: 5,
      longBreak: 15,
      autoStartBreak: false,
      autoStartNextSession: false,
      enableNotifications: true,
    };
  });

  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [focusShield, setFocusShield] = useState({
    blockedWebsites: ['youtube.com', 'instagram.com', 'facebook.com', 'x.com', 'reddit.com', 'discord.com'],
    isEnabled: false,
  });

  // Global Timer and Active Session States
  const [mode, setMode] = useState('focus'); // 'focus' | 'short' | 'long'
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [quote, setQuote] = useState("Focus is a muscle, and you are building it right now.");
  const [showQuoteToast, setShowQuoteToast] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [isCustomActive, setIsCustomActive] = useState(() => {
    return localStorage.getItem('focusflow_is_custom_active') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('focusflow_is_custom_active', isCustomActive ? 'true' : 'false');
  }, [isCustomActive]);

  const durations = {
    focus: (userSettings?.focusDuration || 25) * 60,
    short: (userSettings?.shortBreak || 5) * 60,
    long: (userSettings?.longBreak || 15) * 60,
  };

  const [themePreference, setThemePreferenceState] = useState(() => {
    return localStorage.getItem('focusflow_theme_selection') || 'dark';
  });
  const [theme, setTheme] = useState('dark');

  // Notification Permission State
  const [notificationPermission, setNotificationPermission] = useState('default');

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(window.Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await window.Notification.requestPermission();
      setNotificationPermission(permission);
      return permission;
    }
    return 'denied';
  };

  // Notification Preferences State
  const [notificationSettings, setNotificationSettings] = useState(() => {
    const saved = localStorage.getItem('focusflow_notification_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          focusAlerts: parsed.focusAlerts ?? true,
          breakAlerts: parsed.breakAlerts ?? true,
          dailyReminders: parsed.dailyReminders ?? true,
          achievementBadges: parsed.achievementBadges ?? true,
        };
      } catch (e) {}
    }
    return {
      focusAlerts: true,
      breakAlerts: true,
      dailyReminders: true,
      achievementBadges: true,
    };
  });

  // Local storage backup for settings
  useEffect(() => {
    localStorage.setItem('focusflow_notification_settings', JSON.stringify(notificationSettings));
  }, [notificationSettings]);

  // Notifications List State
  const [userNotifications, setUserNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUserNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch('http://localhost:5000/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setUserNotifications(data.notifications);
        setUnreadCount(data.notifications.filter(n => !n.read).length);
      }
    } catch (err) {
      console.error('Failed to fetch user notifications:', err);
    }
  }, [token]);

  // Fetch notifications on mount/token change
  useEffect(() => {
    fetchUserNotifications();
  }, [fetchUserNotifications]);

  const markNotificationAsRead = async (notifId) => {
    setUserNotifications(prev => 
      prev.map(n => n._id === notifId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      await fetch(`http://localhost:5000/api/notifications/${notifId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllNotificationsAsRead = async () => {
    setUserNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      await fetch('http://localhost:5000/api/notifications/read-all', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const deleteNotificationItem = async (notifId) => {
    setUserNotifications(prev => {
      const filtered = prev.filter(n => n._id !== notifId);
      setUnreadCount(filtered.filter(n => !n.read).length);
      return filtered;
    });

    try {
      await fetch(`http://localhost:5000/api/notifications/${notifId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const clearAllNotificationItems = async () => {
    setUserNotifications([]);
    setUnreadCount(0);

    try {
      await fetch('http://localhost:5000/api/notifications/clear-all', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  };

  // Trigger Notification Helper (Browser alerts & MongoDB record)
  const triggerNotification = useCallback(async (title, message, category) => {
    const categoryToSetting = {
      Focus: 'focusAlerts',
      Break: 'breakAlerts',
      Study: 'focusAlerts',
      Exam: 'focusAlerts',
      Assignment: 'focusAlerts',
      Goal: 'dailyReminders'
    };
    
    const toggleName = categoryToSetting[category];
    const isSettingEnabled = toggleName ? notificationSettings[toggleName] : true;
    
    if (!isSettingEnabled) return;

    // 1. Browser Desktop Notification
    if ('Notification' in window && window.Notification.permission === 'granted') {
      try {
        new window.Notification(title, { body: message });
      } catch (e) {
        console.warn("Browser desktop notification failed:", e);
      }
    }

    // 2. Save Notification to Database
    if (token) {
      try {
        await fetch('http://localhost:5000/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ title, message, category })
        });
        fetchUserNotifications();
      } catch (err) {
        console.error('Failed to save notification record to DB:', err);
      }
    }
  }, [token, notificationSettings, fetchUserNotifications]);

  // Calendar Events State for reminder check loops
  const [calendarEvents, setCalendarEvents] = useState([]);

  const fetchCalendarEvents = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch('http://localhost:5000/api/calendar', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setCalendarEvents(data.events);
      }
    } catch (err) {
      console.error('Failed to fetch calendar events in Context:', err);
    }
  }, [token]);

  useEffect(() => {
    fetchCalendarEvents();
  }, [fetchCalendarEvents]);

  // Keep track of triggered reminder keys to prevent duplicates
  const [triggeredReminders, setTriggeredReminders] = useState(() => {
    const saved = localStorage.getItem('focusflow_triggered_reminders');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('focusflow_triggered_reminders', JSON.stringify(triggeredReminders));
  }, [triggeredReminders]);

  useEffect(() => {
    if (!token || calendarEvents.length === 0) return;

    const reminderCheckInterval = setInterval(() => {
      const now = new Date();
      const currentMinuteLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), 0);

      calendarEvents.forEach(event => {
        if (!event.reminderOffset || event.reminderOffset === 'none') return;

        const eventDate = new Date(event.date);
        const [hours, minutes] = event.startTime.split(':').map(Number);
        
        const eventStartLocal = new Date(
          eventDate.getUTCFullYear(),
          eventDate.getUTCMonth(),
          eventDate.getUTCDate(),
          hours,
          minutes,
          0
        );

        let offsetMinutes = 0;
        if (event.reminderOffset === '5_min') offsetMinutes = 5;
        else if (event.reminderOffset === '10_min') offsetMinutes = 10;
        else if (event.reminderOffset === '30_min') offsetMinutes = 30;
        else if (event.reminderOffset === '1_hour') offsetMinutes = 60;
        else if (event.reminderOffset === '1_day') offsetMinutes = 1440;

        const targetReminderTime = new Date(eventStartLocal.getTime() - offsetMinutes * 60 * 1000);
        const isSameTime = targetReminderTime.getTime() === currentMinuteLocal.getTime();
        const reminderKey = `${event._id}-${event.reminderOffset}`;

        if (isSameTime && !triggeredReminders[reminderKey]) {
          setTriggeredReminders(prev => ({ ...prev, [reminderKey]: true }));

          const timeLabel = event.reminderOffset === 'at_time' ? 'now' : `${offsetMinutes} mins before`;
          const title = `Reminder: ${event.title}`;
          const message = `Scheduled for ${event.startTime}. Category: ${event.category} (${timeLabel}).`;
          
          triggerNotification(title, message, event.category);
        }
      });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(reminderCheckInterval);
  }, [token, calendarEvents, triggeredReminders, notificationSettings, triggerNotification]);

  // Handle setting theme preference locally (auto-sync handles DB persistence)
  const setThemePreference = (newTheme) => {
    setThemePreferenceState(newTheme);
    localStorage.setItem('focusflow_theme_selection', newTheme);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setThemePreference(nextTheme);
  };

  // Synchronize document classes and monitor preferences media query shifts
  useEffect(() => {
    if (themePreference === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const applySystemTheme = (e) => {
        const sysTheme = e.matches ? 'dark' : 'light';
        setTheme(sysTheme);
        document.documentElement.classList.toggle('dark', sysTheme === 'dark');
        document.documentElement.classList.toggle('light', sysTheme === 'light');
      };
      
      applySystemTheme(mq);
      mq.addEventListener('change', applySystemTheme);
      return () => mq.removeEventListener('change', applySystemTheme);
    } else {
      setTheme(themePreference);
      document.documentElement.classList.toggle('dark', themePreference === 'dark');
      document.documentElement.classList.toggle('light', themePreference === 'light');
    }
  }, [themePreference]);

  // Sync /me when token changes or on mount
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setUser(data.user);
          } else {
            logout();
          }
        } else {
          logout();
        }
      } catch (err) {
        console.error('Error fetching current user profile:', err.message);
        // Offline safeguard: do not logout on network disconnects
      } finally {
        setIsLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  // Fetch settings from MongoDB when user resolves
  useEffect(() => {
    const fetchSettings = async () => {
      if (!token || !user) return;
      try {
        const response = await fetch('http://localhost:5000/api/settings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.settings) {
            setThemePreferenceState(data.settings.theme || 'dark');
            localStorage.setItem('focusflow_theme_selection', data.settings.theme || 'dark');
            setUserSettings({
              focusDuration: data.settings.timerSettings?.focusDuration || 25,
              shortBreak: data.settings.timerSettings?.shortBreak || 5,
              longBreak: data.settings.timerSettings?.longBreak || 15,
              autoStartBreak: data.settings.timerSettings?.autoStartBreak ?? false,
              autoStartNextSession: data.settings.timerSettings?.autoStartNextSession ?? false,
              enableNotifications: data.settings.notifications?.focusAlerts ?? true,
            });
            if (data.settings.notifications) {
              setNotificationSettings({
                focusAlerts: data.settings.notifications.focusAlerts ?? true,
                breakAlerts: data.settings.notifications.breakAlerts ?? true,
                dailyReminders: data.settings.notifications.dailyReminders ?? true,
                achievementBadges: data.settings.notifications.achievementBadges ?? true,
              });
            }
            if (data.settings.focusShield) {
              setFocusShield({
                blockedWebsites: data.settings.focusShield.blockedWebsites || [],
                isEnabled: data.settings.focusShield.isEnabled ?? false
              });
            }
            setSettingsLoaded(true);
          }
        }
      } catch (err) {
        console.error('Error fetching settings:', err.message);
      }
    };
    
    if (user) {
      fetchSettings();
    } else {
      setSettingsLoaded(false);
    }
  }, [token, user]);

  // Sync settings back to MongoDB when themePreference, userSettings, notificationSettings, or focusShield changes
  useEffect(() => {
    if (!token || !user || !settingsLoaded) return;

    const syncTimeout = setTimeout(async () => {
      try {
        await fetch('http://localhost:5000/api/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            theme: themePreference,
            timerSettings: {
              focusDuration: userSettings.focusDuration,
              shortBreak: userSettings.shortBreak,
              longBreak: userSettings.longBreak,
              autoStartBreak: userSettings.autoStartBreak,
              autoStartNextSession: userSettings.autoStartNextSession
            },
            notifications: {
              focusAlerts: notificationSettings.focusAlerts,
              breakAlerts: notificationSettings.breakAlerts,
              dailyReminders: notificationSettings.dailyReminders,
              achievementBadges: notificationSettings.achievementBadges
            },
            focusShield: {
              blockedWebsites: focusShield.blockedWebsites,
              isEnabled: focusShield.isEnabled
            }
          })
        });
      } catch (err) {
        console.error('Failed to sync settings on server:', err.message);
      }
    }, 1000); // 1-second debounce

    return () => clearTimeout(syncTimeout);
  }, [themePreference, userSettings, notificationSettings, token, user, settingsLoaded, focusShield]);

  // MOTIVATIONAL QUOTES & Audio Alert triggers
  const MOTIVATIONAL_QUOTES = [
    "Focus is a muscle, and you are building it right now.",
    "Deep work produces high quality results. Keep flowing!",
    "Success is the sum of small efforts, repeated day in and day out.",
    "Your mind is for having ideas, not holding them. Focus on the present.",
    "The secret of getting ahead is getting started.",
    "Work hard in silence, let your success be your noise.",
    "The only way to do great work is to love what you do."
  ];

  const playAlertSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.25);
      oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.3); // E5
      gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.35);
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.6);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.7);
    } catch (e) {
      console.warn("Audio Context failed to execute: ", e);
    }
  };

  const handleTimerExpiry = async () => {
    playAlertSound();
    
    // Trigger notification alert
    if (mode === 'focus') {
      triggerNotification("Focus Session Completed", "Great work! You finished your study session.", "Focus");
    } else {
      triggerNotification("Break Completed", "Break is over. Ready to return to flow state?", "Break");
    }

    const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    setQuote(randomQuote);
    setShowQuoteToast(true);

    const prevActiveSession = activeSession;
    setActiveSession(null);
    setIsActive(false);

    // Focus Shield deactivation for Custom Focus Timer
    if (isCustomActive) {
      setFocusShield(prev => ({ ...prev, isEnabled: false }));
      setIsCustomActive(false);
    }

    if (token && prevActiveSession) {
      try {
        await fetch('http://localhost:5000/api/sessions/active', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'completed', remainingTime: 0 })
        });
      } catch (err) {
        console.error('Failed to log completed focus session to MongoDB:', err.message);
      }
    }
    
    if (mode === 'focus') {
      const nextSessionCount = completedSessions + 1;
      setCompletedSessions(nextSessionCount);
      if (nextSessionCount === 4) { // Target daily goal
        triggerNotification("Daily Goal Completed!", "Congratulations! You completed your daily study target of 4 focus sessions.", "Goal");
      }
      if (nextSessionCount % 4 === 0) {
        setMode('long');
      } else {
        setMode('short');
      }
    } else {
      setMode('focus');
    }

    setTimeout(() => {
      setShowQuoteToast(false);
    }, 8000);
  };

  const timerRef = useRef(null);

  // Sync timer duration if mode changes
  useEffect(() => {
    if (!isActive && !activeSession) {
      setTimeLeft(durations[mode]);
    }
  }, [mode, userSettings, activeSession]);

  // Sync userSettings to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('focusflow_timer_settings', JSON.stringify(userSettings));
  }, [userSettings]);

  // Sync and cancel active session if mode is switched to a mismatched type
  useEffect(() => {
    if (activeSession) {
      const modeToSessionType = {
        focus: 'Focus',
        short: 'Short Break',
        long: 'Long Break',
      };
      
      if (activeSession.sessionType !== modeToSessionType[mode]) {
        // Cancel mismatched session on backend
        if (token) {
          fetch('http://localhost:5000/api/sessions/active', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: 'cancelled' })
          }).catch(err => console.error('Failed to cancel mismatched active session:', err));
        }
        
        // Clear active session state on client
        setActiveSession(null);
        setIsActive(false);
      }
    }
  }, [mode, activeSession, token]);

  // Tick countdown handler
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTimerExpiry();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, mode, activeSession]);

  // Load completed focus sessions count today from analytics
  useEffect(() => {
    const fetchSessionCount = async () => {
      if (!token || !user) return;
      try {
        const response = await fetch('http://localhost:5000/api/analytics', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.analytics) {
          setCompletedSessions(Math.round(data.analytics.totalFocusHours * 2.4) || 0);
        }
      } catch (e) {
        console.warn("Failed to fetch analytics completed session counts: ", e);
      }
    };
    fetchSessionCount();
  }, [token, user]);

  // Fetch active session on mount and calculate correct remaining time
  useEffect(() => {
    const retrieveActiveSession = async () => {
      if (!token || !user) return;
      try {
        const response = await fetch('http://localhost:5000/api/sessions/active', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success && data.session) {
          const session = data.session;
          
          if (session.status === 'completed') {
            playAlertSound();
            setQuote("Your focus session was completed while you were away! Keep it up.");
            setShowQuoteToast(true);
            setCompletedSessions((prev) => prev + 1);

            // Focus Shield deactivation for Custom Focus Timer if completed away
            const wasCustom = localStorage.getItem('focusflow_is_custom_active') === 'true' || 
                              (session.sessionType === 'Focus' && ![10 * 60, 25 * 60, 45 * 60, 60 * 60].includes(session.duration));
            if (wasCustom) {
              setFocusShield(prev => ({ ...prev, isEnabled: false }));
              setIsCustomActive(false);
            }
            
            const nextSessionCount = completedSessions + 1;
            if (nextSessionCount % 4 === 0) {
              setMode('long');
            } else {
              setMode('short');
            }
            setTimeout(() => setShowQuoteToast(false), 8000);
            return;
          }

          setActiveSession(session);
          
          const recoveredMode = session.sessionType === 'Focus' ? 'focus' : session.sessionType === 'Short Break' ? 'short' : 'long';
          setMode(recoveredMode);
          
          if (session.status === 'paused') {
            setTimeLeft(session.remainingTime);
            setIsActive(false);
          } else if (session.status === 'active') {
            const end = new Date(session.endTime);
            const remaining = Math.max(0, Math.round((end - new Date()) / 1000));
            if (remaining > 0) {
              setTimeLeft(remaining);
              setIsActive(true);
            } else {
              playAlertSound();
              setQuote("Focus session completed! You built focus today.");
              setShowQuoteToast(true);
              setCompletedSessions((prev) => prev + 1);
              setIsActive(false);
              setActiveSession(null);

              // Focus Shield deactivation for Custom Focus Timer
              const wasCustom = localStorage.getItem('focusflow_is_custom_active') === 'true' || 
                                (session.sessionType === 'Focus' && ![10 * 60, 25 * 60, 45 * 60, 60 * 60].includes(session.duration));
              if (wasCustom) {
                setFocusShield(prev => ({ ...prev, isEnabled: false }));
                setIsCustomActive(false);
              }

              setTimeout(() => setShowQuoteToast(false), 8000);
            }
          }
        }
      } catch (err) {
        console.error('Failed to retrieve active focus session from server:', err.message);
      }
    };

    retrieveActiveSession();
  }, [token, user]);

  const handleStartPause = async () => {
    if (!token) {
      setIsActive(!isActive);
      return;
    }

    const nextIsActive = !isActive;
    setIsActive(nextIsActive);

    if (nextIsActive) {
      if (mode === 'focus') {
        triggerNotification("Focus Session Started", "Time to concentrate and study.", "Focus");
      } else {
        triggerNotification("Break Started", "Relax and rest.", "Break");
      }
    }

    // Focus Shield activation for Custom Focus Timer
    if (nextIsActive && mode === 'focus') {
      const isCustom = localStorage.getItem('focusflow_last_duration_type') === 'custom';
      if (isCustom) {
        setIsCustomActive(true);
        setFocusShield(prev => ({ ...prev, isEnabled: true }));
      }
    }

    try {
      if (nextIsActive) {
        if (activeSession) {
          const response = await fetch('http://localhost:5000/api/sessions/active', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: 'active', remainingTime: timeLeft })
          });
          const data = await response.json();
          if (data.success && data.session) {
            setActiveSession(data.session);
          }
        } else {
          const sessionTypeMap = mode === 'focus' ? 'Focus' : mode === 'short' ? 'Short Break' : 'Long Break';
          const response = await fetch('http://localhost:5000/api/sessions/start', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ duration: timeLeft, sessionType: sessionTypeMap })
          });
          const data = await response.json();
          if (data.success && data.session) {
            setActiveSession(data.session);
          }
        }
      } else {
        if (activeSession) {
          const response = await fetch('http://localhost:5000/api/sessions/active', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: 'paused', remainingTime: timeLeft })
          });
          const data = await response.json();
          if (data.success && data.session) {
            setActiveSession(data.session);
          }
        }
      }
    } catch (err) {
      console.error('Failed to sync start/pause state with server:', err.message);
    }
  };

  const handleReset = async () => {
    setIsActive(false);
    setTimeLeft(durations[mode]);
    
    const prevActiveSession = activeSession;
    setActiveSession(null);

    // Focus Shield deactivation for Custom Focus Timer
    if (isCustomActive) {
      setFocusShield(prev => ({ ...prev, isEnabled: false }));
      setIsCustomActive(false);
    }

    if (token && prevActiveSession) {
      try {
        await fetch('http://localhost:5000/api/sessions/active', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'cancelled' })
        });
      } catch (err) {
        console.error('Failed to cancel active session on server:', err.message);
      }
    }
  };

  const handleSkip = async () => {
    setIsActive(false);
    const prevActiveSession = activeSession;
    setActiveSession(null);

    // Focus Shield deactivation for Custom Focus Timer
    if (isCustomActive) {
      setFocusShield(prev => ({ ...prev, isEnabled: false }));
      setIsCustomActive(false);
    }

    if (token && prevActiveSession) {
      try {
        await fetch('http://localhost:5000/api/sessions/active', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'cancelled' })
        });
      } catch (err) {
        console.error('Failed to cancel active session on skip:', err.message);
      }
    }

    if (mode === 'focus') {
      setMode('short');
    } else {
      setMode('focus');
    }
  };

  const login = (newToken, newUser) => {
    localStorage.setItem('focusflow_token', newToken);
    setToken(newToken);
    setUser(newUser);
    window.postMessage({ type: 'FOCUSFLOW_TOKEN_CHANGED', token: newToken }, '*');
  };

  const logout = () => {
    localStorage.removeItem('focusflow_token');
    setToken(null);
    setUser(null);
    window.postMessage({ type: 'FOCUSFLOW_TOKEN_CHANGED', token: null }, '*');
  };

  return (
    <AppContext.Provider value={{ 
      theme, 
      themePreference,
      setThemePreference,
      toggleTheme, 
      setTheme, 
      userSettings, 
      setUserSettings,
      user,
      setUser,
      token,
      login,
      logout,
      isLoading,
      focusShield,
      setFocusShield,
      mode,
      setMode,
      timeLeft,
      setTimeLeft,
      isActive,
      setIsActive,
      completedSessions,
      setCompletedSessions,
      activeSession,
      setActiveSession,
      quote,
      showQuoteToast,
      setShowQuoteToast,
      durations,
      handleStartPause,
      handleReset,
      handleSkip,
      playAlertSound,
      isCustomActive,
      setIsCustomActive,
      notificationSettings,
      setNotificationSettings,
      userNotifications,
      unreadCount,
      fetchUserNotifications,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      deleteNotificationItem,
      clearAllNotificationItems,
      requestNotificationPermission,
      notificationPermission,
      fetchCalendarEvents
    }}>
      {children}
    </AppContext.Provider>
  );
}

/**
 * Custom hook to consume the AppContext easily.
 */
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
