import express from 'express';

const router = express.Router();

router.get('/health', (req, res) => {
  res.ok({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

export const healthRoutes = router;
