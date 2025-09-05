'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { formatEther, createPublicClient, http } from 'viem'
import { arbitrumSepolia } from 'viem/chains'
import { FRANKY_ADDRESS, FRANKY_ABI } from '@/lib/constants'
import { useWallet } from '@/providers/WalletProvider'
import { FiCpu, FiHash, FiDollarSign, FiUser, FiUserCheck, FiX, FiCopy, FiCheck } from "react-icons/fi"

// Define interface types for our data
interface Agent {
  uuid: string;
  name: string;
  description: string;
  personality: string;
  scenario: string;
  messageExample: string;
  tools: string[];
  imageUrl: string;
  ownerAddress: string;
}

// Shared styles
const cardStyle = "bg-black/30 backdrop-blur-sm border border-[#00FF88]/20 rounded-lg p-4 mb-4 hover:border-[#00FF88]/40 transition-all cursor-pointer"
const labelStyle = "text-[#00FF88] text-sm"
const valueStyle = "text-white text-lg font-medium"
const emptyStateStyle = "text-white/60 italic text-center mt-12"

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const { accountId } = useWallet()
  // Fix hydration issues by waiting for component to mount
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && accountId) {
      setLoading(true)
      fetchAgents()
    }
  }, [accountId, mounted])

  const fetchAgents = async () => {
    if (!accountId) return

    setLoading(true)
    setError(null)

    try {
      // Create public client to read from Registry contract
      const publicClient = createPublicClient({
        chain: arbitrumSepolia,
        transport: http(),
      });

      console.log("Fetching agents by owner from Registry contract...");

      // Call getAgentsByOwner function
      const agentsByOwner = await publicClient.readContract({
        address: FRANKY_ADDRESS as `0x${string}`,
        abi: FRANKY_ABI,
        functionName: "getAgentsByOwner",
        args: [accountId as `0x${string}`],
      }) as Agent[];

      console.log("🤖 Agents by Owner from contract:", agentsByOwner);
      
      setAgents(agentsByOwner);
    } catch (error: any) {
      console.error("Error fetching agents from contract:", error)
      setError(error?.message || "Failed to load agents data")
    } finally {
      setLoading(false)
    }
  }

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
              My Agents
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
        <div className="text-center mb-16">
          <motion.h1
            className="text-4xl md:text-5xl font-bold gradient-franky-text font-sen mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            My Agents
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link href="/profile" className="inline-flex items-center text-franky-cyan/80 hover:text-franky-cyan transition-colors font-sen">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to Profile
            </Link>
          </motion.div>
        </div>

        {!accountId && (
          <div className="text-center py-20 text-white/70">
            <p className="text-xl">Please connect your wallet to view your agents</p>
          </div>
        )}

        {accountId && loading && (
          <div className="text-center py-20 text-white/70">
            <div className="w-12 h-12 border-4 border-franky-cyan/20 border-t-franky-cyan rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xl font-sen">Loading your agents...</p>
          </div>
        )}

        {accountId && !loading && error && (
          <div className="text-center py-20 text-red-400">
            <p className="text-xl font-sen">Error loading agents</p>
            <p className="text-sm mt-2 font-sen">{error}</p>
            <button
              onClick={fetchAgents}
              className="mt-4 px-4 py-2 bg-franky-cyan-20 text-franky-cyan rounded-lg hover:bg-franky-cyan-30 transition-colors font-sen"
            >
              Try Again
            </button>
          </div>
        )}

        {accountId && !loading && !error && (
          <div className="py-10 px-6">
            <div className="container mx-auto">
              {agents.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-xl text-gray-400 mb-3 font-sen">
                    No agents found on the blockchain.
                  </p>
                  <Link href="/create-agent">
                    <motion.button
                      className="px-6 py-2 rounded-none bg-franky-cyan-20 border border-franky-cyan-50 text-franky-cyan hover:bg-franky-cyan-30 transition-colors font-sen"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Create the first agent!
                    </motion.button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {agents.map((agent, idx) => (
                    <motion.div
                      key={idx.toString()}
                      className="card-cyber h-full flex flex-col hover:glow-cyan cursor-pointer group"
                      whileHover={{
                        y: -5,
                        scale: 1.02,
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5 }}
                      onClick={() => setSelectedAgent(agent)}
                    >
                      {/* Header */}
                      <div className="flex items-start gap-3 mb-4">
                        {agent.imageUrl ? (
                          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-franky-cyan-30 flex-shrink-0">
                            <img
                              src={agent.imageUrl}
                              alt={agent.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src =
                                  "https://placehold.co/100x100/038fa8/1A1A1A?text=AI&font=Roboto";
                              }}
                            />
                          </div>
                        ) : (
                          <div className="flex justify-center items-center w-16 h-16 rounded-full bg-franky-cyan-20 text-franky-cyan animate-glow group-hover:text-franky-orange transition-colors flex-shrink-0">
                            <FiUserCheck className="text-2xl" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold gradient-franky-text font-sen mb-1 truncate">
                            {agent.name}
                          </h3>
                          <p className="text-gray-300 text-sm font-sen line-clamp-2 leading-relaxed">
                            {agent.description}
                          </p>
                        </div>
                      </div>

                      {/* Capabilities Preview */}
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-franky-cyan text-sm">⚡</span>
                          <span className="text-gray-300 text-sm font-sen">
                            {agent.tools.length} Capabilities
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {agent.tools.slice(0, 2).map((tool, index) => (
                            <span
                              key={index}
                              className="bg-franky-cyan-10 text-franky-cyan px-2 py-1 rounded-full text-xs font-sen border border-franky-cyan-20"
                            >
                              {tool.split(' ').slice(0, 2).join(' ')}
                            </span>
                          ))}
                          {agent.tools.length > 2 && (
                            <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-xs font-sen">
                              +{agent.tools.length - 2}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Spacer */}
                      <div className="flex-grow"></div>

                      {/* Footer */}
                      <div className="pt-3 border-t border-franky-cyan-20">
                        <div className="flex items-center justify-between text-xs text-gray-400 font-sen">
                          <span>Creator</span>
                          <span className="text-franky-cyan font-mono">
                            {`${agent.ownerAddress.slice(0, 6)}...${agent.ownerAddress.slice(-4)}`}
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <motion.div
                        className="mt-3 p-3 bg-franky-cyan-10 hover:bg-franky-cyan-20 transition-colors rounded-lg border border-franky-cyan-20"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-franky-cyan font-sen font-medium">View Details</span>
                        </div>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Agent Details Modal */}
        <AnimatePresence>
          {selectedAgent && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-cyber pt-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAgent(null)}
            >
              <motion.div
                className="card-cyber max-w-lg w-full glow-cyan max-h-[80vh] overflow-y-auto"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close button */}
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-white h-6 w-6 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/70 transition-colors"
                  aria-label="Close modal"
                >
                  <FiX className="h-4 w-4" />
                </button>

                {/* Header */}
                <div className="flex items-start gap-3 mb-4 pr-6">
                  {selectedAgent.imageUrl ? (
                    <div className="w-14 h-14 rounded-full overflow-hidden border border-franky-cyan-30 flex-shrink-0">
                      <img
                        src={selectedAgent.imageUrl}
                        alt={selectedAgent.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex justify-center items-center w-14 h-14 rounded-full bg-franky-cyan-20 text-franky-cyan animate-glow flex-shrink-0">
                      <FiUserCheck className="text-xl" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold gradient-franky-text font-sen mb-1">
                      {selectedAgent.name}
                    </h2>
                    <p className="text-gray-300 text-sm font-sen leading-relaxed">
                      {selectedAgent.description}
                    </p>
                  </div>
                </div>

                {/* Agent Details */}
                <div className="space-y-3 mb-4">
                  {/* Agent Info */}
                  <div className="p-3 rounded-lg bg-black/30 border border-franky-cyan-20">
                    <h3 className="text-sm font-semibold text-franky-cyan mb-2 font-sen">
                      Agent Information
                    </h3>
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-gray-400 font-sen">Agent ID:</span>
                        <div className="flex items-center gap-1">
                          <span className="text-franky-cyan font-mono text-xs break-all">{selectedAgent.uuid.slice(0, 12)}...</span>
                          <button
                            onClick={() => navigator.clipboard.writeText(selectedAgent.uuid)}
                            className="text-gray-400 hover:text-franky-cyan transition-colors"
                          >
                            <FiCopy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-gray-400 font-sen">Personality:</span>
                        <span className="text-gray-300 font-sen text-right text-xs max-w-[65%]">
                          {selectedAgent.personality}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-gray-400 font-sen">Scenario:</span>
                        <span className="text-gray-300 font-sen text-right text-xs max-w-[65%]">
                          {selectedAgent.scenario}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-gray-400 font-sen">First Message:</span>
                        <span className="text-gray-300 font-sen text-right text-xs max-w-[65%] italic">
                          "{selectedAgent.messageExample}"
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Capabilities */}
                  <div className="p-3 rounded-lg bg-black/30 border border-franky-cyan-20">
                    <h3 className="text-sm font-semibold text-franky-cyan mb-2 font-sen">
                      Agent Capabilities ({selectedAgent.tools.length})
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-1">
                      {selectedAgent.tools.map((tool, index) => (
                        <div key={index} className="flex items-center p-2 rounded bg-franky-cyan-10 border border-franky-cyan-20">
                          <div className="w-4 h-4 bg-franky-cyan rounded-full mr-2 flex items-center justify-center flex-shrink-0">
                            <span className="text-black text-xs font-bold">⚡</span>
                          </div>
                          <span className="text-franky-cyan font-sen text-xs font-medium">{tool}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-2 p-2 rounded bg-black/30 border border-franky-cyan">
                      <p className="text-gray-400 font-sen text-xs italic">
                        This agent can perform {selectedAgent.tools.length} specialized blockchain analysis tasks
                      </p>
                    </div>
                  </div>

                  {/* Creator Info */}
                  <div className="p-3 rounded-lg bg-black/30 border border-franky-cyan-20">
                    <h3 className="text-sm font-semibold text-franky-cyan mb-2 font-sen">
                      Creator Details
                    </h3>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 font-sen text-xs">Creator Address:</span>
                      <div className="flex items-center gap-1">
                        <span className="text-franky-cyan font-mono text-xs">{selectedAgent.ownerAddress.slice(0, 8)}...{selectedAgent.ownerAddress.slice(-6)}</span>
                        <button
                          onClick={() => navigator.clipboard.writeText(selectedAgent.ownerAddress)}
                          className="text-gray-400 hover:text-franky-cyan transition-colors"
                        >
                          <FiCopy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <motion.button
                    onClick={() => setSelectedAgent(null)}
                    className="flex-1 py-2 px-4 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors font-sen text-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Close
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
} 