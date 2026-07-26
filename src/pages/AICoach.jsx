import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Brain, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Globe, 
  Loader2, 
  Calendar,
  MessageSquare,
  Award,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AICoach() {
  const { token } = useApp();
  const [reports, setReports] = useState([]);
  const [activeReport, setActiveReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  // Fetch coach reports from database on mount
  useEffect(() => {
    const fetchReports = async () => {
      if (!token) return;
      try {
        const res = await fetch('http://localhost:5000/api/coach/reports', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.reports) {
          setReports(data.reports);
          if (data.reports.length > 0) {
            setActiveReport(data.reports[0]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch coaching reports:', err);
        setError('Failed to load past coaching logs.');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [token]);

  // Request new AI coach report generation
  const handleGenerateReport = async () => {
    setGenerating(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/coach/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success && data.report) {
        setReports(prev => [data.report, ...prev]);
        setActiveReport(data.report);
      } else {
        setError(data.message || 'Failed to complete coaching analysis.');
      }
    } catch (err) {
      console.error('Failed to generate coaching report:', err);
      setError('Connection error. AI generation failed.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-10 transition-colors duration-300">
      
      {/* Header */}
      <div className="max-w-6xl mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-in">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
            AI Productivity{' '}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Coach
            </span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
            Get personalized cognitive diagnostics, strength profiling, and distraction shield recommendations.
          </p>
        </div>
        <div>
          <button
            onClick={handleGenerateReport}
            disabled={generating || loading}
            className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all duration-200"
          >
            {generating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Analyzing Logs...</span>
              </>
            ) : (
              <>
                <Brain className="h-5 w-5" />
                <span>Generate Weekly Analysis</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="max-w-5xl mb-6 p-4 rounded-xl border border-red-200/80 bg-red-50 text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400 text-sm font-semibold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-4" />
          <p className="text-sm font-semibold text-slate-500">Loading coaching database...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="max-w-4xl mx-auto text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-8 bg-slate-50/50 dark:bg-slate-900/20">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 rounded-full w-fit mx-auto mb-6">
            <Sparkles className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">No Reports Generated Yet</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
            Generate your first weekly report to let the AI Coach analyze your focus intervals, distraction logs, and timing trends.
          </p>
          <button
            onClick={handleGenerateReport}
            disabled={generating}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-colors"
          >
            {generating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Brain className="h-5 w-5" />}
            Generate Coaching Analysis
          </button>
        </div>
      ) : (
        <div className="max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Coach Analysis Display (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Report Summary Card */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-8 shadow-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Weekly Performance Summary
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Report starting {new Date(activeReport.weekStartDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
                {activeReport.weeklyProductivitySummary}
              </p>
            </div>

            {/* Strengths & Weaknesses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Strengths Column */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-6 shadow-sm">
                <h3 className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-4.5 w-4.5" /> Key Strengths
                </h3>
                <ul className="space-y-3">
                  {activeReport.strengths.map((item, index) => (
                    <li key={index} className="flex gap-2.5 items-start text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses Column */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-6 shadow-sm">
                <h3 className="text-sm font-extrabold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-4.5 w-4.5" /> Growth Areas
                </h3>
                <ul className="space-y-3">
                  {activeReport.weaknesses.map((item, index) => (
                    <li key={index} className="flex gap-2.5 items-start text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      <div className="h-1.5 w-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Timings & Blocker Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Timings */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-6 shadow-sm">
                <h3 className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Clock className="h-4.5 w-4.5" /> Best Focus Windows
                </h3>
                <ul className="space-y-3">
                  {activeReport.bestStudyTimings.map((time, index) => (
                    <li key={index} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      <Clock className="h-4.5 w-4.5 text-indigo-500" />
                      <span>{time}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Websites blocker recommendations */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-6 shadow-sm">
                <h3 className="text-sm font-extrabold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Globe className="h-4.5 w-4.5" /> Blocker Recommendations
                </h3>
                <ul className="space-y-2">
                  {activeReport.suggestedBlockedWebsites.length > 0 ? (
                    activeReport.suggestedBlockedWebsites.map((site, index) => (
                      <li key={index} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-xs font-semibold text-slate-800 dark:text-slate-200">
                        <span className="truncate">{site}</span>
                        <span className="text-[10px] bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                          Distraction
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="text-xs text-slate-400 py-4 text-center">No block suggestions this week</li>
                  )}
                </ul>
              </div>

            </div>

          </div>

          {/* Sidebar Reports History & Feedback (1 col) */}
          <div className="space-y-6">
            
            {/* Motivational Feedback Widget */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/5 p-6 shadow-sm">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <MessageSquare className="h-4.5 w-4.5 text-indigo-500" /> Coach's Voice
              </h3>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300 italic leading-relaxed">
                "{activeReport.motivationalFeedback}"
              </p>
            </div>

            {/* Past Reports History */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-6 shadow-sm">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Calendar className="h-4.5 w-4.5 text-indigo-500" /> Coaching History
              </h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {reports.map((report) => (
                  <button
                    key={report._id}
                    onClick={() => setActiveReport(report)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between ${
                      activeReport._id === report._id
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-semibold'
                        : 'border-slate-100 hover:border-slate-200 dark:border-slate-800 dark:hover:border-slate-700 bg-slate-50/30 dark:bg-slate-950/10 text-slate-700 dark:text-slate-400'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">
                        Analysis Log
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                        {new Date(report.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 opacity-70" />
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
