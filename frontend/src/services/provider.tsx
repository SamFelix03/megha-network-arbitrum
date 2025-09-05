"use client";
import { ReactNode } from "react";
import { WalletProvider } from "@/providers/WalletProvider";

export const AllWalletsProvider = (props: {
  children: ReactNode | undefined;
}) => {
  return (
    <WalletProvider>
      {props.children}
    </WalletProvider>
  );
};
