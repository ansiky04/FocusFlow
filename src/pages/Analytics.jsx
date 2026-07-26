import React, { useState, useEffect } from 'react';
import {
  Clock,
  Target,
  Flame,
  Activity,
  ShieldAlert,
  Globe,
  Hourglass,
  TrendingUp,
  Award
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

import AnalyticsCard from '../components/analytics/AnalyticsCard';
import SummaryCard from '../components/analytics/SummaryCard';
import GoalProgress from '../components/analytics/GoalProgress';
import ActivityTimeline from '../components/analytics/ActivityTimeline';
import AchievementCard from '../components/analytics/AchievementCard';
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

export default function Analytics() {
  const { token, theme: _theme } = useApp();
  const [analytics, setAnalytics] = useState(null);
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
      if (!token) return;
      try {
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
      }
    };

    fetchAnalytics();
  }, [token]);

  // Chart configs
  const isDark = document.documentElement.classList.contains('dark');
  const labelColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDark ? '#fff' : '#0f172a',
        bodyColor: isDark ? '#cbd5e1' : '#334155',
        borderColor: 'rgba(99, 102, 241, 0.2)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
        titleFont: { family: 'Plus Jakarta Sans', weight: 'bold' },
        bodyFont: { family: 'Plus Jakarta Sans' }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: labelColor,
          font: { family: 'Plus Jakarta Sans', weight: '600', size: 11 }
        }
      },
      y: {
        grid: { color: gridColor },
        ticks: {
          color: labelColor,
          font: { family: 'Plus Jakarta Sans', weight: '600', size: 11 }
        }
      }
    }
  };

  // Weekly dataset
  const weeklyLabels = analytics?.weeklyData ? analytics.weeklyData.map(d => d.day) : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyValues = analytics?.weeklyData ? analytics.weeklyData.map(d => d.hours) : [0, 0, 0, 0, 0, 0, 0];
  const weeklyChartData = {
    labels: weeklyLabels,
    datasets: [{
      label: 'Focus Hours',
      data: weeklyValues,
      backgroundColor: 'rgba(99, 102, 241, 0.85)',
      hoverBackgroundColor: 'rgba(99, 102, 241, 1)',
      borderRadius: 6,
      borderSkipped: false
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
      borderColor: 'rgba(168, 85, 247, 1)',
      backgroundColor: 'rgba(168, 85, 247, 0.12)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: 'rgba(168, 85, 247, 1)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6
    }]
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-10 transition-colors duration-300">

      {/* Page Header */}
      <div className="max-w-6xl mb-10 animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
          Analytics &{' '}
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Insights
          </span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
          Monitor your study timings, focus durations, streaks, and website blocker telemetry logs.
        </p>
      </div>

      <div className="max-w-7xl space-y-10">

        {/* Focus Insights Metrics Grid */}
        <section>
          <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
            Performance Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            <AnalyticsCard
              title="Today's Focus Time"
              value={`${dynamicStats.todayFocusHours.toFixed(1)} hrs`}
              icon={Clock}
              gradient="from-orange-500 to-amber-500"
              trend="Study time logged today"
              isPositive={true}
            />
            <AnalyticsCard
              title="Completed Sessions"
              value={String(dynamicStats.completedSessionsCount)}
              icon={Target}
              gradient="from-indigo-500 to-blue-500"
              trend="Ticking blocks completed"
              isPositive={true}
            />
            <AnalyticsCard
              title="Average Duration"
              value={`${dynamicStats.averageSessionDuration} mins`}
              icon={Hourglass}
              gradient="from-emerald-500 to-teal-500"
              trend="Average study block length"
              isPositive={true}
            />
            <AnalyticsCard
              title="Current Streak"
              value={`${analytics ? analytics.currentStreak : 0} days`}
              icon={Flame}
              gradient="from-rose-500 to-orange-500"
              trend="Active focus days"
              isPositive={true}
            />
            <AnalyticsCard
              title="Longest Streak"
              value={`${dynamicStats.longestStreak} days`}
              icon={Award}
              gradient="from-purple-500 to-pink-500"
              trend="Personal best streak"
              isPositive={true}
            />
            <AnalyticsCard
              title="Blocked Attempts"
              value={String(blockedStats.todayBlocked)}
              icon={ShieldAlert}
              gradient="from-rose-500 to-red-500"
              trend={`Total saved attempts: ${blockedStats.weeklyBlocked}`}
              isPositive={true}
            />
            <AnalyticsCard
              title="Most Distracting Site"
              value={blockedStats.mostDistractingWebsite}
              icon={Globe}
              gradient="from-violet-500 to-indigo-500"
              trend="Highest block intercept"
              isPositive={true}
            />
            <AnalyticsCard
              title="Productivity Score"
              value={`${analytics ? analytics.productivityScore : 0}%`}
              icon={TrendingUp}
              gradient="from-cyan-500 to-blue-500"
              trend="Focus efficiency index"
              isPositive={true}
            />
          </div>
        </section>

        {/* Charts Section using Chart.js */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Weekly focus chart */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Activity className="h-4.5 w-4.5 text-indigo-500" /> Weekly Focus Progress (Hours)
            </h3>
            <div className="h-72">
              <Bar data={weeklyChartData} options={chartOptions} />
            </div>
          </div>

          {/* Monthly focus chart */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-purple-500" /> Monthly Focus Trends (Hours)
            </h3>
            <div className="h-72">
              <Line data={monthlyChartData} options={chartOptions} />
            </div>
          </div>

        </section>

        {/* Today's Summary & Goal Progress */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SummaryCard />
          </div>
          <div className="lg:col-span-1">
            <GoalProgress />
          </div>
        </section>

        {/* Achievements & Activity Timeline */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AchievementCard />
          </div>
          <div className="lg:col-span-1">
            <ActivityTimeline />
          </div>
        </section>

      </div>
    </div>
  );
}
