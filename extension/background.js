/**
 * FocusFlow Focus Shield Service Worker (Background Script)
 * Uses chrome.declarativeNetRequest to block and redirect domains to blocked.html.
 */

let token = null;
let shieldActive = false;
let blockedWebsites = [];
let remainingTime = 0;
let lastSyncTime = 0;
let previousShieldState = false;
let activePorts = new Set();

// Load persisted cache parameters on startup
chrome.storage.local.get(['token', 'shieldActive', 'blockedWebsites', 'remainingTime', 'lastSyncTime', 'previousShieldState'], (result) => {
  if (result.token) token = result.token;
  if (result.shieldActive !== undefined) shieldActive = result.shieldActive;
  if (result.blockedWebsites) blockedWebsites = result.blockedWebsites;
  if (result.remainingTime) remainingTime = result.remainingTime;
  if (result.lastSyncTime) lastSyncTime = result.lastSyncTime;
  if (result.previousShieldState !== undefined) previousShieldState = result.previousShieldState;

  console.log("[FocusShield] Service worker initial cache load details:", {
    hasToken: !!token,
    shieldActive,
    blockedCount: blockedWebsites.length,
    remainingTime
  });

  // Reapply rules on startup
  updateDeclarativeRules();
});

// Listener for auth token synchronization from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SYNC_TOKEN') {
    const isNewToken = token !== message.token;
    token = message.token;
    chrome.storage.local.set({ token }, () => {
      if (chrome.runtime.lastError) {
        console.warn("[FocusShield] Failed to save token to storage:", chrome.runtime.lastError.message);
      }
    });

    if (isNewToken && token) {
      console.log("[FocusShield] Authentication JWT synced. Refreshing settings from server...");
      fetchShieldSettings();
    } else if (!token) {
      console.log("[FocusShield] Token cleared. Disabling shield...");
      shieldActive = false;
      blockedWebsites = [];
      remainingTime = 0;
      chrome.storage.local.set({ shieldActive: false, blockedWebsites: [], remainingTime: 0 }, () => {
        if (chrome.runtime.lastError) { }
      });
      updateDeclarativeRules();
    }

    // Explicitly send response and return true/false to prevent runtime messaging channel warnings
    if (sendResponse) {
      sendResponse({ success: true });
    }
    return false;
  }
});

// Trigger a Chrome system notification
function showNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: title,
    message: message,
    priority: 2
  });
}

// Update chrome.declarativeNetRequest dynamic rules for blocking/redirection
async function updateDeclarativeRules() {
  try {
    const extensionId = chrome.runtime.id;

    // 1. Fetch all current dynamic rules
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const removeRuleIds = existingRules.map(r => r.id);

    console.log("[FocusShield] Removing rule IDs:", removeRuleIds);
    console.log("[FocusShield] Dynamic Rules Count (Before Update):", existingRules.length);

    const addRules = [];

    // 2. Map new dynamic rules only if Focus Mode is active
    if (shieldActive && blockedWebsites.length > 0) {
      console.log("[FocusShield] Focus Mode is active. Constructing blocker rules for:", blockedWebsites);

      blockedWebsites.forEach((site, index) => {
        const ruleId = index + 1;

        // Escape dots in domain name for regex
        const escapedSite = site.replace(/\./g, '\\.');

        // Regex to capture full target URL (group 1)
        const regexFilter = `^(https?://(?:[^/]*\\.)?${escapedSite}(?:/.*)?)$`;
        // Pass captured original url as url=\1
        const redirectUrl = `chrome-extension://${extensionId}/blocked.html?website=${encodeURIComponent(site)}&url=\\1`;

        addRules.push({
          id: ruleId,
          priority: 1,
          action: {
            type: "redirect",
            redirect: {
              regexSubstitution: redirectUrl
            }
          },
          condition: {
            regexFilter: regexFilter,
            resourceTypes: ["main_frame"]
          }
        });
      });
      // Save blocked website/domain directly into chrome.storage.local
      chrome.storage.local.set({
        blockedWebsites: blockedWebsites
      }, () => {
        if (chrome.runtime.lastError) { }
      });
    } else {
      console.log("[FocusShield] Focus Mode is inactive. Blocker rules will be cleared.");
      chrome.storage.local.set({
        blockedWebsites: []
      }, () => {
        if (chrome.runtime.lastError) { }
      });
    }

    // 3. Apply changes to declarativeNetRequest dynamic rules
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds,
      addRules
    });

    const activeRules = await chrome.declarativeNetRequest.getDynamicRules();
    console.log("[FocusShield] DeclarativeNetRequest dynamic rules successfully updated.");
    console.log("[FocusShield] Dynamic Rules Count (After Update):", activeRules.length);
    if (activeRules.length > 0) {
      console.log("[FocusShield] Active rules details:", JSON.stringify(activeRules, null, 2));
    }
  } catch (err) {
    console.error("[FocusShield] Failed to update DeclarativeNetRequest dynamic rules:", err);
  }
}

// Synchronize blocker list and timer status from FocusFlow Express server (runs every 2s)
async function fetchShieldSettings() {
  const result = await chrome.storage.local.get(['token']);
  const activeToken = result.token || token;
  if (!activeToken) {
    token = null;
    return;
  }
  token = activeToken;

  try {
    // 1. Fetch the Active Session directly from focus sessions endpoint
    const sessionRes = await fetch('http://localhost:5000/api/sessions/active', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    // 2. Fetch Blocked Website Lists
    const sitesRes = await fetch('http://localhost:5000/api/block-sites', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (sessionRes.ok && sitesRes.ok) {
      const sessionData = await sessionRes.json();
      const sitesData = await sitesRes.json();

      if (sessionData.success && sitesData.success) {
        // Focus Mode is active if an active Focus session is running on the backend
        const activeSession = sessionData.session;
        const nextShieldActive = !!(
          activeSession &&
          activeSession.status === 'active' &&
          activeSession.sessionType === 'Focus'
        );
        const nextRemainingTime = activeSession ? activeSession.remainingTime || 0 : 0;
        const nextBlockedWebsites = (sitesData.sites || [])
          .filter(s => s.enabled)
          .map(s => s.website.trim().toLowerCase());

        // Print exact console telemetry logs
        console.log("[FocusShield] Backend response:", sessionData);
        console.log("[FocusShield] Focus Active:", nextShieldActive);
        console.log("[FocusShield] Remaining Time:", nextRemainingTime);
        console.log("[FocusShield] Blocked Websites:", nextBlockedWebsites);

        // Check if rules or active state changed to avoid redundant rule writes
        const listChanged = JSON.stringify(blockedWebsites) !== JSON.stringify(nextBlockedWebsites);
        const stateChanged = shieldActive !== nextShieldActive;

        shieldActive = nextShieldActive;
        blockedWebsites = nextBlockedWebsites;
        remainingTime = nextRemainingTime;
        lastSyncTime = Date.now();

        // Show notifications on Focus timer transition
        if (shieldActive && !previousShieldState) {
          showNotification('Focus Session Started', 'Website blocker is active. Time to focus!');
        } else if (!shieldActive && previousShieldState) {
          showNotification('Great Job!', 'Your blocked websites are available again.');
        }

        previousShieldState = shieldActive;

        // Persist in local storage
        chrome.storage.local.set({
          shieldActive,
          blockedWebsites,
          remainingTime,
          lastSyncTime,
          previousShieldState
        });

        // Update dynamic rules on change
        if (listChanged || stateChanged) {
          console.log("[FocusShield] State or blacklist changed. Triggering declarativeNetRequest rule update...");
          await updateDeclarativeRules();
        }

        // Broadcast to all active blocked page ports
        activePorts.forEach(port => {
          try {
            port.postMessage({ type: 'TIMER_UPDATE', timeLeft: remainingTime, shieldActive });
          } catch (e) {
            activePorts.delete(port);
          }
        });
      }
    } else if (sessionRes.status === 401 || sitesRes.status === 401) {
      console.warn("[FocusShield] Sync unauthorized. Clearing tokens...");
      token = null;
      shieldActive = false;
      chrome.storage.local.remove(['token', 'shieldActive', 'blockedWebsites', 'remainingTime']);
      await updateDeclarativeRules();

      activePorts.forEach(port => {
        try {
          port.postMessage({ type: 'TIMER_UPDATE', timeLeft: 0, shieldActive: false });
        } catch (e) {
          activePorts.delete(port);
        }
      });
    }
  } catch (err) {
    console.error('[FocusShield] Sync settings failed:', err);
  }
}

// 2-second interval timer for real-time synchronization
setInterval(() => {
  if (token) {
    fetchShieldSettings();
  }
}, 2000);

// Use MV3 alarm to wake up background service worker
chrome.alarms.create('sync_alarm', { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'sync_alarm' && token) {
    fetchShieldSettings();
  }
});

// Keep-alive port listener from blocked.html
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'blocked-page') {
    activePorts.add(port);
    // Immediately trigger settings sync when blocked page connects
    fetchShieldSettings();

    port.onMessage.addListener((msg) => {

      if (msg.type === "REQUEST_TIMER") {
        port.postMessage({
          type: "TIMER_UPDATE",
          timeLeft: remainingTime,
          remainingTime: remainingTime,
          shieldActive: shieldActive
        });
        return;
      }

      if (msg.type === "PING") {
        // Keeps worker alive
      }

    });

    port.onDisconnect.addListener(() => {
      activePorts.delete(port);
    });
  }
});

// Auto-inject content script into active tabs on reload/install
chrome.runtime.onInstalled.addListener(() => {
  injectContentScripts();
});

chrome.runtime.onStartup.addListener(() => {
  injectContentScripts();
});

function injectContentScripts() {
  try {
    const manifest = chrome.runtime.getManifest();
    const contentScripts = manifest.content_scripts;
    if (!contentScripts) return;

    for (const script of contentScripts) {
      if (!script.matches) continue;

      for (const matchPattern of script.matches) {
        chrome.tabs.query({ url: matchPattern }, (tabs) => {
          if (chrome.runtime.lastError) {
            console.log("[FocusShield] Query tabs warning:", chrome.runtime.lastError.message);
            return;
          }
          if (!tabs) return;

          tabs.forEach(tab => {
            if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) return;

            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: script.js
            }, () => {
              if (chrome.runtime.lastError) {
                // Safely catch tab closing or scripting access errors without creating extension errors page logs
              }
            });
          });
        });
      }
    }
  } catch (err) {
    console.warn("[FocusShield] Programmatic script injection exception:", err);
  }
}


