import rateLimit from 'express-rate-limit';
export const rateLimiterMiddleware = rateLimit({
  windowMs: 60 * 1000, // 1 minute to unlock block
  max: 20, // 10 requests per minute
  message: 'You have exceeded your 20 requests per minute limit.',
});
