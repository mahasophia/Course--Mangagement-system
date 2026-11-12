const mongoose = require("mongoose");
const Enrollment = require("../models/Enrollment");

const requireCourseEnrollment = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    // Admin can access all course content.
    if (req.user.role === "admin") {
      return next();
    }
    if (!mongoose.isValidObjectId(courseId)) {
  return res.status(400).json({
    success: false,
    message: "Invalid course ID"
  });
}

    // Check whether the student is enrolled.
    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: courseId,
      status: { $in: ["active", "completed"] }
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in this course to access its content"
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = requireCourseEnrollment;
