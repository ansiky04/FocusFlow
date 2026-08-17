/**
 * FocusFlow Focus Shield - Blocked Page Interactivity Script
 * Production-ready countdown timer synchronized with absolute timestamps (startTime, endTime).
 * Never resets on page refresh; automatically unblocks and redirects when session finishes.
 */

const MOTIVATIONAL_QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { text: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki" },
  { text: "Deep work is the superpower of the 21st century.", author: "Cal Newport" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "FocusFlow" },
  { text: "Great things never come from comfort zones.", author: "Anonymous" }
];

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const websiteParam = params.get('website') || '';
  const originalUrl = params.get('url') || '';

  const domainEl = document.getElementById('blocked-domain');
  const faviconEl = document.getElementById('blocked-favicon');
  const countdownEl = document.getElementById('countdown');
  const sessionTitleEl = document.getElementById('session-title-text');
  const sessionTypeBadge = document.getElementById('session-type-badge');
  const quoteTextEl = document.getElementById('quote-text');
  const quoteAuthorEl = document.getElementById('quote-author');
  const completedNotice = document.getElementById('completed-notice');
  const returnSiteBtn = document.getElementById('return-site-btn');
  const returnBtnLabel = document.getElementById('return-btn-label');
  const btnLockIcon = document.getElementById('btn-lock-icon');
  const backAppBtn = document.getElementById('back-app-btn');
  const closeBtn = document.getElementById('close-btn');

  // Display randomized motivational quote
  const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
  if (quoteTextEl && quoteAuthorEl) {
    quoteTextEl.textContent = randomQuote.text;
    quoteAuthorEl.textContent = `— ${randomQuote.author}`;
  }

  // Parse clean hostname
  let domainToShow = websiteParam;
  if (originalUrl) {
    try {
      const parsed = new URL(originalUrl.startsWith('http') ? originalUrl : `https://${originalUrl}`);
      domainToShow = parsed.hostname.replace(/^www\./, '');
    } catch {
      // ignore
    }
  }

  if (domainToShow) {
    domainEl.textContent = domainToShow;
    faviconEl.src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domainToShow)}&sz=32`;
    faviconEl.style.display = 'block';
  }

  let sessionEndTime = null;
  let timerInterval = null;
  let hasAutoRedirected = false;

  function formatTime(seconds) {
    if (typeof seconds !== 'number' || isNaN(seconds) || seconds <= 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function redirectBackToOriginalSite() {
    if (hasAutoRedirected) return;
    hasAutoRedirected = true;

    if (originalUrl) {
      window.location.replace(originalUrl);
    } else if (domainToShow) {
      window.location.replace(`https://${domainToShow}`);
    }
  }

  function handleTimerCompletion(autoRedirect = true) {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    if (countdownEl) {
      countdownEl.textContent = '00:00';
      countdownEl.style.color = '#10b981';
    }

    // Show completion notice
    if (completedNotice) completedNotice.style.display = 'flex';

    // Enable the Return Button
    if (returnSiteBtn) {
      returnSiteBtn.disabled = false;
      returnSiteBtn.className = 'btn-return-unlocked';
      if (btnLockIcon) btnLockIcon.textContent = '➜';
      if (returnBtnLabel) {
        returnBtnLabel.textContent = domainToShow ? `Return to ${domainToShow}` : 'Continue to Website';
      }
    }

    // Inform background worker that session is ended
    try {
      chrome.runtime.sendMessage({ type: 'END_STUDY_SESSION' }, () => {
        if (chrome.runtime.lastError) { /* ignore */ }
      });
    } catch {
      // ignore context invalidation
    }

    // Auto redirect user back to the original website
    if (autoRedirect) {
      setTimeout(redirectBackToOriginalSite, 800);
    }
  }

  function updateCountdownTick() {
    if (!sessionEndTime) {
      handleTimerCompletion(false);
      return;
    }

    const now = Date.now();
    const remainingSeconds = Math.max(0, Math.ceil((sessionEndTime - now) / 1000));

    if (countdownEl) {
      countdownEl.textContent = formatTime(remainingSeconds);
    }

    if (remainingSeconds <= 0) {
      handleTimerCompletion(true);
    }
  }

  function startCountdown(endTime) {
    const endMs = typeof endTime === 'number' ? endTime : (Number(endTime) || Date.parse(endTime));
    if (!endMs || isNaN(endMs)) {
      handleTimerCompletion(false);
      return;
    }

    sessionEndTime = endMs;
    const now = Date.now();
    const remainingSeconds = Math.max(0, Math.ceil((sessionEndTime - now) / 1000));

    if (remainingSeconds <= 0) {
      handleTimerCompletion(true);
      return;
    }

    // Set locked button state while active
    if (returnSiteBtn) {
      returnSiteBtn.disabled = true;
      returnSiteBtn.className = 'btn-return-locked';
      if (btnLockIcon) btnLockIcon.textContent = '🔒';
      if (returnBtnLabel) {
        returnBtnLabel.textContent = 'Return to Website (Locked until session ends)';
      }
    }

    if (completedNotice) {
      completedNotice.style.display = 'none';
    }

    if (countdownEl) {
      countdownEl.textContent = formatTime(remainingSeconds);
      countdownEl.style.color = '';
    }

    if (timerInterval) clearInterval(timerInterval);
    // Run tick every 1000ms
    timerInterval = setInterval(updateCountdownTick, 1000);
  }

  // Fetch live session info from local storage or background worker
  function syncShieldData() {
    // 1. First directly read from chrome.storage.local for instantaneous hydration
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.get(['shieldActive', 'endTime', 'currentSession'], (data) => {
        if (!chrome.runtime.lastError && data) {
          const now = Date.now();
          const endMs = (typeof data.endTime === 'number' && !isNaN(data.endTime)) ? data.endTime : null;

          if (data.shieldActive && endMs && endMs > now) {
            if (data.currentSession) {
              if (sessionTitleEl) sessionTitleEl.textContent = data.currentSession.name || 'Deep Focus Session';
              if (sessionTypeBadge) sessionTypeBadge.textContent = data.currentSession.sessionType || 'Focus';
            }
            startCountdown(endMs);
            return;
          }
        }

        // 2. Query background worker for dynamic state
        try {
          chrome.runtime.sendMessage({ type: 'GET_SHIELD_STATE' }, (response) => {
            if (chrome.runtime.lastError || !response) {
              return;
            }

            if (response.success && response.shieldActive && response.endTime && response.endTime > Date.now()) {
              if (response.currentSession) {
                if (sessionTitleEl) sessionTitleEl.textContent = response.currentSession.name || 'Deep Focus Session';
                if (sessionTypeBadge) sessionTypeBadge.textContent = response.currentSession.sessionType || 'Focus';
              }
              startCountdown(response.endTime);
            } else if (!response.shieldActive) {
              handleTimerCompletion(false);
            }
          });
        } catch {
          // ignore
        }
      });
    }
  }

  // Initial Sync on Page Load
  syncShieldData();

  // Listen for real-time storage changes to keep synced across tabs/windows
  if (typeof chrome !== 'undefined' && chrome.storage?.onChanged) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local') {
        if (changes.shieldActive || changes.endTime || changes.currentSession) {
          syncShieldData();
        }
      }
    });
  }

  // Log blocked attempt telemetry
  if (domainToShow && typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
    try {
      chrome.runtime.sendMessage({
        type: 'LOG_ATTEMPT',
        website: domainToShow,
        originalUrl: originalUrl
      });
    } catch {}
  }

  // Return to Website Button Click
  if (returnSiteBtn) {
    returnSiteBtn.addEventListener('click', () => {
      if (returnSiteBtn.disabled) return;
      redirectBackToOriginalSite();
    });
  }

  // Return to FocusFlow App
  if (backAppBtn) {
    backAppBtn.addEventListener('click', () => {
      window.location.href = 'https://focus-flow-flame-one.vercel.app/shield';
    });
  }

  // Close Tab
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      window.close();
    });
  }
});

