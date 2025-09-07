'use client';

import { usePayment } from '@/providers/PaymentProvider';
import { useDevice } from '@/providers/DeviceProvider';

export const PaymentInfo = () => {
  const { usdcBalance, error } = usePayment();
  const { selectedDevice } = useDevice();

  if (!selectedDevice) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <h3 className="text-sm font-medium text-blue-800 mb-2">
        💡 How Automatic Payments Work
      </h3>
      <div className="text-xs text-blue-700 space-y-1">
        <p><strong>Step 1:</strong> Approve 10 USDC spending limit (one-time)</p>
        <p><strong>Step 2:</strong> Device automatically deducts {selectedDevice.hostingFee} USDC per message</p>
        <p><strong>Step 3:</strong> No more MetaMask popups after approval!</p>
        <p><strong>Step 4:</strong> When allowance runs low, approve another 10 USDC</p>
      </div>
      
      {usdcBalance && (
        <div className="mt-2 text-xs">
          <p><strong>Your USDC Balance:</strong> {usdcBalance} USDC</p>
          <p><strong>Hosting Fee:</strong> {selectedDevice.hostingFee} USDC per message</p>
        </div>
      )}
      
      {error && (
        <div className="mt-2 text-xs text-red-600">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}
    </div>
  );
};
