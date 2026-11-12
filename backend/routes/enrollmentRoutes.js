
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const controller = require("../controllers/enrollmentController");

// All enrollment routes require login.
router.use(authMiddleware);

router.get("/", controller.getEnrollments);
router.get("/:id", controller.getEnrollment);
router.post("/", controller.createEnrollment);
router.patch("/:id", controller.updateEnrollment);

// Admin only: delete all (Clear All) or one enrollment.
router.delete("/", authorizeRoles("admin"), controller.clearEnrollments);
router.delete("/:id", authorizeRoles("admin"), controller.deleteEnrollment);

module.exports = router;
