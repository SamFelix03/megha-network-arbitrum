"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiUploadCloud,
  FiCheck,
  FiX,
  FiCopy,
  FiImage,
  FiExternalLink,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useWallet } from "@/providers/WalletProvider";
import { createWalletClient, custom } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/constants";
import { v4 as uuidv4 } from 'uuid';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  selected?: boolean;
}

// Character data interface
interface CharacterData {
  name: string;
  description: string;
  personality: string;
  scenario: string;
  first_mes: string;
  mes_example: string;
  creatorcomment: string;
  tags: string[];
  talkativeness: number;
  fav: boolean;
}

// Agent creation result interface
interface AgentCreationResult {
  uuid: string;
  name: string;
  description: string;
  tools: string[];
  imageUrl: string;
  txHash: string;
}

// Available tools
const availableTools: Tool[] = [
  {
    id: "wallet-activity",
    name: "Get Wallet Activity",
    description: "Check which chains a wallet address is active on",
    icon: "🔍",
  },
  {
    id: "native-balance",
    name: "Get Native Token Balance", 
    description: "Get native token balance for wallet on specific chain",
    icon: "💰",
  },
  {
    id: "tx-summary",
    name: "Get Transaction Summary",
    description: "Get transaction summary for wallet address on chain",
    icon: "📊",
  },
  {
    id: "nft-owned",
    name: "Get NFTs Owned",
    description: "Get NFTs owned by an address on specific chain",
    icon: "🖼️",
  },
  {
    id: "token-approvals",
    name: "Get Token Approvals",
    description: "Show token approvals for address on specific chain",
    icon: "✅",
  },
  {
    id: "btc-balances",
    name: "Get Bitcoin Balances",
    description: "Fetch BTC HD wallet child balances for xpub",
    icon: "₿",
  },
];

// Modified ConstructionZone Component
function ConstructionZone({
  availableTools,
  selectedTools,
  onToolToggle,
}: {
  availableTools: Tool[];
  selectedTools: Tool[];
  onToolToggle: (toolId: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {availableTools.map((tool) => {
        const isSelected = selectedTools.some((t) => t.id === tool.id);
        return (
          <div
            key={tool.id}
            onClick={() => onToolToggle(tool.id)}
            className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 font-sen ${
              isSelected
                ? "bg-franky-blue-20 border-franky-blue glow-cyan"
                : "card-cyber hover:bg-franky-blue-10"
            }`}
          >
            <div className="flex items-center">
              <span className="text-2xl mr-3">{tool.icon}</span>
              <div>
                <h3 className="text-franky-blue font-medium">{tool.name}</h3>
                <p className="text-sm text-gray-400">{tool.description}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Character Builder Component
function CharacterBuilder({
  characterData,
  setCharacterData,
  onSubmit,
}: {
  characterData: CharacterData;
  setCharacterData: React.Dispatch<React.SetStateAction<CharacterData>>;
  onSubmit: () => void;
}) {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCharacterData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTags = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsArray = e.target.value.split(",").map((tag) => tag.trim());
    setCharacterData((prev) => ({
      ...prev,
      tags: tagsArray,
    }));
  };

  const handleTalkativeness = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCharacterData((prev) => ({
      ...prev,
      talkativeness: parseFloat(e.target.value),
    }));
  };

  const handleFav = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCharacterData((prev) => ({
      ...prev,
      fav: e.target.checked,
    }));
  };

  return (
    <div className="card-cyber">
      <h2 className="text-xl font-semibold text-franky-blue mb-4 font-sen">
        Character Builder
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-gray-300 mb-1 text-sm font-sen">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={characterData.name}
            onChange={handleChange}
            className="w-full p-2 rounded-lg card-cyber text-white focus:outline-none focus:ring-2 focus:ring-franky-blue font-sen"
            placeholder="Agent name"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-1 text-sm font-sen">
            Description
          </label>
          <textarea
            name="description"
            value={characterData.description}
            onChange={handleChange}
            className="w-full p-2 rounded-lg card-cyber text-white focus:outline-none focus:ring-2 focus:ring-franky-blue font-sen"
            rows={3}
            placeholder="Describe your agent"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-1 text-sm font-sen">
            Personality
          </label>
          <input
            type="text"
            name="personality"
            value={characterData.personality}
            onChange={handleChange}
            className="w-full p-2 rounded-lg card-cyber text-white focus:outline-none focus:ring-2 focus:ring-franky-blue font-sen"
            placeholder="Personality traits"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-1 text-sm font-sen">
            Scenario
          </label>
          <textarea
            name="scenario"
            value={characterData.scenario}
            onChange={handleChange}
            className="w-full p-2 rounded-lg card-cyber text-white focus:outline-none focus:ring-2 focus:ring-franky-blue font-sen"
            rows={3}
            placeholder="Usage scenario"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-1 text-sm font-sen">
            First Message
          </label>
          <textarea
            name="first_mes"
            value={characterData.first_mes}
            onChange={handleChange}
            className="w-full p-2 rounded-lg card-cyber text-white focus:outline-none focus:ring-2 focus:ring-franky-blue font-sen"
            rows={2}
            placeholder="First message from agent"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-1 text-sm font-sen">
            Message Example
          </label>
          <textarea
            name="mes_example"
            value={characterData.mes_example}
            onChange={handleChange}
            className="w-full p-2 rounded-lg card-cyber text-white focus:outline-none focus:ring-2 focus:ring-franky-blue font-sen"
            rows={2}
            placeholder="Example message"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-1 text-sm font-sen">
            Creator Comment
          </label>
          <textarea
            name="creatorcomment"
            value={characterData.creatorcomment}
            onChange={handleChange}
            className="w-full p-2 rounded-lg card-cyber text-white focus:outline-none focus:ring-2 focus:ring-franky-blue font-sen"
            rows={2}
            placeholder="Notes about your agent"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-1 text-sm font-sen">
            Tags (comma separated)
          </label>
          <input
            type="text"
            value={characterData.tags.join(", ")}
            onChange={handleTags}
            className="w-full p-2 rounded-lg card-cyber text-white focus:outline-none focus:ring-2 focus:ring-franky-blue font-sen"
            placeholder="helpful, trading, defi"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-1 text-sm font-sen mt-4">
            Talkativeness (0.0 - 1.0)
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={characterData.talkativeness}
            onChange={handleTalkativeness}
            className="w-full"
          />
          <span className="text-franky-blue text-sm">
            {characterData.talkativeness}
          </span>
        </div>
      </div>

    </div>
  );
}

// Success Modal Component
function AgentCreationSuccessModal({
  isOpen,
  onClose,
  agentResult,
}: {
  isOpen: boolean;
  onClose: () => void;
  agentResult: AgentCreationResult | null;
}) {
  if (!isOpen || !agentResult) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-cyber">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-cyber max-w-md w-full glow-cyan max-h-[90vh] overflow-y-auto"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white h-7 w-7 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/70 transition-colors"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="text-xl font-bold gradient-franky-text mb-3 pr-8 font-sen">
          Agent Deployed Successfully!
        </h3>

        {/* Success status card */}
        <div className="p-3 rounded-lg bg-franky-blue-10 border border-franky-blue-30 mb-4">
          <div className="flex items-center mb-1">
            <div className="flex justify-center items-center h-6 w-6 rounded-full bg-franky-blue-20 mr-2">
              <FiCheck className="text-franky-blue text-sm" />
            </div>
            <span className="text-franky-blue text-sm font-medium font-sen">Deployment Status</span>
            <span className="ml-auto text-xs bg-franky-blue-20 px-2 py-0.5 rounded-full text-franky-blue">
              Complete
            </span>
          </div>
          <div className="text-xs text-gray-400 ml-8">
            <p className="flex justify-between">
              <span className="text-gray-300 font-sen">Agent ID:</span>
              <span className="text-franky-blue font-sen font-mono text-xs">
                {agentResult.uuid.substring(0, 8)}...{agentResult.uuid.substring(agentResult.uuid.length - 4)}
              </span>
            </p>
            <p className="flex justify-between mt-1">
              <span className="text-gray-300 font-sen">Name:</span>
              <span className="text-franky-blue font-sen">{agentResult.name}</span>
            </p>
          </div>
        </div>

        {/* Agent capabilities in accordion style */}
        <div className="space-y-2 mb-4">
          <details className="group rounded-lg bg-black/50 border border-franky-blue-20 overflow-hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between p-2 font-medium font-sen">
              <div className="flex items-center">
                <span className="text-franky-blue mr-2">🤖</span>
                <span>Agent Profile</span>
              </div>
              <span className="transition group-open:rotate-180">
                <svg fill="none" height="16" width="16" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </span>
            </summary>
            <div className="p-2 pt-0 text-xs space-y-1">
              <div className="flex justify-between py-1 border-t border-franky-blue-20">
                <span className="text-gray-400 font-sen">Name</span>
                <span className="text-franky-blue font-sen">{agentResult.name}</span>
              </div>
              <div className="py-1 border-t border-franky-blue-20">
                <span className="text-gray-400 font-sen block mb-1">Description</span>
                <span className="text-franky-blue font-sen text-xs leading-relaxed">{agentResult.description}</span>
              </div>
              {agentResult.imageUrl && (
                <div className="flex justify-between py-1 border-t border-franky-blue-20 items-center">
                  <span className="text-gray-400 font-sen">Avatar</span>
                  <img
                    src={agentResult.imageUrl}
                    alt="Agent avatar"
                    className="w-6 h-6 rounded-full object-cover border border-franky-blue"
                  />
                </div>
              )}
            </div>
          </details>

          <details className="group rounded-lg bg-black/50 border border-franky-blue-20 overflow-hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between p-2 font-medium font-sen">
              <div className="flex items-center">
                <span className="text-franky-blue mr-2">⚡</span>
                <span>Agent Capabilities ({agentResult.tools.length})</span>
              </div>
              <span className="transition group-open:rotate-180">
                <svg fill="none" height="16" width="16" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </span>
            </summary>
            <div className="p-2 pt-0 space-y-2">
              <div className="grid grid-cols-1 gap-2">
                {agentResult.tools.map((tool, index) => (
                  <div key={index} className="flex items-center p-2 rounded bg-franky-blue-10 border border-franky-blue-20">
                    <div className="w-6 h-6 bg-franky-blue rounded-full mr-3 flex items-center justify-center flex-shrink-0">
                      <span className="text-black text-xs font-bold">⚡</span>
                    </div>
                    <div className="flex-1">
                      <span className="text-franky-blue font-sen text-sm font-medium">{tool}</span>
                      <div className="flex items-center mt-1">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                        <span className="text-green-300 text-xs font-sen">Active</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-2 rounded bg-black/30 border border-franky-blue">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 font-sen text-xs">Total Capabilities:</span>
                  <span className="text-franky-blue font-sen text-sm font-bold">{agentResult.tools.length}</span>
                </div>
                <p className="text-gray-400 font-sen text-xs mt-1 italic">
                  Ready to handle blockchain analysis requests
                </p>
              </div>
            </div>
          </details>
        </div>

        {/* Transaction confirmation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-3 rounded-lg bg-franky-blue-10 border border-franky-blue-30 text-center mb-4"
        >
          <FiCheck className="text-franky-blue mx-auto text-xl mb-1" />
          <p className="text-franky-blue font-medium text-sm font-sen">Agent deployment confirmed!</p>
          
          <div className="mt-2 text-xs text-franky-blue">
            <p className="font-sen">Transaction confirmed on-chain</p>
            <div className="flex items-center justify-center gap-2 mt-1">
              <button
                onClick={() => copyToClipboard(agentResult.txHash)}
                className="text-franky-blue underline hover:text-white text-xs font-sen"
              >
                Copy Hash
              </button>
              <span className="text-gray-400">|</span>
              <a
                href={`https://sepolia.arbiscan.io/tx/${agentResult.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-franky-blue underline hover:text-white text-xs font-sen"
              >
                View on Explorer
              </a>
            </div>
          </div>
        </motion.div>

        {/* Action button */}
        <div className="pt-4 border-t border-franky-blue-20">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-lg bg-franky-purple text-white font-medium hover:bg-franky-indigo transition-colors font-sen"
          >
            Continue to Homepage
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Main CreateAgent Component
export default function CreateAgent() {
  const router = useRouter();
  const { accountId } = useWallet();
  const [selectedTools, setSelectedTools] = useState<Tool[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [agentResult, setAgentResult] = useState<AgentCreationResult | null>(null);
  
  const [characterData, setCharacterData] = useState<CharacterData>({
    name: "CryptoSage",
    description: "A knowledgeable blockchain assistant that helps users analyze wallet activities, check balances, and understand crypto transactions across multiple networks.",
    personality: "Friendly, knowledgeable, and patient. Always explains complex blockchain concepts in simple terms.",
    scenario: "You are a helpful crypto analyst who assists users with wallet analysis, balance checking, and transaction insights. You have access to powerful blockchain data tools.",
    first_mes: "Hey there! I'm CryptoSage, your blockchain data assistant. I can help you analyze wallet activities, check balances, examine transactions, and explore NFT collections across different networks. What would you like to investigate today?",
    mes_example: "User: What chains is wallet 0x123... active on?\nCryptoSage: Let me check the wallet activity across all supported chains for you. *analyzes data* This wallet is active on Ethereum mainnet, Polygon, and Arbitrum based on recent transactions.",
    creatorcomment: "Built for comprehensive blockchain data analysis using Goldrush API tools",
    tags: ["blockchain", "wallet-analysis", "defi", "crypto", "data"],
    talkativeness: 0.7,
    fav: false,
  });

  // Handle tool selection
  const handleToolToggle = (toolId: string) => {
    const tool = availableTools.find((t) => t.id === toolId);
    if (!tool) return;

    setSelectedTools((prev) => {
      const isSelected = prev.some((t) => t.id === toolId);
      if (isSelected) {
        return prev.filter((t) => t.id !== toolId);
      } else {
        return [...prev, tool];
      }
    });
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    setImageFile(file);
    
    // Upload to Pinata
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/pinata/image", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const { url } = await response.json();
        setImageUrl(url);
        toast.success("Image uploaded successfully!");
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      toast.error("Failed to upload image");
      console.error("Upload error:", error);
    }
  };

  // Create agent
  const handleCreateAgent = async () => {
    if (!accountId) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!characterData.name || !characterData.description) {
      toast.error("Please fill in at least name and description");
      return;
    }

    setIsCreating(true);

    try {
      // Generate UUID for the agent
      const uuid = uuidv4();
      
      // Create wallet client
      const walletClient = createWalletClient({
        chain: arbitrumSepolia,
        transport: custom(window.ethereum!),
      });

      // Call createAgent function on Registry contract
      const txHash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: "createAgent",
        args: [
          uuid, // _uuid
          characterData.name, // _name
          characterData.description, // _description
          characterData.personality, // _personality
          characterData.scenario, // _scenario
          characterData.first_mes, // _messageExample
          selectedTools.map(tool => tool.name), // _tools
          imageUrl || "", // _imageUrl
          accountId as `0x${string}`, // _ownerAddress
        ],
        account: accountId as `0x${string}`,
      });

      console.log("Agent creation transaction:", txHash);

      // Set up agent result data for modal
      const result: AgentCreationResult = {
        uuid,
        name: characterData.name,
        description: characterData.description,
        tools: selectedTools.map(tool => tool.name),
        imageUrl: imageUrl || "",
        txHash,
      };

      setAgentResult(result);
      setShowSuccessModal(true);

    } catch (error) {
      console.error("Agent creation error:", error);
      toast.error("Failed to create agent");
    } finally {
      setIsCreating(false);
    }
  };

  // Handle success modal close
  const handleModalClose = () => {
    setShowSuccessModal(false);
    setAgentResult(null);
    router.push("/"); // Redirect to home page
  };

  return (
    <div className="min-h-screen bg-cyber pt-20 pb-10">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl font-bold font-orbitron mb-4 font-logo text-franky-blue">
            Create Your AI Agent
          </h1>
          <p className="text-gray-400 text-lg font-sen max-w-2xl mx-auto">
            Build a custom AI agent with personality, tools, and unique characteristics
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Agent Avatar - Top Center */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <div className="card-cyber max-w-sm">
              <h3 className="text-lg font-semibold text-franky-blue mb-4 font-sen text-center">
                Agent Avatar
              </h3>
              
              <div className="mb-4 flex justify-center">
                <label className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-franky-purple-30 rounded-full cursor-pointer hover:border-franky-purple transition-colors bg-cyber relative overflow-hidden">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Agent preview"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full">
                      <FiUploadCloud className="mx-auto text-3xl text-franky-blue mb-2" />
                      <span className="text-xs text-gray-400 font-sen">
                        Click to upload
                      </span>
                    </div>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            </div>
          </motion.div>

          {/* Character Details - Below Avatar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CharacterBuilder
              characterData={characterData}
              setCharacterData={setCharacterData}
              onSubmit={() => {}} // Remove the submit button from CharacterBuilder
            />
          </motion.div>

          {/* Tools Selection - Full Width Below Character Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="card-cyber">
              <h3 className="text-xl font-semibold text-franky-blue mb-6 font-sen text-center">
                Available Tools ({selectedTools.length} selected)
              </h3>
              <ConstructionZone
                availableTools={availableTools}
                selectedTools={selectedTools}
                onToolToggle={handleToolToggle}
              />
            </div>
          </motion.div>

          {/* Deploy Button - Bottom */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center space-y-4"
          >
            <motion.button
              onClick={handleCreateAgent}
              disabled={isCreating || !accountId}
              className="w-full max-w-md py-4 bg-franky-blue text-black rounded-lg font-bold text-lg hover:bg-franky-purple/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-sen"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isCreating ? (
                <span className="flex items-center justify-center">
                  <span className="mr-2">Creating Agent...</span>
                  <div className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full"></div>
                </span>
              ) : (
                "Deploy Agent to Blockchain"
              )}
            </motion.button>

            {!accountId && (
              <p className="text-center text-sm text-gray-400 font-sen">
                Please connect your wallet to create an agent
              </p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Success Modal */}
      <AgentCreationSuccessModal
        isOpen={showSuccessModal}
        onClose={handleModalClose}
        agentResult={agentResult}
      />
    </div>
  );
}