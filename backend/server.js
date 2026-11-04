// dotenv must run first: config files read process.env when they are required.
require("dotenv").config();

const http = require("http");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");

const connectDB = require("./config/db");
const allowedOrigins = require("./config/allowedOrigins");
const initializeSocket = require("./config/socket");

const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const courseRoutes = require("./routes/courseRoutes");
const profileRoutes = require("./routes/profileRoutes");
const messageRoutes = require("./routes/messageRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const notFound = require("./middleware/notFoundMiddleware");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const server = http.createServer(app);

// Behind Render/Vercel-style proxies the real client IP is needed for rate limiting.
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// -------------------------
// Security + parsing middleware
// -------------------------
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      // No Origin header = Postman / curl / server-to-server: allowed.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(
        Object.assign(new Error("Origin not allowed by CORS"), { status: 403 })
      );
    }
  })
);
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
// Never log request bodies, passwords or tokens - morgan only logs method/url/status.
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// -------------------------
// Test + health routes
// -------------------------
app.get("/", (req, res) => {
  res.json({ message: "Student Course Management API is running" });
});

function healthCheck(req, res) {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(dbConnected ? 200 : 503).json({
    success: dbConnected,
    message: dbConnected ? "Backend is healthy" : "Database not connected",
    timestamp: new Date().toISOString()
  });
}
app.get("/api/health", healthCheck);
app.get("/api/v1/health", healthCheck);

// -------------------------
// API routes
// -------------------------
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/students", studentRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/courses", courseRoutes); // legacy alias kept for older clients
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/notifications", notificationRoutes);

// -------------------------
// 404 + error handling (order matters: routes -> 404 -> error handler)
// -------------------------
app.use(notFound);
app.use(errorHandler);

// -------------------------
// Startup + graceful shutdown
// -------------------------
const PORT = process.env.PORT || 5000;
let io;

async function startServer() {
  try {
    await connectDB();
    io = initializeSocket(server);

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error.message);
    process.exit(1);
  }
}

async function shutdown(signal) {
  console.log(`${signal} received: shutting down gracefully`);

  // Force-quit if connections refuse to close.
  const forceExit = setTimeout(() => process.exit(1), 10000);
  forceExit.unref();

  try {
    if (io) await io.close(); // closes websocket clients and the HTTP server
    if (server.listening) {
      await new Promise((resolve) => server.close(resolve));
    }
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
}

// Only wire up the process-level handlers when run directly (not when imported by tests).
if (require.main === module) {
  process.on("unhandledRejection", (error) => {
    console.error("Unhandled rejection:", error);
    process.exit(1);
  });

  process.on("uncaughtException", (error) => {
    console.error("Uncaught exception:", error);
    process.exit(1);
  });

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  startServer();
}

module.exports = { app, server };
