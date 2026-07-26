import express from 'express';
import { 
  getTasks, 
  createTask, 
  updateTask, 
  deleteTask 
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authorization guard middleware to all task endpoints
router.use(protect);

// Mappings for /api/tasks
router.route('/')
  .get(getTasks)
  .post(createTask);

// Mappings for /api/tasks/:id
router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

export default router;
