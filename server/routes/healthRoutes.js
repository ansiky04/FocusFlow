import express from 'express';
import { getHealth } from '../controllers/healthController.js';

const router = express.Router();

// Map / to getHealth controller
router.get('/', getHealth);

export default router;
