'use client';

import { useState } from 'react';
import { usePayment } from '@/providers/PaymentProvider';
import { useDevice } from '@/providers/DeviceProvider';

export const ApprovalTestButton = () => {
  const { approveUSDC, isLoading, error } = usePayment();
  const { selectedDevice } = useDevice();
  const [isApproving, setIsApproving] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleTestApproval = async () => {
    if (!selectedDevice) {
      alert('Please select a device first');
      return;
    }

    try {
      setIsApproving(true);
      setTxHash(null);
      
      console.log('Testing USDC approval...');
      const tx = await approveUSDC();
      
      console.log('Approval transaction:', tx);
      setTxHash(tx.hash);
      
      alert(`Approval successful! Transaction hash: ${tx.hash}`);
    } catch (error) {
      console.error('Approval test failed:', error);
      alert(`Approval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsApproving(false);
    }
  };

  if (!selectedDevice) {
    return null;
  }

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
      <h3 className="text-sm font-medium text-orange-800 mb-2">
        🧪 Test USDC Approval
      </h3>
      <p className="text-xs text-orange-700 mb-3">
        Click this button to test the USDC approval process and see the MetaMask popup.
      </p>
      
      <button
        onClick={handleTestApproval}
        disabled={isApproving || isLoading}
        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
      >
        {isApproving ? (
          <div className="flex items-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Testing Approval...
          </div>
        ) : (
          'Test USDC Approval'
        )}
      </button>

      {txHash && (
        <div className="mt-3 p-2 bg-green-100 rounded text-xs">
          <p className="text-green-800">
            <strong>✅ Approval Successful!</strong>
          </p>
          <p className="text-green-700 mt-1">
            Transaction Hash: <code className="bg-white px-1 rounded">{txHash}</code>
          </p>
          <a
            href={`https://sepolia.arbiscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline mt-1 block"
          >
            View on Arbitrum Sepolia Explorer
          </a>
        </div>
      )}

      {error && (
        <div className="mt-3 p-2 bg-red-100 rounded text-xs">
          <p className="text-red-800">
            <strong>❌ Error:</strong> {error}
          </p>
        </div>
      )}
    </div>
  );
};
