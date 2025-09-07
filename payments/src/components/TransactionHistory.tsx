'use client';

import { usePayment } from '@/providers/PaymentProvider';
import { useState } from 'react';

export const TransactionHistory = () => {
  const { transactions } = usePayment();
  const [isExpanded, setIsExpanded] = useState(false);

  if (transactions.length === 0) {
    return null;
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'approval': return '🔓';
      case 'payment': return '💸';
      default: return '📝';
    }
  };

  const getExplorerUrl = (txHash: string) => {
    return `https://sepolia.arbiscan.io/tx/${txHash}`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-800">
          💰 Payment History ({transactions.length})
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          {isExpanded ? 'Hide' : 'Show'} Details
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-2">
          {transactions.slice(0, 10).map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getTypeIcon(tx.type)}</span>
                <div>
                  <div className="font-medium">
                    {tx.type === 'approval' ? 'USDC Approval' : 'Hosting Fee Payment'}
                  </div>
                  <div className="text-gray-500">
                    {tx.amount} USDC → {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(tx.status)}`}>
                  {tx.status}
                </span>
                <div className="text-right">
                  <div className="text-gray-500">{formatTime(tx.timestamp)}</div>
                  <a
                    href={getExplorerUrl(tx.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    View TX
                  </a>
                </div>
              </div>
            </div>
          ))}
          
          {transactions.length > 10 && (
            <div className="text-xs text-gray-500 text-center pt-2">
              Showing latest 10 transactions
            </div>
          )}
        </div>
      )}

      {!isExpanded && (
        <div className="flex items-center space-x-4 text-xs text-gray-600">
          <div className="flex items-center space-x-1">
            <span>🔓</span>
            <span>{transactions.filter(tx => tx.type === 'approval').length} Approvals</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>💸</span>
            <span>{transactions.filter(tx => tx.type === 'payment').length} Payments</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>✅</span>
            <span>{transactions.filter(tx => tx.status === 'confirmed').length} Confirmed</span>
          </div>
        </div>
      )}
    </div>
  );
};
