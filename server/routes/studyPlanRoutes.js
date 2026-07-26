import express from 'express';
import { 
  generateStudyPlan, 
  getStudyPlans, 
  updateStudyPlanProgress,
  deleteStudyPlan
} from '../controllers/studyPlanController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/generate', generateStudyPlan);
router.get('/', getStudyPlans);
router.put('/:id/progress', updateStudyPlanProgress);
router.delete('/:id', deleteStudyPlan);

export default router;
