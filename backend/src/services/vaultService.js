import { ethers } from 'ethers';
import createError from 'http-errors';
import { getContract } from '../config/blockchain.js';
import { ERROR_MESSAGES, ERROR_CODES, CACHE_TTL_MS } from '../config/constants.js';
import { cacheService } from './cacheService.js';

class VaultService {
  constructor() {
    this.contract = null;
    this.initializeContract();
  }

  throwBadRequest(code, message) {
    const error = createError.BadRequest(message);
    error.code = code;
    throw error;
  }

  throwBadRequestWithDetails(code, message, details) {
    const error = createError.BadRequest(message);
    error.code = code;
    error.details = details;
    throw error;
  }

  initializeContract() {
    try {
      const contract = getContract();
      if (contract) {
        this.contract = contract;
      }
    } catch (error) {
      console.error('Failed to initialize contract:', error);
    }
  }

  async getBalance(userAddress, tokenAddress) {
    if (!this.contract) {
      this.throwBadRequest(
        ERROR_CODES.CONTRACT_NOT_INITIALIZED,
        ERROR_MESSAGES.CONTRACT_NOT_INITIALIZED,
      );
    }

    const balance = await this.contract.balanceOf(userAddress, tokenAddress);
    const balanceFormatted = ethers.formatEther(balance);

    return {
      userAddress,
      tokenAddress,
      balance: balance.toString(),
      balanceFormatted,
    };
  }

  async getTotalDeposits(tokenAddress) {
    if (!this.contract) {
      this.throwBadRequest(
        ERROR_CODES.CONTRACT_NOT_INITIALIZED,
        ERROR_MESSAGES.CONTRACT_NOT_INITIALIZED,
      );
    }

    const cacheKey = `total:${tokenAddress}`;
    const cached = cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const total = await this.contract.totalDeposits(tokenAddress);
    const totalFormatted = ethers.formatEther(total);

    const data = {
      tokenAddress,
      total: total.toString(),
      totalFormatted,
    };

    cacheService.set(cacheKey, data, CACHE_TTL_MS.TOTAL_DEPOSITS);
    return data;
  }

  async getStatus() {
    if (!this.contract) {
      this.throwBadRequest(
        ERROR_CODES.CONTRACT_NOT_INITIALIZED,
        ERROR_MESSAGES.CONTRACT_NOT_INITIALIZED,
      );
    }

    const cacheKey = 'status';
    const cached = cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const paused = await this.contract.paused();

    const data = {
      paused,
    };

    cacheService.set(cacheKey, data, CACHE_TTL_MS.STATUS);
    return data;
  }

  async estimateDeposit(tokenAddress, amount, userAddress) {
    if (!this.contract) {
      this.throwBadRequest(
        ERROR_CODES.CONTRACT_NOT_INITIALIZED,
        ERROR_MESSAGES.CONTRACT_NOT_INITIALIZED,
      );
    }

    const amountWei = ethers.parseEther(amount);
    const gasEstimate = await this.contract
      .getFunction('deposit')
      .estimateGas(tokenAddress, amountWei, { from: userAddress });

    return {
      tokenAddress,
      amount,
      gasEstimate: gasEstimate.toString(),
    };
  }

  async estimateWithdraw(tokenAddress, amount, userAddress) {
    if (!this.contract) {
      this.throwBadRequest(
        ERROR_CODES.CONTRACT_NOT_INITIALIZED,
        ERROR_MESSAGES.CONTRACT_NOT_INITIALIZED,
      );
    }

    const amountWei = ethers.parseEther(amount);
    const gasEstimate = await this.contract
      .getFunction('withdraw')
      .estimateGas(tokenAddress, amountWei, { from: userAddress });

    return {
      tokenAddress,
      amount,
      gasEstimate: gasEstimate.toString(),
    };
  }
}

export { VaultService };
