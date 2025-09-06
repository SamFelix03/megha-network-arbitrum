"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend, FiX, FiUser, FiCpu, FiUserCheck, FiCopy, FiChevronDown, FiArrowDown } from "react-icons/fi";
import { useWallet } from "@/providers/WalletProvider";
import { createPublicClient, http } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { FRANKY_ADDRESS, FRANKY_ABI } from "@/lib/constants";

// Message interface
interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  toolResponse?: any;
}

// Agent interface
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

// Device interface
interface DeviceDetails {
  deviceModel: string;
  ram: string;
  storageCapacity: string;
  cpu: string;
  os: string;
  ngrokLink: string;
  walletAddress: string;
  hostingFee: string;
}

// Agent Profile Modal Component
const AgentProfileModal = ({
  agent,
  isOpen,
  onClose,
}: {
  agent: Agent | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen || !agent) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-cyber pt-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
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
                <div className="w-14 h-14 rounded-full overflow-hidden border border-franky-cyan-30 flex-shrink-0">
                  <img
                    src={agent.imageUrl}
                    alt={agent.name}
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
              <div className="p-3 rounded-lg bg-black/30 border border-franky-cyan-20">
                <h3 className="text-sm font-semibold text-franky-cyan mb-2 font-sen">
                  Agent Information
                </h3>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-gray-400 font-sen">Agent ID:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-franky-cyan font-mono text-xs break-all">{agent.uuid.slice(0, 12)}...</span>
                      <button
                        onClick={() => copyToClipboard(agent.uuid)}
                        className="text-gray-400 hover:text-franky-cyan transition-colors"
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
              <div className="p-3 rounded-lg bg-black/30 border border-franky-cyan-20">
                <h3 className="text-sm font-semibold text-franky-cyan mb-2 font-sen">
                  Agent Capabilities ({agent.tools.length})
                </h3>
                
                <div className="grid grid-cols-1 gap-1">
                  {agent.tools.map((tool, index) => (
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
                    This agent can perform {agent.tools.length} specialized blockchain analysis tasks
                  </p>
                </div>
              </div>

              {/* Owner Info */}
              <div className="p-3 rounded-lg bg-black/30 border border-franky-cyan-20">
                <h3 className="text-sm font-semibold text-franky-cyan mb-2 font-sen">
                  Creator Details
                </h3>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-sen text-xs">Creator Address:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-franky-cyan font-mono text-xs">{agent.ownerAddress.slice(0, 8)}...{agent.ownerAddress.slice(-6)}</span>
                    <button
                      onClick={() => copyToClipboard(agent.ownerAddress)}
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
                onClick={onClose}
                className="flex-1 py-2 px-4 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors font-sen text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Device Details Modal Component
const DeviceDetailsModal = ({
  device,
  isOpen,
  onClose,
}: {
  device: DeviceDetails | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen || !device) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-cyber pt-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="card-cyber max-w-md w-full glow-cyan max-h-[90vh] overflow-y-auto"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-white h-7 w-7 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/70 transition-colors"
              aria-label="Close modal"
            >
              <FiX className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-bold gradient-franky-text mb-3 pr-8 font-sen">
              Device Details
            </h3>

            {/* Hosting fee display */}
            <div className="p-3 rounded-lg bg-franky-cyan-10 border border-franky-cyan-30 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-franky-cyan text-sm font-medium font-sen">Fee per Message</span>
                <span className="text-white text-xl font-bold font-sen">{device.hostingFee} ETH</span>
              </div>
              <p className="text-xs text-gray-400 mt-1 font-sen">
                Payment per API call for agents hosted on this device
              </p>
            </div>

            {/* Device details in accordion style */}
            <div className="space-y-2 mb-4">
              <details className="group rounded-lg bg-black/50 border border-franky-cyan-20 overflow-hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between p-2 font-medium font-sen">
                  <div className="flex items-center">
                    <span className="text-franky-cyan mr-2">📱</span>
                    <span>Device Specs</span>
                  </div>
                  <span className="transition group-open:rotate-180">
                    <svg fill="none" height="16" width="16" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </span>
                </summary>
                <div className="p-2 pt-0 text-xs space-y-1">
                  <div className="flex justify-between py-1 border-t border-franky-cyan-20">
                    <span className="text-gray-400 font-sen">Model</span>
                    <span className="text-franky-cyan font-sen">{device.deviceModel}</span>
                  </div>
                  <div className="flex justify-between py-1 border-t border-franky-cyan-20">
                    <span className="text-gray-400 font-sen">RAM</span>
                    <span className="text-franky-cyan font-sen">{device.ram}</span>
                  </div>
                  <div className="flex justify-between py-1 border-t border-franky-cyan-20">
                    <span className="text-gray-400 font-sen">Storage</span>
                    <span className="text-franky-cyan font-sen">{device.storageCapacity}</span>
                  </div>
                  <div className="flex justify-between py-1 border-t border-franky-cyan-20">
                    <span className="text-gray-400 font-sen">CPU</span>
                    <span className="text-franky-cyan font-sen">{device.cpu}</span>
                  </div>
                  <div className="flex justify-between py-1 border-t border-franky-cyan-20">
                    <span className="text-gray-400 font-sen">OS</span>
                    <span className="text-franky-cyan font-sen">{device.os}</span>
                  </div>
                </div>
              </details>

              <details className="group rounded-lg bg-black/50 border border-franky-cyan-20 overflow-hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between p-2 font-medium font-sen">
                  <div className="flex items-center">
                    <span className="text-franky-cyan mr-2">🔗</span>
                    <span>Connection Details</span>
                  </div>
                  <span className="transition group-open:rotate-180">
                    <svg fill="none" height="16" width="16" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </span>
                </summary>
                <div className="p-2 pt-0 text-xs space-y-1">
                  <div className="flex justify-between py-1 border-t border-franky-cyan-20">
                    <span className="text-gray-400 font-sen">Device Address</span>
                    <span className="text-franky-cyan text-xs break-all font-sen">
                      {device.walletAddress.toLowerCase().substring(0, 8)}...{device.walletAddress.toLowerCase().substring(device.walletAddress.toLowerCase().length - 8)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-t border-franky-cyan-20">
                    <span className="text-gray-400 font-sen">Link</span>
                    <a 
                      href={device.ngrokLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-franky-cyan text-xs underline hover:text-white transition-colors break-all max-w-[200px] truncate font-sen"
                    >
                      {device.ngrokLink}
                    </a>
                  </div>
                </div>
              </details>
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
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default function AgentChatPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { accountId } = useWallet();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [agentLoading, setAgentLoading] = useState(true);
  const [device, setDevice] = useState<DeviceDetails | null>(null);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const agentUuid = params?.agentAddress as string; // This is actually the UUID
  const deviceNgrok = searchParams?.get('deviceNgrok');
  
  // Ref for auto-scrolling to bottom of chat
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Function to scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Check if user has scrolled up to show scroll-to-bottom button
  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
      setShowScrollButton(isScrolledUp);
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Add scroll event listener
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.addEventListener('scroll', handleScroll);
      return () => chatContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Function to parse device details from URL parameters
  const parseDeviceDetails = () => {
    if (!searchParams) {
      console.log('No searchParams available');
      return null;
    }

    const deviceModel = searchParams.get('deviceModel');
    const ram = searchParams.get('ram');
    const storageCapacity = searchParams.get('storage') || searchParams.get('storageCapacity');
    const cpu = searchParams.get('cpu');
    const os = searchParams.get('os') || 'Unknown';
    const ngrokLink = searchParams.get('ngrokLink') || deviceNgrok;
    const walletAddress = searchParams.get('walletAddress');
    const hostingFee = searchParams.get('hostingFee') || '0';

    console.log('Parsing device details from URL:', {
      deviceModel,
      ram,
      storageCapacity,
      cpu,
      os,
      ngrokLink,
      walletAddress,
      hostingFee,
      allParams: Object.fromEntries(searchParams.entries())
    });

    if (deviceModel && ram && storageCapacity && ngrokLink && walletAddress) {
      const deviceDetails = {
        deviceModel,
        ram,
        storageCapacity,
        cpu: cpu || 'Unknown',
        os,
        ngrokLink,
        walletAddress,
        hostingFee,
      } as DeviceDetails;
      
      console.log('Successfully parsed device details:', deviceDetails);
      return deviceDetails;
    }
    
    console.log('Missing required device parameters');
    return null;
  };

  // Function to fetch agent data by UUID
  const fetchAgentData = async (uuid: string) => {
    try {
      setAgentLoading(true);
      const publicClient = createPublicClient({
        chain: arbitrumSepolia,
        transport: http(),
      });

      const agentData = await publicClient.readContract({
        address: FRANKY_ADDRESS as `0x${string}`,
        abi: FRANKY_ABI,
        functionName: "getAgentByUUID",
        args: [uuid],
      }) as Agent;

      setAgent(agentData);
    } catch (error) {
      console.error('Error fetching agent data:', error);
      setError("Failed to load agent information");
    } finally {
      setAgentLoading(false);
    }
  };

  useEffect(() => {
    console.log('useEffect triggered with:', { accountId, deviceNgrok, agentUuid, searchParams: searchParams?.toString() });
    
    if (!accountId) {
      router.push("/agent-marketplace");
      return;
    }

    if (!deviceNgrok) {
      setError("No device selected. Please select a device first.");
      return;
    }

    // Parse device details from URL parameters
    const deviceDetails = parseDeviceDetails();
    if (deviceDetails) {
      console.log('Setting device details:', deviceDetails);
      setDevice(deviceDetails);
    } else {
      console.log('No device details found in URL parameters');
    }

    if (agentUuid) {
      fetchAgentData(agentUuid);
    }

    // Add initial welcome message - will be updated when agent data loads
    setMessages([{
      id: '1',
      content: "Hello! How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    }]);
  }, [agentUuid, accountId, router, deviceNgrok, searchParams]);

  // Update the first message when agent data loads
  useEffect(() => {
    if (agent && agent.messageExample && messages.length > 0) {
      setMessages(prev => prev.map((msg, index) => 
        index === 0 
          ? { ...msg, content: agent.messageExample }
          : msg
      ));
    }
  }, [agent, messages.length]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading || !deviceNgrok) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setLoading(true);

    try {
      // Send request to device ngrok endpoint
      const response = await fetch(`${deviceNgrok}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uuid: agentUuid,
          message: inputMessage,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Agent response:', data);

      // Create bot response message
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.rawModelResponse || "I received your message but couldn't generate a response.",
        isUser: false,
        timestamp: new Date(),
        toolResponse: data.rawToolResponse ? JSON.parse(data.rawToolResponse) : null,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I encountered an error processing your request. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleCloseChat = () => {
    router.push("/agent-marketplace");
  };

  const renderToolResponse = (toolResponse: any) => {
    if (!toolResponse || typeof toolResponse !== 'object') return null;

    return (
      <div className="mt-3 p-3 bg-franky-cyan-10 border border-franky-cyan-20 rounded-lg">
        <h4 className="text-franky-cyan text-sm font-bold mb-2 font-sen">Tool Response:</h4>
        <div className="space-y-1">
          {Object.entries(toolResponse).map(([key, value]) => (
            <div key={key} className="flex justify-between items-start gap-2 text-xs">
              <span className="text-gray-400 font-sen">{key}:</span>
              <span className="text-gray-200 font-sen text-right max-w-[70%] break-words">
                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="min-h-screen bg-cyber flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 font-sen mb-4">{error}</p>
          <button
            onClick={() => router.push("/agent-marketplace")}
            className="px-6 py-2 bg-franky-cyan-20 text-franky-cyan rounded-lg hover:bg-franky-cyan-30 transition-colors font-sen"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Fixed Background Layer */}
      <div className="fixed inset-0 bg-cyber -z-10"></div>
      
      <div className="h-screen pt-20 flex flex-col relative">
        <div className="container mx-auto px-4 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between py-4 border-b border-franky-cyan-20 flex-shrink-0">
          <div 
            className="flex items-center gap-3 cursor-pointer hover:bg-gray-800/30 rounded-lg p-2 transition-colors"
            onClick={() => setShowProfileModal(true)}
          >
            <div className="w-10 h-10 bg-franky-cyan-20 rounded-full flex items-center justify-center">
              {agent?.imageUrl ? (
                <img
                  src={agent.imageUrl}
                  alt={agent.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <FiCpu className="text-franky-cyan" />
              )}
            </div>
            <div>
              <h1 className="text-lg font-bold text-white font-sen">
                {agentLoading ? "Loading..." : agent ? `Now chatting with ${agent.name}` : "AI Agent Chat"}
              </h1>
              <p className="text-sm text-gray-400 font-sen flex items-center gap-1">
                Agent ID: {agentUuid.slice(0, 8)}...
                <FiChevronDown className="w-3 h-3" />
              </p>
            </div>
          </div>
          
          {/* Hosting Fee Display - Top Center */}
          {device && (
            <div className="text-center">
              <div className="text-xs text-gray-400 font-sen">Fee per Message</div>
              <div className="text-xl font-bold text-franky-cyan font-sen">{device.hostingFee} ETH</div>
            </div>
          )}
          
          <div className="flex items-center gap-3">
            {/* Device Details Container - Top Right */}
            {device ? (
              <div 
                className="bg-gray-800/50 border border-franky-cyan-20 rounded-lg p-3 cursor-pointer hover:bg-gray-800/70 transition-colors"
                onClick={() => setShowDeviceModal(true)}
                title="View device details"
              >
                <div className="text-sm font-bold text-white font-sen mb-1">
                  {device.deviceModel}
                </div>
                <div className="text-xs text-franky-cyan font-sen">
                  RAM: {device.ram}
                </div>
              </div>
            ) : (
              <div className="bg-gray-800/30 border border-gray-600 rounded-lg p-3">
                <div className="text-sm text-gray-400 font-sen">Device loading...</div>
              </div>
            )}
            
            <button
              onClick={handleCloseChat}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 relative min-h-0">
          {/* Messages */}
          <div 
            ref={chatContainerRef}
            className="h-full overflow-y-auto py-4 px-2"
            style={{ 
              scrollBehavior: 'smooth',
              overflowAnchor: 'none' // Prevents scroll jumping
            }}
          >
            <div className="space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!message.isUser && (
                    <div className="w-8 h-8 bg-franky-cyan-20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <FiCpu className="text-franky-cyan text-sm" />
                    </div>
                  )}
                  
                  <div className={`max-w-[70%] ${message.isUser ? 'order-first' : ''}`}>
                    <div
                      className={`p-3 rounded-lg ${
                        message.isUser
                          ? 'bg-franky-cyan text-black'
                          : 'bg-gray-800 text-white border border-gray-700'
                      }`}
                    >
                      <p className="text-sm font-sen leading-relaxed break-words">{message.content}</p>
                      {message.toolResponse && renderToolResponse(message.toolResponse)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 font-sen">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>

                  {message.isUser && (
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <FiUser className="text-gray-300 text-sm" />
                    </div>
                  )}
                </motion.div>
              ))}
              
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex gap-3 justify-start"
                >
                  <div className="w-8 h-8 bg-franky-cyan-20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <FiCpu className="text-franky-cyan text-sm" />
                  </div>
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-franky-cyan rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-franky-cyan rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-franky-cyan rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      <span className="text-gray-400 text-sm font-sen ml-2">AI is thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Invisible element for scrolling reference */}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Scroll to Bottom Button */}
          <AnimatePresence>
            {showScrollButton && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                onClick={scrollToBottom}
                className="absolute bottom-4 right-4 w-10 h-10 bg-franky-cyan text-black rounded-full flex items-center justify-center shadow-lg hover:bg-franky-cyan/90 transition-colors z-10"
                title="Scroll to bottom"
              >
                <FiArrowDown className="w-5 h-5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Input */}
        <div className="border-t border-franky-cyan-20 pt-4 pb-4 flex-shrink-0">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Send message"
              className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-franky-cyan font-sen"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !inputMessage.trim()}
              className="px-4 py-3 bg-franky-cyan text-black rounded-lg hover:bg-franky-cyan/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSend className="w-5 h-5" />
            </button>
          </div>
        </div>
        </div>
      </div>

      {/* Agent Profile Modal */}
      <AgentProfileModal
        agent={agent}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      {/* Device Details Modal */}
      <DeviceDetailsModal
        device={device}
        isOpen={showDeviceModal}
        onClose={() => setShowDeviceModal(false)}
      />
    </>
  );
} 