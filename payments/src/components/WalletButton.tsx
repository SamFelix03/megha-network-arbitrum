'use client';

import { useWallet } from '@/providers/WalletProvider';

export function WalletButton() {
    const { connect, disconnect, accountId, balance, isConnecting, isConnected } = useWallet();

    if (isConnecting) {
        return (
            <button 
                disabled
                className="px-6 py-3 rounded-lg bg-blue-500 text-white border border-blue-500 font-medium opacity-75 animate-pulse"
            >
                Connecting...
            </button>
        );
    }

    if (isConnected && accountId) {
        return (
            <div className="flex flex-col items-end space-y-2">
                <div className="text-right">
                    <div className="text-sm text-gray-400">Account</div>
                    <div className="text-blue-500 font-mono text-sm">
                        {accountId.slice(0, 6)}...{accountId.slice(-4)}
                    </div>
                    {balance && (
                        <div className="text-xs text-gray-500">
                            {parseFloat(balance).toFixed(4)} ETH
                        </div>
                    )}
                </div>
                <button 
                    onClick={disconnect}
                    className="px-4 py-2 rounded-lg bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30 transition-all duration-300 text-sm hover:scale-105 active:scale-95"
                >
                    Disconnect
                </button>
            </div>
        );
    }

    return (
        <button 
            onClick={connect}
            className="px-6 py-3 rounded-lg bg-blue-500/20 text-blue-500 border border-blue-500/30 hover:bg-blue-500/30 transition-all duration-300 font-medium hover:scale-105 active:scale-95"
        >
            Connect Wallet
        </button>
    );
}
