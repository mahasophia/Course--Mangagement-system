const mongoose = require("mongoose");

// Field names match the existing Course API/front-end (courseName, courseCode ...).
// duration is free text such as "8 Weeks".
const courseSchema = new mongoose.Schema(
  {
    courseName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },
    courseCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 30
    },
    instructor: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    duration: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: ""
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
