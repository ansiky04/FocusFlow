import express from 'express';
import { 
  getChats, 
  sendMessage, 
  renameChat, 
  deleteChat, 
  clearAllChats 
} from '../controllers/aiChatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getChats)
  .post(sendMessage)
  .delete(clearAllChats);

router.route('/:chatId')
  .put(renameChat)
  .delete(deleteChat);

export default router;
