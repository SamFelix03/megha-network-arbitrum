'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createPublicClient, http } from 'viem'
import { arbitrumSepolia } from 'viem/chains'
import { FRANKY_ADDRESS, FRANKY_ABI } from '@/lib/constants'
import { useWallet } from '@/providers/WalletProvider'
import { FiCpu, FiHardDrive, FiServer, FiLink, FiSmartphone, FiHash } from "react-icons/fi"

interface Device {
  deviceModel: string;
  ram: string;
  cpu: string;
  storageCapacity: string;
  os: string;
  walletAddress: string;
  ownerAddress: string;
  timestamp: string;
  ngrokLink: string;
  hostingFee: string;
}


// Shared styles
const cardStyle = "bg-black/30 backdrop-blur-sm border border-[#00FF88]/20 rounded-lg p-4 mb-4 hover:border-[#00FF88]/40 transition-all cursor-pointer"
const labelStyle = "text-[#00FF88] text-sm"
const valueStyle = "text-white text-lg font-medium"
const emptyStateStyle = "text-white/60 italic text-center mt-12"

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [debugInfo, setDebugInfo] = useState<{
    functionSelector: string;
    allSelectors: { selector: string, from: string }[];
  } | null>(null)
  const { accountId } = useWallet()
  // Fix hydration issues by waiting for component to mount
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && accountId) {
      setLoading(true)
      fetchDevices(accountId)
    }
  }, [accountId, mounted])

  const fetchDevices = async (walletAddress: string) => {
    if (!accountId) return
    setLoading(true)
    setError(null)

    try {
      // Create public client to read from Registry contract
      const publicClient = createPublicClient({
        chain: arbitrumSepolia,
        transport: http(),
      });

      console.log("Fetching devices by owner from Registry contract...");

      // Call getDevicesByOwner function
      const devicesByOwner = await publicClient.readContract({
        address: FRANKY_ADDRESS as `0x${string}`,
        abi: FRANKY_ABI,
        functionName: "getDevicesByOwner",
        args: [walletAddress as `0x${string}`],
      }) as Device[];

      console.log("📦 Devices by Owner from contract:", devicesByOwner);
      
      setDevices(devicesByOwner);
    } catch (error: any) {
      console.error("Error fetching devices from contract:", error)
      setError(error?.message || "Failed to load devices data")
    } finally {
      setLoading(false)
    }
  }

  // Return a loading state until mounted to avoid hydration errors
  if (!mounted) {
    return (
      <div className="min-h-screen bg-cyber pt-32">
        <div className="container mx-auto px-4 pb-16">
          <div className="text-center mb-16">
            <motion.h1
              className="text-4xl md:text-5xl font-bold gradient-franky-text font-sen mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              My Devices
            </motion.h1>
          </div>
          <div className="text-center py-20 text-white/70">
            <p className="text-xl">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cyber pt-32">
      <div className="container mx-auto px-4 pb-16">
        <div className="text-center">
          <motion.h1
            className="text-4xl md:text-5xl font-bold gradient-franky-text font-sen mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            My Devices
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link href="/profile" className="inline-flex items-center text-franky-blue/80 hover:text-franky-blue transition-colors font-sen">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to Profile
            </Link>
          </motion.div>
        </div>

        {accountId && loading && (
          <div className="text-center py-20 text-white/70">
            <div className="w-12 h-12 border-4 border-franky-blue/20 border-t-franky-blue rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xl font-sen">Loading your devices...</p>
          </div>
        )}

        {accountId && !loading && error && (
          <div className="text-center py-20 text-red-400">
            <p className="text-xl font-sen">Error loading devices</p>
            <p className="text-sm mt-2 font-sen">{error}</p>
            <button
              onClick={() => fetchDevices(accountId || '')}
              className="mt-4 px-4 py-2 bg-franky-purple-20 text-franky-purple rounded-lg hover:bg-franky-purple hover:text-white transition-colors font-sen"
            >
              Try Again
            </button>
          </div>
        )}

        {accountId && !loading && !error && (
          <div className="py-10 px-6">
            <div className="container mx-auto">
              {devices.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-xl text-gray-400 mb-3 font-sen">
                    No devices found on the blockchain.
                  </p>
                  <Link href="/deploy-device">
                    <motion.button
                      className="px-6 py-2 rounded-none bg-franky-purple-20 border border-franky-purple-50 text-franky-purple hover:bg-franky-purple hover:text-white transition-colors font-sen"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Register the first device!
                    </motion.button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {devices.map((device, idx) => (
                    <motion.div
                      key={idx.toString()}
                      className="card-cyber h-full flex flex-col hover:glow-cyan cursor-pointer group rounded-none"
                      whileHover={{
                        y: -5,
                        scale: 1.02,
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="flex items-center mb-4">
                        <div className="flex justify-center items-center h-12 w-12 rounded-full bg-franky-blue-20 text-franky-blue mr-4 animate-glow group-hover:text-franky-purple transition-colors">
                          <FiSmartphone className="text-xl" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold gradient-franky-text font-sen">
                            {device.deviceModel || "Unknown Device"}
                          </h3>
                          <div className="flex items-center mt-1">
                            <span className="inline-block w-2 h-2 rounded-full bg-franky-blue animate-glow mr-2"></span>
                            <span className="text-sm text-gray-400 font-sen">
                              Active • {device.os}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3 flex-grow">
                        <div className="flex items-center text-gray-300 font-sen">
                          <FiCpu className="mr-2 text-franky-blue" />
                          <span>
                            CPU: {device.cpu || "Unknown"}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-300 font-sen">
                          <FiServer className="mr-2 text-franky-blue" />
                          <span>
                            RAM: {device.ram || "Unknown"}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-300 font-sen">
                          <FiHardDrive className="mr-2 text-franky-blue" />
                          <span>
                            Storage: {device.storageCapacity || "Unknown"}
                          </span>
                        </div>
                        <div className="flex items-start text-gray-300 font-sen">
                          <FiLink className="mr-2 text-franky-blue mt-1 flex-shrink-0" />
                          <span className="text-sm break-all">
                            {device.ngrokLink || "No link available"}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-300 font-sen">
                          <FiHash className="mr-2 text-franky-blue" />
                          <span>
                            Device Address:{" "}
                            <span className="text-franky-blue font-medium font-mono text-sm">
                              {device.walletAddress 
                                ? `${device.walletAddress.slice(0, 6)}...${device.walletAddress.slice(-4)}`
                                : "Unknown"}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center text-gray-300 font-sen">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-2 text-franky-blue"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>
                            Hosting Fee:{" "}
                            <span className="text-franky-blue font-medium">
                              {device.hostingFee && parseFloat(device.hostingFee) > 0
                                ? `${parseFloat(device.hostingFee).toFixed(2)} USDC`
                                : "Free"}
                            </span>
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-franky-blue-20">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400 font-sen">Owner</span>
                          <span className="text-xs text-franky-blue font-sen font-mono">
                            {device.ownerAddress 
                              ? `${device.ownerAddress.slice(0, 6)}...${device.ownerAddress.slice(-4)}`
                              : "Unknown"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-400 font-sen">Registered</span>
                          <span className="text-xs text-franky-blue font-sen">
                            {device.timestamp 
                              ? new Date(parseInt(device.timestamp)).toLocaleDateString()
                              : "Unknown"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-400 font-sen">OS</span>
                          <span className="text-xs text-franky-blue font-sen">
                            {device.os || "Unknown"}
                          </span>
                        </div>
                      </div>
                      <motion.button
                        className="mt-4 w-full py-2 rounded-lg bg-franky-purple-10 text-franky-purple hover:bg-franky-purple hover:text-white transition-colors font-sen font-medium"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        Device Details
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 