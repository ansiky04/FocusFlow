import express from 'express';
import {
  getCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from '../controllers/calendarController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth protection to all routes
router.use(protect);

router.route('/')
  .get(getCalendarEvents)
  .post(createCalendarEvent);

router.route('/:id')
  .put(updateCalendarEvent)
  .delete(deleteCalendarEvent);

export default router;
