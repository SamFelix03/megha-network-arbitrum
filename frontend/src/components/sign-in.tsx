"use client";

import { useState, ReactNode, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useWallet } from "@/providers/WalletProvider";
import { WavyBackground } from "@/components/ui/wavy-background";

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
    ghost: "bg-transparent border-none text-franky-blue hover:bg-black/20",
    dark: "card-cyber text-white hover:text-franky-blue",
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
        <div className="absolute inset-0 bg-gradient-to-r from-franky-blue/0 via-franky-blue/20 to-franky-blue/0 opacity-0 hover:opacity-100 transition-opacity duration-300" />
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
    <WavyBackground 
      className="max-w-4xl mx-auto"
      colors={["#8b5cf6", "#60a5fa", "#4f46e5", "#7c3aed", "#a855f7"]}
      waveWidth={50}
      backgroundFill="black"
      blur={10}
      speed="fast"
      waveOpacity={0.5}
    >
      <div className="container mx-auto text-center flex flex-col items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-6xl">
          <p className="text-xl md:text-2xl lg:text-3xl mb-4 text-gray-400 max-w-4xl mx-auto font-jetbrains">
            Introducing
          </p>
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold mb-8 text-white font-orbitron">
            MEGHA NETWORK
          </h1>
          <p className="text-2xl md:text-3xl lg:text-4xl mb-12 text-gray-300 max-w-4xl mx-auto font-space-grotesk leading-relaxed">
            Recycle your old mobile devices into{" "}
            <span className="text-franky-blue">AI agents</span> and earn{" "}
            <span className="text-franky-purple">$USDC</span>.
          </p>

          <div className="flex flex-col md:flex-row justify-center gap-6 md:gap-8 mt-8">
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
                  className="rounded-full border border-franky-blue-50"
                />
                <p className="font-sen font-medium">Connect Wallet</p>
              </div>
            </GlowButton>
          </div>
        </div>
      </div>
    </WavyBackground>
  );
}
