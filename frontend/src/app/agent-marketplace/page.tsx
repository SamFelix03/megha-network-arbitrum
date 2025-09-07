"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiCpu,
  FiHash,
  FiDollarSign,
  FiUser,
  FiUserCheck,
  FiX,
  FiCopy,
  FiCheck,
} from "react-icons/fi";
import { useWallet } from "@/providers/WalletProvider";
import { createPublicClient, http } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { FRANKY_ADDRESS, FRANKY_ABI } from "@/lib/constants";

// Define agent interface to match the Registry contract
type Agent = {
  uuid: string;
  name: string;
  description: string;
  personality: string;
  scenario: string;
  messageExample: string;
  tools: string[];
  imageUrl: string;
  ownerAddress: string;
};

const Background = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 grid-cyber opacity-30"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-emerald-900/10"></div>
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
              className="text-franky-blue"
            />
          </pattern>
        </defs>
        <rect width="100%" height="200%" fill="url(#hexagons)" />
      </svg>

      <motion.div
        className="absolute w-96 h-96 rounded-full bg-franky-blue-20 blur-3xl"
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
        className="absolute w-64 h-64 rounded-full bg-franky-purple-20 blur-3xl"
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
};

// Agent card component
const AgentCard = ({
  keyVal,
  agent,
  onClick,
}: {
  keyVal: string;
  agent: Agent;
  onClick: () => void;
}) => {
  return (
    <motion.div
      key={keyVal}
      className="card-cyber h-full flex flex-col hover:glow-cyan cursor-pointer group"
      whileHover={{
        y: -5,
        scale: 1.02,
      }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        {agent.imageUrl ? (
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-franky-blue-30 flex-shrink-0">
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
          <div className="flex justify-center items-center w-16 h-16 rounded-full bg-franky-blue-20 text-franky-blue animate-glow group-hover:text-franky-purple transition-colors flex-shrink-0">
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
          <span className="text-franky-blue text-sm">⚡</span>
          <span className="text-gray-300 text-sm font-sen">
            {agent.tools.length} Capabilities
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          {agent.tools.slice(0, 2).map((tool, index) => (
            <span
              key={index}
              className="bg-franky-blue-10 text-franky-blue px-2 py-1 rounded-full text-xs font-sen border border-franky-blue-20"
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
      <div className="pt-3 border-t border-franky-blue-20">
        <div className="flex items-center justify-between text-xs text-gray-400 font-sen">
          <span>Owner</span>
          <span className="text-franky-blue font-mono">
            {`${agent.ownerAddress.slice(0, 6)}...${agent.ownerAddress.slice(-4)}`}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <motion.div
        className="mt-3 p-3 bg-franky-purple-10 hover:bg-franky-purple-20 transition-colors rounded-lg border border-franky-purple-20"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center justify-center gap-2">
          <span className="text-franky-blue font-sen font-medium">View Details</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Agent Details Modal
const AgentDetailsModal = ({
  agent,
  isOpen,
  onClose,
  onConnect,
}: {
  agent: Agent | null;
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => void;
}) => {
  if (!isOpen || !agent) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-cyber pt-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-cyber max-w-lg w-full glow-cyan max-h-[80vh] overflow-y-auto"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white h-6 w-6 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/70 transition-colors"
          aria-label="Close modal"
        >
          <FiX className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3 mb-4 pr-6">
          {agent.imageUrl ? (
            <div className="w-14 h-14 rounded-full overflow-hidden border border-franky-blue-30 flex-shrink-0">
              <img
                src={agent.imageUrl}
                alt={agent.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="flex justify-center items-center w-14 h-14 rounded-full bg-franky-blue-20 text-franky-blue animate-glow flex-shrink-0">
              <FiUserCheck className="text-xl" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold gradient-franky-text font-sen mb-1">
              {agent.name}
            </h2>
            <p className="text-gray-300 text-sm font-sen leading-relaxed">
              {agent.description}
            </p>
          </div>
        </div>

        {/* Agent Details */}
        <div className="space-y-3 mb-4">
          {/* Agent Info */}
          <div className="p-3 rounded-lg bg-black/30 border border-franky-blue-20">
            <h3 className="text-sm font-semibold text-franky-blue mb-2 font-sen">
              Agent Information
            </h3>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-start gap-2">
                <span className="text-gray-400 font-sen">Agent ID:</span>
                <div className="flex items-center gap-1">
                  <span className="text-franky-blue font-mono text-xs break-all">{agent.uuid.slice(0, 12)}...</span>
                  <button
                    onClick={() => copyToClipboard(agent.uuid)}
                    className="text-gray-400 hover:text-franky-blue transition-colors"
                  >
                    <FiCopy className="w-3 h-3" />
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between items-start gap-2">
                <span className="text-gray-400 font-sen">Personality:</span>
                <span className="text-gray-300 font-sen text-right text-xs max-w-[65%]">
                  {agent.personality}
                </span>
              </div>
              
              <div className="flex justify-between items-start gap-2">
                <span className="text-gray-400 font-sen">Scenario:</span>
                <span className="text-gray-300 font-sen text-right text-xs max-w-[65%]">
                  {agent.scenario}
                </span>
              </div>
              
              <div className="flex justify-between items-start gap-2">
                <span className="text-gray-400 font-sen">First Message:</span>
                <span className="text-gray-300 font-sen text-right text-xs max-w-[65%] italic">
                  "{agent.messageExample}"
                </span>
              </div>
            </div>
          </div>

          {/* Capabilities */}
          <div className="p-3 rounded-lg bg-black/30 border border-franky-blue-20">
            <h3 className="text-sm font-semibold text-franky-blue mb-2 font-sen">
              Agent Capabilities ({agent.tools.length})
            </h3>
            
            <div className="grid grid-cols-1 gap-1">
              {agent.tools.map((tool, index) => (
                <div key={index} className="flex items-center p-2 rounded bg-franky-blue-10 border border-franky-blue-20">
                  <div className="w-4 h-4 bg-franky-blue rounded-full mr-2 flex items-center justify-center flex-shrink-0">
                    <span className="text-black text-xs font-bold">⚡</span>
                  </div>
                  <span className="text-franky-blue font-sen text-xs font-medium">{tool}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-2 p-2 rounded bg-black/30 border border-franky-blue">
              <p className="text-gray-400 font-sen text-xs italic">
                This agent can perform {agent.tools.length} specialized blockchain analysis tasks
              </p>
            </div>
          </div>

          {/* Owner Info */}
          <div className="p-3 rounded-lg bg-black/30 border border-franky-blue-20">
            <h3 className="text-sm font-semibold text-franky-blue mb-2 font-sen">
              Creator Details
            </h3>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-sen text-xs">Creator Address:</span>
              <div className="flex items-center gap-1">
                <span className="text-franky-blue font-mono text-xs">{agent.ownerAddress.slice(0, 8)}...{agent.ownerAddress.slice(-6)}</span>
                <button
                  onClick={() => copyToClipboard(agent.ownerAddress)}
                  className="text-gray-400 hover:text-franky-blue transition-colors"
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
            onClick={onClose}
            className="flex-1 py-2 px-4 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors font-sen text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Close
          </motion.button>
          <motion.button
            onClick={onConnect}
            className="flex-1 py-2 px-4 bg-franky-purple text-white rounded-lg font-bold hover:bg-franky-indigo transition-colors font-sen text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Connect & Chat
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default function AgentMarketplacePage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  const { accountId } = useWallet();
  const router = useRouter();

  // HCS service now auto-initializes globally, no manual initialization needed

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create public client to read from Registry contract
      const publicClient = createPublicClient({
        chain: arbitrumSepolia,
        transport: http(),
      });

      console.log("Fetching agents from Registry contract...");

      // Call getAllAgents function
      const allAgents = await publicClient.readContract({
        address: FRANKY_ADDRESS as `0x${string}`,
        abi: FRANKY_ABI,
        functionName: "getAllAgents",
      }) as Agent[];

      console.log("🤖 All Agents from contract:", allAgents);
      
      setAgents(allAgents);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching agents from contract:", err);
      setLoading(false);
      setError("Failed to fetch agents from blockchain");
    }
  };

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAgent(null);
  };

  const handleConnectAgent = async () => {
    if (!accountId) {
      alert("Please connect your wallet first");
      return;
    }

    if (!selectedAgent) return;

    try {
      console.log('Connecting to agent:', selectedAgent);
      
      // Redirect to device marketplace with agent UUID
      router.push(`/marketplace?agentUuid=${selectedAgent.uuid}`);
      
      handleCloseModal();
      
    } catch (error) {
      console.error("Error connecting to agent:", error);
      alert("Failed to connect to agent. Please try again.");
    }
  };


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
              Agent Marketplace
            </h1>
            <p className="text-xl mb-6 text-gray-400 max-w-4xl mx-auto font-desc">
              Connect and chat with AI agents powered by blockchain technology.
            </p>
            <p className="text-lg mb-6 text-franky-blue max-w-4xl mx-auto font-sen">
              Secure, decentralized conversations with AI agents.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Marketplace Section */}
      <section className="py-10 px-6">
        <div className="container mx-auto">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-franky-blue mb-4"></div>
              <p className="text-gray-400 font-sen">
                Loading agents from blockchain...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-20 px-4">
              <div className="card-cyber max-w-2xl mx-auto">
                <p className="text-xl text-red-400 mb-4 font-sen">
                  Error loading agents
                </p>
                <p className="text-gray-400 font-sen">{error}</p>
              </div>
            </div>
          ) : agents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent, idx) => (
                <AgentCard
                  keyVal={idx.toString()}
                  key={idx.toString()}
                  agent={agent}
                  onClick={() => handleAgentSelect(agent)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-gray-400 mb-3 font-sen">
                No agents found on the blockchain.
              </p>
              <Link href="/create-agent">
                <motion.button
                  className="px-6 py-2 rounded-none bg-franky-purple-20 border border-franky-purple-50 text-franky-purple hover:bg-franky-purple hover:text-white transition-colors font-sen"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Create the first agent!
                </motion.button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Agent Details Modal */}
      <AgentDetailsModal
        agent={selectedAgent}
        isOpen={showModal}
        onClose={handleCloseModal}
        onConnect={handleConnectAgent}
      />
    </>
  );
}
