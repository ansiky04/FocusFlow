/**
 * Controller to handle Health check API request.
 * @route GET /api/health
 * @access Public
 */
export const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: "FocusFlow Backend Running"
  });
};
