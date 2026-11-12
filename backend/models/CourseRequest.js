const mongoose = require("mongoose");

const courseRequestSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  courseName: { type: String, required: true, trim: true, maxlength: 150 },
  courseCode: { type: String, required: true, trim: true, uppercase: true, maxlength: 30 },
  instructor: { type: String, required: true, trim: true, maxlength: 100 },
  duration: { type: String, required: true, trim: true, maxlength: 50 },
  category: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 2000, default: "" },
  level: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Beginner" },
  hours: { type: String, trim: true, maxlength: 20, default: "" },
  topics: { type: String, trim: true, maxlength: 1000, default: "" },
  outcome: { type: String, trim: true, maxlength: 1000, default: "" },
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  reviewedAt: { type: Date, default: null },
  adminNote: { type: String, trim: true, maxlength: 500, default: "" },
  createdCourse: { type: mongoose.Schema.Types.ObjectId, ref: "Course", default: null }
}, { timestamps: true });

courseRequestSchema.index({ student: 1, createdAt: -1 });
module.exports = mongoose.model("CourseRequest", courseRequestSchema);
