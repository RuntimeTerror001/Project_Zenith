import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // Limit each IP to 120 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many requests from this IP, please try again after a minute.'
  }
});

export const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 15, // Limit each IP to 15 authentication requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many login or registration attempts. Please try again after 5 minutes.'
  }
});
