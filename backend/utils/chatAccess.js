// Who may chat with whom (Task 13/14 "recipient authorization").
//   admin   -> can message anyone
//   student -> can message admins and classmates (students sharing an
//              active/completed course enrollment)
const User = require("../models/User");
const Enrollment = require("../models/Enrollment");

const LIVE_STATUSES = ["active", "completed"];

async function getCourseIds(userId) {
  return Enrollment.find({
    student: userId,
    status: { $in: LIVE_STATUSES }
  }).distinct("course");
}

// Returns an array of user ids this user may chat with, or null for "everyone".
async function getAllowedContactIds(user) {
  if (user.role === "admin") return null;

  const courseIds = await getCourseIds(user.id);

  const [admins, classmateIds] = await Promise.all([
    User.find({ role: "admin" }).select("_id").lean(),
    courseIds.length
      ? Enrollment.find({
          course: { $in: courseIds },
          student: { $ne: user.id },
          status: { $in: LIVE_STATUSES }
        }).distinct("student")
      : []
  ]);

  return [...admins.map((a) => String(a._id)), ...classmateIds.map(String)];
}

async function canMessage(user, recipientId) {
  const recipient = await User.findById(recipientId).select("_id").lean();
  if (!recipient) return false;

  const allowed = await getAllowedContactIds(user);
  return allowed === null || allowed.includes(String(recipientId));
}

module.exports = { getAllowedContactIds, canMessage };
