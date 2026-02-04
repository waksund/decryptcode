import axios from 'axios';
import { API_BASE_URL } from '@/config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API service functions for TokenVault
export const vaultService = {
  // Get user's balance in vault
  getBalance: async (userAddress: string, tokenAddress: string) => {
    try {
      const response = await api.get(
        `/api/vault/balance/${userAddress}/${tokenAddress}`
      );
      return { success: true, data: response.data.data };
    } catch (error: any) {
      const errorCode = error.response?.data?.errorCode || 'NETWORK_ERROR';
      const errorDetails = error.response?.data?.errorDetails;
      return {
        success: false,
        errorCode,
        errorDetails,
      };
    }
  },

  // Get total deposits for a token
  getTotalDeposits: async (tokenAddress: string) => {
    try {
      const response = await api.get(`/api/vault/total/${tokenAddress}`);
      return { success: true, data: response.data.data };
    } catch (error: any) {
      const errorCode = error.response?.data?.errorCode || 'NETWORK_ERROR';
      const errorDetails = error.response?.data?.errorDetails;
      return {
        success: false,
        errorCode,
        errorDetails,
      };
    }
  },

  // Get contract status
  getStatus: async () => {
    try {
      const response = await api.get('/api/vault/status');
      return { success: true, data: response.data.data };
    } catch (error: any) {
      const errorCode = error.response?.data?.errorCode || 'NETWORK_ERROR';
      const errorDetails = error.response?.data?.errorDetails;
      return {
        success: false,
        errorCode,
        errorDetails,
      };
    }
  },

  // Estimate gas for deposit
  estimateDeposit: async (tokenAddress: string, amount: string, userAddress: string) => {
    try {
      const response = await api.post('/api/vault/estimate-deposit', {
        tokenAddress,
        amount,
        userAddress,
      });
      return { success: true, data: response.data.data };
    } catch (error: any) {
      const errorCode = error.response?.data?.errorCode || 'NETWORK_ERROR';
      const errorDetails = error.response?.data?.errorDetails;
      return {
        success: false,
        errorCode,
        errorDetails,
      };
    }
  },

  // Estimate gas for withdraw
  estimateWithdraw: async (tokenAddress: string, amount: string, userAddress: string) => {
    try {
      const response = await api.post('/api/vault/estimate-withdraw', {
        tokenAddress,
        amount,
        userAddress,
      });
      return { success: true, data: response.data.data };
    } catch (error: any) {
      const errorCode = error.response?.data?.errorCode || 'NETWORK_ERROR';
      const errorDetails = error.response?.data?.errorDetails;
      return {
        success: false,
        errorCode,
        errorDetails,
      };
    }
  },
};

// Health check
export const checkHealth = async () => {
  try {
    const response = await api.get('/api/health');
    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      success: false,
      errorCode: 'NETWORK_ERROR',
    };
  }
};

export default api;
