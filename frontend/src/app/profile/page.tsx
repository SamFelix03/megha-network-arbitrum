"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useWallet } from "@/providers/WalletProvider";
export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { accountId, balance, disconnect } = useWallet();

  useEffect(() => {
    if (accountId) {
      setIsLoading(false);
    }
  }, [accountId]);

  // Fix hydration issues by waiting for component to mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Return a loading state until mounted to avoid hydration errors
  if (!mounted) {
    return (
      <div className="pt-24 min-h-screen bg-cyber">
        <div className="container mx-auto px-4 pb-16">
          <motion.h1
            className="text-3xl md:text-4xl font-bold mb-10 text-center gradient-franky-text font-logo"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Your Profile
          </motion.h1>
          <div className="text-center py-20 text-white/70">
            <p className="text-xl font-sen">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-cyber">
      <div className="container mx-auto px-4 pb-16">
        <motion.h1
          className="text-3xl md:text-4xl font-bold mb-10 text-center gradient-franky-text font-logo"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Your Profile
        </motion.h1>

        <div className="max-w-2xl mx-auto">
          <motion.div
            className="card-cyber"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-2 text-center">
              <div className="inline-block p-4 bg-franky-cyan/10 rounded-full mb-4">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                    stroke="#9ca3af"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M20 21C20 16.5817 16.4183 13 12 13C7.58172 13 4 16.5817 4 21"
                    stroke="#9ca3af"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="flex justify-center">
                {accountId ? (
                  <div className="mb-6 p-3 rounded-lg bg-franky-cyan/10 border border-stone-800">
                    <div className="flex items-center">
                      <div className="flex justify-center items-center h-8 w-8 rounded-full bg-franky-cyan/20 mr-3">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-franky-cyan"
                        >
                          <path
                            d="M5 13l4 4L19 7"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-franky-cyan font-medium font-sen">
                          Wallet connected
                        </p>
                        <p className="text-xs text-gray-400 font-sen">
                          {accountId
                            ? `${accountId.substring(
                                0,
                                6
                              )}...${accountId.substring(accountId.length - 4)}`
                            : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      if (accountId) {
                        disconnect();
                      }
                    }}
                    className="btn-cyber glow-cyan font-sen mb-4"
                  >
                    Connect Wallet
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-center space-x-12 items-center">
              {balance && (
                <div className="flex items-center gap-2 my-auto h-full pb-6">
                  <Image
                    src="/hedera.png"
                    alt="Token Logo"
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                  <span className="text-franky-cyan text-xl font-medium font-sen">
                    {parseFloat(balance).toFixed(3)}
                  </span>
                  <span className="text-franky-cyan/70 text-xl font-sen">
                    ETH
                  </span>
                </div>
              )}
            </div>

            {accountId && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                <Link href="/profile/agents">
                  <motion.div
                    className="flex flex-col items-center justify-center p-6 bg-franky-cyan/5 border border-stone-800 rounded-lg hover:bg-franky-cyan/10 transition-colors cursor-pointer"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div className="w-14 h-14 flex items-center justify-center bg-franky-cyan/10 rounded-full mb-3">
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 2L20 7V17L12 22L4 17V7L12 2Z"
                          stroke="#ef4444"
                          strokeWidth="1.5"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="3"
                          stroke="#ef4444"
                          strokeWidth="1.5"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-white font-sen">
                      My Agents
                    </h3>
                    <p className="text-white/60 text-sm text-center mt-1 font-sen">
                      View and manage your registered agents
                    </p>
                  </motion.div>
                </Link>

                <Link href="/profile/devices">
                  <motion.div
                    className="flex flex-col items-center justify-center p-6 bg-franky-cyan/5 border border-stone-800 rounded-lg hover:bg-franky-cyan/10 transition-colors cursor-pointer"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div className="w-14 h-14 flex items-center justify-center bg-franky-cyan/10 rounded-full mb-3">
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          x="2"
                          y="4"
                          width="20"
                          height="16"
                          rx="2"
                          stroke="#3b82f6"
                          strokeWidth="1.5"
                        />
                        <path d="M2 10H22" stroke="#3b82f6" strokeWidth="1.5" />
                        <circle
                          cx="12"
                          cy="16"
                          r="2"
                          stroke="#3b82f6"
                          strokeWidth="1.5"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-white font-sen">
                      My Devices
                    </h3>
                    <p className="text-white/60 text-sm text-center mt-1 font-sen">
                      View and manage your registered devices
                    </p>
                  </motion.div>
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
