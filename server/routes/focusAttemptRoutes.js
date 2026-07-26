import express from 'express';
import { createFocusAttempt } from '../controllers/focusAttemptController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Require authentication for logging attempts
router.use(protect);

router.route('/')
  .post(createFocusAttempt);

export default router;
