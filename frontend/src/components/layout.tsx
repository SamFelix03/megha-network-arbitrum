"use client";

import Header from "./ui/Header";
import { useWallet } from "@/providers/WalletProvider";
import SignIn from "./sign-in";
import { useState } from "react";
import { WalletSelectionDialog } from "./wallet-selection-dialog";

const HeroAnimation = () => {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>

      {/* Animated grid pattern */}
      <div className="absolute inset-0 opacity-20 grid-cyber animate-pulse-slow"></div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-franky-cyan rounded-full opacity-60 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${4 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl bg-franky-orange animate-pulse-slow" />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl bg-franky-cyan animate-pulse-slow"
        style={{ animationDelay: "1s" }}
      />

      {/* Cyberpunk scanning lines */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-franky-orange to-transparent opacity-50 animate-glow" />
        <div
          className="absolute bottom-0 right-0 w-px h-full bg-gradient-to-t from-transparent via-franky-cyan to-transparent opacity-50 animate-glow"
          style={{ animationDelay: "1s" }}
        />
      </div>
    </div>
  );
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const { accountId } = useWallet();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col font-sen relative overflow-hidden">
      <div className="min-h-screen flex flex-col relative z-10">
        <Header />
        <HeroAnimation />
        <div className="flex-1 relative z-20">
          {accountId != null ? children : <SignIn setOpen={setOpen} />}
        </div>
        <WalletSelectionDialog
          open={open}
          setOpen={setOpen}
          onClose={() => setOpen(false)}
        />
      </div>
    </div>
  );
}
