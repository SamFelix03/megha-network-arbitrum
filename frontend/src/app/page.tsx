"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ChatInterface from "@/components/chat/ChatInterface";

// Simple glow button
const GlowButton = ({
  children,
  href,
  onClick,
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
}) => {
  const buttonContent = (
    <div
      className="btn-cyber glow-cyan hover:glow-franky transition-all duration-300"
      onClick={onClick}
    >
      <span className="relative z-10 text-2xl font-bold gradient-franky-text font-sen">
        {children}
      </span>

      {/* Shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 opacity-0 hover:opacity-100 transition-opacity duration-300 animate-shine" />
    </div>
  );

  if (href) {
    return <Link href={href}>{buttonContent}</Link>;
  }

  return buttonContent;
};

// Option card component for get started options
const OptionCard = ({
  title,
  description,
  icon,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
}) => {
  return (
    <motion.div
      className="card-cyber hover:glow-cyan cursor-pointer group rounded-none"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
    >
      <div className="text-4xl flex w-full justify-center mb-4 text-franky-cyan group-hover:text-franky-orange transition-colors duration-300 animate-glow">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 gradient-franky-text font-sen">
        {title}
      </h3>
      <p className="text-gray-400 font-sen leading-relaxed">{description}</p>
    </motion.div>
  );
};

// Main Home component
export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [getStarted, setGetStarted] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const router = useRouter();

  // Ensure component is mounted to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div></div>;
  }

  return (
    <section className="flex-1 flex flex-col h-screen items-center justify-center px-4 relative">
      <div className="container mx-auto text-center">
        {!getStarted && !isChatOpen ? (
          <div>
            <p className="text-lg md:text-xl mb-3 text-gray-400 max-w-3xl mx-auto font-desc">
              Introducing
            </p>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-franky-text font-logo">
              FRANKY AGENTS
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-gray-300 max-w-3xl mx-auto font-desc leading-relaxed">
              Recycle your old mobile devices into{" "}
              <span className="text-franky-cyan">AI agents</span> and earn{" "}
              <span className="text-franky-orange">$ETH</span>.
            </p>

            <div className="flex flex-col md:flex-row justify-center gap-6 md:gap-8">
              <GlowButton onClick={() => setGetStarted(true)}>
                Get Started
              </GlowButton>
            </div>

            {/* Feature highlights */}
            {/* <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex justify-center space-x-8 mt-12 text-sm text-gray-400 font-sen"
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-franky-cyan rounded-full animate-glow"></div>
                <span>Eco-Friendly</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-franky-orange rounded-full animate-glow"></div>
                <span>Profitable</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-franky-yellow rounded-full animate-glow"></div>
                <span>Decentralized</span>
              </div>
            </motion.div> */}
          </div>
        ) : !isChatOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            {/* Logo and Site Name */}
            <div className="flex items-center justify-center mb-16 space-x-4">
              <Image
                src={"/logo.png"}
                alt="Logo"
                width={50}
                height={50}
                className="rounded-full select-none animate-glow"
              />
              <span
                className="ml-4 text-2xl font-bold gradient-franky-text font-desc "
                style={{
                  letterSpacing: "0.2em",
                }}
              >
                frankyagent.xyz
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <OptionCard
                title="Convert Your Device"
                description="Turn your old mobile device into an AI agent hosting service and earn $HBAR tokens."
                icon={
                  <svg
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="2"
                      y="4"
                      width="20"
                      height="16"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M2 10H22"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx="12"
                      cy="16"
                      r="2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                }
                onClick={() => {
                  router.push("/deploy-device");
                }}
              />
              <OptionCard
                title="Chat with AI Agents"
                description="Access and use AI agents in the Franky Ecosystem. Pay per API call using ETH."
                icon={
                  <svg
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M20 21C20 16.5817 16.4183 13 12 13C7.58172 13 4 16.5817 4 21"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                }
                onClick={() => {
                  router.push("/agent-marketplace");
                }}
              />
              <OptionCard
                title="Create Your AI Agent"
                description="Create Your AI Agent characteristics, choose its abilities (tools) and deploy it to the blockchain."
                icon={
                  <svg
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 2L20 7V17L12 22L4 17V7L12 2Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                }
                onClick={() => router.push("/create-agent")}
              />
            </div>

            {/* Back button */}
            <div className="mt-12 flex flex-col md:flex-row justify-center gap-6">
              <motion.button
                className="py-3 px-6 text-franky-cyan hover:text-white border border-franky-cyan-30 rounded-lg transition-all duration-300 hover:bg-franky-cyan-10 font-sen"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setGetStarted(false)}
              >
                ← Go Back
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <ChatInterface
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
          />
        )}
      </div>
    </section>
  );
}
