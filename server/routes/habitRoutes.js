import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  getHabits, 
  createHabit, 
  updateHabit, 
  updateHabitLog, 
  deleteHabit 
} from '../controllers/habitController.js';

const router = express.Router();

// Require authentication for all habit endpoints
router.use(protect);

router.route('/')
  .get(getHabits)
  .post(createHabit);

router.route('/:id')
  .put(updateHabit)
  .delete(deleteHabit);

router.post('/:id/log', updateHabitLog);

export default router;
