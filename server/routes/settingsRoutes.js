import express from 'express';
import { 
  getSettings, 
  updateSettings, 
  getExtensionShieldStatus 
} from '../controllers/settingsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/extension-shield', getExtensionShieldStatus);

router.route('/')
  .get(getSettings)
  .put(updateSettings);

export default router;
