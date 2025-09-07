'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { TokenBalanceService, TokenBalance } from '@/services/tokenBalanceService';
import { useWallet } from '@/providers/WalletProvider';

export const TokenBalances = () => {
  const { isConnected, accountId } = useWallet();
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = async () => {
    if (!isConnected || !accountId || typeof window === 'undefined' || !window.ethereum) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const tokenService = new TokenBalanceService(provider);
      
      const tokenBalances = await tokenService.getAllTokenBalances();
      setBalances(tokenBalances);
    } catch (error) {
      console.error('Error fetching token balances:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch balances');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchBalances();
    } else {
      setBalances([]);
      setError(null);
    }
  }, [isConnected, accountId]);

  if (!isConnected) {
    return (
      <div className="text-sm text-gray-500">
        Connect wallet to view balances
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Token Balances</h3>
        <button
          onClick={fetchBalances}
          disabled={isLoading}
          className="text-xs text-blue-500 hover:text-blue-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-gray-500">Loading balances...</span>
        </div>
      )}

      {error && (
        <div className="text-xs text-red-500">
          Error: {error}
        </div>
      )}

      {!isLoading && !error && balances.length === 0 && (
        <div className="text-xs text-gray-500">
          No token balances found
        </div>
      )}

      {!isLoading && !error && balances.length > 0 && (
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {balances.map((token) => (
            <div key={token.address} className="flex justify-between items-center text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium text-gray-700">{token.symbol}</span>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-800">
                  {parseFloat(token.formattedBalance).toFixed(4)}
                </div>
                <div className="text-gray-500 truncate max-w-20" title={token.address}>
                  {token.address.slice(0, 6)}...{token.address.slice(-4)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {balances.length > 0 && (
        <div className="text-xs text-gray-500 border-t pt-1">
          Total: {balances.length} token{balances.length !== 1 ? 's' : ''} with balance
        </div>
      )}
    </div>
  );
};
