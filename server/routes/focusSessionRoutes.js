import express from 'express';
import { 
  createSession, 
  getSessions, 
  getActiveSession, 
  startSession, 
  updateActiveSession 
} from '../controllers/focusSessionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/active', getActiveSession);
router.post('/start', startSession);
router.put('/active', updateActiveSession);

router.route('/')
  .get(getSessions)
  .post(createSession);

export default router;
