
const mongoose = require("mongoose");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const User = require("../models/User");

// Get enrollments
const getEnrollments = async (req, res, next) => {
  try {
    const filter = req.user.role === "admin"
      ? {}
      : { student: req.user.id };

    const enrollments = await Enrollment.find(filter)
      .populate("student", "name email")
      .populate("course")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments
    });
  } catch (error) {
    next(error);
  }
};

// Get one enrollment
const getEnrollment = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid enrollment ID"
      });
    }

    const enrollment = await Enrollment.findById(req.params.id)
      .populate("student", "name email")
      .populate("course");

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found"
      });
    }

    if (
      req.user.role !== "admin" &&
      enrollment.student._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    res.status(200).json({ success: true, data: enrollment });
  } catch (error) {
    next(error);
  }
};

// Enroll the logged-in student
const createEnrollment = async (req, res, next) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can enroll in courses"
      });
    }

    const { courseId, rollNo } = req.body;

    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Valid courseId is required"
      });
    }

    const [student, course] = await Promise.all([
      User.findById(req.user.id),
      Course.findById(courseId)
    ]);

    if (!student || student.role !== "student") {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    const existing = await Enrollment.findOne({
      student: student._id,
      course: course._id
    });

    if (existing && existing.status !== "withdrawn") {
      return res.status(409).json({
        success: false,
        message: "Already enrolled in this course"
      });
    }

    let enrollment;

    if (existing) {
      existing.status = "active";
      existing.enrolledAt = new Date();
      if (typeof rollNo === "string") existing.rollNo = rollNo.trim().slice(0, 50);
      enrollment = await existing.save();
    } else {
      enrollment = await Enrollment.create({
        student: student._id,
        course: course._id,
        rollNo: typeof rollNo === "string" ? rollNo.trim().slice(0, 50) : ""
      });
    }

    res.status(201).json({
      success: true,
      message: "Enrolled successfully",
      data: enrollment
    });
  } catch (error) {
    next(error);
  }
};

// Update enrollment status
const updateEnrollment = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid enrollment ID"
      });
    }

    const { status } = req.body;
    const allowedStatuses = ["active", "completed", "withdrawn"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid enrollment status"
      });
    }

    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found"
      });
    }

    if (
      req.user.role !== "admin" &&
      (
        enrollment.student.toString() !== req.user.id ||
        !["completed", "withdrawn"].includes(status)
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot update this enrollment"
      });
    }

    enrollment.status = status;
    await enrollment.save();

    res.status(200).json({
      success: true,
      message: "Enrollment updated successfully",
      data: enrollment
    });
  } catch (error) {
    next(error);
  }
};

// Admin: delete one enrollment record
const deleteEnrollment = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid enrollment ID"
      });
    }

    const enrollment = await Enrollment.findByIdAndDelete(req.params.id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Enrollment deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

// Admin: delete every enrollment record (the dashboard "Clear All" button)
const clearEnrollments = async (req, res, next) => {
  try {
    const result = await Enrollment.deleteMany({});

    res.status(200).json({
      success: true,
      message: "All enrollments cleared",
      deleted: result.deletedCount
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  deleteEnrollment,
  clearEnrollments,
  getEnrollments,
  getEnrollment,
  createEnrollment,
  updateEnrollment
};
