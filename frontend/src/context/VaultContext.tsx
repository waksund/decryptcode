'use client';

import React, { createContext, useState, useContext, useCallback } from 'react';
import { vaultService } from '@/services/api';
import type { ApiError, ApiErrorDetails } from '@/types/api';
import { formatApiError } from '@/utils/formatApiError';
import { toast } from 'react-hot-toast';

interface VaultContextType {
  balance: any;
  totalDeposits: any;
  status: any;
  loading: boolean;
  error: ApiError | null;
  fetchBalance: (userAddress: string, tokenAddress: string) => Promise<void>;
  fetchTotalDeposits: (tokenAddress: string) => Promise<void>;
  fetchStatus: () => Promise<void>;
  estimateDeposit: (tokenAddress: string, amount: string, userAddress: string) => Promise<any>;
  estimateWithdraw: (tokenAddress: string, amount: string, userAddress: string) => Promise<any>;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export const useVault = () => {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return context;
};

export const VaultProvider = ({ children }: { children: React.ReactNode }) => {
  const [balance, setBalance] = useState<any>(null);
  const [totalDeposits, setTotalDeposits] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const runRequest = useCallback(
    async <T,>(
      action: () => Promise<{ success: boolean; data?: T; errorCode?: string; errorDetails?: ApiErrorDetails }>,
      onSuccess?: (data: T) => void
    ) => {
      setLoading(true);
      setError(null);
      try {
        const result = await action();
      if (result.success) {
        onSuccess?.(result.data as T);
        return result.data ?? null;
      }
      const apiError = {
        errorCode: result.errorCode,
        errorDetails: result.errorDetails,
      };
      setError(apiError);
      toast.error(formatApiError(apiError));
      return null;
    } catch {
      setError({ errorCode: 'UNKNOWN_ERROR' });
      toast.error('UNKNOWN_ERROR');
      return null;
    } finally {
      setLoading(false);
    }
    },
    []
  );

  const fetchBalance = useCallback(async (userAddress: string, tokenAddress: string) => {
    await runRequest(
      () => vaultService.getBalance(userAddress, tokenAddress),
      setBalance
    );
  }, [runRequest]);

  const fetchTotalDeposits = useCallback(async (tokenAddress: string) => {
    await runRequest(
      () => vaultService.getTotalDeposits(tokenAddress),
      setTotalDeposits
    );
  }, [runRequest]);

  const fetchStatus = useCallback(async () => {
    await runRequest(() => vaultService.getStatus(), setStatus);
  }, [runRequest]);

  const estimateDeposit = useCallback(async (tokenAddress: string, amount: string, userAddress: string) => {
    return await runRequest(() =>
      vaultService.estimateDeposit(tokenAddress, amount, userAddress)
    );
  }, [runRequest]);

  const estimateWithdraw = useCallback(async (tokenAddress: string, amount: string, userAddress: string) => {
    return await runRequest(() =>
      vaultService.estimateWithdraw(tokenAddress, amount, userAddress)
    );
  }, [runRequest]);

  const value = {
    balance,
    totalDeposits,
    status,
    loading,
    error,
    fetchBalance,
    fetchTotalDeposits,
    fetchStatus,
    estimateDeposit,
    estimateWithdraw,
  };

  return (
    <VaultContext.Provider value={value}>
      {children}
    </VaultContext.Provider>
  );
};
