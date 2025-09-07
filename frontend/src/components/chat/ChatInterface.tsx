"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import { FiCopy, FiCheck, FiSmartphone, FiTerminal } from "react-icons/fi";
import DeviceSelector from "./DeviceSelector";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";

type MessageRole = "user" | "assistant";

interface Message {
  id: string;
  content: string;
  role: MessageRole;
  timestamp: Date;
  showDeployDeviceInfo?: boolean;
}

// CodeBlock component for displaying commands with copy functionality
const CodeBlock = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <div className="relative mt-3 mb-6 rounded-lg overflow-hidden w-full">
      <div className="card-cyber p-5 font-mono text-sm md:text-base overflow-x-auto">
        <code className="text-franky-blue font-sen">{code}</code>
      </div>
      <button
        onClick={copyToClipboard}
        className="absolute top-3 right-3 p-2 rounded-md bg-black/50 hover:bg-black/80 text-franky-blue transition-colors glow-blue"
        aria-label="Copy to clipboard"
      >
        {copied ? <FiCheck /> : <FiCopy />}
      </button>
    </div>
  );
};

// Instruction Step component
const InstructionStep = ({
  number,
  title,
  icon,
  children,
}: {
  number: number;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: number * 0.1 }}
      className="mb-6 card-cyber"
    >
      <div className="flex items-center mb-3">
        <div className="flex justify-center items-center h-10 w-10 rounded-full bg-franky-blue-20 text-franky-blue mr-3 animate-glow">
          {icon}
        </div>
        <h3 className="text-lg font-bold gradient-franky-text font-sen">
          Step {number}: {title}
        </h3>
      </div>
      <div className="text-gray-300 ml-12 text-sm font-sen">{children}</div>
    </motion.div>
  );
};

// DeployDeviceInfo component to show when user asks about deploying devices
const DeployDeviceInfo = () => {
  return (
    <div className="mt-4 space-y-4">
      <p className="text-gray-400 mb-4 font-sen">
        Here's how you can deploy your mobile device to earn $HBAR by hosting AI
        agents:
      </p>

      <InstructionStep
        number={1}
        title="Setup your Phone"
        icon={<FiSmartphone size={20} />}
      >
        <p>
          Watch this video tutorial to set up your phone with Termux, an Android
          terminal emulator that allows you to run Linux commands:
        </p>
        <div
          className="mt-3 relative w-full border border-franky-blue-30 rounded-lg overflow-hidden"
          style={{ paddingBottom: "56.25%" }}
        >
          <iframe
            className="absolute inset-0 w-full h-full"
            src="https://www.youtube.com/embed/s3TXc-jiQ40?si=xq88k3gI5n1OUJHk"
            title="Setup Termux for Franky"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
        <div className="mt-4 p-4 bg-franky-indigo-20 border border-franky-indigo-30 rounded-lg">
          <p className="text-franky-indigo font-sen">
            <strong>Important:</strong> Make sure the qwen2.5:3b model is
            installed on your device before proceeding. This is required for
            Franky to function properly.
          </p>
        </div>
      </InstructionStep>

      <InstructionStep
        number={2}
        title="Run Franky"
        icon={<FiTerminal size={20} />}
      >
        <p>
          Use the following curl command to download, install and run Franky:
        </p>
        <CodeBlock code="pkg update && pkg install nodejs libqrencode termux-api jq curl && git clone https://github.com/gabrielantonyxaviour/franky-hedera.git && cd franky-hedera && cd agent-framework && chmod +x franky && ./franky start" />
        <p>
          This script will download all necessary files to run Franky on your
          device.
        </p>
      </InstructionStep>
    </div>
  );
};

export default function ChatInterface({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Function to check if message is asking about deploying a device
  const isAskingAboutDeployingDevice = (message: string) => {
    const deployKeywords = [
      "deploy device",
      "how to deploy",
      "setup device",
      "deploy a device",
      "register my device",
      "register device",
      "deploy my phone",
      "deploy my device",
      // ... (keeping all existing keywords)
    ];

    const lowerMessage = message.toLowerCase();
    const hasExactMatch = deployKeywords.some((keyword) =>
      lowerMessage.includes(keyword)
    );
    if (hasExactMatch) return true;

    const deviceTerms = /\b(device|phone|mobile|android|iphone|ios)\b/i;
    const actionTerms =
      /\b(deploy|register|setup|set up|configure|enroll|initialize|activate|onboard)\b/i;
    const questionTerms =
      /\b(how|can i|steps|guide|instructions|help|want|get)\b/i;

    const hasDeviceTerm = deviceTerms.test(lowerMessage);
    const hasActionTerm = actionTerms.test(lowerMessage);

    if (hasDeviceTerm && hasActionTerm) return true;

    if (hasDeviceTerm && questionTerms.test(lowerMessage)) {
      if (
        lowerMessage.includes("regist") ||
        lowerMessage.includes("deploy") ||
        lowerMessage.includes("setup") ||
        lowerMessage.includes("set up") ||
        lowerMessage.includes("configur") ||
        lowerMessage.includes("enroll")
      ) {
        return true;
      }
    }

    return false;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const isDeployQuestion = isAskingAboutDeployingDevice(input);

    const userMessage: Message = {
      id: uuidv4(),
      content: input,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      if (isDeployQuestion) {
        setTimeout(() => {
          const assistantMessage: Message = {
            id: uuidv4(),
            content: "Here's how to deploy your device with Franky:",
            role: "assistant",
            timestamp: new Date(),
            showDeployDeviceInfo: true,
          };

          setMessages((prev) => [...prev, assistantMessage]);
          setIsLoading(false);
        }, 1000);
      } else {
        const response = await fetch(
          process.env.NEXT_PUBLIC_FRONTEND_AGENT + "/chat",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: input,
              secrets:
                "sYZg5Kl5w+qhEW/J9AeVmKK+dgQqqE8VMeAZxaRsWgXnybl0ZXjDoQkdjkT9cCVYZMSTewKCrR6VEE8TEL1OQ+mi4gZQKOD9mHLoZP+1wQ5IvpEfAtn7BV1G/YOFhg5x3pKYMGYyX3fl17kaHBX4scnFcajezkZ69Uix1aQAM3Wtw8/RoYDohNaJxOZoWO0OlXnwhE/iyS5WAg==",
              secretsHash: "sdbweudbwudcbubcueibciuedbci",
              avatarUrl:
                "https://ivory-impressive-mosquito-615.mypinata.cloud/files/",
              deviceAddress: "0x7339b922a04ad2c0ddd9887e5f043a65759543b8",
              perApiCallFee: "1000000000000000",
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to get response from agent");
        }

        const data = await response.json();

        const assistantMessage: Message = {
          id: uuidv4(),
          content:
            data.message ||
            data.response ||
            "I'm having trouble responding right now.",
          role: "assistant",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Error communicating with agent:", error);

      const errorMessage: Message = {
        id: uuidv4(),
        content: "Sorry, I encountered an error. Please try again later.",
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {isOpen && (
        <>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-franky-blue-10 blur-3xl" />

          <div className="relative z-10 max-w-4xl mx-auto p-6">
            <div className="flex flex-col justify-center w-full h-[80vh] max-w-3xl px-4 pt-20 pb-8 mx-auto">
              <ScrollArea className="">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center">
                    <h1 className="text-4xl font-semibold text-white mb-12 font-sen">
                      What can I help with?
                    </h1>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 overflow-y-auto pb-4">
                      {messages.map((message) => (
                        <div key={message.id} className="mb-6">
                          <div className="flex">
                            <div className="flex items-start max-w-3xl">
                              <div className="flex-shrink-0 mr-4">
                                {message.role === "assistant" ? (
                                  <div className="h-8 w-8 rounded-full flex items-center justify-center animate-glow">
                                    <Image
                                      src="/logo.png"
                                      alt="Franky Logo"
                                      width={32}
                                      height={32}
                                      className="rounded-full"
                                    />
                                  </div>
                                ) : (
                                  <div className="h-8 w-8 rounded-full flex items-center justify-center">
                                    <Image
                                      src="/you.png"
                                      alt="You"
                                      width={32}
                                      height={32}
                                      className="rounded-full"
                                    />
                                  </div>
                                )}
                              </div>
                              <div className="space-y-1">
                                <p className="font-semibold text-sm text-white text-left font-sen">
                                  {message.role === "assistant"
                                    ? "Franky AI"
                                    : "You"}
                                </p>
                                <div className="prose text-gray-400 text-left font-sen">
                                  {message.content}
                                </div>

                                {message.showDeployDeviceInfo && (
                                  <DeployDeviceInfo />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {isLoading && (
                        <div className="mb-6">
                          <div className="flex">
                            <div className="flex items-start max-w-3xl">
                              <div className="flex-shrink-0 mr-4">
                                <div className="h-8 w-8 rounded-full flex items-center justify-center animate-glow">
                                  <Image
                                    src="/logo.png"
                                    alt="Franky Logo"
                                    width={32}
                                    height={32}
                                    className="rounded-full"
                                  />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <p className="font-semibold text-sm text-white font-sen">
                                  Franky AI
                                </p>
                                <div className="flex space-x-2">
                                  {[0, 1, 2].map((dot) => (
                                    <motion.div
                                      key={dot}
                                      className="w-2 h-2 rounded-full bg-franky-blue animate-glow"
                                      animate={{
                                        opacity: [0.3, 1, 0.3],
                                        scale: [0.8, 1.2, 0.8],
                                      }}
                                      transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        delay: dot * 0.2,
                                      }}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>
                  </>
                )}
                <ScrollBar orientation="vertical" />
              </ScrollArea>

              {messages.length > 0 ? (
                <div className="w-full max-w-3xl mt-4 mx-auto">
                  <div className="relative glow-cyan rounded-2xl">
                    <textarea
                      rows={1}
                      placeholder="Send a message"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="input-cyber w-full py-3.5 pl-4 pr-14 rounded-md resize-none font-sen"
                      disabled={isLoading}
                      style={{
                        minHeight: "56px",
                        maxHeight: "200px",
                        height: "auto",
                      }}
                    />
                    <div className="absolute right-2 bottom-3">
                      <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className={`p-1.5 rounded-md bg-franky-purple hover:bg-franky-indigo transition-colors ${
                          !input.trim() || isLoading
                            ? "opacity-40 cursor-not-allowed"
                            : "opacity-100"
                        }`}
                      >
                        {isLoading ? (
                          <svg
                            className="w-5 h-5 animate-spin text-black"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                        ) : (
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M7 11L12 6L17 11M12 18V7"
                              stroke="black"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              transform="rotate(90 12 12)"
                            ></path>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-[800px] mx-auto">
                  <div className="relative glow-cyan rounded-2xl">
                    <textarea
                      rows={1}
                      placeholder="Ask anything"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="input-cyber w-full py-3.5 pl-4 pr-14 rounded-2xl resize-none font-sen"
                      disabled={isLoading}
                      style={{
                        minHeight: "56px",
                        maxHeight: "200px",
                        height: "auto",
                      }}
                    />
                    <div className="absolute right-2 bottom-2.5 flex space-x-2">
                      <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className={`p-1.5 rounded-full bg-black ${
                          !input.trim() || isLoading
                            ? "opacity-40 cursor-not-allowed"
                            : "opacity-100"
                        }`}
                      >
                        {isLoading ? (
                          <svg
                            className="w-5 h-5 animate-spin text-white"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                        ) : (
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M7 11L12 6L17 11M12 18V7"
                              stroke="#038fa8"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              transform="rotate(90 12 12)"
                            ></path>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col md:flex-row justify-center gap-6">
              <motion.button
                className="py-2 px-4 text-franky-purple hover:text-white border border-franky-purple-30 rounded-lg transition-colors duration-300 font-sen"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
              >
                ← Go Back
              </motion.button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
