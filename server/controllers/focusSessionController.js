import FocusSession from '../models/FocusSession.js';
import Analytics from '../models/Analytics.js';

/**
 * Save a completed focus session and update user analytics metrics automatically.
 * @route POST /api/sessions
 * @access Private
 */
export const createSession = async (req, res, next) => {
  const { duration, completed, sessionType, startedAt, endedAt } = req.body;

  try {
    if (!duration || !sessionType) {
      res.status(400);
      throw new Error('Session duration and type are required');
    }

    const session = await FocusSession.create({
      userId: req.user._id,
      duration,
      completed: completed ?? true,
      sessionType,
      startedAt: startedAt || new Date(),
      endedAt: endedAt || new Date(),
    });

    // Automatically update user's total focus hours and weekly charts if sessionType is 'Focus'
    if (completed && sessionType === 'Focus') {
      const hoursAdded = duration / 3600; // Translate seconds to hours

      let analytics = await Analytics.findOne({ userId: req.user._id });
      if (!analytics) {
        analytics = new Analytics({ userId: req.user._id });
      }

      analytics.totalFocusHours += hoursAdded;
      analytics.productivityScore = Math.min(100, Math.round(analytics.productivityScore + 1.5));

      // Update weekly focus hours arrays
      const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const currentDay = weekdayNames[new Date().getDay()];

      analytics.weeklyData = analytics.weeklyData.map(item =>
        item.day === currentDay ? { ...item, hours: item.hours + hoursAdded } : item
      );

      await analytics.save();
    }

    res.status(201).json({
      success: true,
      session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch all sessions logged for the user.
 * @route GET /api/sessions
 * @access Private
 */
export const getSessions = async (req, res, next) => {
  try {
    const sessions = await FocusSession.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: sessions.length,
      sessions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get active running focus session for logged-in user.
 * @route GET /api/sessions/active
 * @access Private
 */
export const getActiveSession = async (req, res, next) => {
  try {
    let session = await FocusSession.findOne({
      userId: req.user._id,
      status: { $in: ['active', 'paused'] }
    });

    if (session) {
      if (session.status === "active" && session.endTime) {
        const secondsLeft = Math.max(
          0,
          Math.floor((new Date(session.endTime) - Date.now()) / 1000)
        );

        session.remainingTime = secondsLeft;
        await session.save();
      }
      // Check if session has expired while the browser was closed
      if (session.status === 'active' && session.endTime && new Date() > new Date(session.endTime)) {
        session.status = 'completed';
        session.completed = true;
        session.remainingTime = 0;
        session.endedAt = session.endTime;
        await session.save();

        // Increment user focus hours analytics logs
        if (session.sessionType === 'Focus') {
          const hoursAdded = session.duration / 3600;
          let analytics = await Analytics.findOne({ userId: req.user._id });
          if (!analytics) {
            analytics = new Analytics({ userId: req.user._id });
          }
          analytics.totalFocusHours += hoursAdded;
          analytics.productivityScore = Math.min(100, Math.round(analytics.productivityScore + 1.5));

          const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const currentDay = weekdayNames[new Date(session.endTime).getDay()];
          analytics.weeklyData = analytics.weeklyData.map(item =>
            item.day === currentDay ? { ...item, hours: item.hours + hoursAdded } : item
          );
          await analytics.save();
        }
      }
    }

    res.status(200).json({
      success: true,
      session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Start a new focus session (cancels existing active sessions).
 * @route POST /api/sessions/start
 * @access Private
 */
export const startSession = async (req, res, next) => {
  const { duration, sessionType } = req.body;

  try {
    if (!duration || !sessionType) {
      res.status(400);
      throw new Error('Duration and sessionType are required to start a session');
    }

    // Cancel all previously running sessions
    await FocusSession.updateMany(
      { userId: req.user._id, status: { $in: ['active', 'paused'] } },
      { status: 'cancelled', endedAt: new Date() }
    );

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + duration * 1000);

    const session = await FocusSession.create({
      userId: req.user._id,
      duration,
      remainingTime: duration,
      status: 'active',
      startTime,
      endTime,
      sessionType,
      startedAt: startTime,
    });

    res.status(201).json({
      success: true,
      session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update the active focus session (pauses, resumes, completes, or cancels).
 * @route PUT /api/sessions/active
 * @access Private
 */
export const updateActiveSession = async (req, res, next) => {
  const { status, remainingTime } = req.body;

  try {
    const session = await FocusSession.findOne({
      userId: req.user._id,
      status: { $in: ['active', 'paused'] }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'No active focus session found to update',
      });
    }

    if (status) session.status = status;
    if (remainingTime !== undefined) session.remainingTime = remainingTime;

    if (status === 'paused') {
      session.endTime = null;
    } else if (status === 'active') {
      // Re-initialize endTime relative to current clock time + remaining seconds
      const secondsLeft = remainingTime !== undefined ? remainingTime : session.remainingTime;
      session.endTime = new Date(Date.now() + secondsLeft * 1000);
    } else if (status === 'completed') {
      session.completed = true;
      session.remainingTime = 0;
      session.endedAt = new Date();

      // Automatically sync performance totals inside Analytics
      if (session.sessionType === 'Focus') {
        const hoursAdded = session.duration / 3600;
        let analytics = await Analytics.findOne({ userId: req.user._id });
        if (!analytics) {
          analytics = new Analytics({ userId: req.user._id });
        }
        analytics.totalFocusHours += hoursAdded;
        analytics.productivityScore = Math.min(100, Math.round(analytics.productivityScore + 1.5));

        const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const currentDay = weekdayNames[new Date().getDay()];
        analytics.weeklyData = analytics.weeklyData.map(item =>
          item.day === currentDay ? { ...item, hours: item.hours + hoursAdded } : item
        );
        await analytics.save();
      }
    } else if (status === 'cancelled') {
      session.endedAt = new Date();
    }

    await session.save();

    res.status(200).json({
      success: true,
      session,
    });
  } catch (error) {
    next(error);
  }
};
