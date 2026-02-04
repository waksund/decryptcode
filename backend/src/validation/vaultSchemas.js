import { z } from 'zod';
import { ethers } from 'ethers';

const addressSchema = z.string().min(1).refine(ethers.isAddress, {
  message: 'Invalid address',
});

export const balanceParamsSchema = z.object({
  userAddress: addressSchema,
  tokenAddress: addressSchema,
});

export const totalParamsSchema = z.object({
  tokenAddress: addressSchema,
});

export const estimateBodySchema = z.object({
  tokenAddress: addressSchema,
  amount: z.string().min(1),
  userAddress: addressSchema,
});
