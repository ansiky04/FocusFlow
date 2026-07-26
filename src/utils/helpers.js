/**
 * Formats a duration in seconds to a standard timer format (MM:SS).
 * @param {number} seconds - The duration in seconds.
 * @returns {string} - Formatted time.
 */
export function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

/**
 * Returns a human-friendly relative time string (e.g., "5m ago").
 * @param {number} timestamp - Epoch timestamp in ms.
 * @returns {string} - Relative time string.
 */
export function getRelativeTime(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(timestamp).toLocaleDateString();
}
