/**
 * FocusFlow Focus Shield - Telemetry Module
 * Logs blocked distraction attempts to the MongoDB backend API and local storage.
 */

import { storage } from '../storage/storageService.js';

export class TelemetryService {
  /**
   * Log an intercepted blocked website attempt
   */
  static async logAttempt(domain, originalUrl = '') {
    if (!domain) return;

    try {
      const allData = await storage.getAll();
      const token = allData.token;

      // Update local storage stats
      const stats = allData.stats || { todayAttempts: 0, timeSavedMinutes: 0, siteAttempts: {} };
      stats.todayAttempts = (stats.todayAttempts || 0) + 1;
      stats.timeSavedMinutes = (stats.timeSavedMinutes || 0) + 5; // ~5 mins saved per interception
      stats.siteAttempts = stats.siteAttempts || {};
      stats.siteAttempts[domain] = (stats.siteAttempts[domain] || 0) + 1;

      await storage.set({ stats });

      // Send telemetry to backend MongoDB if authenticated
      if (token) {
        const prodUrl = 'https://focusflow-api-aazl.onrender.com/api/focus-attempt';
        const localUrl = 'http://localhost:5000/api/focus-attempt';
        const sendReq = (url) => fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            website: domain,
            url: originalUrl,
            timestamp: new Date().toISOString()
          })
        });

        sendReq(prodUrl).catch(() => sendReq(localUrl)).catch((err) => {
          console.warn('[FocusShield Telemetry] Failed to send telemetry to MongoDB:', err.message);
        });
      }
    } catch (err) {
      console.warn('[FocusShield Telemetry] Error logging attempt:', err);
    }
  }
}
