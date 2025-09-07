"use client";
import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import {
  FiServer,
  FiSmartphone,
  FiLink,
  FiUploadCloud,
  FiCheck,
  FiX,
  FiCopy,
  FiImage,
} from "react-icons/fi";
import { normalize } from "viem/ens";
import {
  createPublicClient,
  formatEther,
  http,
  parseEther,
} from "viem";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { mainnet } from "viem/chains";
import { useWallet } from "@/providers/WalletProvider";

interface Device {
  id: string;
  deviceModel: string;
  ram: string;
  storage: string;
  cpu: string;
  ngrokUrl: string;
  walletAddress: string;
  hostingFee: string;
  agentCount: number;
  status: "Active" | "Inactive";
  lastActive: string;
  txHash: string;
  registeredAt: string;
}

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

// Available tools
const availableTools: Tool[] = [
  {
    id: "swap",
    name: "1inch Swap",
    description: "Swap tokens at the best rates across multiple DEXes",
    icon: "💱",
  },
  {
    id: "limit",
    name: "1inch Limit Order",
    description: "Create limit orders with conditional execution",
    icon: "📊",
  },
  {
    id: "balance",
    name: "Balance Checker",
    description: "Check token balances across multiple chains",
    icon: "💰",
  },
  {
    id: "gas",
    name: "Gas Estimator",
    description: "Estimate gas costs for transactions",
    icon: "⛽",
  },
  {
    id: "price",
    name: "Price Oracle",
    description: "Get real-time token prices from multiple sources",
    icon: "🔮",
  },
  {
    id: "nft",
    name: "NFT Explorer",
    description: "Browse and analyze NFT collections",
    icon: "🖼️",
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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            placeholder="Character name"
            className="input-cyber w-full font-sen"
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
            placeholder="Physical appearance and traits"
            className="input-cyber w-full h-20 font-sen resize-none"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-1 text-sm font-sen">
            Personality
          </label>
          <textarea
            name="personality"
            value={characterData.personality}
            onChange={handleChange}
            placeholder="Character's personality traits"
            className="input-cyber w-full h-20 font-sen resize-none"
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
            placeholder="Context for the character's existence"
            className="input-cyber w-full h-20 font-sen resize-none"
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
            placeholder="How the character introduces themselves"
            className="input-cyber w-full h-20 font-sen resize-none"
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
            placeholder="Example of how the character speaks"
            className="input-cyber w-full h-20 font-sen resize-none"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-1 text-sm font-sen">
            Creator Comments
          </label>
          <textarea
            name="creatorcomment"
            value={characterData.creatorcomment}
            onChange={handleChange}
            placeholder="Additional notes"
            className="input-cyber w-full h-20 font-sen resize-none"
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
            placeholder="e.g. scientist, eccentric"
            className="input-cyber w-full font-sen"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-1 text-sm font-sen">
            Talkativeness: {characterData.talkativeness.toFixed(1)}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={characterData.talkativeness}
            onChange={handleTalkativeness}
            className="w-full franky-blue"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={characterData.fav}
            onChange={handleFav}
            className="mr-2 accent-franky-blue"
          />
          <label className="text-gray-300 text-sm font-sen">Favorite</label>
        </div>

        <button
          onClick={onSubmit}
          className="btn-cyber w-full glow-cyan font-sen"
        >
          Construct Character
        </button>
      </div>
    </div>
  );
}

// Secrets Component
function SecretsEditor({
  secrets,
  setSecrets,
}: {
  secrets: string;
  setSecrets: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <div className="card-cyber mt-6 flex-grow">
      <h2 className="text-xl font-semibold text-franky-blue mb-4 font-sen">
        Agent Secrets
      </h2>
      <p className="text-gray-300 text-sm mb-4 font-sen">
        Add environment variables that your agent will need (API keys,
        credentials, etc.). Use the standard .env format with KEY=VALUE pairs,
        one per line.
      </p>
      <textarea
        value={secrets}
        onChange={(e) => setSecrets(e.target.value)}
        placeholder="{
        'PRIVATE_KEY' : 'bewbfaalb7cf87qwngo8ewg8wn8g98cwgnmwc'
        }"
        className="input-cyber w-full h-64 font-mono text-sm"
      />
      <div className="mt-3 text-xs text-gray-400 font-sen">
        <p>
          • Your secrets will be encrypted using Lit Protocol before storage
        </p>
        <p>
          • They will be stored alongside your character data in the Pinata
          bucket
        </p>
        <p>
          • They will only be accessible by your agent with proper
          authentication
        </p>
        <p className="text-franky-blue mt-1">
          • Sensitive API keys will never be stored in plaintext
        </p>
      </div>
    </div>
  );
}

// JSON Display Component
function JsonDisplay({
  characterData,
  uploadUrl,
  uploadDetails = [],
}: {
  characterData: CharacterData | null;
  uploadUrl: string | null;
  uploadDetails?: string[];
}) {
  if (!characterData) return null;

  return (
    <div className="card-cyber mt-4">
      <h3 className="text-lg font-semibold text-franky-blue mb-3 font-sen">
        Generated Character JSON
      </h3>
      {uploadUrl && (
        <div className="mb-4 p-3 bg-franky-blue-10 rounded-lg border border-franky-blue-30">
          <div className="flex items-center">
            <FiCheck className="text-franky-blue mr-2" size={18} />
            <p className="text-sm text-white font-semibold font-sen">
              Successfully uploaded to IPFS
            </p>
          </div>
          <div className="mt-2 flex items-center">
            <span className="text-xs text-gray-400 mr-2 font-sen">URL:</span>
            <a
              href={uploadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-franky-blue underline break-all flex-1 font-sen"
            >
              {uploadUrl}
            </a>
            <button
              onClick={() => navigator.clipboard.writeText(uploadUrl)}
              className="ml-2 p-1 bg-franky-blue-20 rounded hover:bg-franky-blue-30 transition-colors"
              title="Copy URL to clipboard"
            >
              <FiCopy className="h-4 w-4 text-franky-blue" />
            </button>
          </div>

          {uploadDetails.length > 0 && (
            <div className="mt-3 border-t border-franky-blue-20 pt-2">
              <div className="flex justify-between items-center mb-1">
                <p className="text-xs text-gray-400 font-sen">
                  Upload Details:
                </p>
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(uploadDetails.join("\n"))
                  }
                  className="text-xs text-franky-blue hover:underline font-sen"
                >
                  Copy logs
                </button>
              </div>
              <pre className="text-xs text-gray-300 bg-black/30 p-2 rounded max-h-32 overflow-auto font-mono">
                {uploadDetails.join("\n")}
              </pre>
            </div>
          )}
        </div>
      )}
      <pre className="text-xs text-gray-300 overflow-auto max-h-80 p-3 bg-black/50 rounded-lg font-mono">
        {JSON.stringify(characterData, null, 2)}
      </pre>
    </div>
  );
}

// ENS validation utility
async function checkEnsAvailability(
  name: string
): Promise<{ available: boolean; error?: string }> {
  try {
    const publicClient = createPublicClient({
      chain: mainnet,
      transport: http(),
    });

    const normalizedName = normalize(`${name}.megha.network`);
    const ensAddress = await publicClient.getEnsAddress({
      name: normalizedName,
    });

    return { available: !ensAddress };
  } catch (error: any) {
    console.error("Error checking ENS availability:", error);
    return { available: false, error: error.message };
  }
}

// Confirmation Modal Component
function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  deviceInfo,
  agentName,
  characterData,
  isPending,
  perApiCallFee,
  isPublic,
  isEncrypting,
  isUploading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  deviceInfo: Device | null;
  agentName: string;
  characterData: CharacterData | null;
  isPending: boolean;
  perApiCallFee: string;
  isPublic: boolean;
  isEncrypting?: boolean;
  isUploading?: boolean;
}) {
  if (!isOpen) return null;

  const getButtonText = () => {
    if (isPending) return "Creating Agent...";
    if (isEncrypting) return "Encrypting Secrets...";
    if (isUploading) return "Uploading Character Data...";
    return "Confirm & Create Agent";
  };

  const isButtonDisabled = isPending || isEncrypting || isUploading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-cyber">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-cyber max-w-lg w-full glow-cyan"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold gradient-franky-text font-sen">
            Create Agent Confirmation
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={isButtonDisabled}
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-franky-blue text-sm mb-1 font-sen">
              Agent Name
            </h3>
            <p className="text-white text-lg font-medium font-sen">
              {agentName}.megha network
            </p>
          </div>

          {characterData && (
            <div>
              <h3 className="text-franky-blue text-sm mb-1 font-sen">
                Character Details
              </h3>
              <div className="bg-black/50 rounded-lg p-3 space-y-2">
                <p className="text-white font-sen">
                  <span className="text-gray-400">Name:</span>{" "}
                  {characterData.name}
                </p>
                <p className="text-white font-sen">
                  <span className="text-gray-400">Description:</span>{" "}
                  {characterData.description}
                </p>
                <p className="text-white font-sen">
                  <span className="text-gray-400">Tags:</span>{" "}
                  {characterData.tags.join(", ")}
                </p>
              </div>
            </div>
          )}

          {deviceInfo && (
            <div>
              <h3 className="text-franky-blue text-sm mb-1 font-sen">
                Selected Device
              </h3>
              <div className="bg-black/50 rounded-lg p-3 space-y-2">
                <p className="text-white font-sen">
                  <span className="text-gray-400">Model:</span>{" "}
                  {deviceInfo.deviceModel}
                </p>
                <p className="text-white font-sen">
                  <span className="text-gray-400">Address:</span>{" "}
                  {deviceInfo.id}
                </p>
                <p className="text-white font-sen">
                  <span className="text-gray-400">Hosting Fee:</span>{" "}
                  {parseFloat(deviceInfo.hostingFee).toFixed(2)} USDC
                </p>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-franky-blue text-sm mb-1 font-sen">
              Configuration
            </h3>
            <div className="bg-black/50 rounded-lg p-3 space-y-2">
              <p className="text-white font-sen">
                <span className="text-gray-400">Per API Call Fee:</span>{" "}
                {perApiCallFee} USDC
              </p>
              <p className="text-white font-sen">
                <span className="text-gray-400">Visibility:</span>{" "}
                {isPublic ? "Public" : "Private"}
              </p>
              <p className="text-white font-sen">
                <span className="text-gray-400">Network:</span> Hedera Testnet
              </p>
            </div>
          </div>

          {/* Status indicators */}
          {(isEncrypting || isUploading) && (
            <div className="bg-franky-blue-10 rounded-lg p-3 border border-franky-blue-30">
              <div className="flex items-center">
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-franky-blue border-t-transparent rounded-full"></div>
                <p className="text-franky-blue text-sm font-sen">
                  {isEncrypting
                    ? "Encrypting secrets with Lit Protocol..."
                    : "Uploading character data to Pinata..."}
                </p>
              </div>
              <p className="text-xs text-gray-400 mt-1 font-sen">
                {isEncrypting
                  ? "Securing your API keys before storage"
                  : "Storing character data with encrypted secrets"}
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-franky-blue-20">
            <button
              onClick={onConfirm}
              disabled={isButtonDisabled}
              className="w-full py-3 rounded-lg bg-franky-blue text-white font-medium hover:bg-franky-indigo transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-sen"
            >
              {isButtonDisabled ? (
                <span className="flex items-center justify-center">
                  <span className="mr-2">{getButtonText()}</span>
                  <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full"></div>
                </span>
              ) : (
                "Confirm & Create Agent"
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Success Modal Component
function SuccessModal({
  isOpen,
  onClose,
  agentAddress,
  apiKey,
}: {
  isOpen: boolean;
  onClose: () => void;
  agentAddress: string | null;
  apiKey: string | null;
}) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleBackToHome = () => {
    router.push("/");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-cyber">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-cyber max-w-lg w-full glow-cyan"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold gradient-franky-text font-sen">
            Agent Created Successfully!
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {agentAddress && (
            <div>
              <p className="text-gray-400 text-sm font-sen">Agent Address</p>
              <div className="flex items-center mt-1">
                <p className="text-franky-blue font-medium break-all font-sen">
                  {agentAddress}
                </p>
                <button
                  onClick={() => navigator.clipboard.writeText(agentAddress)}
                  className="ml-2 text-gray-400 hover:text-franky-blue transition-colors"
                >
                  <FiCopy size={16} />
                </button>
              </div>
            </div>
          )}

          {apiKey && (
            <div>
              <p className="text-gray-400 text-sm font-sen">API Key</p>
              <div className="flex items-center mt-1">
                <p className="text-franky-blue font-medium break-all font-sen">
                  {apiKey}
                </p>
                <button
                  onClick={() => navigator.clipboard.writeText(apiKey)}
                  className="ml-2 text-gray-400 hover:text-franky-blue transition-colors"
                >
                  <FiCopy size={16} />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1 font-sen">
                Keep this key safe! You'll need it to interact with your agent.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={handleBackToHome}
            className="flex-1 py-2 rounded-lg bg-franky-blue text-white font-medium hover:bg-franky-indigo transition-colors font-sen"
          >
            Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Client component that uses useSearchParams
function CreateAgentContent({
  deviceAddress,
  accountId,
}: {
  deviceAddress: string;
  accountId: string | null;
}) {
  const [selectedTools, setSelectedTools] = useState<Tool[]>([]);
  const [agentName, setAgentName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [isNameAvailable, setIsNameAvailable] = useState(false);
  const [perApiCallFee, setPerApiCallFee] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [constructedCharacter, setConstructedCharacter] =
    useState<CharacterData | null>(null);
  const [characterData, setCharacterData] = useState<CharacterData>({
    name: "CryptoSage",
    description: "A wise and experienced crypto trading assistant.",
    personality: "Patient, analytical, and cautious.",
    scenario:
      "You are consulting with a trader in the fast-paced world of DeFi.",
    first_mes: "Hello! I'm CryptoSage, your personal DeFi trading assistant.",
    mes_example:
      "Based on the current market conditions, I'd recommend being cautious with leverage trading right now.",
    creatorcomment:
      "This character is designed to be knowledgeable but conservative, always prioritizing user's risk management.",
    tags: ["crypto", "trading", "DeFi", "finance", "advisor", "blockchain"],
    talkativeness: 0.7,
    fav: true,
  });
  const [secrets, setSecrets] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [uploadDetails, setUploadDetails] = useState<string[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [agentCreated, setAgentCreated] = useState(false);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deviceInfo, setDeviceInfo] = useState<Device | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  // Mock points functionality removed

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!deviceAddress) return;
    (async function () {
      try {
        const fetchedDeviceRequest = await fetch(
          "/api/db/devices?address=" + deviceAddress.toLowerCase()
        );
        const device = await fetchedDeviceRequest.json();
        console.log("Device from Supabase:", device);

        if (!device || device.error) throw Error("Device does not exist");

        setDeviceInfo({
          id: device.walletAddress,
          deviceModel: device.deviceModel,
          ram: device.ram,
          storage: device.storage,
          cpu: device.cpu || "",
          ngrokUrl: device.ngrokUrl,
          walletAddress: device.walletAddress,
          hostingFee: device.hostingFee,
          agentCount: device.agentCount || 0,
          status: device.status || "Active",
          lastActive: device.lastActive,
          txHash: device.txHash,
          registeredAt: device.registeredAt,
        });
      } catch (e) {
        console.log(e);
        setError("Device does not exist");
      }
      setLoading(false);
    })();
  }, [hydrated, deviceAddress]);

  // Handle tool selection
  const handleToolToggle = (toolId: string) => {
    setSelectedTools((prev) => {
      const isSelected = prev.some((tool) => tool.id === toolId);
      if (isSelected) {
        return prev.filter((tool) => tool.id !== toolId);
      } else {
        const toolToAdd = availableTools.find((tool) => tool.id === toolId);
        return toolToAdd ? [...prev, toolToAdd] : prev;
      }
    });
  };

  // Handle character construction
  function handleConstructCharacter() {
    setConstructedCharacter({ ...characterData });
  }

  // Add debounced name check
  useEffect(() => {
    const checkName = async () => {
      if (!agentName) {
        setNameError(null);
        setIsNameAvailable(false);
        return;
      }

      // Validate name format
      if (!/^[a-z0-9-]+$/i.test(agentName)) {
        setNameError("Name can only contain letters, numbers, and hyphens");
        setIsNameAvailable(false);
        return;
      }

      setIsCheckingName(true);
      const { available, error } = await checkEnsAvailability(agentName);
      setIsCheckingName(false);

      if (error) {
        setNameError(`Error checking name: ${error}`);
        setIsNameAvailable(false);
      } else {
        setNameError(available ? null : "Name is already taken");
        setIsNameAvailable(available);
      }
    };

    const timeoutId = setTimeout(checkName, 500);
    return () => clearTimeout(timeoutId);
  }, [agentName]);

  // Add avatar input change handler
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log("Selected file:", file);
      if (file.type.startsWith("image/")) {
        setAvatarFile(file);
        console.log("Avatar file set successfully:", file.name);
      } else {
        toast.error("Please select an image file");
        console.warn("Invalid file type selected:", file.type);
      }
    } else {
      console.log("No file selected");
    }
  };

  // Update handleCreateAgent to use the validated name
  async function handleCreateAgent() {
    if (!agentName) {
      toast.error("Please enter a valid agent name");
      return;
    }

    if (!constructedCharacter) {
      toast.error("Please construct your character first");
      return;
    }

    if (!deviceInfo?.id) {
      toast.error(
        "No device selected. Please select a device from the marketplace."
      );
      return;
    }

    // Validate perApiCallFee
    if (
      !perApiCallFee.trim() ||
      isNaN(Number(perApiCallFee)) ||
      Number(perApiCallFee) < 0
    ) {
      toast.error(
        "Please enter a valid non-negative number for the per API call fee"
      );
      return;
    }

    // Check if avatar is uploaded
    if (!avatarFile) {
      toast.error("Please upload an avatar image first");
      return;
    }

    // Show confirmation modal
    setShowConfirmModal(true);
  }

  // Modified handleConfirmCreateAgent function to only do HCS and DB operations
  async function handleConfirmCreateAgent() {
    if (
      !deviceInfo?.id ||
      !isNameAvailable ||
      !constructedCharacter
    ) {
      toast.error("Missing required information to create agent");
      return;
    }

    if (!avatarFile) {
      toast.error("Please upload an avatar image first");
      return;
    }

    try {
      // Use the validated name as the subname
      const subname = agentName.toLowerCase();
      setIsUploading(true);

      try {
        console.log("Preparing transaction");
        toast.info("Uploading Avatar to Pinata...", {
          description: "This will take some time...",
        });

        const formData = new FormData();
        const customFileName = `avatar-${Date.now()}.${avatarFile.name
          .split(".")
          .pop()}`;
        formData.append("file", avatarFile, customFileName);
        const avatarUrlRequest = await fetch(`/api/pinata/image`, {
          method: "POST",
          body: formData,
        });
        const { url: avatarUrl } = await avatarUrlRequest.json();
        console.log(avatarUrl);
        console.log(
          "Uploading character data to Pinata with encrypted secrets..."
        );
        let characterConfigUrl = "";
        toast.info("Encrypting .env with Lit Protocol", {
          description: "Your secrets can be decrypted only by the Device",
        });
        // Mock encryption - in production, implement proper secret management
        const ciphertext = "mock_encrypted_data";
        const dataToEncryptHash = "mock_hash";
        toast.info("Uploading character data to Pinata", {
          description: "This will take some time...",
        });
        try {
          const characterConfigUrlRequest = await fetch(`/api/pinata/json`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              json: {
                character: constructedCharacter,
                subname,
                secrets: ciphertext,
                secretsHash: dataToEncryptHash,
                avatarUrl,
              },
            }),
          });
          const { url } = await characterConfigUrlRequest.json();
          characterConfigUrl = url;
          console.log(
            "✅ Character data with encrypted secrets available at Pinata: ",
            characterConfigUrl
          );
          setIsUploading(false);
        } catch (error) {
          console.error("Error in Pinata upload process:", error);
          toast.error("Error uploading character data. Please try again.");
          setIsUploading(false);
          setShowConfirmModal(false);
          return;
        }
        setIsPending(true);

        // Create Hedera agent to get metadata
        toast.info("Creating agent in Hedera...", {
          description:
            "Setting up inbound and outbound topics for your agent",
        });

        try {
          // First call the create-agent API to get the metadata
          const createHederaAgentResponse = await fetch(
            "/api/hedera/create-agent",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                characterId: agentName.toLowerCase(),
                name: agentName,
                description: constructedCharacter.description,
                personality: constructedCharacter.personality,
                scenario: constructedCharacter.scenario,
                first_mes: constructedCharacter.first_mes,
                mes_example: constructedCharacter.mes_example,
                creatorcomment: constructedCharacter.creatorcomment,
                tags: constructedCharacter.tags,
                talkativeness: constructedCharacter.talkativeness,
                traits: {},
                imageUrl: avatarUrl,
              }),
            }
          );

          if (!createHederaAgentResponse.ok) {
            const errorText = await createHederaAgentResponse.text();
            throw new Error(`Failed to create Hedera agent: ${errorText}`);
          }

          const hederaAgentData = await createHederaAgentResponse.json();

          if (!hederaAgentData.success || !hederaAgentData.agent) {
            throw new Error(
              "Hedera agent creation returned invalid response"
            );
          }

          console.log(
            "Agent created in Hedera with topics:",
            hederaAgentData.agent
          );

          // Store the private key directly in ECDSA format
          const agentPrivateKey = hederaAgentData.agent.privateKey;

          // Now we have the metadata, let's store it in Supabase
          const createAgentsRequest = await fetch(`/api/db/agents`, {
            method: "POST",
            body: JSON.stringify({
              name: agentName,
              subname: agentName.toLowerCase(),
              description: constructedCharacter.description,
              personality: constructedCharacter.personality,
              scenario: constructedCharacter.scenario,
              first_mes: constructedCharacter.first_mes,
              mes_example: constructedCharacter.mes_example,
              creator_comment: constructedCharacter.creatorcomment,
              tags: constructedCharacter.tags,
              talkativeness: constructedCharacter.talkativeness,
              is_favorite: constructedCharacter.fav,
              device_address: deviceInfo.id.toLowerCase(),
              owner_address: accountId?.toLowerCase(),
              per_api_call_fee: parseEther(perApiCallFee).toString(),
              is_public: isPublic,
              metadata_url: characterConfigUrl,
              tools: selectedTools.map((tool) => tool.id),
              tx_hash: hederaAgentData.agent.accountId, // No transaction hash since we're not doing contract execution
              agent_address: hederaAgentData.agent.accountId, // Use Hedera account ID as agent address
              // Add Hedera-specific metadata
              account_id: hederaAgentData.agent.accountId,
              inbound_topic_id: hederaAgentData.agent.inboundTopicId,
              outbound_topic_id: hederaAgentData.agent.outboundTopicId,
              profile_topic_id: hederaAgentData.agent.profileTopicId,
              encrypted_private_key: agentPrivateKey, // Store ECDSA key directly
            }),
          });

          if (!createAgentsRequest.ok) {
            const errorText = await createAgentsRequest.text();
            throw new Error(
              `Failed to store agent in database: ${errorText}`
            );
          }

          const createAgentResponse = await createAgentsRequest.json();
          console.log(
            "Agent created in Supabase with Hedera metadata:",
            createAgentResponse
          );

          // Mock: Points functionality removed
          try {
            console.log('Mock: Would award 200 points for agent creation');
            const pointsAwarded = true; // Mock success
            
            if (pointsAwarded) {
              console.log("Mock: Points awarded");
            }
          } catch (pointsError) {
            // Log but don't affect main flow
            console.warn('Failed to award points:', pointsError)
          }

          toast.success("Agent created and registered in Hedera", {
            description: `Created agent with inbound topic: ${hederaAgentData.agent.inboundTopicId.substring(
              0,
              10
            )}...`,
          });

          setIsPending(false);
          setShowConfirmModal(false);
          setAgentCreated(true);
          setAgentId(hederaAgentData.agent.accountId);
          setShowSuccessModal(true);
        } catch (hederaError: any) {
          console.error("Error creating Hedera agent:", hederaError);
          toast.error("Failed to create Hedera agent", {
            description:
              hederaError.message || "Unknown error in Hedera setup",
          });
          setIsPending(false);
          setShowConfirmModal(false);
        }
      } catch (error: any) {
        console.error("Error in upload process:", error);
        toast.error(`Error uploading data: ${error.message || "Unknown error"}`);
        setIsUploading(false);
        setShowConfirmModal(false);
      }
    } catch (error: any) {
      console.error("Error creating agent:", error);
      toast.error(`Error creating agent: ${error.message || "Unknown error"}`);
      setShowConfirmModal(false);
      setIsPending(false);
    }
  }

  return (
    <>
      <div className="container mx-auto px-4 pt-32">
        <motion.h1
          className="text-4xl md:text-5xl font-bold mb-8 gradient-franky-text text-center font-logo"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Build Your AI Agent
        </motion.h1>

        {deviceInfo && !agentCreated && (
          <motion.div
            className="mb-8 card-cyber"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold gradient-franky-text mb-4 font-sen">
              Selected Device
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <FiSmartphone className="text-franky-blue mr-2" />
                <span className="text-gray-300 font-sen">
                  {deviceInfo.deviceModel &&
                  deviceInfo.deviceModel.trim().length > 0
                    ? deviceInfo.deviceModel
                    : "Samsung Galaxy S23"}
                </span>
              </div>
              <div className="flex items-center">
                <FiServer className="text-franky-blue mr-2" />
                <span className="text-gray-300 font-sen">
                  Status: {deviceInfo.agentCount == 0 ? "Available" : "In Use"}
                </span>
              </div>
              <div className="flex items-center">
                <FiLink className="text-franky-blue mr-2" />
                <span className="text-gray-300 text-sm font-sen">
                  {deviceInfo.ngrokUrl}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-400 font-sen">
                  Device Address:{" "}
                </span>
                <span className="text-sm text-franky-blue ml-2 font-sen">
                  {`${deviceInfo.id.slice(0, 6)}...${deviceInfo.id.slice(-4)}`}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: deviceInfo ? 0.4 : 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="agent-name"
                className="block mb-2 text-gray-300 font-sen"
              >
                Agent Name
              </label>
              <div className="relative">
                <input
                  id="agent-name"
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="my-agent-name"
                  className={`input-cyber w-full font-sen ${
                    isNameAvailable
                      ? "border-franky-blue-30 focus:border-franky-blue"
                      : nameError
                      ? "border-red-500/30 focus:border-red-500"
                      : "border-franky-blue-30 focus:border-franky-blue"
                  }`}
                />
                {agentName && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {isCheckingName ? (
                      <div className="animate-spin h-5 w-5 border-2 border-franky-blue border-t-transparent rounded-full" />
                    ) : isNameAvailable ? (
                      <FiCheck className="text-franky-blue" />
                    ) : (
                      <FiX className="text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {nameError && (
                <p className="mt-1 text-sm text-red-500 font-sen">
                  {nameError}
                </p>
              )}
              {agentName && !nameError && (
                <p className="mt-1 text-sm text-franky-blue font-sen">
                  {`${agentName}.megha network will be your agent's ENS name`}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="per-api-call-fee"
                className="block mb-2 text-gray-300 font-sen"
              >
                Per API Call Fee (USDC)
              </label>
              <input
                id="per-api-call-fee"
                type="text"
                value={perApiCallFee}
                onChange={(e) => setPerApiCallFee(e.target.value)}
                placeholder="Enter fee amount"
                className="input-cyber w-full font-sen"
              />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="mr-2 accent-franky-blue"
              />
              <label className="text-gray-300 text-sm font-sen">
                Make this agent public (anyone can use it)
              </label>
            </div>
          </div>
        </motion.div>

        {accountId && (
          <div className="mb-6 p-3 rounded-lg bg-franky-blue-10 border border-franky-blue-30">
            <div className="flex items-center">
              <div className="flex justify-center items-center h-8 w-8 rounded-full bg-franky-blue-20 mr-3">
                <FiCheck className="text-franky-blue" />
              </div>
              <div>
                <p className="text-franky-blue font-medium font-sen">
                  Wallet connected
                </p>
                <p className="text-xs text-gray-400 font-sen">
                  {accountId
                    ? `${accountId.substring(0, 6)}...${accountId.substring(
                        accountId.length - 4
                      )}`
                    : ""}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Only render components after hydration to avoid mismatch */}
        {hydrated ? (
          <div className="grid grid-cols-1 lg:grid-cols-8 gap-8">
            {/* Construction Zone with JSON Display - Left Column */}
            <motion.div
              className="lg:col-span-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {/* <div className="card-cyber mb-6">
                <h2 className="text-xl font-semibold text-franky-blue mb-4 font-sen">
                  Available Tools
                </h2>
                <ConstructionZone
                  availableTools={availableTools}
                  selectedTools={selectedTools}
                  onToolToggle={handleToolToggle}
                />
              </div> */}

              {/* Secrets Editor */}
              <SecretsEditor secrets={secrets} setSecrets={setSecrets} />

              {/* JSON Display Area with upload URL and details */}
              <JsonDisplay
                characterData={constructedCharacter}
                uploadUrl={uploadUrl}
                uploadDetails={uploadDetails}
              />
            </motion.div>

            {/* Character Builder - Right Column */}
            <motion.div
              className="lg:col-span-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <CharacterBuilder
                characterData={characterData}
                setCharacterData={setCharacterData}
                onSubmit={handleConstructCharacter}
              />
            </motion.div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-8 gap-8">
            <div className="lg:col-span-4 h-[600px] card-cyber flex items-center justify-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-10 w-10 border-2 border-t-franky-blue border-franky-blue-30 rounded-full animate-spin mb-3"></div>
                <p className="text-gray-400 font-sen">Loading...</p>
              </div>
            </div>
            <div className="lg:col-span-4 h-[600px] card-cyber flex items-center justify-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-10 w-10 border-2 border-t-franky-blue border-franky-blue-30 rounded-full animate-spin mb-3"></div>
                <p className="text-gray-400 font-sen">Loading builder...</p>
              </div>
            </div>
          </div>
        )}

        {/* Add Avatar Upload Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="card-cyber">
            <h2 className="text-xl font-semibold text-franky-blue mb-4 font-sen">
              Agent Avatar
            </h2>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="flex-1">
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <div className="flex items-center justify-center w-full p-4 border-2 border-dashed border-franky-blue-30 rounded-lg hover:border-franky-blue-60 transition-colors cursor-pointer">
                      <div className="text-center">
                        <FiImage className="mx-auto h-8 w-8 text-franky-blue-60 mb-2" />
                        <p className="text-sm text-gray-300 font-sen">
                          {avatarFile
                            ? avatarFile.name
                            : "Click to select image"}
                        </p>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {
            <button
              onClick={handleCreateAgent}
              disabled={!constructedCharacter || isUploading || agentCreated}
              className={`px-8 py-4 rounded-lg transition-all duration-300 glow-cyan backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed font-sen font-medium
                ${
                  uploadUrl
                    ? "bg-franky-blue-30 border border-franky-blue text-white"
                    : "btn-cyber hover:glow-franky"
                } 
                ${isUploading ? "animate-pulse" : ""}`}
            >
              {!constructedCharacter ? (
                "Construct Character First"
              ) : isUploading ? (
                <span className="flex items-center justify-center">
                  <span className="mr-2">Uploading to IPFS...</span>
                  <FiUploadCloud className="animate-bounce" />
                </span>
              ) : uploadUrl ? (
                <span className="flex items-center justify-center">
                  <FiCheck className="mr-2" />
                  <span>Proceed to Create Agent</span>
                </span>
              ) : (
                "Upload & Create Agent"
              )}
            </button>
          }

          {!constructedCharacter && (
            <p className="mt-3 text-sm text-gray-400 font-sen">
              Fill out the character form and click "Construct Character"
            </p>
          )}
          {uploadUrl && !agentCreated && (
            <p className="mt-3 text-sm text-franky-blue font-sen">
              Character data has been successfully uploaded! Click to create
              your agent.
            </p>
          )}
        </motion.div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmCreateAgent}
        deviceInfo={deviceInfo}
        agentName={agentName}
        characterData={constructedCharacter}
        isPending={isPending}
        perApiCallFee={perApiCallFee}
        isPublic={isPublic}
        isEncrypting={isEncrypting}
        isUploading={isUploading}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        agentAddress={agentId}
        apiKey={apiKey}
      />
    </>
  );
}

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-gray-300 flex flex-col items-center">
        <div className="h-12 w-12 mb-4 border-4 border-t-franky-blue border-gray-700 rounded-full animate-spin"></div>
        <p className="font-sen">Loading agent builder...</p>
      </div>
    </div>
  );
}

export default function CreateAgentPage({
  params,
}: {
  params: Promise<{
    address: string;
  }>;
}) {
  const [address, setAddress] = useState<string>("");
  const { accountId } = useWallet();

  useEffect(() => {
    const fetchData = async () => {
      const fetcgedparams = await params;
      console.log(fetcgedparams);
      setAddress(fetcgedparams.address);
    };
    fetchData();
  }, []);

  return (
    <main className="min-h-screen pb-20">
      <Suspense fallback={<LoadingFallback />}>
        {address && (
          <CreateAgentContent
            deviceAddress={address}
            accountId={accountId}
          />
        )}
      </Suspense>
    </main>
  );
}
