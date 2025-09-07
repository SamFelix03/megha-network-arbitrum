'use client';

import { useWallet } from '@/providers/WalletProvider';

export const NetworkStatus = () => {
  const { chainId, networkName, switchToArbitrumSepolia, isConnected } = useWallet();

  const isCorrectNetwork = chainId === '0x66eee'; // Arbitrum Sepolia

  if (!isConnected) {
    return null;
  }

  const handleSwitchNetwork = async () => {
    try {
      await switchToArbitrumSepolia();
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-2 h-2 rounded-full ${isCorrectNetwork ? 'bg-green-500' : 'bg-red-500'}`}></div>
      <div className="text-xs">
        {isCorrectNetwork ? (
          <span className="text-green-600 font-medium">{networkName}</span>
        ) : (
          <div className="flex items-center space-x-2">
            <span className="text-red-600">{networkName}</span>
            <button
              onClick={handleSwitchNetwork}
              className="text-xs text-blue-500 hover:text-blue-700 underline"
            >
              Switch to Arbitrum Sepolia
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
