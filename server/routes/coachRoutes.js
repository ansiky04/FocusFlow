import express from 'express';
import { generateCoachReport, getCoachReports } from '../controllers/coachController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All coach endpoints require authentication
router.use(protect);

router.post('/generate', generateCoachReport);
router.get('/reports', getCoachReports);

export default router;
