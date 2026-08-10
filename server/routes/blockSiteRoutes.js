import express from 'express';
import {
  getBlockSites,
  createBlockSite,
  updateBlockSite,
  deleteBlockSite,
  syncBlockSites
} from '../controllers/blockSiteController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All block site routes require JWT authentication
router.use(protect);

router.route('/')
  .get(getBlockSites)
  .post(createBlockSite);

router.post('/sync', syncBlockSites);

router.route('/:id')
  .put(updateBlockSite)
  .delete(deleteBlockSite);

export default router;

