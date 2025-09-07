'use client';

import { useState } from 'react';
import { usePayment } from '@/providers/PaymentProvider';
import { useDevice } from '@/providers/DeviceProvider';

interface PaymentApprovalModalProps {
  onApproved: () => void;
  onCancel: () => void;
}

export const PaymentApprovalModal = ({ onApproved, onCancel }: PaymentApprovalModalProps) => {
  const { usdcBalance, isLoading, error, approveUSDC } = usePayment();
  const { selectedDevice } = useDevice();
  const [isApproving, setIsApproving] = useState(false);

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      await approveUSDC();
      onApproved();
    } catch (error) {
      console.error('Approval failed:', error);
    } finally {
      setIsApproving(false);
    }
  };

  if (!selectedDevice) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-6 animate-fade-in">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Approve USDC Payment
          </h2>
          <p className="text-gray-600">
            Approve spending up to 10 USDC for automatic hosting fee payments
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Your USDC Balance:</span>
              <span className="text-sm font-semibold text-blue-600">
                {usdcBalance ? `${parseFloat(usdcBalance).toFixed(2)} USDC` : 'Loading...'}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Hosting Fee:</span>
              <span className="text-sm font-semibold text-gray-800">
                {selectedDevice.hostingFee} USDC per message
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Max Approval:</span>
              <span className="text-sm font-semibold text-green-600">10 USDC</span>
            </div>
          </div>

          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This approval allows automatic deduction of hosting fees for each message. 
              You'll only need to approve again when the 10 USDC limit is reached.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            disabled={isApproving}
            className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleApprove}
            disabled={isApproving || isLoading}
            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isApproving ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Approving...
              </div>
            ) : (
              'Approve 10 USDC'
            )}
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            You'll be prompted to sign the transaction in MetaMask
          </p>
        </div>
      </div>
    </div>
  );
};
