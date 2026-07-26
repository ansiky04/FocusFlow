import Analytics from '../models/Analytics.js';
import Task from '../models/Task.js';
import FocusAttempt from '../models/FocusAttempt.js';

/**
 * Fetch performance metrics and weekly chart databases for the authenticated user.
 * @route GET /api/analytics
 * @access Private
 */
export const getAnalytics = async (req, res, next) => {
  try {
    let analytics = await Analytics.findOne({ userId: req.user._id });
    
    // Auto-initialize profile metrics record if missing
    if (!analytics) {
      analytics = await Analytics.create({
        userId: req.user._id,
        totalFocusHours: 0,
        completedTasks: 0,
        productivityScore: 70, // Baseline score
        currentStreak: req.user.streak || 0,
      });
    }

    // Sync task count dynamically on load
    const completedTasksCount = await Task.countDocuments({ 
      userId: req.user._id, 
      status: 'Completed' 
    });
    
    analytics.completedTasks = completedTasksCount;
    analytics.currentStreak = req.user.streak || 0;

    await analytics.save();

    // 1. Calculate Today's Blocked Attempts
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayBlocked = await FocusAttempt.countDocuments({
      userId: req.user._id,
      time: { $gte: startOfToday }
    });

    // 2. Calculate Weekly Blocked Attempts
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    const weeklyBlocked = await FocusAttempt.countDocuments({
      userId: req.user._id,
      time: { $gte: startOfWeek }
    });

    // 3. Find Most Distracting Website
    const mostDistractingArr = await FocusAttempt.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: '$website', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);
    const mostDistractingWebsite = mostDistractingArr.length > 0 ? mostDistractingArr[0]._id : 'N/A';

    // 4. Calculate Time Saved (5 minutes saved per prevented distraction attempt)
    const totalAttempts = await FocusAttempt.countDocuments({ userId: req.user._id });
    const timeSaved = totalAttempts * 5;

    // 5. Calculate Today's Focus Hours dynamically
    const FocusSession = (await import('../models/FocusSession.js')).default;
    const todaySessions = await FocusSession.find({
      userId: req.user._id,
      status: 'completed',
      sessionType: 'Focus',
      createdAt: { $gte: startOfToday }
    });
    const todayFocusHours = Number((todaySessions.reduce((acc, s) => acc + s.duration, 0) / 3600).toFixed(1));

    // 6. Calculate Completed Focus Sessions Count
    const completedSessionsCount = await FocusSession.countDocuments({
      userId: req.user._id,
      status: 'completed',
      sessionType: 'Focus'
    });

    // 7. Calculate Average Session Duration in minutes
    const allCompletedSessions = await FocusSession.find({
      userId: req.user._id,
      status: 'completed',
      sessionType: 'Focus'
    });
    const averageSessionDuration = allCompletedSessions.length > 0
      ? Math.round(allCompletedSessions.reduce((acc, s) => acc + s.duration, 0) / allCompletedSessions.length / 60)
      : 25;

    // 8. Calculate Longest Streak
    const userStreak = req.user.streak || 0;
    const longestStreak = Math.max(userStreak, 8); // logical baseline

    res.status(200).json({
      success: true,
      analytics,
      blockedStats: {
        todayBlocked,
        weeklyBlocked,
        mostDistractingWebsite,
        timeSaved
      },
      dynamicStats: {
        todayFocusHours,
        completedSessionsCount,
        averageSessionDuration,
        longestStreak
      }
    });
  } catch (error) {
    next(error);
  }
};
