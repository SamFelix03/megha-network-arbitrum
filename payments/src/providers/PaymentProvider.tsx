'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { PaymentService } from '@/services/paymentService';
import { useWallet } from './WalletProvider';
import { useDevice } from './DeviceProvider';

interface PaymentTransaction {
  id: string;
  type: 'approval' | 'payment';
  amount: string;
  to: string;
  txHash: string;
  timestamp: string;
  status: 'pending' | 'confirmed' | 'failed';
}

interface PaymentContextType {
  usdcBalance: string | null;
  isLoading: boolean;
  error: string | null;
  approveUSDC: () => Promise<void>;
  payHostingFee: () => Promise<void>;
  checkPaymentRequirements: () => Promise<boolean>;
  refreshBalance: () => Promise<void>;
  transactions: PaymentTransaction[];
  addTransaction: (tx: Omit<PaymentTransaction, 'id' | 'timestamp'>) => void;
  updateTransactionStatus: (txHash: string, status: 'pending' | 'confirmed' | 'failed') => void;
}

const PaymentContext = createContext<PaymentContextType>({} as PaymentContextType);

export function PaymentProvider({ children }: { children: ReactNode }) {
  const { isConnected, accountId } = useWallet();
  const { selectedDevice } = useDevice();
  const [usdcBalance, setUsdcBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentService, setPaymentService] = useState<PaymentService | null>(null);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);

  // Initialize payment service when wallet connects
  useEffect(() => {
    if (isConnected && accountId && typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        
        const service = new PaymentService(provider);
        setPaymentService(service);
        refreshBalance();
      } catch (error) {
        console.error('Failed to initialize payment service:', error);
        setError('Failed to initialize payment service');
      }
    } else {
      setPaymentService(null);
      setUsdcBalance(null);
    }
  }, [isConnected, accountId]);

  const refreshBalance = async () => {
    if (!paymentService) {
      console.log('No payment service available');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      console.log('Refreshing USDC balance...');
      const balance = await paymentService.getUSDCBalance();
      console.log('Balance retrieved:', balance);
      setUsdcBalance(balance);
    } catch (error) {
      console.error('Failed to refresh balance:', error);
      setError(error instanceof Error ? error.message : 'Failed to get USDC balance');
      setUsdcBalance(null);
    } finally {
      setIsLoading(false);
    }
  };

  const addTransaction = (tx: Omit<PaymentTransaction, 'id' | 'timestamp'>) => {
    const newTransaction: PaymentTransaction = {
      ...tx,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const updateTransactionStatus = (txHash: string, status: 'pending' | 'confirmed' | 'failed') => {
    setTransactions(prev => 
      prev.map(tx => 
        tx.txHash === txHash ? { ...tx, status } : tx
      )
    );
  };

  const approveUSDC = async () => {
    if (!paymentService || !selectedDevice) {
      throw new Error('Payment service or device not available');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Requesting USDC approval...');
      const tx = await paymentService.approveUSDC(selectedDevice.walletAddress);
      
      // Check if transaction was returned
      if (!tx || !tx.hash) {
        throw new Error('Transaction failed - no transaction hash returned');
      }
      
      // Add transaction to tracking
      addTransaction({
        type: 'approval',
        amount: '10',
        to: selectedDevice.walletAddress,
        txHash: tx.hash,
        status: 'pending'
      });
      
      console.log('Approval transaction sent:', tx.hash);
      console.log('Waiting for confirmation...');
      
      await tx.wait();
      console.log('USDC approval confirmed!');
      
      // Update transaction status
      updateTransactionStatus(tx.hash, 'confirmed');
      
      // Refresh balance after approval
      await refreshBalance();
      
      return tx; // Return transaction for the test button
    } catch (error) {
      console.error('Failed to approve USDC:', error);
      setError(error instanceof Error ? error.message : 'Failed to approve USDC');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const payHostingFee = async () => {
    if (!paymentService || !selectedDevice) {
      throw new Error('Payment service or device not available');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const hostingFee = selectedDevice.hostingFee;
      console.log(`Paying hosting fee: ${hostingFee} USDC`);
      
      const tx = await paymentService.payHostingFee(selectedDevice.walletAddress, hostingFee);
      
      console.log('Payment transaction sent:', tx.hash);
      console.log('Waiting for confirmation...');
      
      await tx.wait();
      console.log('Hosting fee payment confirmed!');
      
      // Refresh balance after payment
      await refreshBalance();
    } catch (error) {
      console.error('Failed to pay hosting fee:', error);
      setError(error instanceof Error ? error.message : 'Failed to pay hosting fee');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const checkPaymentRequirements = async (): Promise<boolean> => {
    if (!paymentService || !selectedDevice) {
      return false;
    }

    try {
      const hostingFee = selectedDevice.hostingFee;
      
      // Check if user has sufficient USDC balance
      const hasBalance = await paymentService.hasSufficientBalance(hostingFee);
      if (!hasBalance) {
        setError(`Insufficient USDC balance. Need ${hostingFee} USDC`);
        return false;
      }

      // Check if user has sufficient allowance
      const hasAllowance = await paymentService.hasSufficientAllowance(selectedDevice.walletAddress, hostingFee);
      if (!hasAllowance) {
        console.log('Insufficient allowance, need approval');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking payment requirements:', error);
      setError('Failed to check payment requirements');
      return false;
    }
  };

  return (
    <PaymentContext.Provider
      value={{
        usdcBalance,
        isLoading,
        error,
        approveUSDC,
        payHostingFee,
        checkPaymentRequirements,
        refreshBalance,
        transactions,
        addTransaction,
        updateTransactionStatus,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
}

export const usePayment = () => useContext(PaymentContext);
