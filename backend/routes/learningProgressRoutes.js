const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const requireCourseEnrollment = require("../middleware/requireCourseEnrollment");
const controller = require("../controllers/learningProgressController");

// Learning progress belongs to students.
router.use(authMiddleware);
router.use(authorizeRoles("student"));

router.get("/", controller.getMyProgress);
router.get("/:courseId", controller.getCourseProgress);
router.post(
  "/:courseId/lessons/:lessonId",
  requireCourseEnrollment, // must be enrolled in the course
  controller.markLessonComplete
);

module.exports = router;
