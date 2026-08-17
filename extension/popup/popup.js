/**
 * FocusFlow Focus Shield - Popup Script
 * Renders live state and synchronized countdown calculated from endTime - Date.now().
 */

document.addEventListener('DOMContentLoaded', () => {
  const pulseDot = document.getElementById('pulse-dot');
  const statusTitle = document.getElementById('status-title');
  const syncBtn = document.getElementById('sync-btn');
  const sessionType = document.getElementById('session-type');
  const sessionName = document.getElementById('session-name');
  const timerDigits = document.getElementById('timer-digits');
  const blockedCount = document.getElementById('blocked-count');
  const attemptsCount = document.getElementById('attempts-count');
  const openAppBtn = document.getElementById('open-app-btn');

  let localTimerInterval = null;
  let sessionEndTime = null;

  function formatTime(seconds) {
    if (typeof seconds !== 'number' || isNaN(seconds) || seconds <= 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function tickCountdown() {
    if (!sessionEndTime) {
      if (localTimerInterval) clearInterval(localTimerInterval);
      if (timerDigits) timerDigits.textContent = '--:--';
      return;
    }

    const now = Date.now();
    const remainingSeconds = Math.max(0, Math.ceil((sessionEndTime - now) / 1000));
    if (timerDigits) timerDigits.textContent = formatTime(remainingSeconds);

    if (remainingSeconds <= 0) {
      if (localTimerInterval) clearInterval(localTimerInterval);
      localTimerInterval = null;
      sessionEndTime = null;
      updateUIState({ shieldActive: false, endTime: null });
    }
  }

  function startLocalCountdown(endTime) {
    const endMs = typeof endTime === 'number' ? endTime : (Number(endTime) || Date.parse(endTime));
    if (!endMs || isNaN(endMs)) {
      if (localTimerInterval) clearInterval(localTimerInterval);
      localTimerInterval = null;
      sessionEndTime = null;
      if (timerDigits) timerDigits.textContent = '--:--';
      return;
    }

    if (localTimerInterval) clearInterval(localTimerInterval);
    sessionEndTime = endMs;
    tickCountdown();
    localTimerInterval = setInterval(tickCountdown, 1000);
  }

  function updateUIState(state) {
    if (!state) return;
    const now = Date.now();
    const endMs = (typeof state.endTime === 'number' && !isNaN(state.endTime)) ? state.endTime : null;
    const isActive = Boolean(state.shieldActive && endMs && endMs > now);

    // Status Banner
    if (pulseDot) {
      pulseDot.className = isActive ? 'pulse-dot active' : 'pulse-dot inactive';
    }
    if (statusTitle) {
      statusTitle.textContent = isActive ? 'SHIELD ACTIVE' : 'SHIELD STANDBY';
    }

    // Session Info
    if (isActive && state.currentSession) {
      if (sessionName) sessionName.textContent = state.currentSession.name || 'Focus Session';
      if (sessionType) sessionType.textContent = state.currentSession.sessionType || 'Focus';
      startLocalCountdown(endMs);
    } else {
      if (sessionName) sessionName.textContent = 'No Active Session';
      if (sessionType) sessionType.textContent = 'Standby';
      if (timerDigits) timerDigits.textContent = '--:--';
      if (localTimerInterval) {
        clearInterval(localTimerInterval);
        localTimerInterval = null;
      }
      sessionEndTime = null;
    }

    // Metrics
    if (blockedCount && Array.isArray(state.blockedWebsites)) {
      blockedCount.textContent = state.blockedWebsites.length;
    }

    if (attemptsCount && state.stats) {
      attemptsCount.textContent = state.stats.todayAttempts || 0;
    }
  }

  function fetchState() {
    // 1. Immediate storage read for instant UI hydration
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.get(null, (data) => {
        if (!chrome.runtime.lastError && data) {
          updateUIState(data);
        }
      });
    }

    // 2. Query background worker
    try {
      chrome.runtime.sendMessage({ type: 'GET_SHIELD_STATE' }, (response) => {
        if (!chrome.runtime.lastError && response && response.success) {
          updateUIState(response);
        }
      });
    } catch {
      // ignore
    }
  }

  // Initial Fetch
  fetchState();

  // Listen for storage changes
  if (typeof chrome !== 'undefined' && chrome.storage?.onChanged) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local') {
        fetchState();
      }
    });
  }

  // Sync Button
  if (syncBtn) {
    syncBtn.addEventListener('click', () => {
      syncBtn.style.transform = 'rotate(180deg)';
      setTimeout(() => { syncBtn.style.transform = 'none'; }, 300);

      try {
        chrome.runtime.sendMessage({ type: 'FORCE_SYNC' }, () => {
          fetchState();
        });
      } catch {
        fetchState();
      }
    });
  }

  // Open App Button
  if (openAppBtn) {
    openAppBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: 'https://focus-flow-flame-one.vercel.app/shield' });
    });
  }
});

