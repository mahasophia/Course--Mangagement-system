const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateRequest");
const controller = require("../controllers/studentController");
const {
  createStudentValidation,
  updateStudentValidation,
  studentIdValidation
} = require("../validators/studentValidators");

// Authentication first, then authorization: admin only.
router.use(authMiddleware);
router.use(authorizeRoles("admin"));

router.get("/", controller.getStudents);
router.get("/:id", studentIdValidation, validateRequest, controller.getStudentById);
router.post("/", createStudentValidation, validateRequest, controller.createStudent);
router.put("/:id", updateStudentValidation, validateRequest, controller.updateStudent);
router.delete("/:id", studentIdValidation, validateRequest, controller.deleteStudent);

module.exports = router;
