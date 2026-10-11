import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { query } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const COOKIE_NAME = 'stayease_token';

export function cookieOptions() {
  const sameSite = config.cookieSameSite;
  return {
    httpOnly: true,
    secure: config.isProd || sameSite === 'none',
    sameSite,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
}

export function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
}

async function loadUser(req) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return null;
  let payload;
  try {
    payload = jwt.verify(token, config.jwt.secret);
  } catch {
    return null;
  }
  // Role and active flag are always re-read from the database, never trusted from the token.
  const rows = await query('SELECT id, name, email, phone, address, role, is_active, created_at FROM users WHERE id = ?', [payload.id]);
  const user = rows[0];
  if (!user || !user.is_active) return null;
  return user;
}

export const authenticate = asyncHandler(async (req, _res, next) => {
  const user = await loadUser(req);
  if (!user) throw new AppError(401, 'Please log in to continue.');
  req.user = user;
  next();
});

export const requireAdmin = (req, _res, next) => {
  if (!req.user || req.user.role !== 'admin') return next(new AppError(403, 'Administrator access is required.'));
  next();
};
