'use client';

import { usePayment } from '@/providers/PaymentProvider';

export const USDCBalance = () => {
  const { usdcBalance, isLoading, error, refreshBalance } = usePayment();

  return (
    <div className="flex items-center space-x-2">
      <div className="text-sm text-gray-600">
        USDC Balance:
      </div>
      <div className="text-sm font-semibold text-green-600">
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        ) : error ? (
          <span className="text-red-500" title={error}>Error</span>
        ) : (
          usdcBalance ? `${parseFloat(usdcBalance).toFixed(2)} USDC` : 'N/A'
        )}
      </div>
      <button
        onClick={refreshBalance}
        className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
        disabled={isLoading}
      >
        Refresh
      </button>
    </div>
  );
};
