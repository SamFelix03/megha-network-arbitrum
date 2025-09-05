"use client";

import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import { FiCopy, FiCheck, FiSmartphone } from "react-icons/fi";
import { Zap } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamic import for DeviceVerification to avoid SSR issues
const DeviceVerification = dynamic(
  () => import("./verification").then((mod) => mod.DeviceVerification),
  { ssr: false }
);

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
    <div className="relative mt-3 mb-6 !rounded-none overflow-hidden w-full">
      <div className="card-cyber p-5 font-mono text-sm md:text-base overflow-x-auto rounded-none">
        <code className="text-franky-cyan font-sen">{code}</code>
      </div>
      <button
        onClick={copyToClipboard}
        className="absolute top-3 right-3 p-2 rounded-md bg-black/50 hover:bg-black/80 text-franky-cyan transition-colors glow-cyan"
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
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: number * 0.1 }}
      className="mb-12 card-cyber rounded-none"
    >
      <div className="flex items-center mb-5">
        <div className="flex justify-center items-center h-12 w-12 rounded-full bg-franky-cyan-20 text-franky-cyan mr-4 animate-glow">
          {icon}
        </div>
        <h3 className="text-2xl font-bold gradient-franky-text font-sen">
          Step {number}: {title}
        </h3>
      </div>
      <div className="text-gray-300 ml-16 font-sen">{children}</div>
    </motion.div>
  );
};

// Background component to ensure full-page coverage
const Background = () => {
  return (
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
};

export default function DeployDevice() {
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
              Deploy Your Device
            </h1>
            <p className="text-xl mb-12 text-gray-400 max-w-4xl mx-auto font-desc">
              Transform your old mobile device into an{" "}
              <span className="text-franky-cyan">AI agent</span> in ten minutes.
              Follow the instructions below to get started.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Instructions Section */}
      <section className="py-10 px-6">
        <div className="container mx-auto max-w-5xl">
          <InstructionStep
            number={1}
            title="Setup your Phone"
            icon={<FiSmartphone />}
          >
            <p className="mb-6">
              Watch this video tutorial to set up your phone with Termux, an
              Android terminal emulator that allows you to run Linux commands:
            </p>

            <div className="relative pb-[56.25%] h-0 rounded-lg overflow-hidden mb-4 border border-franky-cyan-30">
              <iframe
                className="absolute top-0 left-0 w-full h-full border-0"
                src="https://www.youtube.com/embed/s3TXc-jiQ40"
                title="Franky AI: Setting up your device"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="mt-4 p-4 bg-franky-yellow-20 border border-stone-800 rounded-lg">
              <p className="text-franky-yellow font-sen">
                <strong>Important:</strong> Make sure the qwen2.5:3b model is
                installed on your device before proceeding. This is required for
                Franky to function properly.
              </p>
            </div>
          </InstructionStep>

          <InstructionStep number={2} title="Run Franky" icon={<Zap />}>
            <p className="mb-4">
              Use the following curl command to download, install and run
              Franky:
            </p>
            <CodeBlock code="pkg update && pkg install nodejs libqrencode termux-api jq curl && git clone https://github.com/gabrielantonyxaviour/franky-agent-framework.git && cd franky-agent-framework && chmod +x franky && ./franky start" />
            <p className="mt-4">
              This script will download all necessary files to run Franky on
              your device.
            </p>
          </InstructionStep>
        </div>
      </section>

      <Suspense
        fallback={
          <div className="p-6 text-center text-franky-cyan font-sen">
            Loading device verification...
          </div>
        }
      >
        <DeviceVerification />
      </Suspense>
    </>
  );
}
