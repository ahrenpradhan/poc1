import { verifyToken } from '../utils/auth.js';

/**
 * Auth middleware for Mercurius GraphQL context
 * Extracts JWT token from Authorization header and verifies it
 * Adds user info to context if token is valid
 */
export const authMiddleware = async (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return { user: null };
  }

  // Extract token from "Bearer <token>" format
  const token = authHeader.replace('Bearer ', '');

  if (!token) {
    return { user: null };
  }

  // Verify token
  const decoded = verifyToken(token);

  if (!decoded) {
    return { user: null };
  }

  return { user: decoded };
};
