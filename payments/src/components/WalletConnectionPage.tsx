'use client';

import { useState } from 'react';
import { useWallet } from '@/providers/WalletProvider';

interface WalletConnectionPageProps {
  onConnected: () => void;
}

export const WalletConnectionPage = ({ onConnected }: WalletConnectionPageProps) => {
  const [hoveredWallet, setHoveredWallet] = useState<string | null>(null);
  const { connect, isConnecting } = useWallet();

  const handleConnect = async () => {
    try {
      await connect();
      onConnected();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-scale-in">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Connect Your Wallet
          </h1>
          <p className="text-gray-600">
            Connect your wallet to start chatting with AI agents
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            onMouseEnter={() => setHoveredWallet("metamask")}
            onMouseLeave={() => setHoveredWallet(null)}
            className={`w-full flex items-center justify-start p-4 rounded-lg border transition-all duration-300 ${
              hoveredWallet === "metamask"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 bg-gray-50"
            } ${isConnecting ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md hover:scale-102 active:scale-98'}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <svg
                  className="w-8 h-8"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              </div>
              <div className="flex flex-col items-start">
                <span
                  className={`text-lg font-medium transition-colors ${
                    hoveredWallet === "metamask"
                      ? "text-blue-500"
                      : "text-gray-800"
                  }`}
                >
                  {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
                </span>
                <span className="text-xs text-gray-500">
                  Connect using MetaMask wallet
                </span>
              </div>
            </div>
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 mb-3">
            Secure • Fast • Reliable
          </p>
          <div className="flex justify-center space-x-4 text-xs text-gray-400">
            <span>🔒 Secure</span>
            <span>⚡ Fast</span>
            <span>🛡️ Reliable</span>
          </div>
        </div>

        {isConnecting && (
          <div className="mt-6 text-center animate-fade-in">
            <div className="inline-flex items-center space-x-2 text-blue-500">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Connecting to wallet...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
