import rateLimit from 'express-rate-limit';

const json = (message) => ({ success: false, message });

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: json('Too many requests. Please try again in a few minutes.'),
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: json('Too many login attempts. Please try again in 15 minutes.'),
});
