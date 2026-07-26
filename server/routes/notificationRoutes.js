import express from 'express';
import {
  getNotifications,
  createNotification,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth middleware
router.use(protect);

router.route('/')
  .get(getNotifications)
  .post(createNotification);

router.route('/read-all')
  .put(markAllNotificationsRead);

router.route('/clear-all')
  .delete(clearAllNotifications);

router.route('/:id')
  .put(markNotificationRead)
  .delete(deleteNotification);

export default router;
