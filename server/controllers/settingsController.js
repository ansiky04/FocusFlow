import Settings from '../models/Settings.js';
import FocusSession from '../models/FocusSession.js';
import BlockSite from '../models/BlockSite.js';

/**
 * Fetch settings configuration mapping for the authenticated user.
 * @route GET /api/settings
 * @access Private
 */
export const getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne({ userId: req.user._id });

    // Auto-initialize settings block with context default values if missing in DB
    if (!settings) {
      settings = await Settings.create({
        userId: req.user._id,
        theme: 'dark',
        accentColor: 'indigo',
        notifications: {
          focusAlerts: true,
          breakAlerts: true,
          dailyReminders: true,
          achievementBadges: true,
        },
        timerSettings: {
          focusDuration: 25,
          shortBreak: 5,
          longBreak: 15,
          autoStartBreak: false,
          autoStartNextSession: false,
        },
        ambientSound: {
          volume: 0.5,
          activeTrack: null,
        },
        language: 'en',
        focusShield: {
          blockedWebsites: ['youtube.com', 'instagram.com', 'facebook.com', 'x.com', 'reddit.com', 'discord.com'],
          isEnabled: false,
        }
      });
    }

    res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update configurations settings values.
 * @route PUT /api/settings
 * @access Private
 */
export const updateSettings = async (req, res, next) => {
  const { theme, accentColor, notifications, timerSettings, ambientSound, language, focusShield } = req.body;

  try {
    let settings = await Settings.findOne({ userId: req.user._id });

    if (!settings) {
      settings = new Settings({ userId: req.user._id });
    }

    // Apply updates parameter overrides safely
    if (theme !== undefined) settings.theme = theme;
    if (accentColor !== undefined) settings.accentColor = accentColor;
    if (notifications !== undefined) settings.notifications = { ...settings.notifications, ...notifications };
    if (timerSettings !== undefined) settings.timerSettings = { ...settings.timerSettings, ...timerSettings };
    if (ambientSound !== undefined) settings.ambientSound = { ...settings.ambientSound, ...ambientSound };
    if (language !== undefined) settings.language = language;
    if (focusShield !== undefined) settings.focusShield = { ...settings.focusShield, ...focusShield };

    const updatedSettings = await settings.save();

    res.status(200).json({
      success: true,
      settings: updatedSettings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resolve shield blocking status for extensions.
 * @route GET /api/settings/extension-shield
 * @access Private
 */
export const getExtensionShieldStatus = async (req, res, next) => {
  try {
    const settings = await Settings.findOne({ userId: req.user._id });
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings profile not found',
      });
    }

    // Verify if an active focus session is currently ticking
    const activeSession = await FocusSession.findOne({
      userId: req.user._id,
      status: 'active',
      sessionType: 'Focus',
    });

    const shieldActive = !!activeSession;
    let remainingTime = 0;

    if (activeSession && activeSession.endTime) {
      remainingTime = Math.max(0, Math.round((new Date(activeSession.endTime) - new Date()) / 1000));
    }

    // Query Custom BlockSite collection for this user's enabled sites
    const customBlockedSites = await BlockSite.find({ userId: req.user._id, enabled: true });
    const blockedWebsites = customBlockedSites.map(site => site.website);

    res.status(200).json({
      success: true,
      shieldActive,
      blockedWebsites,
      remainingTime,
    });
  } catch (error) {
    next(error);
  }
};
