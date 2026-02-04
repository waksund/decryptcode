import express from 'express';
import {
  getBalance,
  getTotalDeposits,
  getStatus,
  estimateDeposit,
  estimateWithdraw,
} from '../controllers/vaultController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  balanceParamsSchema,
  totalParamsSchema,
  estimateBodySchema,
} from '../validation/vaultSchemas.js';

const router = express.Router();

// Get user's balance in vault
router.get(
  '/balance/:userAddress/:tokenAddress',
  validateRequest({ params: balanceParamsSchema }),
  getBalance,
);

// Get total deposits for a token
router.get(
  '/total/:tokenAddress',
  validateRequest({ params: totalParamsSchema }),
  getTotalDeposits,
);

// Get contract status
router.get('/status', getStatus);

// Estimate gas for deposit
router.post(
  '/estimate-deposit',
  validateRequest({ body: estimateBodySchema }),
  estimateDeposit,
);

// Estimate gas for withdraw
router.post(
  '/estimate-withdraw',
  validateRequest({ body: estimateBodySchema }),
  estimateWithdraw,
);

export const vaultRoutes = router;
