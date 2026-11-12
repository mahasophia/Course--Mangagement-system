const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const Message = require("../models/Message");
const Notification = require("../models/Notification");
const allowedOrigins = require("./allowedOrigins");
const { canMessage } = require("../utils/chatAccess");

// At most 20 messages per 10 seconds for each socket connection.
const MESSAGE_LIMIT = 20;
const MESSAGE_WINDOW_MS = 10000;

function initializeSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins, // same trusted origins as Express CORS (Task 14.1)
      methods: ["GET", "POST"]
    }
  });

  // Authenticate every socket connection with the JWT
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth && socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ["HS256"]
      });

      const user = await User.findById(decoded.sub).select("_id name role");

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = {
        id: String(user._id),
        name: user.name,
        role: user.role
      };

      next();
    } catch (error) {
      next(new Error("Invalid authentication token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.id;

    // Each authenticated user has a private room
    socket.join(`user:${userId}`);
    console.log("Socket connected:", userId);

    let recentMessages = [];

    socket.on("send_message", async (data, ack) => {
      try {
        const now = Date.now();
        recentMessages = recentMessages.filter((t) => now - t < MESSAGE_WINDOW_MS);
        if (recentMessages.length >= MESSAGE_LIMIT) {
          throw new Error("You are sending messages too quickly. Please slow down.");
        }
        recentMessages.push(now);

        const { recipientId, text } = data || {};

        if (
          !mongoose.isValidObjectId(recipientId) ||
          typeof text !== "string" ||
          !text.trim() ||
          text.trim().length > 2000
        ) {
          throw new Error("Invalid message data");
        }

        if (String(recipientId) === userId) {
          throw new Error("You cannot send a message to yourself");
        }

        if (!(await canMessage(socket.user, recipientId))) {
          throw new Error("You are not allowed to message this user");
        }

        // sender always comes from the authenticated socket, never from the client
        const message = await Message.create({
          sender: userId,
          recipient: recipientId,
          text: text.trim()
        });

        const payload = {
          _id: message._id,
          sender: userId,
          recipient: String(recipientId),
          text: message.text,
          createdAt: message.createdAt
        };

        io.to(`user:${userId}`)
          .to(`user:${recipientId}`)
          .emit("receive_message", payload);

        const notification = await Notification.create({
          recipient: recipientId,
          message: `New message from ${socket.user.name}`
        });

        io.to(`user:${recipientId}`).emit("new_notification", notification);

        if (typeof ack === "function") {
          ack({ success: true });
        }
      } catch (error) {
        if (typeof ack === "function") {
          ack({ success: false, message: error.message });
        }
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", userId);
    });
  });

  return io;
}

module.exports = initializeSocket;
