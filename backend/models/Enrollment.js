const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true
    },
    status: {
      type: String,
      enum: ["active", "completed", "withdrawn"],
      default: "active"
    },
    rollNo: {
      type: String,
      trim: true,
      maxlength: 50,
      default: ""
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// One enrollment document per student/course pair.
// To unenroll, set status to "withdrawn"; to re-enroll, set it back to "active".
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
