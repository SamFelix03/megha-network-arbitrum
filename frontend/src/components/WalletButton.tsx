'use client';

import { useWallet } from '@/providers/WalletProvider';
import { motion } from 'framer-motion';

export function WalletButton() {
    const { connect, disconnect, accountId, balance, isConnecting, isConnected } = useWallet();

    if (isConnecting) {
        return (
            <motion.button 
                disabled
                className="px-6 py-3 rounded-lg bg-franky-blue-30 text-franky-blue border border-franky-blue-30 font-sen"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
            >
                Connecting...
            </motion.button>
        );
    }

    if (isConnected && accountId) {
        return (
            <div className="flex flex-col items-end space-y-2">
                <div className="text-right">
                    <div className="text-sm text-gray-400 font-sen">Account</div>
                    <div className="text-franky-blue font-mono text-sm">
                        {accountId.slice(0, 6)}...{accountId.slice(-4)}
                    </div>
                </div>
                <motion.button 
                    onClick={disconnect}
                    className="px-4 py-2 rounded-lg bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30 transition-all duration-300 font-sen text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Disconnect
                </motion.button>
            </div>
        );
    }

    return (
        <motion.button 
            onClick={connect}
            className="px-6 py-3 rounded-lg bg-franky-purple/20 text-franky-purple border border-franky-purple/30 hover:bg-franky-purple/30 transition-all duration-300 font-sen glow-franky"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            Connect Wallet
        </motion.button>
    );
} 