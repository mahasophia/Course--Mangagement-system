const { body } = require("express-validator");

const registerValidation = [
  body("name")
    .isString()
    .withMessage("Name is required")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 100 })
    .withMessage("Name must be 100 characters or fewer"),
  body("email")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail({ gmail_remove_dots: false }),
  body("password")
    .isString()
    .withMessage("Password is required")
    .isLength({ min: 12, max: 72 })
    .withMessage("Password must contain between 12 and 72 characters"),
  body("department")
    .optional()
    .isString()
    .withMessage("Department must be text")
    .trim()
    .isLength({ max: 100 })
    .withMessage("Department must be 100 characters or fewer")
];

const loginValidation = [
  body("email")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail({ gmail_remove_dots: false }),
  body("password")
    .isString()
    .withMessage("Password is required")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ max: 72 })
    .withMessage("Password is too long")
];

module.exports = {
  registerValidation,
  loginValidation
};
