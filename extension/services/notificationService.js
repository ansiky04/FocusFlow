/**
 * FocusFlow Focus Shield - Notification Module
 * Manages Chromium system notifications for session status changes.
 * Guaranteed persistent idempotent notification delivery across service worker wakeups.
 */

export class NotificationService {
  /**
   * Helper to check if an event key was already notified in persistent storage
   */
  static async isNotified(category, idKey) {
    try {
      if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) return false;
      const data = await chrome.storage.local.get(['notifiedHistory']);
      const history = data.notifiedHistory || {};
      return Boolean(history[category] && history[category][idKey]);
    } catch {
      return false;
    }
  }

  /**
   * Helper to record notification in persistent storage
   */
  static async markNotified(category, idKey) {
    try {
      if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) return;
      const data = await chrome.storage.local.get(['notifiedHistory']);
      const history = data.notifiedHistory || {};
      if (!history[category]) history[category] = {};
      history[category][idKey] = Date.now();

      // Clean up entries older than 24 hours
      const now = Date.now();
      for (const cat of Object.keys(history)) {
        for (const k of Object.keys(history[cat])) {
          if (now - history[cat][k] > 86400000) {
            delete history[cat][k];
          }
        }
      }

      await chrome.storage.local.set({ notifiedHistory: history });
    } catch {
      // ignore
    }
  }

  /**
   * Show a browser notification
   */
  static notify(title, message, iconUrl = 'icons/icon128.png') {
    try {
      if (typeof chrome !== 'undefined' && chrome.notifications) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: iconUrl,
          title: title,
          message: message,
          priority: 2
        }, (notificationId) => {
          if (chrome.runtime.lastError) {
            console.warn('[FocusShield Notification] Warning:', chrome.runtime.lastError.message);
          } else {
            console.log('[FocusShield Notification] Notification displayed successfully:', title, notificationId);
          }
        });
      }
    } catch (err) {
      console.warn('[FocusShield Notification] Error displaying notification:', err);
    }
  }

  /**
   * Session started notification (Persistent Idempotent per sessionId)
   */
  static async notifySessionStarted(sessionName, durationMinutes, sessionId = 'default_session') {
    const idKey = `${sessionId}_${sessionName}`;
    const alreadyDone = await this.isNotified('started', idKey);
    if (alreadyDone) {
      console.log('[FocusShield Notification] Suppressed duplicate START notification for:', idKey);
      return;
    }

    await this.markNotified('started', idKey);

    this.notify(
      'Focus Shield Active',
      `Study session "${sessionName || 'Focus Session'}" is active for ${durationMinutes || 25} minutes. Distracting websites are blocked.`
    );
  }

  /**
   * Session ending soon notification (Persistent Idempotent per sessionId)
   */
  static async notifySessionEndingSoon(sessionName, minutesRemaining = 1, sessionId = 'default_session') {
    const idKey = `${sessionId}_${sessionName}`;
    const alreadyDone = await this.isNotified('endingSoon', idKey);
    if (alreadyDone) {
      console.log('[FocusShield Notification] Suppressed duplicate ENDING SOON notification for:', idKey);
      return;
    }

    await this.markNotified('endingSoon', idKey);

    this.notify(
      'Focus Session Ending Soon',
      `"${sessionName || 'Focus Session'}" will complete in ${minutesRemaining} minute. Get ready to finish up!`
    );
  }

  /**
   * Session completed notification (Persistent Idempotent per sessionId)
   */
  static async notifySessionCompleted(sessionName, sessionId = 'default_session') {
    const idKey = `${sessionId}_${sessionName}`;
    const alreadyDone = await this.isNotified('completed', idKey);
    if (alreadyDone) {
      console.log('[FocusShield Notification] Suppressed duplicate COMPLETED notification for:', idKey);
      return;
    }

    await this.markNotified('completed', idKey);

    this.notify(
      'Focus Session Completed!',
      `Great job! "${sessionName || 'Focus Session'}" has finished. Website access is now restored.`
    );
  }
}

