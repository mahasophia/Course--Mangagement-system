const mongoose = require("mongoose");
const CourseRequest = require("../models/CourseRequest");
const Course = require("../models/Course");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { sendEmail } = require("../utils/email");

const COURSE_FIELDS = ["courseName", "courseCode", "instructor", "duration", "category", "description", "level", "hours", "topics", "outcome"];

async function createCourseRequest(req, res, next) {
  try {
    const data = {};
    for (const key of COURSE_FIELDS) {
      if (req.body[key] !== undefined) data[key] = typeof req.body[key] === "string" ? req.body[key].trim() : req.body[key];
    }
    const required = ["courseName", "courseCode", "instructor", "duration", "category"];
    const missing = required.filter((key) => !data[key]);
    if (missing.length) return res.status(400).json({ success: false, message: `Required fields missing: ${missing.join(", ")}` });

    const duplicatePending = await CourseRequest.findOne({ student: req.user.sub, courseCode: data.courseCode.toUpperCase(), status: "Pending" });
    if (duplicatePending) return res.status(409).json({ success: false, message: "You already have a pending request for this course code." });

    const request = await CourseRequest.create({ ...data, student: req.user.sub });
    const admins = await User.find({ role: "admin" }).select("_id email name").lean();
    if (admins.length) {
      await Notification.insertMany(admins.map((admin) => ({ recipient: admin._id, message: `${req.user.email} requested a new course: ${request.courseName}` })));
    }

    const adminEmail = process.env.ADMIN_EMAIL || admins[0]?.email;
    let emailSent = false;
    try {
      emailSent = await sendEmail({
        to: adminEmail,
        subject: `New course request: ${request.courseName}`,
        text: `A student has requested a new course.
Course: ${request.courseName}
Code: ${request.courseCode}
Category: ${request.category}
Instructor: ${request.instructor}
Student email: ${req.user.email}
Please sign in to SkillMatrix to review this request.`
      });
    } catch (mailError) {
      console.error("Course request email failed:", mailError.message);
    }

    return res.status(201).json({ success: true, message: emailSent ? "Course request submitted. Admin email sent." : "Course request submitted. Admin can review it in the dashboard; email is not configured yet.", data: request, emailSent });
  } catch (error) { next(error); }
}

async function getCourseRequests(req, res, next) {
  try {
    const filter = req.user.role === "admin" ? {} : { student: req.user.sub };
    const requests = await CourseRequest.find(filter).populate("student", "name email").sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: requests });
  } catch (error) { next(error); }
}

async function reviewCourseRequest(req, res, next) {
  try {
    const { status, adminNote = "" } = req.body;
    if (!["Approved", "Rejected"].includes(status)) return res.status(400).json({ success: false, message: "Status must be Approved or Rejected." });
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid request ID." });

    const request = await CourseRequest.findById(req.params.id).populate("student", "name email");
    if (!request) return res.status(404).json({ success: false, message: "Course request not found." });
    if (request.status !== "Pending") return res.status(409).json({ success: false, message: `This request is already ${request.status.toLowerCase()}.` });

    let createdCourse = null;
    if (status === "Approved") {
      const existing = await Course.findOne({ courseCode: request.courseCode.toUpperCase() });
      if (existing) return res.status(409).json({ success: false, message: "A course with this course code already exists. Edit the request or reject it." });
      createdCourse = await Course.create({
        courseName: request.courseName, courseCode: request.courseCode, instructor: request.instructor,
        duration: request.duration, category: request.category, description: request.description,
        level: request.level, hours: request.hours, topics: request.topics, outcome: request.outcome, status: "Active"
      });
      request.createdCourse = createdCourse._id;
    }

    request.status = status;
    request.reviewedBy = req.user.sub;
    request.reviewedAt = new Date();
    request.adminNote = String(adminNote).trim().slice(0, 500);
    await request.save();

    const message = status === "Approved" ? `Your course request for ${request.courseName} was approved.` : `Your course request for ${request.courseName} was rejected.${request.adminNote ? ` Admin note: ${request.adminNote}` : ""}`;
    await Notification.create({ recipient: request.student._id, message });
    try {
      await sendEmail({ to: request.student.email, subject: `Course request ${status.toLowerCase()}: ${request.courseName}`, text: `${message}

SkillMatrix Admin` });
    } catch (mailError) { console.error("Student notification email failed:", mailError.message); }

    res.json({ success: true, message: status === "Approved" ? "Request approved and course added." : "Request rejected.", data: request, course: createdCourse });
  } catch (error) { next(error); }
}

module.exports = { createCourseRequest, getCourseRequests, reviewCourseRequest };
