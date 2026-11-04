const express = require("express");
const router = express.Router();

const courseController = require("../controllers/courseController");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  createCourseValidation,
  updateCourseValidation,
  courseIdValidation,
  listCoursesValidation
} = require("../validators/courseValidators");

// Public: anyone can browse courses
router.get(
  "/",
  listCoursesValidation,
  validateRequest,
  courseController.getCourses
);
router.get(
  "/:id",
  courseIdValidation,
  validateRequest,
  courseController.getCourse
);

// Admin only: create / update / delete
router.post(
  "/",
  authMiddleware,
  authorizeRoles("admin"),
  createCourseValidation,
  validateRequest,
  courseController.addCourse
);

router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  updateCourseValidation,
  validateRequest,
  courseController.editCourse
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  courseIdValidation,
  validateRequest,
  courseController.removeCourse
);

module.exports = router;
