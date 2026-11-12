const express = require("express");
const mongoose = require("mongoose");
const Message = require("../models/Message");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const { getAllowedContactIds } = require("../utils/chatAccess");

const router = express.Router();

// GET /api/v1/messages/contacts  - the people the logged-in user may chat with
// (admins: everyone; students: admins + classmates),
// plus the last message of each conversation (most recent chats first).
// Only name / role / department are exposed (no e-mail addresses).
router.get("/contacts", authMiddleware, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.user.sub)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const myId = new mongoose.Types.ObjectId(req.user.sub);

    const allowedIds = await getAllowedContactIds({
      id: req.user.sub,
      role: req.user.role
    });
    const userFilter =
      allowedIds === null
        ? { _id: { $ne: myId } }
        : { _id: { $in: allowedIds, $ne: myId } };

    const [users, lastMessages] = await Promise.all([
      User.find(userFilter)
        .select("name role department")
        .limit(200)
        .lean(),
      Message.aggregate([
        { $match: { $or: [{ sender: myId }, { recipient: myId }] } },
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: {
              $cond: [{ $eq: ["$sender", myId] }, "$recipient", "$sender"]
            },
            text: { $first: "$text" },
            createdAt: { $first: "$createdAt" },
            fromMe: { $first: { $eq: ["$sender", myId] } }
          }
        }
      ])
    ]);

    const lastByUser = new Map(
      lastMessages.map((item) => [String(item._id), item])
    );

    const contacts = users
      .map((user) => {
        const last = lastByUser.get(String(user._id));
        return {
          ...user,
          lastMessage: last
            ? { text: last.text, createdAt: last.createdAt, fromMe: last.fromMe }
            : null
        };
      })
      .sort((a, b) => {
        if (a.lastMessage && b.lastMessage) {
          return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
        }
        if (a.lastMessage) return -1;
        if (b.lastMessage) return 1;
        return a.name.localeCompare(b.name);
      });

    res.json({ contacts });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/messages/:userId  - conversation between the logged-in user and :userId.
// myId always comes from the JWT, so nobody can read someone else's conversations.
router.get("/:userId", authMiddleware, async (req, res, next) => {
  try {
    const myId = req.user.sub;
    const otherId = req.params.userId;

    if (!mongoose.isValidObjectId(myId) || !mongoose.isValidObjectId(otherId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const messages = await Message.find({
      $or: [
        { sender: myId, recipient: otherId },
        { sender: otherId, recipient: myId }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json({ messages: messages.reverse() });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
