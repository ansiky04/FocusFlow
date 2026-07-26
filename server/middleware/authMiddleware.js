import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to protect private API routes.
 * Decodes the Bearer token or Cookie token, verifies signatures,
 * and fetches the matching user profile (excluding the password) from the DB.
 */
export const protect = async (req, res, next) => {
  let token;

  // 1. Check HTTP Authorization headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user profile from DB (excluding password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        return next(new Error('Not authorized: User profile not found'));
      }

      return next();
    } catch (error) {
      console.error("Token verification error:", error.message);
      res.status(401);
      return next(new Error('Not authorized: JWT signature verification failed'));
    }
  }

  // 2. Fallback check for HTTP-only cookies
  if (req.cookies && req.cookies.token) {
    try {
      token = req.cookies.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        return next(new Error('Not authorized: User profile not found'));
      }

      return next();
    } catch (error) {
      console.error("Cookie verification error:", error.message);
      res.status(401);
      return next(new Error('Not authorized: JWT cookie verification failed'));
    }
  }

  // 3. Reject if no token is parsed
  if (!token) {
    res.status(401);
    return next(new Error('Not authorized: No authentication token provided'));
  }
};
