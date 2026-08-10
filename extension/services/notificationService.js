/**
 * FocusFlow Focus Shield - Notification Module
 * Manages Chromium system notifications for session status changes.
 */

export class NotificationService {
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
        }, (_notificationId) => {
          if (chrome.runtime.lastError) {
            console.warn('[FocusShield Notification] Browser notification warning:', chrome.runtime.lastError.message);
          }
        });
      }
    } catch (err) {
      console.warn('[FocusShield Notification] Notification error:', err);
    }
  }

  /**
   * Session started notification
   */
  static notifySessionStarted(sessionName, durationMinutes) {
    this.notify(
      '🚀 Focus Shield Activated',
      `Study session "${sessionName || 'Deep Work'}" is active for ${durationMinutes || 25} minutes. Distracting websites are blocked.`
    );
  }

  /**
   * Session completed notification
   */
  static notifySessionCompleted(sessionName) {
    this.notify(
      '🎉 Focus Session Completed!',
      `Great job! "${sessionName || 'Study Session'}" has finished. Website access is now restored.`
    );
  }
}
