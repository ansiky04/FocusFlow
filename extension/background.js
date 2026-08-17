/**
 * FocusFlow Focus Shield - Background Service Worker (Manifest V3 Module)
 * Production-ready Service Worker supporting Google Chrome & Microsoft Edge.
 * Synchronizes absolute session timestamps (startTime, endTime) across windows & tabs.
 */

import { storage } from './storage/storageService.js';
import { RuleEngine } from './services/ruleEngine.js';
import { TelemetryService } from './services/telemetryService.js';
import { NotificationService } from './services/notificationService.js';
import { SyncService } from './sync/syncService.js';

let syncServiceInstance = null;
let updateRulesTimeout = null;

/**
 * Scan all open tabs across ALL browser windows and immediately redirect any blocked sites.
 */
async function scanAndRedirectActiveTabs() {
  try {
    const { shieldActive, endTime, blockedWebsites, allowedWebsites } = await storage.getAll();
    const now = Date.now();
    const endMs = (typeof endTime === 'number' && !isNaN(endTime)) ? endTime : null;
    const isExpired = endMs ? now >= endMs : false;

    if (!shieldActive || isExpired || !Array.isArray(blockedWebsites) || blockedWebsites.length === 0) {
      return;
    }

    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (!tab.url || !tab.id) continue;

      // Skip internal browser and extension pages
      if (
        tab.url.startsWith('chrome://') ||
        tab.url.startsWith('edge://') ||
        tab.url.startsWith('about:') ||
        tab.url.startsWith('chrome-extension://') ||
        tab.url.startsWith('extension://')
      ) {
        continue;
      }

      // Check if URL is whitelisted
      if (RuleEngine.isWhitelisted(tab.url, allowedWebsites)) {
        continue;
      }

      // Check if URL matches any blocked pattern
      const matchingPattern = blockedWebsites.find(pattern => RuleEngine.isUrlMatching(tab.url, pattern));
      if (matchingPattern) {
        const blockedPageUrl = chrome.runtime.getURL(
          `blocked.html?website=${encodeURIComponent(matchingPattern)}&url=${encodeURIComponent(tab.url)}`
        );
        chrome.tabs.update(tab.id, { url: blockedPageUrl }, () => {
          if (chrome.runtime.lastError) { /* ignore tab closure race */ }
        });
        TelemetryService.logAttempt(matchingPattern, tab.url);
      }
    }
  } catch (err) {
    console.warn('[FocusShield Background] Error scanning active tabs:', err);
  }
}

let isUpdatingRules = false;
let pendingRuleUpdate = false;

/**
 * Apply dynamic blocking rules via chrome.declarativeNetRequest
 */
async function updateDeclarativeRules() {
  if (isUpdatingRules) {
    pendingRuleUpdate = true;
    return;
  }
  isUpdatingRules = true;

  try {
    const { shieldActive, endTime, blockedWebsites, allowedWebsites, currentSession } = await storage.getAll();
    const now = Date.now();
    const endMs = (typeof endTime === 'number' && !isNaN(endTime)) ? endTime : null;
    const isExpired = endMs ? now >= endMs : false;
    const effectiveShieldActive = Boolean(shieldActive && !isExpired);

    if (shieldActive && endMs && isExpired) {
      console.log('[FocusShield Background] Session expired. Automatically clearing shield and rules.');
      // Auto-expire session
      await storage.clearActiveSession();
      if (currentSession?.name) {
        NotificationService.notifySessionCompleted(currentSession.name);
      }
      try {
        await chrome.alarms.clear('session_expiration');
      } catch {}
    }

    // 1. Query ALL existing dynamic rules directly from browser right before update
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const removeRuleIds = existingRules.map(r => r.id);

    // 2. Generate new rules if effective shield is active
    let addRules = [];
    const defaultSites = ['youtube.com', 'instagram.com', 'facebook.com', 'x.com', 'reddit.com', 'discord.com'];
    const activeBlockedWebsites = (Array.isArray(blockedWebsites) && blockedWebsites.length > 0) ? blockedWebsites : defaultSites;

    if (effectiveShieldActive && activeBlockedWebsites.length > 0) {
      addRules = RuleEngine.generateDynamicRules(activeBlockedWebsites, allowedWebsites || []);
      console.log(`[FocusShield Background] Applied ${addRules.length} dynamic DNR rules for ${activeBlockedWebsites.join(', ')}.`);
      
      // Schedule exact expiration alarm & 1-minute ending soon alarm
      if (endMs && endMs > now) {
        chrome.alarms.create('session_expiration', { when: endMs });
        const endingSoonTime = endMs - 60000;
        if (endingSoonTime > now) {
          chrome.alarms.create('session_ending_soon', { when: endingSoonTime });
        }
      }
    } else {
      console.log('[FocusShield Background] Shield inactive or expired. All blocker rules cleared.');
      try {
        chrome.alarms.clear('session_expiration');
        chrome.alarms.clear('session_ending_soon');
      } catch {}
    }

    // 3. Update Chromium dynamic rules
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds,
      addRules
    });

    // 4. Verify rule registration
    const verifiedRules = await chrome.declarativeNetRequest.getDynamicRules();
    console.log(`[FocusShield Background] Dynamic rules updated. Verified active DNR rule count: ${verifiedRules.length}`);

    // 5. If shield is active, immediately redirect any already-open matching tabs across all windows
    if (effectiveShieldActive) {
      scanAndRedirectActiveTabs();
    }
  } catch (err) {
    console.error('[FocusShield Background] Error updating dynamic rules:', err);
  } finally {
    isUpdatingRules = false;
    if (pendingRuleUpdate) {
      pendingRuleUpdate = false;
      updateDeclarativeRules();
    }
  }
}

/**
 * Debounced update for rules to optimize performance
 */
function debouncedUpdateRules(delayMs = 150) {
  if (updateRulesTimeout) clearTimeout(updateRulesTimeout);
  updateRulesTimeout = setTimeout(() => {
    updateDeclarativeRules();
  }, delayMs);
}

/**
 * Initialize extension background systems
 */
async function initializeExtension() {
  console.log('[FocusShield Background] Initializing Focus Shield Service Worker...');
  await storage.init();

  // Create Sync Service instance
  if (!syncServiceInstance) {
    syncServiceInstance = new SyncService(async () => {
      debouncedUpdateRules();
    });
  }

  // Re-apply rules from persistent storage
  await updateDeclarativeRules();

  // Start polling backend sync
  syncServiceInstance.startPolling(3000);

  // Set up periodic alarm fallback (heartbeat check)
  chrome.alarms.create('focusflow_heartbeat', { periodInMinutes: 1 });
}

// Lifecycle events
chrome.runtime.onInstalled.addListener(async () => {
  console.log('[FocusShield Background] Extension installed/updated.');
  await initializeExtension();
});

chrome.runtime.onStartup.addListener(async () => {
  console.log('[FocusShield Background] Browser started. Activating Focus Shield...');
  await initializeExtension();
});

// Alarm Listener for exact session expiration & periodic background heartbeat
chrome.alarms.onAlarm.addListener(async (alarm) => {
  const { shieldActive, endTime, currentSession } = await storage.getAll();
  const endMs = (typeof endTime === 'number' && !isNaN(endTime)) ? endTime : null;

  if (alarm.name === 'session_ending_soon') {
    if (shieldActive && endMs && Date.now() < endMs) {
      await NotificationService.notifySessionEndingSoon(
        currentSession?.name || 'Focus Session',
        1,
        currentSession?.id
      );
    }
  }

  if (alarm.name === 'session_expiration') {
    if (shieldActive && (!endMs || Date.now() >= endMs)) {
      await storage.clearActiveSession();
      await updateDeclarativeRules();
      await NotificationService.notifySessionCompleted(
        currentSession?.name || 'Focus Session',
        currentSession?.id
      );
    }
  }

  if (alarm.name === 'focusflow_heartbeat' && syncServiceInstance) {
    await syncServiceInstance.syncWithBackend();
  }
});

/**
 * Unified Differential App State Handler
 * Processes incoming app state changes safely without triggering redundant notifications
 */
async function handleAppStateSync(payload, sendResponse) {
  try {
    const currentData = await storage.getAll();
    const now = Date.now();

    // 1. Token processing
    const newToken = payload.token !== undefined ? payload.token : currentData.token;
    const tokenChanged = currentData.token !== newToken;

    // 2. Active study session processing
    let isSessionActive = false;
    let startTimeMs = null;
    let endTimeMs = null;
    let updatedSession = null;

    const session = payload.session !== undefined ? payload.session : currentData.currentSession;
    if (session && session.status === 'active') {
      const durMin = Number(session.durationMinutes) || 25;
      startTimeMs = session.startTime
        ? (typeof session.startTime === 'number' ? session.startTime : (Number(session.startTime) || Date.parse(session.startTime)))
        : now;
      if (isNaN(startTimeMs) || !startTimeMs) startTimeMs = now;

      endTimeMs = session.endTime
        ? (typeof session.endTime === 'number' ? session.endTime : (Number(session.endTime) || Date.parse(session.endTime)))
        : null;
      if (!endTimeMs || isNaN(endTimeMs)) {
        endTimeMs = startTimeMs + durMin * 60 * 1000;
      }

      if (endTimeMs > now) {
        isSessionActive = true;
        updatedSession = {
          ...session,
          startTime: startTimeMs,
          endTime: endTimeMs,
          durationMinutes: durMin
        };
      }
    }

    const wasShieldActive = Boolean(
      currentData.shieldActive &&
      currentData.endTime &&
      currentData.endTime > now
    );

    const sessionStarted = !wasShieldActive && isSessionActive;
    const sessionEnded = wasShieldActive && !isSessionActive;
    const sessionChanged = isSessionActive && (
      !currentData.currentSession ||
      currentData.currentSession.id !== updatedSession?.id ||
      Math.abs((currentData.endTime || 0) - (endTimeMs || 0)) > 2000
    );

    // 3. Blocked websites processing
    const defaultSites = ['youtube.com', 'instagram.com', 'facebook.com', 'x.com', 'reddit.com', 'discord.com'];
    const incomingBlocked = payload.blockedWebsites;
    const finalBlocked = (Array.isArray(incomingBlocked) && incomingBlocked.length > 0)
      ? incomingBlocked
      : ((Array.isArray(currentData.blockedWebsites) && currentData.blockedWebsites.length > 0) ? currentData.blockedWebsites : defaultSites);

    const incomingAllowed = payload.allowedWebsites !== undefined ? payload.allowedWebsites : (currentData.allowedWebsites || []);
    
    const blockListChanged = JSON.stringify(finalBlocked) !== JSON.stringify(currentData.blockedWebsites || []);
    const allowListChanged = JSON.stringify(incomingAllowed) !== JSON.stringify(currentData.allowedWebsites || []);

    // 4. Differential storage write
    const hasStateChanged = tokenChanged || sessionStarted || sessionEnded || sessionChanged || blockListChanged || allowListChanged;

    if (hasStateChanged) {
      await storage.set({
        token: newToken,
        shieldActive: isSessionActive,
        startTime: isSessionActive ? startTimeMs : null,
        endTime: isSessionActive ? endTimeMs : null,
        currentSession: isSessionActive ? updatedSession : null,
        blockedWebsites: finalBlocked,
        allowedWebsites: incomingAllowed
      });

      await updateDeclarativeRules();

      // Fire notifications ONLY on meaningful event transitions
      if (sessionStarted) {
        await NotificationService.notifySessionStarted(
          updatedSession?.name || 'Focus Session',
          updatedSession?.durationMinutes || 25,
          updatedSession?.id
        );
      } else if (sessionEnded) {
        await NotificationService.notifySessionCompleted(
          currentData.currentSession?.name || 'Focus Session',
          currentData.currentSession?.id
        );
      }
    }

    if (sendResponse) sendResponse({ success: true, stateChanged: hasStateChanged });
  } catch (err) {
    console.error('[FocusShield Background] Error in handleAppStateSync:', err);
    if (sendResponse) sendResponse({ success: false, error: err.message });
  }
}

// Message Listener for inter-module & web app communication
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 0. Direct START / STOP session requests
  if (message.type === 'START_SESSION') {
    console.log('[FocusShield Background] START_SESSION message received');
    handleAppStateSync({
      session: message.session,
      blockedWebsites: message.blockedWebsites,
      allowedWebsites: message.allowedWebsites
    }, sendResponse);
    return true;
  }

  if (message.type === 'STOP_SESSION') {
    console.log('[FocusShield Background] STOP_SESSION message received');
    handleAppStateSync({ session: null }, sendResponse);
    return true;
  }

  // Consolidated App State Sync from Content Script
  if (message.type === 'SYNC_APP_STATE') {
    handleAppStateSync(message, sendResponse);
    return true;
  }

  // 1. Token Sync from Content Script
  if (message.type === 'SYNC_TOKEN') {
    handleAppStateSync({ token: message.token }, sendResponse);
    return true;
  }

  // 2. Block List Instant Update from Web App
  if (message.type === 'SYNC_BLOCK_LIST') {
    handleAppStateSync({
      blockedWebsites: message.blockedWebsites,
      allowedWebsites: message.allowedWebsites
    }, sendResponse);
    return true;
  }

  // 3. Study Session State Sync from Web App
  if (message.type === 'SYNC_STUDY_SESSION') {
    handleAppStateSync({ session: message.session }, sendResponse);
    return true;
  }

  // 4. End Study Session & Unblock Websites (when countdown finishes or manual unlock)
  if (message.type === 'END_STUDY_SESSION') {
    handleAppStateSync({ session: null }, sendResponse);
    return true;
  }

  // 5. Retrieve Shield State (for Popup or Blocked Page)
  if (message.type === 'GET_SHIELD_STATE') {
    storage.getAll().then((data) => {
      const now = Date.now();
      const endMs = (typeof data.endTime === 'number' && !isNaN(data.endTime)) ? data.endTime : null;
      const isExpired = !endMs || now >= endMs;
      const effectiveShieldActive = Boolean(data.shieldActive && endMs && !isExpired);
      const remainingTime = effectiveShieldActive
        ? Math.max(0, Math.ceil((endMs - now) / 1000))
        : 0;

      if (data.shieldActive && isExpired) {
        // Asynchronously update rules to unblock and clean storage
        updateDeclarativeRules();
      }

      if (sendResponse) {
        sendResponse({
          success: true,
          shieldActive: effectiveShieldActive,
          startTime: data.startTime,
          endTime: effectiveShieldActive ? endMs : null,
          remainingTime: remainingTime,
          currentSession: effectiveShieldActive ? data.currentSession : null,
          blockedWebsites: data.blockedWebsites || [],
          allowedWebsites: data.allowedWebsites || [],
          stats: data.stats
        });
      }
    });
    return true;
  }

  // 6. Log Blocked Attempt
  if (message.type === 'LOG_ATTEMPT') {
    TelemetryService.logAttempt(message.website, message.originalUrl).then(() => {
      if (sendResponse) sendResponse({ success: true });
    });
    return true;
  }

  // 7. Force Manual Sync Request
  if (message.type === 'FORCE_SYNC') {
    if (syncServiceInstance) {
      syncServiceInstance.syncWithBackend().then((res) => {
        debouncedUpdateRules();
        if (sendResponse) sendResponse(res);
      });
    } else {
      if (sendResponse) sendResponse({ success: false });
    }
    return true;
  }

  return false;
});

// Lightweight fallback navigation listener (captures top-level window frame navigations across Edge & Chrome)
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return; // Only top-level main window frame

  const { shieldActive, endTime, blockedWebsites, allowedWebsites } = await storage.getAll();
  const now = Date.now();
  const endMs = (typeof endTime === 'number' && !isNaN(endTime)) ? endTime : null;
  const isExpired = endMs ? now >= endMs : false;
  if (!shieldActive || isExpired || !Array.isArray(blockedWebsites) || blockedWebsites.length === 0) return;

  const url = details.url;
  if (
    !url ||
    url.startsWith('chrome://') ||
    url.startsWith('edge://') ||
    url.startsWith('about:') ||
    url.startsWith('chrome-extension://') ||
    url.startsWith('extension://')
  ) {
    return;
  }

  // Whitelist check
  if (RuleEngine.isWhitelisted(url, allowedWebsites)) return;

  // Matching blocked pattern check
  const matchingPattern = blockedWebsites.find(pattern => RuleEngine.isUrlMatching(url, pattern));
  if (matchingPattern) {
    const redirectUrl = chrome.runtime.getURL(
      `blocked.html?website=${encodeURIComponent(matchingPattern)}&url=${encodeURIComponent(url)}`
    );
    try {
      chrome.tabs.update(details.tabId, { url: redirectUrl }, () => {
        if (chrome.runtime.lastError) { /* ignore */ }
      });
      TelemetryService.logAttempt(matchingPattern, url);
    } catch {
      // ignore
    }
  }
});

// Initialize background worker
initializeExtension();

