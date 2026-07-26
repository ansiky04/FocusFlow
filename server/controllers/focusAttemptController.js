import FocusAttempt from '../models/FocusAttempt.js';
import FocusSession from '../models/FocusSession.js';

/**
 * Log a blocked website navigation attempt.
 * @route POST /api/focus-attempt
 * @access Private
 */
export const createFocusAttempt = async (req, res, next) => {
  const { website } = req.body;

  try {
    if (!website || !website.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Website domain name is required'
      });
    }

    // Sanitize domain
    let domain = website.trim().toLowerCase();
    domain = domain.replace(/^(https?:\/\/)?(www\.)?/, '');

    // Search for currently active Focus session
    const activeSession = await FocusSession.findOne({
      userId: req.user._id,
      status: 'active',
      sessionType: 'Focus'
    });

    const attempt = await FocusAttempt.create({
      userId: req.user._id,
      sessionId: activeSession ? activeSession._id : null,
      website: domain,
      time: new Date()
    });

    res.status(201).json({
      success: true,
      attempt
    });
  } catch (error) {
    next(error);
  }
};
