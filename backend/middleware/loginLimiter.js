const { rateLimit } = require("express-rate-limit");

// 10 login attempts per IP per 15 minutes (override with LOGIN_RATE_LIMIT).
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number.parseInt(process.env.LOGIN_RATE_LIMIT, 10) || 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many login attempts. Try again later."
  }
});

module.exports = loginLimiter;
