import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { vaultRoutes } from './routes/vault.js';
import { healthRoutes } from './routes/health.js';
import { requestLogger } from './middleware/requestLogger.js';
import { attachResponseHelpers } from './middleware/responseHelpers.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(requestLogger);
app.use(express.json());
app.use(attachResponseHelpers);

// Routes
app.use('/api/vault', vaultRoutes);
app.use('/api', healthRoutes);

// Error handling middleware
app.use(errorHandler);

export default app;

function start() {
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ Error: Port ${PORT} is already in use.\n`);
      console.error('To fix this, you can:');
      console.error('\n1. Find and stop the process using port ' + PORT + ':');
      console.error('   netstat -ano | findstr :' + PORT);
      console.error('   taskkill /PID <PID_NUMBER> /F');
      console.error('\n2. Or use a different port by setting PORT in your .env file:');
      console.error('   PORT=4001\n');
      process.exit(1);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });

  return server;
}

const isDirectRun =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isDirectRun) {
  start();
}
