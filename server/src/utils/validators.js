import { AppError } from './AppError.js';
import { config } from '../config/env.js';
import { addDays, diffDays, isValidDateStr, todayStr } from './dates.js';

export const isEmail = (v) => typeof v === 'string' && v.length <= 150 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
export const normalizePhone = (v) => (typeof v === 'string' ? v.replace(/[\s-]/g, '') : '');
export const isPhone = (v) => /^\+?[0-9]{10,13}$/.test(normalizePhone(v));
export const cleanText = (v, max = 255) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export function passwordProblem(pw) {
  if (typeof pw !== 'string' || pw.length < 8) return 'Password must be at least 8 characters long.';
  if (pw.length > 72) return 'Password must be at most 72 characters long.';
  if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) return 'Password must contain at least one letter and one number.';
  return null;
}

export function parseId(value, label = 'id') {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) throw new AppError(400, `Invalid ${label}.`);
  return n;
}

export function parseIntInRange(value, min, max, label) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < min || n > max) throw new AppError(400, `${label} must be a whole number between ${min} and ${max}.`);
  return n;
}

export function parseMoney(value, label) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0 || n > 10000000) throw new AppError(400, `${label} must be a positive amount.`);
  return Math.round(n * 100) / 100;
}

export function validateStayDates(checkIn, checkOut) {
  if (!isValidDateStr(checkIn) || !isValidDateStr(checkOut)) throw new AppError(400, 'Please provide valid check-in and check-out dates (YYYY-MM-DD).');
  const today = todayStr();
  if (checkIn < today) throw new AppError(400, 'Check-in date cannot be in the past.');
  if (checkOut <= checkIn) throw new AppError(400, 'Check-out date must be after the check-in date.');
  const nights = diffDays(checkIn, checkOut);
  if (nights > config.pricing.maxStayNights) throw new AppError(400, `Maximum stay is ${config.pricing.maxStayNights} nights.`);
  if (checkIn > addDays(today, 365)) throw new AppError(400, 'Bookings can only be made up to 365 days in advance.');
  return nights;
}
