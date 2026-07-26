import express from 'express';
import {
  registerUser,
  loginUser,
  getCurrentUser
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes for user registration and login
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected route to fetch currently logged-in user profile details
router.get('/me', protect, getCurrentUser);

export default router;
