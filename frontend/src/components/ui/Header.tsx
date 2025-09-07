"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useWallet } from "@/providers/WalletProvider";
import { useRef, useState, useEffect } from "react";
import { LogOut, User, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { createPublicClient, http, formatUnits } from "viem";
import { arbitrumSepolia } from "viem/chains";

// USDC contract configuration
const USDC_CONTRACT_ADDRESS = "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d";
const USDC_DECIMALS = 6;

// USDC ABI (simplified for balance check)
const USDC_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  }
] as const;

export default function Header() {
  const { accountId, disconnect } = useWallet();
  const [showLogout, setShowLogout] = useState(false);
  const [usdcBalance, setUsdcBalance] = useState<string | null>(null);
  const logoutTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userProfileRef = useRef(null);
  const router = useRouter();

  // Fetch USDC balance
  const fetchUSDCBalance = async () => {
    if (!accountId) return;
    
    try {
      const publicClient = createPublicClient({
        chain: arbitrumSepolia,
        transport: http(),
      });
      
      const balance = await publicClient.readContract({
        address: USDC_CONTRACT_ADDRESS as `0x${string}`,
        abi: USDC_ABI,
        functionName: 'balanceOf',
        args: [accountId as `0x${string}`],
      }) as bigint;
      
      const formattedBalance = formatUnits(balance, USDC_DECIMALS);
      setUsdcBalance(formattedBalance);
    } catch (error) {
      console.error('Error fetching USDC balance:', error);
      setUsdcBalance(null);
    }
  };

  useEffect(() => {
    if (accountId) {
      fetchUSDCBalance();
    } else {
      setUsdcBalance(null);
    }
  }, [accountId]);

  const handleMouseEnter = () => {
    if (logoutTimeoutRef.current) {
      clearTimeout(logoutTimeoutRef.current);
    }
    setShowLogout(true);
  };

  const handleMouseLeave = () => {
    logoutTimeoutRef.current = setTimeout(() => {
      setShowLogout(false);
    }, 500);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-cyber border-b border-stone-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <motion.div
              className="flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Image
                src="/logo.png"
                alt="Franky Logo"
                width={32}
                height={32}
                className="rounded-full"
              />
              <span
                className="ml-4 text-2xl font-bold gradient-franky-text font-desc "
                style={{
                  letterSpacing: "0.2em",
                }}
              >
                frankyagent.xyz
              </span>
            </motion.div>
          </Link>

          {accountId && (
            <div className="flex items-center gap-4">
              {/* Balance Display */}
              {usdcBalance && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex items-center"
                >
                  <div className="flex items-center gap-2 card-cyber py-2 px-3 rounded-none">
                    {/* USDC Logo */}
                    <Image
                      src="/usdc.png"
                      alt="USDC Logo"
                      width={20}
                      height={20}
                      className="mr-1"
                    />
                    <span className="text-franky-cyan font-medium font-sen">
                      {parseFloat(usdcBalance).toFixed(2)}
                    </span>
                    <span className="text-franky-cyan/70 font-sen text-sm">
                      USDC
                    </span>
                  </div>
                </motion.div>
              )}

              <div className="flex flex-1 items-center justify-end space-x-4 relative">
                {accountId && (
                  <div
                    ref={userProfileRef}
                    className="flex space-x-3 items-center cursor-pointer text-gray-300 hover:text-franky-cyan transition-colors font-sen"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <User size={22} />
                    <p className="cursor-pointer">
                      {accountId.slice(0, 6)}...{accountId.slice(-4)}
                    </p>

                    {/* Dropdown with Profile and Logout options */}
                    <AnimatePresence>
                      {showLogout && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full right-0 mt-2 z-50"
                          onMouseEnter={handleMouseEnter}
                          onMouseLeave={handleMouseLeave}
                        >
                          <div className="card-cyber overflow-hidden flex flex-col min-w-[160px] !p-2">
                            {/* Profile option */}
                            <Link href="/profile">
                              <div className="cursor-pointer flex space-x-2 items-center hover:bg-franky-cyan/10 p-2 text-gray-300 hover:text-franky-cyan transition-all font-sen w-full">
                                <UserCircle size={20} />
                                <p className="text-sm">Profile</p>
                              </div>
                            </Link>

                            <div className="h-px bg-franky-cyan/20"></div>

                            <div
                              onClick={() => {
                                disconnect();
                              }}
                              className="cursor-pointer flex space-x-2 items-center hover:bg-franky-orange/10 p-2 text-gray-300 hover:text-franky-orange transition-all font-sen w-full"
                            >
                              <LogOut size={20} />
                              <p className="text-sm">Log out</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
