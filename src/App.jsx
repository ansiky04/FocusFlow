import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Timer from './pages/Timer';
import Tasks from './pages/Tasks';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import FocusShield from './pages/FocusShield';
import Login from './pages/Login';
import Register from './pages/Register';
import StudyCalendar from './pages/StudyCalendar';
import HabitTracker from './pages/HabitTracker';
import DailyPlanner from './pages/DailyPlanner';
import { AppProvider, useApp } from './context/AppContext';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-900 text-center">
          <div className="max-w-md p-6 bg-white dark:bg-slate-850 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-2xl font-black text-rose-500 dark:text-rose-400 mb-3">Module Unavailable</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              This page encountered an error or is currently unavailable. Please go back or try reloading the application.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.href = '/';
              }}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 shadow-md transition-all duration-200"
            >
              Back to Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-900 text-center">
      <div className="max-w-md p-6 bg-white dark:bg-slate-850 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800">
        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-3">Page Not Found</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          The requested page could not be found. It may be temporarily unavailable or the address might be incorrect.
        </p>
        <Link
          to="/"
          className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 shadow-md transition-all duration-200"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
}

function AppContent() {
  const { theme, user, token, isLoading } = useApp();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 text-white font-sans">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500 mb-4"></div>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest animate-pulse">Initializing FocusFlow...</p>
      </div>
    );
  }

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''} h-full w-full`}>
      <Routes>
        {/* Public auth routes (redirect back to main dashboard if already logged in) */}
        <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register" element={token ? <Navigate to="/" replace /> : <Register />} />

        {/* Protected Dashboard Route Frame */}
        <Route
          path="/*"
          element={
            !token ? (
              <Navigate to="/login" replace />
            ) : (
              <div className="flex flex-col h-full bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
                <Navbar />
                <div className="flex flex-1 overflow-hidden">
                  <Sidebar />
                  <main className="flex flex-1 flex-col min-w-0 overflow-hidden bg-slate-50 dark:bg-slate-900/40">
                    <ErrorBoundary>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/timer" element={<Timer />} />
                        <Route path="/tasks" element={<Tasks />} />
                        <Route path="/planner" element={<DailyPlanner />} />
                        <Route path="/habits" element={<HabitTracker />} />
                        <Route path="/calendar" element={<StudyCalendar />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/shield" element={<FocusShield />} />
                        <Route path="/settings" element={<Settings />} />
                        {/* Friendly Page Not Found fallback */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </ErrorBoundary>
                  </main>
                </div>
              </div>
            )
          }
        />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}
