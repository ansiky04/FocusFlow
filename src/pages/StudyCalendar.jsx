import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Search, 
  Trash2, 
  X, 
  Clock,
  AlertTriangle,
  Tag,
  Check,
  BellRing
} from 'lucide-react';
import { useApp } from '../context/AppContext';

// Category color style maps
const CATEGORY_MAPS = {
  Study: {
    color: 'indigo',
    classes: 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/30 dark:border-indigo-900/50 dark:text-indigo-400',
    dot: 'bg-indigo-500'
  },
  Exam: {
    color: 'rose',
    classes: 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-400',
    dot: 'bg-rose-500'
  },
  Assignment: {
    color: 'amber',
    classes: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-400',
    dot: 'bg-amber-500'
  },
  Personal: {
    color: 'emerald',
    classes: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-400',
    dot: 'bg-emerald-500'
  }
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function StudyCalendar() {
  const { token, fetchCalendarEvents } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [draggedOverDate, setDraggedOverDate] = useState(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Form Field States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateVal, setDateVal] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState('Study');
  const [reminderOffset, setReminderOffset] = useState('none');
  const [formError, setFormError] = useState('');

  const fetchEvents = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/calendar', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setEvents(data.events);
      }
    } catch (err) {
      console.error('Error fetching calendar events:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch all events on mount/token change
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Helper: Format Date to YYYY-MM-DD local timezone safely
  const formatLocalDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper: Format date for display: "Dec 12, 2026"
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  };

  // Get Calendar Cells Math
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    const days = [];

    // Preceding month filler
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        date: new Date(Date.UTC(year, month - 1, prevMonthTotalDays - i)),
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        date: new Date(Date.UTC(year, month, i)),
        isCurrentMonth: true
      });
    }

    // Trailing month filler
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        date: new Date(Date.UTC(year, month + 1, i)),
        isCurrentMonth: false
      });
    }

    return days;
  };

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleGoToday = () => {
    setCurrentDate(new Date());
  };

  // Drag and Drop handlers
  const handleDragStart = (e, eventId) => {
    e.dataTransfer.setData('text/plain', eventId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, dateStr) => {
    e.preventDefault();
    if (draggedOverDate !== dateStr) {
      setDraggedOverDate(dateStr);
    }
  };

  const handleDragLeave = () => {
    setDraggedOverDate(null);
  };

  const handleDrop = async (e, dateStr) => {
    e.preventDefault();
    setDraggedOverDate(null);
    const eventId = e.dataTransfer.getData('text/plain');
    if (!eventId) return;

    // Instantly update UI locally
    const originalEventIndex = events.findIndex(ev => ev._id === eventId);
    if (originalEventIndex === -1) return;
    
    const oldEvents = [...events];
    const updatedEvents = [...events];
    updatedEvents[originalEventIndex] = {
      ...updatedEvents[originalEventIndex],
      date: new Date(dateStr)
    };
    setEvents(updatedEvents);

    // Save to Database
    try {
      const response = await fetch(`http://localhost:5000/api/calendar/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ date: dateStr })
      });
      const data = await response.json();
      if (!data.success) {
        // Rollback state if server returns error
        setEvents(oldEvents);
      } else {
        if (fetchCalendarEvents) fetchCalendarEvents();
      }
    } catch (err) {
      console.error('Failed to update event date via drag-and-drop:', err);
      setEvents(oldEvents);
    }
  };

  // Form Modals Setup
  const openCreateModal = (dateObj) => {
    setSelectedEvent(null);
    setFormError('');
    const formatted = formatLocalDate(dateObj);
    setDateVal(formatted);
    setTitle('');
    setDescription('');
    setStartTime('09:00');
    setEndTime('10:00');
    setPriority('Medium');
    setCategory('Study');
    setReminderOffset('none');
    setIsModalOpen(true);
  };

  const openEditModal = (event, e) => {
    e.stopPropagation(); // Avoid triggering openCreateModal on calendar cell click
    setSelectedEvent(event);
    setFormError('');
    const formattedDate = formatLocalDate(event.date);
    setDateVal(formattedDate);
    setTitle(event.title);
    setDescription(event.description || '');
    setStartTime(event.startTime);
    setEndTime(event.endTime);
    setPriority(event.priority);
    setCategory(event.category);
    setReminderOffset(event.reminderOffset || 'none');
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validations
    if (!title.trim()) {
      setFormError('Please enter an event title');
      return;
    }
    if (!startTime || !endTime) {
      setFormError('Start time and End time are required');
      return;
    }

    const startMinutes = parseTimeToMinutes(startTime);
    const endMinutes = parseTimeToMinutes(endTime);

    if (endMinutes <= startMinutes) {
      setFormError('End time must be after start time');
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      date: dateVal,
      startTime,
      endTime,
      priority,
      category,
      reminderOffset
    };

    try {
      let response;
      if (selectedEvent) {
        // Update Event API
        response = await fetch(`http://localhost:5000/api/calendar/${selectedEvent._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        // Create Event API
        response = await fetch('http://localhost:5000/api/calendar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      const data = await response.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchEvents(); // Refresh items
        if (fetchCalendarEvents) fetchCalendarEvents();
      } else {
        setFormError(data.message || 'Operation failed');
      }
    } catch (err) {
      console.error('Failed to save event:', err);
      setFormError('Network communication failure. Please check server.');
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    if (!window.confirm(`Delete the event "${selectedEvent.title}"?`)) return;

    try {
      const response = await fetch(`http://localhost:5000/api/calendar/${selectedEvent._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchEvents();
        if (fetchCalendarEvents) fetchCalendarEvents();
      } else {
        setFormError(data.message || 'Deletion failed');
      }
    } catch (err) {
      console.error('Failed to delete event:', err);
      setFormError('Network error. Failed to delete.');
    }
  };

  const parseTimeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Local Filter and Search Logic
  const filteredEvents = events.filter(event => {
    // Search text match
    const titleMatch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
    const descMatch = (event.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const searchMatch = titleMatch || descMatch;

    // Category filter match
    const categoryMatch = categoryFilter === 'All' || event.category === categoryFilter;

    // Priority filter match
    const priorityMatch = priorityFilter === 'All' || event.priority === priorityFilter;

    return searchMatch && categoryMatch && priorityMatch;
  });

  // Count summaries
  const eventCounts = {
    All: filteredEvents.length,
    Study: filteredEvents.filter(e => e.category === 'Study').length,
    Exam: filteredEvents.filter(e => e.category === 'Exam').length,
    Assignment: filteredEvents.filter(e => e.category === 'Assignment').length,
    Personal: filteredEvents.filter(e => e.category === 'Personal').length
  };

  const calendarDays = getCalendarDays();

  return (
    <div className="flex-1 overflow-y-auto px-8 py-10 transition-colors duration-300">
      
      {/* Page Header */}
      <div className="max-w-7xl flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 animate-fade-in">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-3">
            Study{' '}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Calendar
            </span>
          </h1>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-xl">
            Schedule deadlines, visualize exams, and organize learning sprints in a dynamic, responsive planner.
          </p>
        </div>

        {/* Global Create Button */}
        <button
          onClick={() => openCreateModal(new Date())}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-5 py-3 shadow-md shadow-indigo-500/10 hover:scale-102 active:scale-98 transition-all duration-200 cursor-pointer self-start md:self-auto"
        >
          <Plus className="h-4.5 w-4.5" />
          Add New Event
        </button>
      </div>

      {/* Interactive Filters Panel */}
      <div className="max-w-7xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mb-6 flex flex-col md:flex-row gap-5 items-stretch md:items-center justify-between shadow-sm">
        
        {/* Search bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search events by title, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-100 dark:focus:border-indigo-500/80"
          />
        </div>

        {/* Filters and Priority selectors */}
        <div className="flex flex-wrap gap-4 items-center">
          
          {/* Priority filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-200 dark:focus:border-indigo-500/80 cursor-pointer"
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Quick interactive Category count pills */}
          <div className="flex flex-wrap items-center gap-2">
            {['All', 'Study', 'Exam', 'Assignment', 'Personal'].map((cat) => {
              const isActive = categoryFilter === cat;
              const classes = isActive 
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600 dark:bg-slate-900/60 dark:hover:bg-slate-900/90 dark:text-slate-400';
              return (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${classes}`}
                >
                  {cat !== 'All' && (
                    <span className={`w-2 h-2 rounded-full ${CATEGORY_MAPS[cat]?.dot} ${isActive ? 'bg-white' : ''}`} />
                  )}
                  {cat}
                  <span className={`text-[10px] opacity-75 ${isActive ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500'}`}>
                    ({eventCounts[cat]})
                  </span>
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="max-w-7xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col">
        
        {/* Calendar Nav Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950/80 rounded-xl p-1 border border-slate-200/50 dark:border-slate-800/80">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-950 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="h-4.5 w-4.5" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-950 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          <button
            onClick={handleGoToday}
            className="flex items-center gap-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-950/80 dark:hover:bg-slate-800/80 dark:text-slate-300 rounded-xl border border-slate-200/50 dark:border-slate-800/50 text-xs font-bold transition-all cursor-pointer"
          >
            Today
          </button>
        </div>

        {/* Days of week titles */}
        <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-center py-2.5">
          {DAYS_OF_WEEK.map((day) => (
            <span 
              key={day} 
              className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest"
            >
              {day}
            </span>
          ))}
        </div>

        {/* Monthly Grid */}
        {loading ? (
          <div className="h-[500px] flex flex-col items-center justify-center text-slate-400 gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
            <span className="text-xs font-bold uppercase tracking-wider animate-pulse">Loading Planner...</span>
          </div>
        ) : (
          <div className="grid grid-cols-7 grid-rows-6 divide-x divide-y divide-slate-100 dark:divide-slate-800 border-b border-slate-100 dark:border-slate-800">
            {calendarDays.map((cell, idx) => {
              const cellDateStr = formatLocalDate(cell.date);
              const cellEvents = filteredEvents.filter(ev => formatLocalDate(ev.date) === cellDateStr);
              
              const isToday = formatLocalDate(new Date()) === cellDateStr;
              const isOver = draggedOverDate === cellDateStr;

              return (
                <div
                  key={`${cellDateStr}-${idx}`}
                  onClick={() => openCreateModal(cell.date)}
                  onDragOver={(e) => handleDragOver(e, cellDateStr)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, cellDateStr)}
                  className={`min-h-[95px] md:min-h-[110px] p-2.5 flex flex-col gap-1 transition-all relative group cursor-pointer ${
                    cell.isCurrentMonth
                      ? 'bg-white dark:bg-slate-900/10'
                      : 'bg-slate-50/40 text-slate-400 dark:bg-slate-950/5 dark:text-slate-650'
                  } ${
                    isOver ? 'bg-indigo-500/[0.04] dark:bg-indigo-500/[0.02] border-indigo-500 ring-2 ring-indigo-500/20 z-10' : ''
                  }`}
                >
                  {/* Cell day number */}
                  <div className="flex items-center justify-between w-full mb-1">
                    <span 
                      className={`text-xs md:text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center transition-all ${
                        isToday 
                          ? 'bg-indigo-600 text-white shadow-md' 
                          : cell.isCurrentMonth
                            ? 'text-slate-700 dark:text-slate-300'
                            : 'text-slate-400 dark:text-slate-650'
                      }`}
                    >
                      {cell.date.getUTCDate()}
                    </span>
                  </div>

                  {/* Day events badges stack */}
                  <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto scrollbar-none z-10">
                    {cellEvents.map((ev) => {
                      const style = CATEGORY_MAPS[ev.category] || CATEGORY_MAPS.Study;
                      return (
                        <div
                          key={ev._id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, ev._id)}
                          onClick={(e) => openEditModal(ev, e)}
                          className={`px-2 py-1 rounded-lg border text-[10px] font-semibold leading-normal flex items-center justify-between gap-1 shadow-sm transition-all hover:shadow-md hover:scale-[1.01] active:scale-95 ${style.classes}`}
                          title={`${ev.title}\n${ev.startTime} - ${ev.endTime}\nPriority: ${ev.priority}`}
                        >
                          <div className="flex items-center gap-1 truncate">
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot} flex-shrink-0`} />
                            <span className="truncate">{ev.title}</span>
                          </div>
                          <span className="text-[8px] opacity-75 font-mono flex-shrink-0">
                            {ev.startTime}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create / Edit Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl p-6 md:p-8 animate-scale-in max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {selectedEvent ? 'Edit Calendar Event' : 'Create Calendar Event'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {formatDisplayDate(dateVal)}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Error alerts */}
            {formError && (
              <div className="bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-450 p-4 rounded-2xl flex items-start gap-2.5 text-xs font-semibold mb-6 animate-pulse">
                <AlertTriangle className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveEvent} className="space-y-5">
              
              {/* Event Title */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CS101 Final Exam Prep"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-100 dark:focus:border-indigo-500/80"
                />
              </div>

              {/* Event Description */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                  Description
                </label>
                <textarea
                  placeholder="e.g. Focus on Chapter 4-6 practice questions and summary deck review."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-100 dark:focus:border-indigo-500/80 resize-none"
                />
              </div>

              {/* Date, Start and End Times */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Date Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Date
                  </label>
                  <input
                    type="date"
                    required
                    value={dateVal}
                    onChange={(e) => setDateVal(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-150 dark:focus:border-indigo-500/80 cursor-pointer"
                  />
                </div>

                {/* Start Time */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-150 dark:focus:border-indigo-500/80 cursor-pointer"
                  />
                </div>

                {/* End Time */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-150 dark:focus:border-indigo-500/80 cursor-pointer"
                  />
                </div>
              </div>

              {/* Category & Priority selector rows */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Category selectors */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5" /> Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-200 dark:focus:border-indigo-500/80 cursor-pointer"
                  >
                    <option value="Study">Study Session</option>
                    <option value="Exam">Exam / Test</option>
                    <option value="Assignment">Assignment</option>
                    <option value="Personal">Personal Reminder</option>
                  </select>
                </div>

                {/* Priority Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" /> Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-200 dark:focus:border-indigo-500/80 cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              {/* Reminder Offset Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block flex items-center gap-1">
                  <BellRing className="h-3.5 w-3.5" /> Reminder Time
                </label>
                <select
                  value={reminderOffset}
                  onChange={(e) => setReminderOffset(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-200 dark:focus:border-indigo-500/80 cursor-pointer"
                >
                  <option value="none">No Reminder</option>
                  <option value="at_time">At Event Time</option>
                  <option value="5_min">5 Minutes Before</option>
                  <option value="10_min">10 Minutes Before</option>
                  <option value="30_min">30 Minutes Before</option>
                  <option value="1_hour">1 Hour Before</option>
                  <option value="1_day">1 Day Before</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800 pt-5 mt-6">
                
                {/* Delete button (Conditional) */}
                {selectedEvent ? (
                  <button
                    type="button"
                    onClick={handleDeleteEvent}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 dark:text-rose-450 border border-transparent dark:border-rose-900/30 text-xs font-bold rounded-xl transition-all cursor-pointer hover:scale-102"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                ) : (
                  <div /> // Filler spacing
                )}

                {/* Cancel / Save stack */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4.5 py-2.5 bg-slate-50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/10 transition-all hover:scale-102 cursor-pointer"
                  >
                    <Check className="h-4 w-4" />
                    {selectedEvent ? 'Update Event' : 'Create Event'}
                  </button>
                </div>

              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
