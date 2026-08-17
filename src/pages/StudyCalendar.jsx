import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar as CalendarIcon, 
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
  BellRing,
  BookOpen,
  GraduationCap,
  FileText,
  User,
  CalendarDays,
  TrendingUp
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { API_BASE_URL } from '../utils/api';

// Category color style maps (Google Calendar + Notion inspired)
const CATEGORY_MAPS = {
  Study: {
    color: 'indigo',
    classes: 'bg-indigo-50/90 border-indigo-200/80 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-900/60 dark:text-indigo-300',
    dot: 'bg-indigo-600',
    badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400',
    icon: BookOpen
  },
  Exam: {
    color: 'rose',
    classes: 'bg-rose-50/90 border-rose-200/80 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-300',
    dot: 'bg-rose-600',
    badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400',
    icon: GraduationCap
  },
  Assignment: {
    color: 'amber',
    classes: 'bg-amber-50/90 border-amber-200/80 text-amber-700 dark:bg-amber-950/40 dark:border-amber-900/60 dark:text-amber-300',
    dot: 'bg-amber-600',
    badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
    icon: FileText
  },
  Personal: {
    color: 'emerald',
    classes: 'bg-emerald-50/90 border-emerald-200/80 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-900/60 dark:text-emerald-300',
    dot: 'bg-emerald-600',
    badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
    icon: User
  }
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MINI_DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

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
      const response = await fetch(`${API_BASE_URL}/calendar`, {
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

  // Helper: Format date for display
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

    const originalEventIndex = events.findIndex(ev => ev._id === eventId);
    if (originalEventIndex === -1) return;
    
    const oldEvents = [...events];
    const updatedEvents = [...events];
    updatedEvents[originalEventIndex] = {
      ...updatedEvents[originalEventIndex],
      date: new Date(dateStr)
    };
    setEvents(updatedEvents);

    try {
      const response = await fetch(`${API_BASE_URL}/calendar/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ date: dateStr })
      });
      const data = await response.json();
      if (!data.success) {
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
    const formatted = formatLocalDate(dateObj || new Date());
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
    if (e) e.stopPropagation();
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

  const parseTimeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    setFormError('');

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
        response = await fetch(`${API_BASE_URL}/calendar/${selectedEvent._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch(`${API_BASE_URL}/calendar`, {
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
        fetchEvents();
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
      const response = await fetch(`${API_BASE_URL}/calendar/${selectedEvent._id}`, {
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

  // Filter and Search Logic
  const filteredEvents = events.filter(event => {
    const titleMatch = (event.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const descMatch = (event.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const searchMatch = titleMatch || descMatch;
    const categoryMatch = categoryFilter === 'All' || event.category === categoryFilter;
    const priorityMatch = priorityFilter === 'All' || event.priority === priorityFilter;

    return searchMatch && categoryMatch && priorityMatch;
  });

  const todayStr = formatLocalDate(new Date());
  const todayFormattedLong = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const calendarDays = getCalendarDays();

  // Categorized events
  const todayEvents = events.filter(e => formatLocalDate(e.date) === todayStr);
  const upcomingEvents = events
    .filter(e => formatLocalDate(e.date) >= todayStr)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  
  const upcomingExams = upcomingEvents.filter(e => e.category === 'Exam');
  const upcomingAssignments = upcomingEvents.filter(e => e.category === 'Assignment');
  const upcomingStudy = upcomingEvents.filter(e => e.category === 'Study');

  // Current month stats
  const currentYear = currentDate.getFullYear();
  const currentMonthNum = currentDate.getMonth();
  const monthEvents = events.filter(e => {
    const d = new Date(e.date);
    return d.getUTCFullYear() === currentYear && d.getUTCMonth() === currentMonthNum;
  });

  const totalMonthEvents = monthEvents.length;
  const studySessionsCount = monthEvents.filter(e => e.category === 'Study').length;
  const completedMonthEvents = monthEvents.filter(e => formatLocalDate(e.date) < todayStr).length;
  const upcomingMonthEvents = monthEvents.filter(e => formatLocalDate(e.date) >= todayStr).length;
  const monthlyProgressPercent = totalMonthEvents > 0 ? Math.round((completedMonthEvents / totalMonthEvents) * 100) : 0;

  return (
    <div className="flex-1 overflow-y-auto px-3.5 py-4 sm:px-6 sm:py-6 transition-colors duration-300 relative">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* TOP SECTION */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            
            {/* Title & Month Picker */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Study Calendar
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Plan exam milestones, assignments, and study sessions.
                </p>
              </div>

              {/* Current Month Navigation Pill */}
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl px-2.5 py-1">
                <button
                  onClick={handlePrevMonth}
                  className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
                  title="Previous Month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-bold text-slate-900 dark:text-white px-2 min-w-[110px] text-center">
                  {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                </span>
                <button
                  onClick={handleNextMonth}
                  className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
                  title="Next Month"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  onClick={handleGoToday}
                  className="ml-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline px-1.5"
                >
                  Today
                </button>
              </div>
            </div>

            {/* Search, Filters & Add Event Action */}
            <div className="flex flex-wrap items-center gap-2.5">
              
              {/* Search Events */}
              <div className="relative flex-1 sm:w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                {['All', 'Study', 'Exam', 'Assignment'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                      categoryFilter === cat
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* + Add Event Button */}
              <button
                onClick={() => openCreateModal(new Date())}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold px-3.5 py-1.5 shadow-sm transition-all whitespace-nowrap"
              >
                <Plus className="h-4 w-4" />
                <span>Add Event</span>
              </button>

            </div>

          </div>
        </div>

        {/* MAIN 3-PANEL LAYOUT (Left, Center, Right) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          
          {/* LEFT PANEL (Mini Calendar, Today's Date, Upcoming, Monthly Progress) */}
          <div className="xl:col-span-3 space-y-4">
            
            {/* Today's Date & Quick Mini Calendar Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-4 shadow-sm space-y-3">
              
              {/* Today's Date Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Today's Date</span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{todayFormattedLong}</p>
                </div>
                <div className="h-7 w-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                  {new Date().getDate()}
                </div>
              </div>

              {/* Mini Calendar Grid */}
              <div className="space-y-1">
                <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-slate-400 dark:text-slate-500 py-1">
                  {MINI_DAYS.map((d, i) => <span key={i}>{d}</span>)}
                </div>
                <div className="grid grid-cols-7 text-center text-xs gap-y-1">
                  {calendarDays.slice(0, 35).map((cell, i) => {
                    const cellDateStr = formatLocalDate(cell.date);
                    const isToday = cellDateStr === todayStr;
                    const hasEvent = events.some(e => formatLocalDate(e.date) === cellDateStr);

                    return (
                      <button
                        key={i}
                        onClick={() => openCreateModal(cell.date)}
                        className={`h-6 w-6 mx-auto rounded-full flex flex-col items-center justify-center text-[11px] transition-all relative ${
                          isToday
                            ? 'bg-indigo-600 text-white font-bold'
                            : cell.isCurrentMonth
                            ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            : 'text-slate-300 dark:text-slate-600'
                        }`}
                      >
                        <span>{cell.date.getUTCDate()}</span>
                        {hasEvent && !isToday && (
                          <span className="w-1 h-1 rounded-full bg-indigo-500 -mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Monthly Progress Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  Monthly Progress
                </span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {monthlyProgressPercent}%
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${monthlyProgressPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                {completedMonthEvents} of {totalMonthEvents} events past/completed this month.
              </p>
            </div>

            {/* Upcoming Events Mini List */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Upcoming Events
                </h3>
                <span className="text-[10px] font-semibold text-slate-400">{upcomingEvents.length}</span>
              </div>

              {upcomingEvents.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-3">No upcoming events.</p>
              ) : (
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {upcomingEvents.slice(0, 4).map((ev) => {
                    const style = CATEGORY_MAPS[ev.category] || CATEGORY_MAPS.Study;
                    return (
                      <div
                        key={ev._id}
                        onClick={(e) => openEditModal(ev, e)}
                        className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-slate-200 cursor-pointer transition-all text-xs"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-semibold text-slate-900 dark:text-white truncate">{ev.title}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${style.badge}`}>
                            {ev.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                          <span>{formatDisplayDate(ev.date)}</span>
                          <span>•</span>
                          <span>{ev.startTime}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* CENTER: LARGE MONTHLY CALENDAR */}
          <div className="xl:col-span-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] shadow-sm overflow-hidden flex flex-col">
            
            {/* Days of week header */}
            <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-center py-2">
              {DAYS_OF_WEEK.map((day) => (
                <span key={day} className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                  {day}
                </span>
              ))}
            </div>

            {/* Monthly Grid */}
            {loading ? (
              <div className="h-[460px] flex flex-col items-center justify-center text-slate-400 gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-indigo-600"></div>
                <span className="text-xs font-semibold">Loading calendar...</span>
              </div>
            ) : (
              <div className="grid grid-cols-7 grid-rows-6 divide-x divide-y divide-slate-100 dark:divide-slate-800/80">
                {calendarDays.map((cell, idx) => {
                  const cellDateStr = formatLocalDate(cell.date);
                  const cellEvents = filteredEvents.filter(ev => formatLocalDate(ev.date) === cellDateStr);
                  const isToday = todayStr === cellDateStr;
                  const isOver = draggedOverDate === cellDateStr;

                  return (
                    <div
                      key={`${cellDateStr}-${idx}`}
                      onClick={() => openCreateModal(cell.date)}
                      onDragOver={(e) => handleDragOver(e, cellDateStr)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, cellDateStr)}
                      className={`min-h-[85px] p-1.5 flex flex-col gap-1 transition-colors relative group cursor-pointer ${
                        cell.isCurrentMonth
                          ? 'bg-white dark:bg-slate-900'
                          : 'bg-slate-50/40 text-slate-300 dark:bg-slate-950/20 dark:text-slate-600'
                      } ${
                        isOver ? 'bg-indigo-50/50 dark:bg-indigo-950/20 ring-1 ring-indigo-500' : ''
                      }`}
                    >
                      {/* Cell Day Header */}
                      <div className="flex items-center justify-between w-full">
                        <span 
                          className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                            isToday 
                              ? 'bg-indigo-600 text-white shadow-xs' 
                              : cell.isCurrentMonth
                              ? 'text-slate-700 dark:text-slate-300'
                              : 'text-slate-300 dark:text-slate-600'
                          }`}
                        >
                          {cell.date.getUTCDate()}
                        </span>
                      </div>

                      {/* Day events stack */}
                      <div className="flex-1 flex flex-col gap-1 overflow-y-auto max-h-[60px] scrollbar-none">
                        {cellEvents.map((ev) => {
                          const style = CATEGORY_MAPS[ev.category] || CATEGORY_MAPS.Study;
                          return (
                            <div
                              key={ev._id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, ev._id)}
                              onClick={(e) => openEditModal(ev, e)}
                              className={`px-1.5 py-0.5 rounded border text-[9px] font-semibold leading-tight flex items-center justify-between gap-1 shadow-2xs hover:shadow-xs transition-all ${style.classes}`}
                              title={`${ev.title} (${ev.startTime} - ${ev.endTime})`}
                            >
                              <div className="flex items-center gap-1 truncate">
                                <span className={`w-1.5 h-1.5 rounded-full ${style.dot} shrink-0`} />
                                <span className="truncate">{ev.title}</span>
                              </div>
                              <span className="text-[8px] opacity-75 font-mono shrink-0">
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

          {/* RIGHT PANEL (Today's Schedule & Upcoming Deadlines) */}
          <div className="xl:col-span-3 space-y-4">
            
            {/* Today's Schedule Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Today's Schedule
                </h3>
                <span className="text-[10px] font-semibold text-slate-400">{todayEvents.length}</span>
              </div>

              {todayEvents.length === 0 ? (
                <div className="text-center py-5 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">📅 No events scheduled.</p>
                  <button 
                    onClick={() => openCreateModal(new Date())} 
                    className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    + Add Event
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {todayEvents.map((ev) => {
                    const style = CATEGORY_MAPS[ev.category] || CATEGORY_MAPS.Study;
                    return (
                      <div
                        key={ev._id}
                        onClick={(e) => openEditModal(ev, e)}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-slate-200 cursor-pointer transition-all"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">{ev.title}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${style.badge}`}>{ev.category}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1">
                          <Clock className="h-3 w-3" />
                          <span>{ev.startTime} - {ev.endTime}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Upcoming Deadlines (Exams & Assignments) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Upcoming Deadlines
                </h3>
              </div>

              {/* Exams list */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <GraduationCap className="h-3 w-3" /> Exams ({upcomingExams.length})
                </span>
                {upcomingExams.length === 0 ? (
                  <p className="text-[11px] text-slate-400 pl-4 py-0.5">No exams scheduled.</p>
                ) : (
                  upcomingExams.slice(0, 2).map(ev => (
                    <div 
                      key={ev._id}
                      onClick={(e) => openEditModal(ev, e)}
                      className="p-2 bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-lg text-xs cursor-pointer hover:border-rose-200"
                    >
                      <span className="font-semibold text-slate-900 dark:text-white truncate block">{ev.title}</span>
                      <span className="text-[10px] text-rose-600 dark:text-rose-400">{formatDisplayDate(ev.date)}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Assignments list */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <FileText className="h-3 w-3" /> Assignments ({upcomingAssignments.length})
                </span>
                {upcomingAssignments.length === 0 ? (
                  <p className="text-[11px] text-slate-400 pl-4 py-0.5">No assignments scheduled.</p>
                ) : (
                  upcomingAssignments.slice(0, 2).map(ev => (
                    <div 
                      key={ev._id}
                      onClick={(e) => openEditModal(ev, e)}
                      className="p-2 bg-amber-50/40 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-lg text-xs cursor-pointer hover:border-amber-200"
                    >
                      <span className="font-semibold text-slate-900 dark:text-white truncate block">{ev.title}</span>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400">{formatDisplayDate(ev.date)}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Study Sessions list */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  <BookOpen className="h-3 w-3" /> Study Sessions ({upcomingStudy.length})
                </span>
                {upcomingStudy.length === 0 ? (
                  <p className="text-[11px] text-slate-400 pl-4 py-0.5">No study sessions scheduled.</p>
                ) : (
                  upcomingStudy.slice(0, 2).map(ev => (
                    <div 
                      key={ev._id}
                      onClick={(e) => openEditModal(ev, e)}
                      className="p-2 bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-lg text-xs cursor-pointer hover:border-indigo-200"
                    >
                      <span className="font-semibold text-slate-900 dark:text-white truncate block">{ev.title}</span>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400">{formatDisplayDate(ev.date)}</span>
                    </div>
                  ))
                )}
              </div>

            </div>

          </div>

        </div>

        {/* BOTTOM: MONTHLY STATISTICS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-4 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Events</span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{totalMonthEvents}</h3>
            <span className="text-[11px] text-slate-400 mt-0.5 block">{MONTHS[currentDate.getMonth()]}</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-4 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Study Sessions</span>
            <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{studySessionsCount}</h3>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Targeted learning</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-4 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Completed / Past</span>
            <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{completedMonthEvents}</h3>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Past dates</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-4 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Upcoming</span>
            <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">{upcomingMonthEvents}</h3>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Remaining in month</span>
          </div>

        </div>

      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-[14px] shadow-xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {selectedEvent ? 'Edit Event' : 'Create Event'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {formatDisplayDate(dateVal)}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Error message */}
            {formError && (
              <div className="mx-5 mt-4 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveEvent} className="p-5 space-y-4">
              
              {/* Event Title */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., CS101 Final Exam Prep"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Description
                </label>
                <textarea
                  placeholder="Notes, links or study objectives..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="2"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                />
              </div>

              {/* Date & Times */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={dateVal}
                    onChange={(e) => setDateVal(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Category & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="Study">Study Session</option>
                    <option value="Exam">Exam / Test</option>
                    <option value="Assignment">Assignment</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              {/* Reminder Offset */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Reminder
                </label>
                <select
                  value={reminderOffset}
                  onChange={(e) => setReminderOffset(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="none">No Reminder</option>
                  <option value="at_time">At Event Time</option>
                  <option value="5_min">5 Minutes Before</option>
                  <option value="15_min">15 Minutes Before</option>
                  <option value="30_min">30 Minutes Before</option>
                  <option value="1_hour">1 Hour Before</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                {selectedEvent ? (
                  <button
                    type="button"
                    onClick={handleDeleteEvent}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-xs"
                  >
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
