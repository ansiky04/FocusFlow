/**
 * FocusFlow Focus Shield - Content Script Module
 * Injected on https://focus-flow-flame-one.vercel.app/*, http://localhost:5173/*, and http://localhost:5174/*
 * Bridges authentication tokens, block lists, and start/end session timestamps to the background worker.
 */

let pollInterval = null;
let lastSyncedSnapshot = null;

function isContextValid() {
  return typeof chrome !== 'undefined' && chrome.runtime && !!chrome.runtime.id;
}

/**
 * Extract auth token, blocked sites, and active session from localStorage and forward to background
 */
function syncAppState(force = false) {
  if (!isContextValid()) {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
    return;
  }

  try {
    const token = localStorage.getItem('focusflow_token');
    const now = Date.now();

    // 1. Scan for active study session or quickblock
    let activeSession = null;
    let blockedWebsites = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      if (key.startsWith('focusflow_shield_active_session_')) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.status === 'active') {
              const durMinutes = Number(parsed.durationMinutes) || 25;

              let startTimeMs = parsed.startTime
                ? (typeof parsed.startTime === 'number' ? parsed.startTime : (Number(parsed.startTime) || Date.parse(parsed.startTime)))
                : now;
              if (isNaN(startTimeMs) || !startTimeMs) startTimeMs = now;

              let endTimeMs = parsed.endTime
                ? (typeof parsed.endTime === 'number' ? parsed.endTime : (Number(parsed.endTime) || Date.parse(parsed.endTime)))
                : null;
              if (!endTimeMs || isNaN(endTimeMs)) {
                endTimeMs = startTimeMs + durMinutes * 60 * 1000;
              }

              if (endTimeMs > now) {
                activeSession = {
                  ...parsed,
                  durationMinutes: durMinutes,
                  startTime: startTimeMs,
                  endTime: endTimeMs
                };
              }
            }
          }
        } catch { /* ignore */ }
      }

      if (!activeSession && key.startsWith('focusflow_shield_quickblock_')) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.active) {
              const endMs = typeof parsed.endTime === 'number' ? parsed.endTime : (Number(parsed.endTime) || Date.parse(parsed.endTime));
              if (endMs && endMs > now) {
                const totalMins = Math.max(1, Math.round((parsed.totalSeconds || 1500) / 60));
                activeSession = {
                  id: `quickblock_${parsed.endTime}`,
                  name: parsed.label || 'Quick Block',
                  sessionType: 'Quick Block',
                  durationMinutes: totalMins,
                  startTime: endMs - (parsed.totalSeconds || 1500) * 1000,
                  endTime: endMs,
                  status: 'active'
                };
              }
            }
          }
        } catch { /* ignore */ }
      }

      if (key.startsWith('focusflow_shield_sites_')) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              blockedWebsites = parsed
                .filter(site => site && site.enabled)
                .map(site => site.website);
            }
          }
        } catch { /* ignore */ }
      }
    }

    const defaultBlockedList = ['youtube.com', 'instagram.com', 'facebook.com', 'x.com', 'reddit.com', 'discord.com'];
    const finalBlockedWebsites = blockedWebsites.length > 0 ? blockedWebsites : defaultBlockedList;

    if (!chrome.runtime?.id) return;

    if (activeSession && (!activeSession.blockedWebsites || activeSession.blockedWebsites.length === 0)) {
      activeSession.blockedWebsites = finalBlockedWebsites;
    }

    // Check for state changes to avoid unnecessary message traffic
    const currentSnapshot = JSON.stringify({
      token: token || null,
      blockedWebsites: finalBlockedWebsites,
      session: activeSession
        ? { id: activeSession.id, endTime: activeSession.endTime, name: activeSession.name, status: activeSession.status }
        : null
    });

    if (!force && currentSnapshot === lastSyncedSnapshot) {
      return;
    }

    lastSyncedSnapshot = currentSnapshot;

    // Send single consolidated state sync message to background worker
    chrome.runtime.sendMessage({
      type: 'SYNC_APP_STATE',
      token: token || null,
      blockedWebsites: finalBlockedWebsites,
      session: activeSession
    }, () => {
      if (chrome.runtime.lastError) {
        const msg = chrome.runtime.lastError.message || '';
        if (msg.includes('context invalidated') || msg.includes('Extension context invalidated')) {
          if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
          }
        }
      }
    });
  } catch (err) {
    if (!chrome.runtime?.id || err.message?.includes('invalidated')) {
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
    }
  }
}

// Initial sync
syncAppState(true);

// Monitor login/logout actions by listening to local storage events
window.addEventListener('storage', (e) => {
  if (!isContextValid()) return;
  if (e.key === 'focusflow_token' || e.key?.startsWith('focusflow_shield_')) {
    syncAppState(true);
  }
});

// Monitor instant page message events
window.addEventListener('message', (e) => {
  if (!isContextValid()) return;
  if (
    e.data &&
    (e.data.type === 'FOCUSFLOW_TOKEN_CHANGED' ||
      e.data.type === 'FOCUSFLOW_SESSION_CHANGED' ||
      e.data.type === 'FOCUSFLOW_BLOCKLIST_UPDATED')
  ) {
    syncAppState(true);
  }
});

// Periodic fallback polling with deduplication
if (pollInterval) {
  clearInterval(pollInterval);
}
pollInterval = setInterval(() => syncAppState(false), 3000);

