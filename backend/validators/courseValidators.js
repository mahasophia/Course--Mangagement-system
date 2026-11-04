const { body, param, query } = require("express-validator");

const idParam = param("id").isMongoId().withMessage("Invalid course ID");

function requiredText(field, label, max) {
  return body(field)
    .isString()
    .withMessage(`${label} is required`)
    .trim()
    .notEmpty()
    .withMessage(`${label} is required`)
    .isLength({ max })
    .withMessage(`${label} must be ${max} characters or fewer`);
}

function optionalText(field, label, max) {
  return body(field)
    .optional()
    .isString()
    .withMessage(`${label} must be text`)
    .trim()
    .notEmpty()
    .withMessage(`${label} cannot be empty`)
    .isLength({ max })
    .withMessage(`${label} must be ${max} characters or fewer`);
}

const createCourseValidation = [
  requiredText("courseName", "Course name", 150),
  requiredText("courseCode", "Course code", 30),
  requiredText("instructor", "Instructor", 100),
  requiredText("duration", "Duration", 50),
  requiredText("category", "Category", 100),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be text")
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Description must be 2000 characters or fewer"),
  body("status")
    .optional()
    .isIn(["Active", "Inactive"])
    .withMessage("Status must be Active or Inactive")
];

const updateCourseValidation = [
  idParam,
  optionalText("courseName", "Course name", 150),
  optionalText("courseCode", "Course code", 30),
  optionalText("instructor", "Instructor", 100),
  optionalText("duration", "Duration", 50),
  optionalText("category", "Category", 100),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be text")
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Description must be 2000 characters or fewer"),
  body("status")
    .optional()
    .isIn(["Active", "Inactive"])
    .withMessage("Status must be Active or Inactive")
];

const courseIdValidation = [idParam];

const listCoursesValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be between 1 and 100")
];

module.exports = {
  createCourseValidation,
  updateCourseValidation,
  courseIdValidation,
  listCoursesValidation
};
