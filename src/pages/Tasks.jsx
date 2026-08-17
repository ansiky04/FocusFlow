import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Calendar, 
  CheckCircle2,
  Check, 
  X,
  Clock,
  Flame,
  TrendingUp,
  ListTodo
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { API_BASE_URL } from '../utils/api';

export default function Tasks() {
  const { token, user } = useApp();
  const userStorageKey = user?.id || 'default_user';
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'completed' | 'high'
  const [analytics, setAnalytics] = useState(null);

  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPriority, setFormPriority] = useState('medium'); // 'high' | 'medium' | 'low'
  const [formDueDate, setFormDueDate] = useState('');
  const [formRelatedHabitId, setFormRelatedHabitId] = useState('');

  // Active tracker habits for linking selector
  const [trackerHabits, setTrackerHabits] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`focusflow_habits_v4_${userStorageKey}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setTrackerHabits(parsed.filter(h => !h.isArchived));
        }
      }
    } catch {}
  }, [userStorageKey, isModalOpen]);

  // Daily Habit Tracker State (Local Persistence)
  const todayKey = `focusflow_habits_${new Date().toISOString().split('T')[0]}`;
  const DEFAULT_HABITS = [
    { id: 'h1', label: 'Wake up Early' },
    { id: 'h2', label: 'Study 2 Hours' },
    { id: 'h3', label: 'Revision' },
    { id: 'h4', label: 'Exercise' },
    { id: 'h5', label: 'Drink Water' },
    { id: 'h6', label: 'Reading' },
  ];

  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem(todayKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (_e) {}
    }
    return DEFAULT_HABITS.map(h => ({ ...h, completed: false }));
  });

  const toggleHabit = (id) => {
    const updated = habits.map(h => h.id === id ? { ...h, completed: !h.completed } : h);
    setHabits(updated);
    localStorage.setItem(todayKey, JSON.stringify(updated));
  };

  const completedHabitsCount = habits.filter(h => h.completed).length;
  const habitCompletionPercent = habits.length > 0 ? Math.round((completedHabitsCount / habits.length) * 100) : 0;

  // Fetch tasks from MongoDB
  useEffect(() => {
    const fetchTasks = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${API_BASE_URL}/tasks`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.tasks) {
          const mapped = data.tasks.map(t => ({
            id: t._id,
            title: t.title || '',
            description: t.description || '',
            priority: (t.priority || 'medium').toLowerCase(),
            dueDate: t.dueDate ? String(t.dueDate).split('T')[0] : '',
            completed: t.status === 'Completed',
            relatedHabitId: t.relatedHabitId || '',
            relatedHabitTitle: t.relatedHabitTitle || ''
          }));
          setTasks(mapped);
        }
      } catch (err) {
        console.error('Error fetching tasks:', err.message);
      }
    };
    fetchTasks();
  }, [token]);

  // Fetch analytics for summary panel
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${API_BASE_URL}/analytics`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.analytics) {
          setAnalytics(data.analytics);
        }
      } catch (err) {
        console.error('Error fetching analytics in Tasks:', err.message);
      }
    };
    fetchAnalytics();
  }, [token]);

  // API CRUD Actions
  const handleAddTask = async (newTaskData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newTaskData)
      });
      const data = await response.json();
      if (data.success && data.task) {
        const mapped = {
          id: data.task._id,
          title: data.task.title || '',
          description: data.task.description || '',
          priority: (data.task.priority || 'medium').toLowerCase(),
          dueDate: data.task.dueDate ? String(data.task.dueDate).split('T')[0] : '',
          completed: data.task.status === 'Completed',
          relatedHabitId: data.task.relatedHabitId || '',
          relatedHabitTitle: data.task.relatedHabitTitle || ''
        };
        setTasks(prev => [mapped, ...prev]);
      }
    } catch (err) {
      console.error('Error adding task:', err.message);
    }
  };

  const handleUpdateTask = async (taskId, updatedData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });
      const data = await response.json();
      if (data.success && data.task) {
        const mapped = {
          id: data.task._id,
          title: data.task.title || '',
          description: data.task.description || '',
          priority: (data.task.priority || 'medium').toLowerCase(),
          dueDate: data.task.dueDate ? String(data.task.dueDate).split('T')[0] : '',
          completed: data.task.status === 'Completed',
          relatedHabitId: data.task.relatedHabitId || '',
          relatedHabitTitle: data.task.relatedHabitTitle || ''
        };
        setTasks(prev => prev.map(t => t.id === taskId ? mapped : t));
      }
    } catch (err) {
      console.error('Error updating task:', err.message);
    }
  };

  const handleRemoveTask = async (taskId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setTasks(prev => prev.filter(t => t.id !== taskId));
      }
    } catch (err) {
      console.error('Error deleting task:', err.message);
    }
  };

  // Helper metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const totalTasks = tasks.length;
  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = totalTasks - completedCount;
  const overdueCount = tasks.filter(t => !t.completed && t.dueDate && t.dueDate < todayStr).length;
  const taskProgressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Filter & Search Logic
  const filteredTasks = tasks.filter(task => {
    const titleStr = task.title || '';
    const descStr = task.description || '';
    const matchesSearch = 
      titleStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      descStr.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'completed' ? task.completed :
      filter === 'pending' ? !task.completed :
      filter === 'high' ? task.priority === 'high' : true;

    return matchesSearch && matchesFilter;
  });

  // Modal actions
  const openAddModal = () => {
    setEditingTask(null);
    setFormTitle('');
    setFormDesc('');
    setFormPriority('medium');
    setFormDueDate('');
    setFormRelatedHabitId('');
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDesc(task.description);
    setFormPriority(task.priority);
    setFormDueDate(task.dueDate || '');
    setFormRelatedHabitId(task.relatedHabitId || '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const matchedHabit = trackerHabits.find(h => h.id === formRelatedHabitId);
    const resolvedHabitTitle = matchedHabit ? matchedHabit.name : (formRelatedHabitId ? formRelatedHabitId : '');

    if (editingTask) {
      handleUpdateTask(editingTask.id, {
        title: formTitle,
        description: formDesc,
        priority: formPriority,
        dueDate: formDueDate,
        relatedHabitId: formRelatedHabitId,
        relatedHabitTitle: resolvedHabitTitle
      });
    } else {
      handleAddTask({
        title: formTitle,
        description: formDesc,
        priority: formPriority,
        dueDate: formDueDate,
        completed: false,
        relatedHabitId: formRelatedHabitId,
        relatedHabitTitle: resolvedHabitTitle
      });
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      handleRemoveTask(id);
    }
  };

  const toggleComplete = (id) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      handleUpdateTask(id, {
        completed: !task.completed
      });
    }
  };

  // Helper for category tag
  const getCategory = (task) => {
    const text = (task.title + ' ' + task.description).toLowerCase();
    if (text.includes('exam') || text.includes('quiz') || text.includes('test')) return 'Exam';
    if (text.includes('code') || text.includes('project') || text.includes('app') || text.includes('lab')) return 'Project';
    if (text.includes('read') || text.includes('book') || text.includes('paper') || text.includes('ch.')) return 'Reading';
    if (text.includes('assign') || text.includes('hw') || text.includes('homework')) return 'Assignment';
    return 'Study';
  };

  // Helper for estimated time based on priority
  const getEstimatedTime = (priority) => {
    switch (priority) {
      case 'high': return '60 min';
      case 'medium': return '45 min';
      case 'low': return '25 min';
      default: return '30 min';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-3.5 py-4 sm:px-6 sm:py-6 transition-colors duration-300 relative">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* TOP BAR */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            
            {/* Title & Today's Progress */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <ListTodo className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Task Manager
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Spreadsheet overview of your daily workload and deadlines.
                </p>
              </div>

              {/* Today's Progress Pill */}
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl px-3 py-1.5 flex items-center gap-3">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  Today's Progress
                </span>
                <div className="w-24 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${taskProgressPercent}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {taskProgressPercent}%
                </span>
              </div>
            </div>

            {/* Search, Filter & Add Action */}
            <div className="flex flex-wrap items-center gap-2.5">
              
              {/* Search Tasks Input */}
              <div className="relative flex-1 sm:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'pending', label: 'Pending' },
                  { id: 'completed', label: 'Done' },
                  { id: 'high', label: 'High' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setFilter(tab.id)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                      filter === tab.id
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* + Add Task Button */}
              <button
                onClick={openAddModal}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold px-3.5 py-1.5 shadow-sm transition-all whitespace-nowrap"
              >
                <Plus className="h-4 w-4" />
                <span>Add Task</span>
              </button>

            </div>

          </div>
        </div>

        {/* MAIN LAYOUT: Table & Habits (Left) + Today's Summary (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT 8 COLS: Table & Habit Tracker */}
          <div className="lg:col-span-8 space-y-6">

            {/* MAIN CONTENT: SPREADSHEET TABLE */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] shadow-sm overflow-hidden">
              <div className="overflow-x-auto max-h-[480px]">
                <table className="w-full text-left border-collapse text-xs">
                  
                  {/* Sticky Table Header */}
                  <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800 z-10">
                    <tr>
                      <th className="py-3 px-3.5 w-12 text-center">✓ Status</th>
                      <th className="py-3 px-3 min-w-[180px]">Task Name</th>
                      <th className="py-3 px-3 w-24">Category</th>
                      <th className="py-3 px-3 w-24">Priority</th>
                      <th className="py-3 px-3 w-28">Due Date</th>
                      <th className="py-3 px-3 w-24">Est. Time</th>
                      <th className="py-3 px-3 w-28">Progress</th>
                      <th className="py-3 px-3 w-20 text-center">Actions</th>
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredTasks.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="py-12 text-center text-slate-400 dark:text-slate-500">
                          <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                          <p className="font-semibold text-slate-600 dark:text-slate-400">No tasks found</p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                            {tasks.length === 0 ? 'Click "+ Add Task" to create your first goal.' : 'Try adjusting your search or filter.'}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredTasks.map((task) => {
                        const isOverdue = !task.completed && task.dueDate && task.dueDate < todayStr;
                        const category = getCategory(task);
                        const estTime = getEstimatedTime(task.priority);

                        return (
                          <tr
                            key={task.id}
                            className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                              task.completed ? 'bg-slate-50/40 dark:bg-slate-900/40 opacity-70' : ''
                            }`}
                          >
                            {/* 1. Status Checkbox */}
                            <td className="py-2.5 px-3.5 text-center">
                              <button
                                onClick={() => toggleComplete(task.id)}
                                className={`h-4.5 w-4.5 rounded flex items-center justify-center border transition-all ${
                                  task.completed
                                    ? 'bg-indigo-600 border-indigo-600 text-white'
                                    : 'border-slate-300 dark:border-slate-600 hover:border-indigo-600'
                                }`}
                                title={task.completed ? 'Mark as pending' : 'Mark as completed'}
                              >
                                {task.completed && <Check className="h-3 w-3 stroke-[3]" />}
                              </button>
                            </td>

                            {/* 2. Task Name */}
                            <td className="py-2.5 px-3">
                              <div className="font-semibold text-slate-900 dark:text-white truncate max-w-[240px]">
                                <span className={task.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''}>
                                  {task.title}
                                </span>
                              </div>
                              {task.description && (
                                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[240px] mt-0.5">
                                  {task.description}
                                </p>
                              )}
                              {task.relatedHabitTitle && (
                                <div className="mt-1">
                                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 px-1.5 py-0.5 rounded-md">
                                    <Flame className="w-2.5 h-2.5" />
                                    Habit: {task.relatedHabitTitle}
                                  </span>
                                </div>
                              )}
                            </td>

                            {/* 3. Category */}
                            <td className="py-2.5 px-3">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {category}
                              </span>
                            </td>

                            {/* 4. Priority */}
                            <td className="py-2.5 px-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                                task.priority === 'high'
                                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                                  : task.priority === 'medium'
                                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                  : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                              }`}>
                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                              </span>
                            </td>

                            {/* 5. Due Date */}
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              {task.dueDate ? (
                                <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                                  <Calendar className="h-3 w-3 text-slate-400" />
                                  <span className={isOverdue ? 'text-rose-600 dark:text-rose-400 font-bold' : ''}>
                                    {task.dueDate}
                                  </span>
                                  {isOverdue && (
                                    <span className="text-[9px] font-bold text-rose-500 uppercase ml-0.5">!</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-300 dark:text-slate-600">—</span>
                              )}
                            </td>

                            {/* 6. Estimated Time */}
                            <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-slate-400" />
                                {estTime}
                              </span>
                            </td>

                            {/* 7. Progress */}
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-2">
                                <div className="w-14 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      task.completed
                                        ? 'bg-emerald-500 w-full'
                                        : task.priority === 'high'
                                        ? 'bg-amber-500 w-1/2'
                                        : 'bg-slate-300 dark:bg-slate-700 w-1/4'
                                    }`}
                                  />
                                </div>
                                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                                  {task.completed ? '100%' : task.priority === 'high' ? '50%' : '25%'}
                                </span>
                              </div>
                            </td>

                            {/* 8. Actions */}
                            <td className="py-2.5 px-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => openEditModal(task)}
                                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                  title="Edit Task"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(task.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                  title="Delete Task"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION: DAILY HABIT TRACKER */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Daily Habit Tracker
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {completedHabitsCount} of {habits.length} Done
                  </span>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
                    {habitCompletionPercent}%
                  </span>
                </div>
              </div>

              {/* Progress bar for habits */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-4">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${habitCompletionPercent}%` }}
                />
              </div>

              {/* Habits Checkboxes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {habits.map((habit) => (
                  <button
                    key={habit.id}
                    onClick={() => toggleHabit(habit.id)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                      habit.completed
                        ? 'bg-indigo-50/60 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/40 text-slate-900 dark:text-white'
                        : 'bg-slate-50/60 dark:bg-slate-850/40 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <div className={`h-4 w-4 rounded flex items-center justify-center shrink-0 border ${
                      habit.completed
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                    }`}>
                      {habit.completed && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                    <span className={`text-xs font-medium truncate ${
                      habit.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
                    }`}>
                      {habit.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT 4 COLS: TODAY'S SUMMARY SIDE PANEL */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-5 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Today's Summary
                </h2>
              </div>
            </div>

            {/* Metrics List */}
            <div className="space-y-3">
              
              {/* Completed Tasks */}
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Completed Tasks
                </span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {completedCount}
                </span>
              </div>

              {/* Pending Tasks */}
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Pending Tasks
                </span>
                <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                  {pendingCount}
                </span>
              </div>

              {/* Overdue Tasks */}
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Overdue
                </span>
                <span className={`text-sm font-bold ${overdueCount > 0 ? 'text-rose-600 dark:text-rose-400 font-black' : 'text-slate-400'}`}>
                  {overdueCount}
                </span>
              </div>

              {/* Focus Hours */}
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Focus Hours
                </span>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  {analytics ? `${analytics.totalFocusHours.toFixed(1)}h` : '0.0h'}
                </span>
              </div>

              {/* Productivity % */}
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Productivity %
                </span>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  {analytics ? `${analytics.productivityScore}%` : `${taskProgressPercent}%`}
                </span>
              </div>

            </div>

            {/* Quick Task Creation Trigger */}
            <div className="pt-2">
              <button
                onClick={openAddModal}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                <span>Create New Task</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Task Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[14px] w-full max-w-md overflow-hidden shadow-xl relative">
            
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-850">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {editingTask ? 'Edit Task' : 'Add New Task'}
              </h2>
              <button 
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              
              {/* Title input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Task Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Complete Compiler Design Lab"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-medium"
                />
              </div>

              {/* Description input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Description
                </label>
                <textarea
                  placeholder="Additional context or notes..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  rows="2"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-medium resize-none"
                />
              </div>

              {/* Related Habit selector */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Related Habit (Optional)
                </label>
                <select
                  value={formRelatedHabitId}
                  onChange={(e) => setFormRelatedHabitId(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-medium cursor-pointer"
                >
                  <option value="">None (Independent Task)</option>
                  {trackerHabits.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.category || 'Habit'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority & Due Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Priority
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-medium cursor-pointer"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-medium cursor-pointer"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-xs"
                >
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

