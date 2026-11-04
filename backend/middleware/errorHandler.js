// Centralized error handler (Tasks 12.5 and 14.4). Must be the LAST middleware.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Duplicate unique value (e.g. e-mail or course code)
  if (err.code === 11000) {
    return res.status(409).json({
      message: "Duplicate value already exists"
    });
  }

  // Mongoose schema validation
  if (err.name === "ValidationError" && err.errors) {
    return res.status(400).json({
      message: "Validation failed",
      errors: Object.values(err.errors).map((item) => item.message)
    });
  }

  // Bad ObjectId
  if (err.name === "CastError") {
    return res.status(400).json({
      message: "Invalid identifier"
    });
  }

  // Malformed JSON body (thrown by express.json)
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      message: "Invalid JSON body"
    });
  }

  // Services/middleware may use either `status` or `statusCode`
  const candidate = err.status || err.statusCode;
  const status =
    Number.isInteger(candidate) && candidate >= 400 && candidate < 600
      ? candidate
      : 500;

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({
    message: status === 500 ? "Internal server error" : err.message
  });
}

module.exports = errorHandler;
