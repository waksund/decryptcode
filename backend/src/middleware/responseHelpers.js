export const attachResponseHelpers = (req, res, next) => {
  res.ok = (data) => {
    res.json({
      success: true,
      data,
    });
  };

  res.fail = (status, error) => {
    res.status(status).json({
      success: false,
      error,
    });
  };

  next();
};
