"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiSend, FiUser, FiCpu, FiWifi } from "react-icons/fi";
// Mock HCS service functionality

interface Message {
  id: string;
  content: {
    text: string;
    timestamp?: string;
  };
  isFromUser: boolean;
  timestamp: string;
  senderAccount: string;
}

interface AgentChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  agent: any;
  connectionTopicId: string;
  accountId: string;
}

export default function AgentChatInterface({
  isOpen,
  onClose,
  agent,
  connectionTopicId,
  accountId,
}: AgentChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Start message polling when chat opens
  useEffect(() => {
    if (isOpen && connectionTopicId) {
      startMessagePolling();
      // Remove automatic initial greeting - let user send first message manually
    } else {
      stopMessagePolling();
    }

    return () => {
      stopMessagePolling();
    };
  }, [isOpen, connectionTopicId]);

  const startMessagePolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    setIsPolling(true);
    
    // Poll immediately
    pollMessages();
    
    // Then poll every 3 seconds
    pollingIntervalRef.current = setInterval(() => {
      pollMessages();
    }, 3000);
  };

  const stopMessagePolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsPolling(false);
  };

  const pollMessages = async () => {
    try {
      // Mock: No actual polling, just maintain existing messages
      console.log('Mock message polling for topic:', connectionTopicId);
    } catch (error) {
      console.error("Error polling messages:", error);
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isSending) return;

    console.log(`Mock sending message: "${content}"`);
    setIsSending(true);
    
    try {
      // Mock: Add user message immediately
      const userMessage: Message = {
        id: Date.now().toString(),
        content: { text: content },
        isFromUser: true,
        timestamp: new Date().toISOString(),
        senderAccount: accountId,
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInputMessage("");
      
      // Mock agent response
      setTimeout(() => {
        const agentMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: { text: "This is a mock response from the agent. The HCS functionality has been removed." },
          isFromUser: false,
          timestamp: new Date().toISOString(),
          senderAccount: 'mock_agent',
        };
        setMessages(prev => [...prev, agentMessage]);
      }, 1500);
      
    } catch (error) {
      console.error("Error sending message:", error);
      alert(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendMessage = async () => {
    await sendMessage(inputMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 backdrop-cyber"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Chat Interface */}
          <motion.div
            className="card-cyber w-full max-w-3xl h-[75vh] z-10 relative flex flex-col"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-franky-cyan-20">
              <div className="flex items-center">
                {agent?.avatar ? (
                  <div className="h-10 w-10 rounded-full overflow-hidden mr-3 border border-franky-cyan-30">
                    <img
                      src={agent.avatar}
                      alt={agent.subname}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          "https://placehold.co/100x100/038fa8/1A1A1A?text=AI&font=Roboto";
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-10 w-10 rounded-full bg-franky-cyan-20 text-franky-cyan mr-3">
                    <FiCpu className="text-lg" />
                  </div>
                )}
                
                <div>
                  <h3 className="text-lg font-bold text-white font-sen">
                    {agent?.subname || 'AI Agent'}
                  </h3>
                  <div className="flex items-center text-sm text-gray-400">
                    <FiWifi className="mr-1" />
                    <span className="font-sen">
                      {isPolling ? 'Connected' : 'Disconnected'}
                    </span>
                    {isPolling && (
                      <div className="ml-2 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <FiCpu className="text-4xl mx-auto mb-4 text-franky-cyan" />
                  <p className="font-sen">
                    Start a conversation with {agent?.subname || 'the agent'}
                  </p>
                  <p className="text-sm mt-2 font-sen">
                    Start chatting with the AI agent
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.isFromUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        message.isFromUser
                          ? 'bg-franky-cyan-20 text-franky-cyan border border-franky-cyan-30'
                          : 'bg-gray-800 text-white border border-gray-700'
                      }`}
                    >
                      <div className="flex items-center mb-1">
                        {message.isFromUser ? (
                          <FiUser className="text-sm mr-2" />
                        ) : (
                          <FiCpu className="text-sm mr-2" />
                        )}
                        <span className="text-xs opacity-70 font-sen">
                          {message.isFromUser ? 'You' : agent?.subname || 'Agent'}
                        </span>
                        <span className="text-xs opacity-50 ml-auto font-sen">
                          {formatTimestamp(message.timestamp)}
                        </span>
                      </div>
                      
                      <p className="font-sen whitespace-pre-wrap">
                        {message.content.text}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-franky-cyan-20">
              <div className="flex gap-3">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 input-cyber py-3 px-4 font-sen resize-none"
                  rows={1}
                  disabled={isSending || !isPolling}
                />
                
                <motion.button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isSending || !isPolling}
                  className={`px-6 py-3 rounded-none font-sen font-medium transition-colors ${
                    !inputMessage.trim() || isSending || !isPolling
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-franky-cyan-20 text-franky-cyan hover:bg-franky-cyan-30'
                  }`}
                  whileHover={!inputMessage.trim() || isSending || !isPolling ? {} : { scale: 1.05 }}
                  whileTap={!inputMessage.trim() || isSending || !isPolling ? {} : { scale: 0.95 }}
                >
                  {isSending ? (
                    <div className="animate-spin w-5 h-5 border-t-2 border-r-2 border-current rounded-full" />
                  ) : (
                    <FiSend className="text-lg" />
                  )}
                </motion.button>
              </div>
              
              <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                <span className="font-sen">
                  Topic: {connectionTopicId}
                </span>
                <span className="font-sen">
                  Press Enter to send
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 