/**
 * FocusFlow Focus Shield Content Script.
 * Extracts the user's JWT token from localStorage and forwards it to the background worker.
 */

let pollInterval = null;

function isContextValid() {
  return typeof chrome !== 'undefined' && chrome.runtime && !!chrome.runtime.id;
}

function syncToken() {
  if (!isContextValid()) {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
    return;
  }
  
  try {
    const token = localStorage.getItem('focusflow_token');
    
    // Before every runtime call, verify context identity
    if (!chrome.runtime?.id) {
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
      return;
    }
    
    // Wrap every sendMessage call in try/catch
    chrome.runtime.sendMessage({ type: 'SYNC_TOKEN', token: token || null }, () => {
      // Handle chrome.runtime.lastError properly
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
    // If context is invalidated, clear pollInterval silently without printing stack traces
    if (!chrome.runtime?.id || err.message?.includes('invalidated')) {
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
    } else {
      console.warn('[FocusShield] Token sync warning:', err);
    }
  }
}

// Extract immediately on injection
syncToken();

// Monitor login/logout actions by listening to local storage updates
window.addEventListener('storage', (e) => {
  if (!isContextValid()) return;
  if (e.key === 'focusflow_token') {
    try {
      if (!chrome.runtime?.id) return;
      chrome.runtime.sendMessage({ type: 'SYNC_TOKEN', token: e.newValue || null }, () => {
        if (chrome.runtime.lastError) {
          const msg = chrome.runtime.lastError.message || '';
          if (msg.includes('invalidated') && pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
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
});

// Monitor instant token changes via message events from the page context
window.addEventListener('message', (e) => {
  if (!isContextValid()) return;
  if (e.data && e.data.type === 'FOCUSFLOW_TOKEN_CHANGED') {
    try {
      if (!chrome.runtime?.id) return;
      chrome.runtime.sendMessage({ type: 'SYNC_TOKEN', token: e.data.token || null }, () => {
        if (chrome.runtime.lastError) {
          const msg = chrome.runtime.lastError.message || '';
          if (msg.includes('invalidated') && pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
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
});

// Periodic fallback polling to handle single-page navigation changes
pollInterval = setInterval(syncToken, 3000);
