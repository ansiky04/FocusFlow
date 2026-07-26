import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Sparkles, 
  Loader2, 
  CheckSquare, 
  Square, 
  Plus, 
  Trash2, 
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AIStudyPlanner() {
  const { token } = useApp();
  const [plans, setPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [activeDay, setActiveDay] = useState(1);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  // Form Inputs State
  const [examDate, setExamDate] = useState('');
  const [availableStudyHours, setAvailableStudyHours] = useState(4);
  const [subjects, setSubjects] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('Medium');
  const [revisionDays, setRevisionDays] = useState(2);
  const [breakDays, setBreakDays] = useState(1);

  // Fetch plans on mount
  useEffect(() => {
    const fetchPlans = async () => {
      if (!token) return;
      try {
        const res = await fetch('http://localhost:5000/api/study-plans', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.plans) {
          setPlans(data.plans);
          if (data.plans.length > 0) {
            setActivePlan(data.plans[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load study plans:', err);
        setError('Failed to load study plans.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [token]);

  // Generate study plan
  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!examDate || !subjects) {
      setError('Please fill in exam date and subject fields.');
      return;
    }

    setGenerating(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/study-plans/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          examDate,
          availableStudyHours,
          subjects,
          difficultyLevel,
          revisionDays,
          breakDays
        })
      });
      const data = await res.json();
      if (data.success && data.plan) {
        setPlans(prev => [data.plan, ...prev]);
        setActivePlan(data.plan);
        setActiveDay(1);
      } else {
        setError(data.message || 'Generation failed.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failure during plan generation.');
    } finally {
      setGenerating(false);
    }
  };

  // Toggle task completed state
  const handleToggleTask = async (dayNumber, taskId, currentCompleted) => {
    if (!activePlan) return;

    // Optimistically update frontend UI state
    const updatedDays = activePlan.days.map(d => {
      if (d.dayNumber === dayNumber) {
        return {
          ...d,
          tasks: d.tasks.map(t => t.id === taskId ? { ...t, completed: !currentCompleted } : t)
        };
      }
      return d;
    });

    const updatedPlan = { ...activePlan, days: updatedDays };
    setActivePlan(updatedPlan);

    try {
      const res = await fetch(`http://localhost:5000/api/study-plans/${activePlan._id}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          dayNumber,
          taskId,
          completed: !currentCompleted
        })
      });
      const data = await res.json();
      if (data.success && data.plan) {
        // Update local plan storage
        setActivePlan(data.plan);
        setPlans(prev => prev.map(p => p._id === data.plan._id ? data.plan : p));
      }
    } catch (err) {
      console.error('Failed to sync progress on server:', err);
    }
  };

  // Delete current active study plan
  const handleDeletePlan = async () => {
    if (!activePlan) return;
    if (!window.confirm('Are you sure you want to delete this study plan? Progress will be lost.')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/study-plans/${activePlan._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        const remaining = plans.filter(p => p._id !== activePlan._id);
        setPlans(remaining);
        setActivePlan(remaining.length > 0 ? remaining[0] : null);
        setActiveDay(1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate completion percentage
  const getCompletionStats = () => {
    if (!activePlan || !activePlan.days) return { total: 0, completed: 0, percent: 0 };
    let total = 0;
    let completed = 0;
    activePlan.days.forEach(d => {
      d.tasks.forEach(t => {
        total++;
        if (t.completed) completed++;
      });
    });
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  };

  const { percent } = getCompletionStats();
  const selectedDayData = activePlan?.days.find(d => d.dayNumber === activeDay);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-6 hover:shadow-xl dark:hover:shadow-indigo-950/20 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300">
      
      {/* Background glow styling */}
      <div className="absolute -inset-px bg-gradient-to-r from-transparent via-slate-100/10 to-transparent dark:via-indigo-500/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

      <div className="relative z-10 w-full">
        
        {/* Header Title */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                AI Study Planner
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate daily study checklists and track exam schedules
              </p>
            </div>
          </div>
          {activePlan && (
            <button
              onClick={handleDeletePlan}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
              title="Delete current study plan"
            >
              <Trash2 className="h-4.5 w-4.5" />
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
          </div>
        ) : !activePlan ? (
          /* Form layout to generate plan */
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">
                  Exam Date
                </label>
                <input
                  type="date"
                  value={examDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">
                  Daily Available Study Hours
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={availableStudyHours}
                  onChange={(e) => setAvailableStudyHours(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full text-xs font-semibold px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">
                Subjects (Comma-separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Mathematics, Organic Chemistry, World History"
                value={subjects}
                onChange={(e) => setSubjects(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">
                  Difficulty
                </label>
                <select
                  value={difficultyLevel}
                  onChange={(e) => setDifficultyLevel(e.target.value)}
                  className="w-full text-xs font-semibold px-2 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">
                  Revision Days
                </label>
                <input
                  type="number"
                  min="0"
                  value={revisionDays}
                  onChange={(e) => setRevisionDays(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full text-xs font-semibold px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">
                  Rest/Break Days
                </label>
                <input
                  type="number"
                  min="0"
                  value={breakDays}
                  onChange={(e) => setBreakDays(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full text-xs font-semibold px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={generating}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all duration-200"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>AI generating study calendar...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Build Study Plan</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* Active checklist display */
          <div className="space-y-5">
            {/* Progress metrics */}
            <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-indigo-500" /> Plan Progression
                  </span>
                  <span>{percent}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
              <div className="shrink-0 text-center px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
                <span className="text-[10px] uppercase font-bold block leading-none">Days</span>
                <span className="text-lg font-black">{activePlan.days.length}</span>
              </div>
            </div>

            {/* Day horizontal slider lists */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
              {activePlan.days.map((d) => (
                <button
                  key={d.dayNumber}
                  onClick={() => setActiveDay(d.dayNumber)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                    activeDay === d.dayNumber
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}
                >
                  Day {d.dayNumber}
                </button>
              ))}
            </div>

            {/* Selected day details and task checks */}
            {selectedDayData && (
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/10 space-y-4">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-0.5">
                    {selectedDayData.subject}
                  </span>
                  <h4 className="text-sm font-black text-slate-800 dark:text-white leading-tight">
                    {selectedDayData.topic}
                  </h4>
                </div>

                <div className="space-y-2">
                  {selectedDayData.tasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => handleToggleTask(selectedDayData.dayNumber, task.id, task.completed)}
                      className="w-full text-left flex items-start gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                    >
                      <div className="mt-0.5 shrink-0">
                        {task.completed ? (
                          <CheckSquare className="h-4.5 w-4.5 text-indigo-500" />
                        ) : (
                          <Square className="h-4.5 w-4.5 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-xs font-semibold leading-tight ${task.completed ? 'line-through text-slate-400 dark:text-slate-600' : 'text-slate-700 dark:text-slate-300'}`}>
                          {task.task}
                        </p>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">
                          {task.duration}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
