import logger from "../utils/logger.js";

export const globalErrorHandler = async (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  logger.error({
    message: err.message,
    path: req.originalUrl,
    method: req.method,
    stack: err.stack,
  });

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
  });
};
