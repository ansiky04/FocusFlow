import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Calendar, 
  AlertCircle, 
  CheckCircle,
  Inbox,
  Filter,
  Check,
  X
} from 'lucide-react';

import { useApp } from '../context/AppContext';

export default function Tasks() {
  const { token } = useApp();
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'completed' | 'pending' | 'high'
  
  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPriority, setFormPriority] = useState('medium'); // 'high' | 'medium' | 'low'
  const [formDueDate, setFormDueDate] = useState('');

  // 2. Fetch tasks from MongoDB on mount/token change
  useEffect(() => {
    const fetchTasks = async () => {
      if (!token) return;
      try {
        const response = await fetch('http://localhost:5000/api/tasks', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.tasks) {
          const mapped = data.tasks.map(t => ({
            id: t._id,
            title: t.title,
            description: t.description || '',
            priority: t.priority.toLowerCase(),
            dueDate: t.dueDate ? t.dueDate.split('T')[0] : '',
            completed: t.status === 'Completed'
          }));
          setTasks(mapped);
        }
      } catch (err) {
        console.error('Error fetching tasks:', err.message);
      }
    };
    fetchTasks();
  }, [token]);

  // 3. API CRUD Action: Add task
  const handleAddTask = async (newTaskData) => {
    try {
      const response = await fetch('http://localhost:5000/api/tasks', {
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
          title: data.task.title,
          description: data.task.description || '',
          priority: data.task.priority.toLowerCase(),
          dueDate: data.task.dueDate ? data.task.dueDate.split('T')[0] : '',
          completed: data.task.status === 'Completed'
        };
        setTasks(prev => [mapped, ...prev]);
      }
    } catch (err) {
      console.error('Error adding task:', err.message);
    }
  };

  // 4. API CRUD Action: Update task details or toggle completion status
  const handleUpdateTask = async (taskId, updatedData) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
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
          title: data.task.title,
          description: data.task.description || '',
          priority: data.task.priority.toLowerCase(),
          dueDate: data.task.dueDate ? data.task.dueDate.split('T')[0] : '',
          completed: data.task.status === 'Completed'
        };
        setTasks(prev => prev.map(t => t.id === taskId ? mapped : t));
      }
    } catch (err) {
      console.error('Error updating task:', err.message);
    }
  };

  // 5. API CRUD Action: Delete task
  const handleRemoveTask = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
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

  // Statistics calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const totalTasks = tasks.length;
  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = totalTasks - completedCount;
  const overdueCount = tasks.filter(t => !t.completed && t.dueDate && t.dueDate < todayStr).length;

  // Filter & Search Logic
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    
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
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDesc(task.description);
    setFormPriority(task.priority);
    setFormDueDate(task.dueDate || '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  // Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingTask) {
      // Edit mode
      handleUpdateTask(editingTask.id, {
        title: formTitle,
        description: formDesc,
        priority: formPriority,
        dueDate: formDueDate
      });
    } else {
      // Add mode
      handleAddTask({
        title: formTitle,
        description: formDesc,
        priority: formPriority,
        dueDate: formDueDate,
        completed: false
      });
    }
    closeModal();
  };

  // CRUD Operations
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

  // Styling helper for priorities
  const prioritySettings = {
    high: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50',
    medium: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50',
    low: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50',
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-10 transition-colors duration-300 relative">
      
      {/* Header */}
      <div className="max-w-5xl mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Task Manager</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Organize and prioritize your daily learning checklist.</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold px-5 py-3.5 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <Plus className="h-5 w-5" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Stats Cards Section */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mb-8">
        {/* Total Card */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Tasks</span>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalTasks}</h3>
        </div>
        {/* Completed Card */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Completed</span>
          <h3 className="text-2xl font-black text-emerald-500 mt-1">{completedCount}</h3>
        </div>
        {/* Pending Card */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Pending</span>
          <h3 className="text-2xl font-black text-amber-500 mt-1">{pendingCount}</h3>
        </div>
        {/* Overdue Card */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Overdue</span>
          <h3 className={`text-2xl font-black mt-1 ${overdueCount > 0 ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`}>{overdueCount}</h3>
        </div>
      </section>

      {/* Control Filters & Search Bar */}
      <section className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 max-w-5xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 mr-2 hidden sm:inline flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Filter by:
          </span>
          {[
            { id: 'all', label: 'All' },
            { id: 'pending', label: 'Pending' },
            { id: 'completed', label: 'Completed' },
            { id: 'high', label: 'High Priority' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-all duration-150 ${
                filter === tab.id
                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-950 dark:border-white shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-900/60 dark:text-slate-400 dark:border-slate-800 dark:hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      </section>

      {/* Task List Listing */}
      <section className="max-w-5xl">
        {filteredTasks.length === 0 ? (
          <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
            <Inbox className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No tasks found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              {tasks.length === 0 
                ? "Your task list is empty. Add a new study goal above!" 
                : "No tasks match your search parameters."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map(task => {
              const isOverdue = !task.completed && task.dueDate && task.dueDate < todayStr;
              
              return (
                <div
                  key={task.id}
                  className={`group bg-white dark:bg-slate-900/40 border rounded-2xl p-5 flex items-start gap-4 transition-all duration-200 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-850 ${
                    task.completed 
                      ? 'border-slate-100 opacity-60 dark:border-slate-900/50' 
                      : 'border-slate-200 dark:border-slate-800/80'
                  }`}
                >
                  {/* Status Checkbox */}
                  <button
                    onClick={() => toggleComplete(task.id)}
                    className={`h-6 w-6 rounded-full shrink-0 flex items-center justify-center border-2 transition-all duration-150 ${
                      task.completed
                        ? 'bg-indigo-500 border-indigo-500 text-white'
                        : 'border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400'
                    }`}
                  >
                    {task.completed && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </button>

                  {/* Task details */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-base font-bold text-slate-900 dark:text-white truncate transition-all duration-200 ${
                      task.completed ? 'line-through text-slate-400 dark:text-slate-600' : ''
                    }`}>
                      {task.title}
                    </h3>
                    
                    {task.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1 mb-3 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    {/* Metadata tags */}
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${prioritySettings[task.priority]}`}>
                        {task.priority} Priority
                      </span>

                      {task.dueDate && (
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${
                          isOverdue
                            ? 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30'
                            : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
                        }`}>
                          <Calendar className="h-3 w-3" />
                          <span>Due: {task.dueDate}</span>
                          {isOverdue && (
                            <span className="flex items-center text-rose-500 font-black animate-pulse gap-0.5 ml-1">
                              <AlertCircle className="h-3 w-3" /> OVERDUE
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Task controls */}
                  <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => openEditModal(task)}
                      className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                      title="Edit Task"
                    >
                      <Edit3 className="h-4.5 w-4.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                      title="Delete Task"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Task Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingTask ? 'Edit Task Details' : 'Create New Task'}
              </h2>
              <button 
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* Title input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Task Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Read Physics Chapter 4"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                />
              </div>

              {/* Description input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Description
                </label>
                <textarea
                  placeholder="Provide context or links for your studies..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm resize-none"
                />
              </div>

              {/* Priority & Due Date flex row */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Priority Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Priority
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm font-semibold cursor-pointer"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {/* Due Date selection */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm font-semibold cursor-pointer"
                  />
                </div>

              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors shadow-md shadow-indigo-500/10"
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
