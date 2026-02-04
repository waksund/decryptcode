'use client';

import { useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { WalletProvider } from '@/context/WalletContext';
import { VaultProvider } from '@/context/VaultContext';

const GlobalErrorToasts = () => {
  useEffect(() => {
    const handleUnhandled = () => {
      toast.error('UNEXPECTED_ERROR');
    };

    window.addEventListener('error', handleUnhandled);
    window.addEventListener('unhandledrejection', handleUnhandled);
    return () => {
      window.removeEventListener('error', handleUnhandled);
      window.removeEventListener('unhandledrejection', handleUnhandled);
    };
  }, []);

  return null;
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <VaultProvider>
        {children}
      </VaultProvider>
      <GlobalErrorToasts />
      <Toaster position="top-right" />
    </WalletProvider>
  );
}
