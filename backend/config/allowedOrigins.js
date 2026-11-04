// One trusted-origin list shared by Express CORS (Task 14.1) and Socket.IO (Task 13).
// CLIENT_URL may hold several comma-separated origins.
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

module.exports = allowedOrigins;
