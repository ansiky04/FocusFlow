/**
 * FocusFlow Focus Shield - Storage Module
 * Provides typed, asynchronous access to chrome.storage.local with fallback cache.
 * Persists absolute timestamps (startTime, endTime) for drift-free countdown sync.
 */

const DEFAULT_STORAGE_STATE = {
  token: null,
  shieldActive: false,
  startTime: null,      // Timestamp in milliseconds (epoch ms number)
  endTime: null,        // Timestamp in milliseconds (epoch ms number)
  currentSession: null, // { id, name, durationMinutes, sessionType, startTime, endTime }
  blockedWebsites: ['youtube.com', 'instagram.com', 'facebook.com', 'x.com', 'reddit.com', 'discord.com'],  // Array of strings (domains/patterns e.g. "youtube.com", "*.reddit.*")
  allowedWebsites: [],  // Whitelist exceptions (e.g. "github.com", "docs.google.com")
  lastSyncTime: 0,
  stats: {
    todayAttempts: 0,
    timeSavedMinutes: 0,
    siteAttempts: {}
  }
};

class StorageService {
  /**
   * Normalize and sanitize storage payload to ensure absolute numeric timestamps
   */
  sanitizeItems(items) {
    const sanitized = { ...items };

    if ('endTime' in sanitized) {
      if (sanitized.endTime === null || sanitized.endTime === undefined) {
        sanitized.endTime = null;
      } else {
        const num = typeof sanitized.endTime === 'number'
          ? sanitized.endTime
          : (Number(sanitized.endTime) || Date.parse(sanitized.endTime));
        sanitized.endTime = (!isNaN(num) && num > 0) ? num : null;
      }
    }

    if ('startTime' in sanitized) {
      if (sanitized.startTime === null || sanitized.startTime === undefined) {
        sanitized.startTime = null;
      } else {
        const num = typeof sanitized.startTime === 'number'
          ? sanitized.startTime
          : (Number(sanitized.startTime) || Date.parse(sanitized.startTime));
        sanitized.startTime = (!isNaN(num) && num > 0) ? num : null;
      }
    }

    if ('shieldActive' in sanitized) {
      sanitized.shieldActive = Boolean(sanitized.shieldActive);
    }

    return sanitized;
  }

  /**
   * Initialize storage defaults if not present
   */
  async init() {
    return new Promise((resolve) => {
      if (typeof chrome === 'undefined' || !chrome.storage?.local) {
        resolve({ ...DEFAULT_STORAGE_STATE });
        return;
      }

      chrome.storage.local.get(null, (items) => {
        if (chrome.runtime.lastError) {
          console.warn('[FocusShield Storage] Failed to read storage:', chrome.runtime.lastError.message);
          resolve({ ...DEFAULT_STORAGE_STATE });
          return;
        }

        const merged = { ...DEFAULT_STORAGE_STATE, ...(items || {}) };
        resolve(merged);
      });
    });
  }

  /**
   * Get a single key from storage
   */
  async get(key) {
    return new Promise((resolve) => {
      if (typeof chrome === 'undefined' || !chrome.storage?.local) {
        resolve(DEFAULT_STORAGE_STATE[key]);
        return;
      }

      chrome.storage.local.get([key], (result) => {
        if (chrome.runtime.lastError) {
          console.warn(`[FocusShield Storage] Error reading key "${key}":`, chrome.runtime.lastError.message);
          resolve(DEFAULT_STORAGE_STATE[key]);
          return;
        }
        resolve(result && result[key] !== undefined ? result[key] : DEFAULT_STORAGE_STATE[key]);
      });
    });
  }

  /**
   * Get all storage items
   */
  async getAll() {
    return new Promise((resolve) => {
      if (typeof chrome === 'undefined' || !chrome.storage?.local) {
        resolve({ ...DEFAULT_STORAGE_STATE });
        return;
      }

      chrome.storage.local.get(null, (result) => {
        if (chrome.runtime.lastError) {
          console.warn('[FocusShield Storage] Error reading all keys:', chrome.runtime.lastError.message);
          resolve({ ...DEFAULT_STORAGE_STATE });
          return;
        }
        resolve({ ...DEFAULT_STORAGE_STATE, ...(result || {}) });
      });
    });
  }

  /**
   * Set multiple key-value pairs
   */
  async set(items) {
    const cleanItems = this.sanitizeItems(items);
    return new Promise((resolve) => {
      if (typeof chrome === 'undefined' || !chrome.storage?.local) {
        resolve(false);
        return;
      }

      chrome.storage.local.set(cleanItems, () => {
        if (chrome.runtime.lastError) {
          console.warn('[FocusShield Storage] Failed to persist data:', chrome.runtime.lastError.message);
          resolve(false);
          return;
        }
        resolve(true);
      });
    });
  }

  /**
   * Clear active study session while preserving token, stats, and block lists
   */
  async clearActiveSession() {
    return this.set({
      shieldActive: false,
      startTime: null,
      endTime: null,
      currentSession: null
    });
  }

  /**
   * Clear all stored values
   */
  async clear() {
    return new Promise((resolve) => {
      if (typeof chrome === 'undefined' || !chrome.storage?.local) {
        resolve(true);
        return;
      }

      chrome.storage.local.clear(() => {
        resolve(true);
      });
    });
  }
}

export const storage = new StorageService();
