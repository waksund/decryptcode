export const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    console.log(
        JSON.stringify({
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          durationMs
        })
    );
  });

  next();
};
