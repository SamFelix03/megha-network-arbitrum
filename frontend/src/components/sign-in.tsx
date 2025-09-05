"use client";

import { useState, ReactNode, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useWallet } from "@/providers/WalletProvider";

interface GlowButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "default" | "outline" | "ghost" | "dark";
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

const GlowButton = ({
  children,
  onClick,
  variant = "default",
  disabled = false,
  className = "",
  type = "button",
}: GlowButtonProps) => {
  const variantClasses = {
    default: "btn-cyber glow-cyan",
    outline: "btn-franky-outline",
    ghost: "bg-transparent border-none text-franky-cyan hover:bg-black/20",
    dark: "card-cyber text-white hover:text-franky-cyan",
  };

  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <button
      type={type}
      className={`relative overflow-hidden px-6 py-3 rounded-xl backdrop-blur-sm cursor-pointer flex items-center justify-center font-sen font-medium transition-all duration-300 hover:scale-105 ${variantClasses[variant]} ${disabledClasses} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="relative z-10">{children}</span>
      {!disabled && (
        <div className="absolute inset-0 bg-gradient-to-r from-franky-cyan/0 via-franky-cyan/20 to-franky-cyan/0 opacity-0 hover:opacity-100 transition-opacity duration-300" />
      )}
    </button>
  );
};

export default function SignIn({
  setOpen,
}: {
  setOpen: (val: boolean) => void;
}) {
  const { accountId, disconnect } = useWallet();

  const handleInitialClick = (): void => {
    if (accountId) {
      disconnect();
    } else {
      setOpen(true);
    }
  };


  return (
    <div className="flex flex-col justify-center max-w-2xl mx-auto w-full h-screen px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <p className="text-lg md:text-xl mb-3 text-gray-400 max-w-3xl mx-auto font-desc">
          Introducing
        </p>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-franky-text font-logo">
          FRANKY AGENTS
        </h1>
        <p className="text-xl md:text-2xl mb-10 text-gray-300 max-w-3xl mx-auto font-desc leading-relaxed">
          Recycle your old mobile devices into{" "}
          <span className="text-franky-cyan">AI agents</span> and earn{" "}
          <span className="text-franky-orange">crypto</span>.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mx-auto w-full max-w-md"
      >
        <GlowButton
          onClick={handleInitialClick}
          className="text-lg mx-auto w-full justify-center"
        >
          <div className="flex space-x-3 items-center">
            <Image
              src={"/metamask.png"}
              width={24}
              height={24}
              alt="MetaMask"
              className="rounded-full border border-franky-cyan-50"
            />
            <p className="font-sen font-medium">Connect Wallet</p>
          </div>
        </GlowButton>
      </motion.div>

      {/* Additional feature highlights */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex justify-center space-x-8 mt-12 text-sm text-gray-400 font-sen"
      >
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-franky-cyan rounded-full animate-glow"></div>
          <span>Secure</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-franky-orange rounded-full animate-glow"></div>
          <span>Decentralized</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-franky-yellow rounded-full animate-glow"></div>
          <span>Profitable</span>
        </div>
      </motion.div>
    </div>
  );
}
