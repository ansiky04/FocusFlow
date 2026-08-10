import mongoose from 'mongoose';

/**
 * Controller to handle Health check API request.
 * @route GET /api/health
 * @access Public
 */
export const getHealth = (req, res) => {
  const dbState = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({
    success: true,
    message: "FocusFlow Backend Running",
    dbState
  });
};
