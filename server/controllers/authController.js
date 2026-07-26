import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

/**
 * Register a new FocusFlow user profile.
 * @route POST /api/auth/register
 * @access Public
 */
export const registerUser = async (req, res, next) => {
  const { fullName, email, password } = req.body;

  try {
    // 1. Validate required fields presence
    if (!fullName || !email || !password) {
      res.status(400);
      throw new Error('Please enter all required fields: fullName, email, and password');
    }

    // 2. Prevent duplicate email accounts
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists with this email address');
    }

    // 3. Hash password using bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create user profile in Database
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
    });

    // 5. Generate signed JWT token
    const token = generateToken(user._id);

    // 6. Return response payload (excluding password field)
    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        studyGoal: user.studyGoal,
        dailyGoal: user.dailyGoal,
        weeklyGoal: user.weeklyGoal,
        monthlyGoal: user.monthlyGoal,
        streak: user.streak,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error); // Direct error to global middleware
  }
};

/**
 * Authenticate credentials and login user.
 * @route POST /api/auth/login
 * @access Public
 */
export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // 1. Validate input fields
    if (!email || !password) {
      res.status(400);
      throw new Error('Please enter both email and password');
    }

    // 2. Find user in Database
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    // 3. Compare passwords using bcryptjs
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    // 4. Sign token on matching credentials
    const token = generateToken(user._id);

    // 5. Send response payload (excluding password)
    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        studyGoal: user.studyGoal,
        dailyGoal: user.dailyGoal,
        weeklyGoal: user.weeklyGoal,
        monthlyGoal: user.monthlyGoal,
        streak: user.streak,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch information of the currently authenticated user.
 * @route GET /api/auth/me
 * @access Private
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    // req.user has already been set by protect middleware
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};
