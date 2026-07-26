/**
 * FocusFlow Mock API Service Client.
 * Handles server communication for syncing focus history, tasks, and settings.
 */

const BASE_URL = 'https://api.focusflow.local/v1';

export async function fetchFocusSessions() {
  // Mocking api response for now
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, duration: 1500, completed: true, timestamp: Date.now() - 3600000 },
        { id: 2, duration: 1500, completed: false, timestamp: Date.now() - 7200000 },
      ]);
    }, 500);
  });
}

export async function saveFocusSession(sessionData) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, session: { id: Date.now(), ...sessionData } });
    }, 500);
  });
}
