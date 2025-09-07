'use client';

import { usePayment } from '@/providers/PaymentProvider';
import { useDevice } from '@/providers/DeviceProvider';
import { useWallet } from '@/providers/WalletProvider';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { TokenBalanceService } from '@/services/tokenBalanceService';

export const LivePaymentTracker = () => {
  const { transactions, addTransaction } = usePayment();
  const { selectedDevice } = useDevice();
  const { isConnected, accountId } = useWallet();
  const [allowance, setAllowance] = useState<string>('0');
  const [isTracking, setIsTracking] = useState(false);
  const [usdcBalance, setUsdcBalance] = useState<string>('0');
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // Fetch USDC balance using the same service as TokenBalances
  const fetchUSDCBalance = async () => {
    if (!isConnected || !accountId || typeof window === 'undefined' || !window.ethereum) {
      return;
    }

    try {
      setIsLoadingBalance(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const tokenService = new TokenBalanceService(provider);
      
      const tokenBalances = await tokenService.getAllTokenBalances();
      const usdcToken = tokenBalances.find(token => token.symbol === 'USDC');
      
      if (usdcToken) {
        setUsdcBalance(usdcToken.formattedBalance);
      } else {
        setUsdcBalance('0');
      }
    } catch (error) {
      console.error('Error fetching USDC balance:', error);
      setUsdcBalance('0');
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // Fetch balance on mount and when wallet changes
  useEffect(() => {
    if (isConnected) {
      fetchUSDCBalance();
    } else {
      setUsdcBalance('0');
    }
  }, [isConnected, accountId]);

  // Simulate live payment tracking (in real app, this would come from device server events)
  useEffect(() => {
    if (!selectedDevice || !isTracking) return;

    const interval = setInterval(() => {
      // This would be replaced with actual device server payment notifications
      // For now, we'll simulate a payment every 30 seconds if there's allowance
      if (parseFloat(allowance) > parseFloat(selectedDevice.hostingFee)) {
        const newAllowance = (parseFloat(allowance) - parseFloat(selectedDevice.hostingFee)).toFixed(6);
        setAllowance(newAllowance);
        
        // Add simulated payment transaction
        addTransaction({
          type: 'payment',
          amount: selectedDevice.hostingFee,
          to: selectedDevice.walletAddress,
          txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
          status: 'confirmed'
        });
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [selectedDevice, allowance, isTracking, addTransaction]);

  const startTracking = () => {
    setIsTracking(true);
    // In real app, this would connect to device server WebSocket for live updates
  };

  const stopTracking = () => {
    setIsTracking(false);
  };

  if (!selectedDevice) {
    return null;
  }

  const totalSpent = transactions
    .filter(tx => tx.type === 'payment' && tx.status === 'confirmed')
    .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

  const remainingAllowance = Math.max(0, 10 - totalSpent);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-blue-800">
          📊 Live Payment Tracker
        </h3>
        <div className="flex items-center space-x-2">
          {isTracking ? (
            <button
              onClick={stopTracking}
              className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200"
            >
              Stop Tracking
            </button>
          ) : (
            <button
              onClick={startTracking}
              className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded hover:bg-green-200"
            >
              Start Tracking
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs">
        <div className="bg-white p-3 rounded border">
          <div className="flex items-center justify-between mb-1">
            <div className="text-gray-600">USDC Balance</div>
            <button
              onClick={fetchUSDCBalance}
              disabled={isLoadingBalance}
              className="text-xs text-blue-500 hover:text-blue-700 disabled:opacity-50"
            >
              {isLoadingBalance ? '⏳' : '🔄'}
            </button>
          </div>
          <div className="text-lg font-bold text-green-600">
            {isLoadingBalance ? 'Loading...' : `${parseFloat(usdcBalance).toFixed(6)} USDC`}
          </div>
        </div>
        
        <div className="bg-white p-3 rounded border">
          <div className="text-gray-600 mb-1">Remaining Allowance</div>
          <div className="text-lg font-bold text-blue-600">
            {remainingAllowance.toFixed(6)} USDC
          </div>
        </div>
        
        <div className="bg-white p-3 rounded border">
          <div className="text-gray-600 mb-1">Total Spent</div>
          <div className="text-lg font-bold text-red-600">
            {totalSpent.toFixed(6)} USDC
          </div>
        </div>
        
        <div className="bg-white p-3 rounded border">
          <div className="text-gray-600 mb-1">Hosting Fee</div>
          <div className="text-lg font-bold text-purple-600">
            {selectedDevice.hostingFee} USDC
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-600">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
          <span>{isTracking ? 'Live tracking active' : 'Tracking paused'}</span>
        </div>
        <div className="mt-1">
          Device: {selectedDevice.walletAddress.slice(0, 6)}...{selectedDevice.walletAddress.slice(-4)}
        </div>
      </div>

      <div className="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-800">
        💡 <strong>Balance Sync:</strong> USDC balance now matches Token Balances section above!
        {isTracking && (
          <div className="mt-1">
            🔴 <strong>Live Updates:</strong> Payment deductions will appear here in real-time as you chat!
          </div>
        )}
      </div>
    </div>
  );
};
