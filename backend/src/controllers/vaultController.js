import { VaultService } from '../services/vaultService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Create a single instance of VaultService to be shared across all controller functions
const vaultService = new VaultService();

export const getBalance = asyncHandler(async (req, res) => {
  const { userAddress, tokenAddress } = req.params;
  const data = await vaultService.getBalance(userAddress, tokenAddress);
  res.ok(data);
});

export const getTotalDeposits = asyncHandler(async (req, res) => {
  const { tokenAddress } = req.params;
  const data = await vaultService.getTotalDeposits(tokenAddress);
  res.ok(data);
});

export const getStatus = asyncHandler(async (req, res) => {
  const data = await vaultService.getStatus();
  res.ok(data);
});

export const estimateDeposit = asyncHandler(async (req, res) => {
  const { tokenAddress, amount, userAddress } = req.body;
  const data = await vaultService.estimateDeposit(tokenAddress, amount, userAddress);
  res.ok(data);
});

export const estimateWithdraw = asyncHandler(async (req, res) => {
  const { tokenAddress, amount, userAddress } = req.body;
  const data = await vaultService.estimateWithdraw(tokenAddress, amount, userAddress);
  res.ok(data);
});
