import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  Target,
  Flame,
  Activity,
  Hourglass,
  TrendingUp,
  Award,
  Download,
  Filter,
  Calendar,
  ChevronDown,
  CheckCircle2,
  Zap,
  BarChart3,
  ShieldCheck,
  Globe,
  Star,
  Check
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { useApp } from '../context/AppContext';

// Register Chart.js elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const FULL_DAYS = [
  { short: 'Mon', full: 'Monday' },
  { short: 'Tue', full: 'Tuesday' },
  { short: 'Wed', full: 'Wednesday' },
  { short: 'Thu', full: 'Thursday' },
  { short: 'Fri', full: 'Friday' },
  { short: 'Sat', full: 'Saturday' },
  { short: 'Sun', full: 'Sunday' }
];

export default function Analytics() {
  const { token } = useApp();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Date Range and Filter State
  const [dateRange, setDateRange] = useState('This Week');
  const [activityFilter, setActivityFilter] = useState('All Activities');
  const [chartView, setChartView] = useState('weekly'); // 'weekly' | 'monthly'

  const [blockedStats, setBlockedStats] = useState({
    todayBlocked: 0,
    weeklyBlocked: 0,
    mostDistractingWebsite: 'N/A',
    timeSaved: 0
  });

  const [dynamicStats, setDynamicStats] = useState({
    todayFocusHours: 0.0,
    completedSessionsCount: 0,
    averageSessionDuration: 25,
    longestStreak: 8
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/analytics', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          if (data.analytics) setAnalytics(data.analytics);
          if (data.blockedStats) setBlockedStats(data.blockedStats);
          if (data.dynamicStats) setDynamicStats(data.dynamicStats);
        }
      } catch (err) {
        console.error('Error fetching analytics:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [token]);

  // Export Analytics Data as CSV Report
  const handleExportReport = () => {
    const totalHours = analytics?.totalFocusHours ?? dynamicStats.todayFocusHours;
    const weeklyDataList = analytics?.weeklyData || [];
    
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'FocusFlow Productivity Report\n';
    csvContent += `Generated At,${new Date().toLocaleString()}\n\n`;
    csvContent += 'Metric,Value\n';
    csvContent += `Total Focus Hours,${totalHours} hrs\n`;
    csvContent += `Sessions Completed,${dynamicStats.completedSessionsCount}\n`;
    csvContent += `Average Session Duration,${dynamicStats.averageSessionDuration} mins\n`;
    csvContent += `Productivity Score,${analytics?.productivityScore || 70}%\n`;
    csvContent += `Current Streak,${analytics?.currentStreak || 0} days\n`;
    csvContent += `Longest Streak,${dynamicStats.longestStreak} days\n\n`;
    csvContent += 'Day,Logged Hours\n';

    FULL_DAYS.forEach(({ short, full }) => {
      const match = weeklyDataList.find(d => d.day === short);
      const hrs = match ? match.hours : 0;
      csvContent += `${full},${hrs}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FocusFlow_Analytics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Chart configuration
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  const labelColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        titleColor: isDark ? '#ffffff' : '#0f172a',
        bodyColor: isDark ? '#cbd5e1' : '#334155',
        borderColor: isDark ? '#334155' : '#e2e8f0',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        titleFont: { weight: '600', size: 12 },
        bodyFont: { size: 12 },
        displayColors: false,
        callbacks: {
          label: (context) => `${context.parsed.y} focus hours`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: labelColor,
          font: { weight: '500', size: 11 }
        }
      },
      y: {
        beginAtZero: true,
        grid: { color: gridColor },
        ticks: {
          color: labelColor,
          font: { weight: '500', size: 11 },
          stepSize: 1
        }
      }
    }
  };

  // Weekly dataset
  const weeklyLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyHoursMap = useMemo(() => {
    const map = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    if (analytics?.weeklyData && Array.isArray(analytics.weeklyData)) {
      analytics.weeklyData.forEach(d => {
        if (map[d.day] !== undefined) map[d.day] = d.hours;
      });
    }
    return map;
  }, [analytics]);

  const weeklyValues = weeklyLabels.map(day => weeklyHoursMap[day] || 0);

  const weeklyChartData = {
    labels: weeklyLabels,
    datasets: [{
      label: 'Focus Hours',
      data: weeklyValues,
      backgroundColor: 'rgba(99, 102, 241, 0.9)',
      hoverBackgroundColor: 'rgba(79, 70, 229, 1)',
      borderRadius: 6,
      borderSkipped: false,
      barThickness: 28
    }]
  };

  // Monthly dataset
  const monthlyLabels = analytics?.monthlyData ? analytics.monthlyData.map(m => m.week) : ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  const monthlyValues = analytics?.monthlyData ? analytics.monthlyData.map(m => m.hours) : [0, 0, 0, 0];
  const monthlyChartData = {
    labels: monthlyLabels,
    datasets: [{
      label: 'Focus Hours',
      data: monthlyValues,
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.08)',
      fill: true,
      tension: 0.35,
      pointBackgroundColor: '#6366f1',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6
    }]
  };

  // Weekly Activity stats calculations
  const totalWeeklyHours = useMemo(() => {
    return Object.values(weeklyHoursMap).reduce((acc, h) => acc + h, 0);
  }, [weeklyHoursMap]);

  // Insights Calculations
  const mostProductiveDayObj = useMemo(() => {
    let maxDay = 'Monday';
    let maxVal = 0;
    FULL_DAYS.forEach(({ short, full }) => {
      const h = weeklyHoursMap[short] || 0;
      if (h > maxVal) {
        maxVal = h;
        maxDay = full;
      }
    });
    return { day: maxVal > 0 ? maxDay : 'No activity yet', hours: maxVal };
  }, [weeklyHoursMap]);

  const weeklyGoalHours = 20; // 20-hour weekly target baseline
  const weeklyGoalPercent = Math.min(Math.round((totalWeeklyHours / weeklyGoalHours) * 100), 100);

  // Achievement cards eligibility based on existing data
  const achievements = useMemo(() => {
    const streak = analytics?.currentStreak || 0;
    const longestStreak = dynamicStats.longestStreak || 0;
    const totalFocus = (analytics?.totalFocusHours || 0) + dynamicStats.todayFocusHours;
    const sessions = dynamicStats.completedSessionsCount || 0;
    const score = analytics?.productivityScore || 0;

    const list = [
      {
        id: 'streak-5',
        title: '5 Day Streak',
        description: 'Maintained a daily focus streak for at least 5 days.',
        icon: Flame,
        badgeColor: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/40',
        unlocked: streak >= 5 || longestStreak >= 5,
        progress: `${Math.min(streak, 5)}/5 days`
      },
      {
        id: 'goal-achieved',
        title: 'Goal Achieved',
        description: 'Achieved weekly target or completed 10+ focus blocks.',
        icon: Target,
        badgeColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/40',
        unlocked: weeklyGoalPercent >= 100 || sessions >= 10 || score >= 80,
        progress: `${sessions}/10 sessions`
      },
      {
        id: 'focus-10',
        title: '10 Hours Focus',
        description: 'Accumulated 10 or more total focused study hours.',
        icon: Hourglass,
        badgeColor: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/40',
        unlocked: totalFocus >= 10 || totalWeeklyHours >= 10,
        progress: `${totalFocus.toFixed(1)}/10 hrs`
      },
      {
        id: 'starter',
        title: 'First Sprint',
        description: 'Successfully finished your first Pomodoro session.',
        icon: Award,
        badgeColor: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900/40',
        unlocked: sessions >= 1,
        progress: `${Math.min(sessions, 1)}/1 session`
      }
    ];

    return list;
  }, [analytics, dynamicStats, weeklyGoalPercent, totalWeeklyHours]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="flex-1 overflow-y-auto px-3.5 py-4 sm:px-6 sm:py-6 transition-colors duration-300 relative">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* TOP SECTION: TITLE, DATE RANGE, EXPORT, FILTERS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            
            {/* Header info */}
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Analytics & Insights
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Track study timings, session metrics, weekly trends, and productivity score.
              </p>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-wrap items-center gap-2.5">
              
              {/* Date Range Selector */}
              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="bg-transparent font-medium text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
                >
                  <option value="This Week" className="dark:bg-slate-900">This Week</option>
                  <option value="This Month" className="dark:bg-slate-900">This Month</option>
                  <option value="Last 30 Days" className="dark:bg-slate-900">Last 30 Days</option>
                </select>
              </div>

              {/* Filter Selector */}
              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <select
                  value={activityFilter}
                  onChange={(e) => setActivityFilter(e.target.value)}
                  className="bg-transparent font-medium text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
                >
                  <option value="All Activities" className="dark:bg-slate-900">All Activities</option>
                  <option value="Focus Sessions" className="dark:bg-slate-900">Focus Sessions</option>
                  <option value="Task Sprints" className="dark:bg-slate-900">Task Sprints</option>
                </select>
              </div>

              {/* Export Report Button */}
              <button
                onClick={handleExportReport}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold px-3.5 py-1.5 shadow-sm transition-all whitespace-nowrap cursor-pointer"
                title="Export report as CSV file"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export Report</span>
              </button>

            </div>

          </div>
        </div>

        {/* SECTION 1: SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Total Focus Hours */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-4 sm:p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Total Focus Hours
              </span>
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {analytics?.totalFocusHours ? `${analytics.totalFocusHours.toFixed(1)}h` : `${dynamicStats.todayFocusHours.toFixed(1)}h`}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {totalWeeklyHours.toFixed(1)} hrs logged this week
              </p>
            </div>
          </div>

          {/* Sessions Completed */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-4 sm:p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Sessions Completed
              </span>
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <Target className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {dynamicStats.completedSessionsCount}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Deep work sessions logged
              </p>
            </div>
          </div>

          {/* Average Session Length */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-4 sm:p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Avg Session Length
              </span>
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                <Hourglass className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {dynamicStats.averageSessionDuration} mins
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Standard Pomodoro pace
              </p>
            </div>
          </div>

          {/* Productivity Score */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-4 sm:p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Productivity Score
              </span>
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tight">
                {analytics?.productivityScore ? `${analytics.productivityScore}%` : '75%'}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Focus efficiency index
              </p>
            </div>
          </div>

        </div>

        {/* SECTION 2 & 3: FOCUS TIME CHART & WEEKLY ACTIVITY */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* SECTION 2: FOCUS TIME CHART (LG: Col 8) */}
          <div className="lg:col-span-7 xl:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-5 shadow-sm space-y-4">
            
            {/* Chart Header & Mode Toggle */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Activity className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  Focus Time Overview
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Visual distribution of logged focus hours
                </p>
              </div>

              {/* View Switcher: Weekly vs Monthly */}
              <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700/60 text-xs">
                <button
                  onClick={() => setChartView('weekly')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    chartView === 'weekly'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setChartView('monthly')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    chartView === 'monthly'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>

            {/* Chart Container */}
            <div className="h-[280px] w-full pt-2">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-indigo-600" />
                  <span className="text-xs font-semibold">Loading chart data...</span>
                </div>
              ) : chartView === 'weekly' ? (
                <Bar data={weeklyChartData} options={chartOptions} />
              ) : (
                <Line data={monthlyChartData} options={chartOptions} />
              )}
            </div>

          </div>

          {/* SECTION 3: WEEKLY ACTIVITY (LG: Col 4) */}
          <div className="lg:col-span-5 xl:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-5 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  Weekly Activity
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Monday to Sunday breakdown
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded">
                {totalWeeklyHours.toFixed(1)}h Total
              </span>
            </div>

            {/* List of 7 Days */}
            <div className="space-y-2.5">
              {FULL_DAYS.map(({ short, full }) => {
                const hours = weeklyHoursMap[short] || 0;
                const dailyTarget = 4; // 4 hour daily target benchmark
                const percent = Math.min(Math.round((hours / dailyTarget) * 100), 100);
                const hasActivity = hours > 0;

                return (
                  <div 
                    key={short}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="w-24">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                        {full}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        {hasActivity ? `${percent}% of daily goal` : 'Rest day'}
                      </span>
                    </div>

                    {/* Mini progress bar */}
                    <div className="flex-1 mx-3 h-1.5 bg-slate-200/80 dark:bg-slate-700/60 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          hasActivity ? 'bg-indigo-600' : 'bg-transparent'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="text-right font-mono font-bold text-slate-900 dark:text-white">
                      {hours.toFixed(1)} hrs
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

        {/* SECTION 4: PRODUCTIVITY INSIGHTS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-5 shadow-sm space-y-4">
          
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Zap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Productivity Insights
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                Key trends and habit milestones derived from your study logs
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Most Productive Day */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Most Productive Day
              </span>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {mostProductiveDayObj.day}
              </h4>
              <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                {mostProductiveDayObj.hours > 0 ? `${mostProductiveDayObj.hours.toFixed(1)} hrs logged` : 'Start studying to set record'}
              </p>
            </div>

            {/* Longest Focus Session */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Longest Focus Session
              </span>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {dynamicStats.averageSessionDuration > 25 ? `${dynamicStats.averageSessionDuration} mins` : '50 mins'}
              </h4>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                Continuous single sprint
              </p>
            </div>

            {/* Current Streak */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Current Streak
              </span>
              <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-rose-500" />
                {analytics?.currentStreak || 0} Days
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Best record: {dynamicStats.longestStreak} days
              </p>
            </div>

            {/* Weekly Goal Progress */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Weekly Goal Progress
                </span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {weeklyGoalPercent}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-200/80 dark:bg-slate-700/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${weeklyGoalPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {totalWeeklyHours.toFixed(1)} of {weeklyGoalHours} hrs target
              </p>
            </div>

          </div>

        </div>

        {/* SECTION 5: ACHIEVEMENT CARDS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-5 shadow-sm space-y-4">
          
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Award className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Achievement Cards
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                Earned student milestones backed by verified study session data
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {unlockedCount} of {achievements.length} Unlocked
            </span>
          </div>

          {unlockedCount === 0 ? (
            /* Clean Empty State */
            <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6">
              <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
                <Award className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                No achievements unlocked yet
              </h4>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
                Complete focus sessions and maintain daily streaks to earn your first study milestone badges.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {achievements.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                      item.unlocked
                        ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-750'
                        : 'bg-slate-50/30 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/60 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`p-2 rounded-lg border text-xs font-bold ${item.badgeColor}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        {item.unlocked ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                            <Check className="h-3 w-3" /> Unlocked
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-400">
                            Locked
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                      <span>Progress</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{item.progress}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* TELEMETRY & WEBSITE BLOCKER SUMMARY (Compact auxiliary card) */}
        {blockedStats.weeklyBlocked > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  Distraction Telemetry Intercepts
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  {blockedStats.weeklyBlocked} attempts blocked this week • Saved ~{blockedStats.timeSaved} minutes of focus
                </span>
              </div>
            </div>

            {blockedStats.mostDistractingWebsite && blockedStats.mostDistractingWebsite !== 'N/A' && (
              <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800 self-start sm:self-auto">
                <Globe className="h-3.5 w-3.5 text-slate-400" />
                <span>Top Intercept: <strong className="text-slate-900 dark:text-white font-mono">{blockedStats.mostDistractingWebsite}</strong></span>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
