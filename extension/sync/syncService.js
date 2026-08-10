/**
 * FocusFlow Focus Shield - Sync Module
 * Synchronizes active focus sessions, start/end timestamps, and blocked rules between
 * the FocusFlow Web App, Chrome Extension, and MongoDB backend.
 */

import { storage } from '../storage/storageService.js';
import { NotificationService } from '../services/notificationService.js';

export class SyncService {
  constructor(onStateChangeCallback) {
    this.onStateChange = onStateChangeCallback;
    this.isPolling = false;
    this.pollTimer = null;
  }

  /**
   * Sync active session and blocked websites from MongoDB backend API
   */
  async syncWithBackend() {
    const allStorage = await storage.getAll();
    const { token, shieldActive: prevShieldActive, endTime: prevEndTime, startTime: prevStartTime, currentSession: prevSession } = allStorage;
    if (!token) return { success: false, reason: 'No auth token' };

    try {
      const now = Date.now();
      const prevEndMs = (typeof prevEndTime === 'number' && !isNaN(prevEndTime)) ? prevEndTime : null;
      const isLocalSessionActive = Boolean(prevShieldActive && prevEndMs && prevEndMs > now);

      let isSessionActive = isLocalSessionActive;
      let startTimeMs = isLocalSessionActive ? prevStartTime : null;
      let endTimeMs = isLocalSessionActive ? prevEndMs : null;
      let currentSession = isLocalSessionActive ? prevSession : null;

      // 1. Fetch active session from MongoDB
      try {
        const sessionRes = await fetch('http://localhost:5000/api/sessions/active', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();

          if (sessionData.success && sessionData.session) {
            const s = sessionData.session;
            if (s.status === 'active' && s.sessionType === 'Focus') {
              const durationMinutes = Math.round((Number(s.duration) || 1500) / 60) || 25;

              let parsedStart = s.startTime
                ? (typeof s.startTime === 'number' ? s.startTime : (Number(s.startTime) || Date.parse(s.startTime)))
                : now;
              if (isNaN(parsedStart) || !parsedStart) parsedStart = now;

              let parsedEnd = s.endTime
                ? (typeof s.endTime === 'number' ? s.endTime : (Number(s.endTime) || Date.parse(s.endTime)))
                : null;

              if (!parsedEnd || isNaN(parsedEnd)) {
                const remSec = sessionData.remainingTime !== undefined ? sessionData.remainingTime : (s.duration || 1500);
                parsedEnd = now + remSec * 1000;
              }

              if (parsedEnd > now) {
                isSessionActive = true;
                startTimeMs = parsedStart;
                endTimeMs = parsedEnd;
                currentSession = {
                  id: s._id || s.id,
                  name: s.taskName || s.name || 'Focus Session',
                  durationMinutes: durationMinutes,
                  sessionType: s.sessionType || 'Focus',
                  startTime: startTimeMs,
                  endTime: endTimeMs
                };
              } else {
                isSessionActive = false;
              }
            } else {
              isSessionActive = false;
            }
          } else if (sessionData.success && !sessionData.session) {
            if (!isLocalSessionActive) {
              isSessionActive = false;
            }
          }
        }
      } catch {
        // Backend offline / fetch error, retain local active state
      }

      // If session had elapsed or inactive, mark inactive
      if (!isSessionActive || (endTimeMs && endTimeMs <= now)) {
        isSessionActive = false;
        startTimeMs = null;
        endTimeMs = null;
        currentSession = null;
      }

      // 2. Fetch blocked sites configuration from MongoDB
      let blockedWebsites = null;
      try {
        const sitesRes = await fetch('http://localhost:5000/api/block-sites', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (sitesRes.ok) {
          const sitesData = await sitesRes.json();
          if (sitesData.success && Array.isArray(sitesData.sites) && sitesData.sites.length > 0) {
            const enabledList = sitesData.sites
              .filter(site => site && site.enabled)
              .map(site => site.website);
            if (enabledList.length > 0) {
              blockedWebsites = enabledList;
            }
          }
        }
      } catch {
        // Backend offline / fetch error
      }

      const defaultBlocked = ['youtube.com', 'instagram.com', 'facebook.com', 'x.com', 'reddit.com', 'discord.com'];
      const finalBlockedWebsites = (Array.isArray(blockedWebsites) && blockedWebsites.length > 0)
        ? blockedWebsites
        : ((Array.isArray(allStorage.blockedWebsites) && allStorage.blockedWebsites.length > 0) ? allStorage.blockedWebsites : defaultBlocked);

      // Update storage state with absolute timestamps
      const newState = {
        shieldActive: isSessionActive,
        startTime: isSessionActive ? startTimeMs : null,
        endTime: isSessionActive ? endTimeMs : null,
        currentSession: isSessionActive ? currentSession : null,
        blockedWebsites: finalBlockedWebsites,
        lastSyncTime: Date.now()
      };

      await storage.set(newState);

      // Detect transition from inactive to active
      if (!prevShieldActive && isSessionActive) {
        NotificationService.notifySessionStarted(
          currentSession?.name,
          currentSession?.durationMinutes
        );
      }
      // Detect transition from active to finished
      else if (prevShieldActive && !isSessionActive) {
        NotificationService.notifySessionCompleted(prevSession?.name);
      }

      // Trigger callback to recompute dynamic rules
      if (this.onStateChange) {
        this.onStateChange(newState);
      }

      return { success: true, state: newState };
    } catch (err) {
      console.warn('[FocusShield Sync] Backend synchronization failed:', err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Start periodic background sync polling
   */
  startPolling(intervalMs = 3000) {
    if (this.isPolling) return;
    this.isPolling = true;

    const poll = async () => {
      await this.syncWithBackend();
      if (this.isPolling) {
        this.pollTimer = setTimeout(poll, intervalMs);
      }
    };

    poll();
  }

  /**
   * Stop background sync polling
   */
  stopPolling() {
    this.isPolling = false;
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
  }
}

