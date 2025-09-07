"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FiCpu,
  FiHardDrive,
  FiServer,
  FiLink,
  FiSmartphone,
  FiHash,
} from "react-icons/fi";
import { formatUnits, createPublicClient, http } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { FRANKY_ADDRESS, FRANKY_ABI } from "@/lib/constants";

// Define device interface to match Registry contract
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

// Background animation component
const Background = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 grid-cyber opacity-30"></div>
    {/* Gradient overlay for depth */}
    <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-emerald-900/10"></div>
    {/* Hexagon pattern */}
    <svg
      className="absolute inset-0 w-full h-full opacity-10"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="hexagons"
          width="50"
          height="43.4"
          patternUnits="userSpaceOnUse"
          patternTransform="scale(2)"
        >
          <path
            d="M25 0 L50 14.4 L50 38.6 L25 53 L0 38.6 L0 14.4 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-franky-cyan"
          />
        </pattern>
      </defs>
      <rect width="100%" height="200%" fill="url(#hexagons)" />
    </svg>
    {/* Animated glow spots */}
    <motion.div
      className="absolute w-96 h-96 rounded-full bg-franky-cyan-20 blur-3xl"
      style={{ top: "30%", left: "60%" }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.5, 0.8, 0.5],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
    <motion.div
      className="absolute w-64 h-64 rounded-full bg-franky-orange-20 blur-3xl"
      style={{ bottom: "20%", left: "30%" }}
      animate={{
        scale: [1, 1.3, 1],
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  </div>
);

// Device card component
const DeviceCard = ({
  device,
  onClick,
}: {
  device: Device;
  onClick: () => void;
}) => {
  // Remove unnecessary useEffect
  return (
    <motion.div
      className="card-cyber h-full flex flex-col hover:glow-cyan cursor-pointer group rounded-none"
      whileHover={{
        y: -5,
        scale: 1.02,
      }}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center mb-4">
        <div className="flex justify-center items-center h-12 w-12 rounded-full bg-franky-cyan-20 text-franky-cyan mr-4 animate-glow group-hover:text-franky-orange transition-colors">
          <FiSmartphone className="text-xl" />
        </div>
        <div>
          <h3 className="text-xl font-bold gradient-franky-text font-sen">
            {device.deviceModel || "Unknown Device"}
          </h3>
          <div className="flex items-center mt-1">
            <span className="inline-block w-2 h-2 rounded-full bg-franky-cyan animate-glow mr-2"></span>
            <span className="text-sm text-gray-400 font-sen">
              Active • {device.os}
            </span>
          </div>
        </div>
      </div>
      <div className="space-y-3 flex-grow">
        <div className="flex items-center text-gray-300 font-sen">
          <FiCpu className="mr-2 text-franky-cyan" />
          <span>
            CPU: {device.cpu || "Unknown"}
          </span>
        </div>
        <div className="flex items-center text-gray-300 font-sen">
          <FiServer className="mr-2 text-franky-cyan" />
          <span>
            RAM: {device.ram || "Unknown"}
          </span>
        </div>
        <div className="flex items-center text-gray-300 font-sen">
          <FiHardDrive className="mr-2 text-franky-cyan" />
          <span>
            Storage: {device.storageCapacity || "Unknown"}
          </span>
        </div>
        <div className="flex items-start text-gray-300 font-sen">
          <FiLink className="mr-2 text-franky-cyan mt-1 flex-shrink-0" />
          <span className="text-sm break-all">
            {device.ngrokLink || "No link available"}
          </span>
        </div>
        <div className="flex items-center text-gray-300 font-sen">
          <FiHash className="mr-2 text-franky-cyan" />
          <span>
            Device Address:{" "}
            <span className="text-franky-cyan font-medium font-mono text-sm">
              {device.walletAddress 
                ? `${device.walletAddress.slice(0, 6)}...${device.walletAddress.slice(-4)}`
                : "Unknown"}
            </span>
          </span>
        </div>
        <div className="flex items-center text-gray-300 font-sen">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-2 text-franky-cyan"
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
            <span className="text-franky-cyan font-medium">
              {device.hostingFee && parseFloat(device.hostingFee) > 0
                ? `${parseFloat(device.hostingFee).toFixed(2)} USDC`
                : "Free"}
            </span>
          </span>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-franky-cyan-20">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 font-sen">Owner</span>
          <span className="text-xs text-franky-cyan font-sen font-mono">
            {device.ownerAddress 
              ? `${device.ownerAddress.slice(0, 6)}...${device.ownerAddress.slice(-4)}`
              : "Unknown"}
          </span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-400 font-sen">Registered</span>
          <span className="text-xs text-franky-cyan font-sen">
            {device.timestamp 
              ? new Date(parseInt(device.timestamp)).toLocaleDateString()
              : "Unknown"}
          </span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-400 font-sen">OS</span>
          <span className="text-xs text-franky-cyan font-sen">
            {device.os || "Unknown"}
          </span>
        </div>
      </div>
      <motion.button
        className="mt-4 w-full py-2 rounded-lg bg-franky-cyan-10 text-franky-cyan hover:bg-franky-cyan-20 transition-colors font-sen font-medium"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        Select Device
      </motion.button>
    </motion.div>
  );
};

export default function MarketplacePage() {
  const [isClient, setIsClient] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const agentUuid = searchParams?.get('agentUuid');

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch devices from Registry contract
  useEffect(() => {
    if (!isClient) return;
    
    const fetchDevices = async () => {
      try {
        setLoading(true);
        setError(null);

        // Create public client to read from Registry contract
        const publicClient = createPublicClient({
          chain: arbitrumSepolia,
          transport: http(),
        });

        console.log("Fetching devices from Registry contract...");

        // Call getAllDevices function
        const allDevices = await publicClient.readContract({
          address: FRANKY_ADDRESS as `0x${string}`,
          abi: FRANKY_ABI,
          functionName: "getAllDevices",
        }) as Device[];

        console.log("📦 All Devices from contract:", allDevices);
        
        setDevices(allDevices);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching devices from contract:", err);
        setLoading(false);
        setError("Failed to fetch devices from blockchain");
      }
    };

    fetchDevices();
  }, [isClient]);

  const handleDeviceSelect = (device: Device) => {
    if (!device.walletAddress || !device.ngrokLink) return;
    
    if (agentUuid) {
      // If agent UUID is provided, redirect to chat page with all device details
      const params = new URLSearchParams({
        deviceNgrok: device.ngrokLink,
        deviceModel: device.deviceModel || '',
        ram: device.ram || '',
        storageCapacity: device.storageCapacity || '',
        cpu: device.cpu || '',
        os: device.os || '',
        walletAddress: device.walletAddress,
        hostingFee: device.hostingFee || '0'
      });
      
      router.push(`/agent-chat/${agentUuid}?${params.toString()}`);
    } else {
      // Otherwise, redirect to create agent (existing functionality)
      router.push(`/create-agent/${device.walletAddress}`);
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <>
      <Background />
      {/* Hero Section */}
      <section className="pt-32 px-6 relative">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-8 gradient-franky-text font-logo">
              {agentUuid ? 'Select Chat Device' : 'Device Marketplace'}
            </h1>
            <p className="text-xl mb-6 text-gray-400 max-w-4xl mx-auto font-desc">
              {agentUuid 
                ? 'Choose a device to host your chat session with the selected AI agent.'
                : 'Browse and select from available deployed devices to host your AI agents. These devices have been registered on-chain and are ready to run your agents.'
              }
            </p>
            {!agentUuid && (
              <p className="text-lg mb-12 text-franky-cyan max-w-4xl mx-auto font-sen">
                Each device shows its hosting fee in USDC tokens - this is what
                you'll pay to deploy your agent to the device.
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Marketplace Section */}
      <section className="py-10 px-6">
        <div className="container mx-auto">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-franky-cyan mb-4"></div>
              <p className="text-gray-400 font-sen">
                Loading devices from Registry contract...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-20 px-4">
              <div className="card-cyber max-w-2xl mx-auto">
                <p className="text-xl text-red-400 mb-4 font-sen">
                  Error loading devices
                </p>
                <p className="text-gray-400 font-sen">{error}</p>
              </div>
            </div>
          ) : devices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {devices.map((device, idx) => (
                <DeviceCard
                  key={`${device.walletAddress}-${idx}`}
                  device={device}
                  onClick={() => handleDeviceSelect(device)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-gray-400 mb-3 font-sen">
                No devices found on the blockchain.
              </p>
              <Link href="/deploy-device">
                <motion.button
                  className="px-6 py-2 rounded-lg bg-franky-cyan-20 border border-franky-cyan-50 text-franky-cyan hover:bg-franky-cyan-30 transition-colors font-sen"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Deploy the first device!
                </motion.button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Add Device CTA */}
      <section className="py-10 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="card-cyber text-center rounded-none"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4 gradient-franky-text font-sen">
              Start Earning Money Now!
            </h2>
            <p className="text-gray-400 mb-6 font-sen">
              Deploy your idle mobile devices and earn USDC by providing
              computing resources for AI agents.
            </p>
            <Link href="/deploy-device">
              <motion.button
                className="px-8 py-3 rounded-none bg-franky-cyan-20 border border-franky-cyan-50 text-franky-cyan text-lg font-bold hover:bg-franky-cyan-30 transition-colors font-sen"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Deploy Your Device →
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
