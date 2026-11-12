
const express = require("express");
const router = express.Router();

const courseController = require("../controllers/courseController");
const courseContentController = require("../controllers/courseContentController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateRequest");

const {
  createCourseValidation,
  updateCourseValidation,
  courseIdValidation,
  listCoursesValidation
} = require("../validators/courseValidators");

// ========================================
// PUBLIC COURSE ROUTES
// ========================================

// Get all courses
router.get(
  "/",
  listCoursesValidation,
  validateRequest,
  courseController.getCourses
);

// Get one course
router.get(
  "/:id",
  courseIdValidation,
  validateRequest,
  courseController.getCourse
);

// ========================================
// COURSE CONTENT ROUTES
// ========================================

// Get course content (enrolled students and admins only)

const requireCourseEnrollment = require("../middleware/requireCourseEnrollment");

router.get(
  "/:courseId/content",
  authMiddleware,
  requireCourseEnrollment,
  courseContentController.getCourseContent
);


// Add module (admin only)
router.post(
  "/:courseId/content/modules",
  authMiddleware,
  authorizeRoles("admin"),
  courseContentController.addModule
);

// Add lesson (admin only)
router.post(
  "/:courseId/content/modules/:moduleId/lessons",
  authMiddleware,
  authorizeRoles("admin"),
  courseContentController.addLesson
);

// ========================================
// ADMIN COURSE MANAGEMENT ROUTES
// ========================================

// Add course
router.post(
  "/",
  authMiddleware,
  authorizeRoles("admin"),
  createCourseValidation,
  validateRequest,
  courseController.addCourse
);

// Update course
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  updateCourseValidation,
  validateRequest,
  courseController.editCourse
);

// Delete course
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  courseIdValidation,
  validateRequest,
  courseController.removeCourse
);

module.exports = router;
