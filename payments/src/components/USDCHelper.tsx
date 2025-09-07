'use client';

import { useState } from 'react';
import { usePayment } from '@/providers/PaymentProvider';
import { useWallet } from '@/providers/WalletProvider';

export const USDCHelper = () => {
  const { usdcBalance, isLoading, error } = usePayment();
  const { accountId } = useWallet();
  const [showHelper, setShowHelper] = useState(false);

  const hasUSDC = usdcBalance && parseFloat(usdcBalance) > 0;

  if (hasUSDC || isLoading) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-yellow-800">
            No USDC Balance Detected
          </h3>
          <p className="text-xs text-yellow-700 mt-1">
            You need USDC tokens to approve spending for chat interactions.
          </p>
        </div>
        <button
          onClick={() => setShowHelper(!showHelper)}
          className="text-xs text-yellow-600 hover:text-yellow-800 underline"
        >
          {showHelper ? 'Hide' : 'How to get USDC?'}
        </button>
      </div>
      
      {showHelper && (
        <div className="mt-3 text-xs text-yellow-700">
          <p className="mb-2">
            <strong>To get USDC on Arbitrum Sepolia:</strong>
          </p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>
              Visit{' '}
              <a 
                href="https://faucet.quicknode.com/arbitrum/sepolia" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Arbitrum Sepolia Faucet
              </a>
            </li>
            <li>
              Connect your wallet: <code className="bg-yellow-100 px-1 rounded">{accountId}</code>
            </li>
            <li>
              Request testnet ETH first (for gas fees)
            </li>
            <li>
              Visit{' '}
              <a 
                href="https://bridge.arbitrum.io/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Arbitrum Bridge
              </a>{' '}
              to bridge USDC from Ethereum Sepolia
            </li>
            <li>
              Or use{' '}
              <a 
                href="https://app.uniswap.org/#/swap" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Uniswap
              </a>{' '}
              to swap ETH for USDC
            </li>
          </ol>
          
          <div className="mt-3 p-2 bg-yellow-100 rounded">
            <p className="text-xs">
              <strong>Note:</strong> USDC contract on Arbitrum Sepolia: 
              <code className="bg-white px-1 rounded ml-1">0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d</code>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
