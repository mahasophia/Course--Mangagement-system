const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const controller = require("../controllers/courseRequestController");

const router = express.Router();
router.use(authMiddleware);
router.post("/", authorizeRoles("student"), controller.createCourseRequest);
router.get("/", controller.getCourseRequests);
router.patch("/:id/review", authorizeRoles("admin"), controller.reviewCourseRequest);
module.exports = router;
