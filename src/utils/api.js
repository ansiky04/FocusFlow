/**
 * Central API Base URL Resolver for FocusFlow.
 * Automatically uses VITE_API_URL environment variable in production (Vercel).
 * Falls back to http://localhost:5000/api in local development.
 */
const resolveApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl || !envUrl.trim()) {
    return 'http://localhost:5000/api';
  }
  const trimmed = envUrl.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

export const API_BASE_URL = resolveApiBaseUrl();
