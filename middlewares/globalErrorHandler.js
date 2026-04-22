import logger from "../utils/logger.js";

export const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  logger.error({
    message: err.message,
    path: req.originalUrl,
    method: req.method,
    stack: err.stack,
  });

  // mongoose schema validation
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: Object.values(err.errors).map((e) => e.message),
    });
  }

  // multer file error
  if (err.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
  });
};
