import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

// Load config configurations from environment file
dotenv.config();

// Imports custom middleware and database connection config
import { connectDatabase } from './config/database.js';
import { notFound } from './middleware/notFoundMiddleware.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import focusSessionRoutes from './routes/focusSessionRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import aiChatRoutes from './routes/aiChatRoutes.js';
import blockSiteRoutes from './routes/blockSiteRoutes.js';
import focusAttemptRoutes from './routes/focusAttemptRoutes.js';
import coachRoutes from './routes/coachRoutes.js';
import studyPlanRoutes from './routes/studyPlanRoutes.js';
import calendarRoutes from './routes/calendarRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import habitRoutes from './routes/habitRoutes.js';

const app = express();

// Request logging middleware using Morgan
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Enable Cross-Origin Resource Sharing (CORS)
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin?.startsWith('chrome-extension://') || origin?.startsWith('extension://')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
}));

// Parses incoming JSON request payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Parses Cookie headers
app.use(cookieParser());

// Mount router endpoints
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/sessions', focusSessionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/ai-chat', aiChatRoutes);
app.use('/api/block-sites', blockSiteRoutes);
app.use('/api/focus-attempt', focusAttemptRoutes);
app.use('/api/coach', coachRoutes);
app.use('/api/study-plans', studyPlanRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/habits', habitRoutes);

// Fallbacks for unmatched routes and runtime errors
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Initialize database connection safely
connectDatabase();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`FocusFlow Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
