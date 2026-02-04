export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (res.headersSent) {
    next(err);
    return;
  }

  const status = err.statusCode || 500;

  const payload = {
    success: false,
  };

  if (err.code) {
    payload.errorCode = err.code;
  }

  if (err.details) {
    payload.errorDetails = err.details;
  }

  res.status(status).json(payload);
};
