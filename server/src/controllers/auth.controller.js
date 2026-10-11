import bcrypt from 'bcryptjs';
import * as User from '../models/user.model.js';
import { COOKIE_NAME, cookieOptions, signToken } from '../middleware/auth.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { cleanText, isEmail, isPhone, normalizePhone, passwordProblem } from '../utils/validators.js';

const publicUser = ({ password_hash, ...rest }) => rest;
const sendSession = (res, user, status = 200) => {
  res.cookie(COOKIE_NAME, signToken(user), cookieOptions());
  res.status(status).json({ success: true, user: publicUser(user) });
};

export const register = asyncHandler(async (req, res) => {
  const name = cleanText(req.body.name, 100);
  const email = cleanText(req.body.email, 150).toLowerCase();
  const phone = normalizePhone(cleanText(req.body.phone, 20));
  const password = req.body.password;
  const errors = {};
  if (name.length < 2) errors.name = 'Please enter your full name.';
  if (!isEmail(email)) errors.email = 'Please enter a valid email address.';
  if (!isPhone(phone)) errors.phone = 'Please enter a valid phone number (10-13 digits).';
  const pwProblem = passwordProblem(password);
  if (pwProblem) errors.password = pwProblem;
  if (Object.keys(errors).length) throw new AppError(400, 'Please correct the highlighted fields.', errors);
  if (await User.findByEmail(email)) throw new AppError(409, 'An account with this email already exists.', { email: 'Email is already registered.' });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.createUser({ name, email, phone, passwordHash });
  sendSession(res, user, 201);
});

export const login = asyncHandler(async (req, res) => {
  const email = cleanText(req.body.email, 150).toLowerCase();
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (!isEmail(email) || !password) throw new AppError(400, 'Please enter your email and password.');
  const user = await User.findByEmail(email);
  const ok = user && (await bcrypt.compare(password, user.password_hash));
  if (!ok) throw new AppError(401, 'Invalid email or password.');
  if (!user.is_active) throw new AppError(403, 'This account has been deactivated. Please contact the hotel.');
  sendSession(res, user);
});

export const logout = (_req, res) => {
  const { maxAge, ...opts } = cookieOptions();
  res.clearCookie(COOKIE_NAME, opts);
  res.json({ success: true, message: 'Logged out.' });
};

export const me = (req, res) => res.json({ success: true, user: req.user });

export const updateProfile = asyncHandler(async (req, res) => {
  const name = cleanText(req.body.name, 100);
  const phone = normalizePhone(cleanText(req.body.phone, 20));
  const address = cleanText(req.body.address, 255);
  const errors = {};
  if (name.length < 2) errors.name = 'Please enter your full name.';
  if (!isPhone(phone)) errors.phone = 'Please enter a valid phone number (10-13 digits).';
  if (Object.keys(errors).length) throw new AppError(400, 'Please correct the highlighted fields.', errors);
  const user = await User.updateProfile(req.user.id, { name, phone, address });
  res.json({ success: true, user });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const full = await User.findWithHash(req.user.id);
  if (typeof currentPassword !== 'string' || !(await bcrypt.compare(currentPassword, full.password_hash))) {
    throw new AppError(400, 'Your current password is incorrect.', { currentPassword: 'Incorrect password.' });
  }
  const problem = passwordProblem(newPassword);
  if (problem) throw new AppError(400, problem, { newPassword: problem });
  await User.updatePassword(req.user.id, await bcrypt.hash(newPassword, 12));
  res.json({ success: true, message: 'Password updated successfully.' });
});
