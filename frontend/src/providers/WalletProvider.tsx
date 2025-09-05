'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface WalletContextType {
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    accountId: string | null;
    balance: string | null;
    isConnecting: boolean;
    isConnected: boolean;
    fetchBalance: () => Promise<void>;
    signMessage: (input: { message: string }) => Promise<{ signature: string }>;
}

const WalletContext = createContext<WalletContextType>({} as WalletContextType);

export function WalletProvider({ children }: { children: ReactNode }) {
    const [accountId, setAccountId] = useState<string | null>(null);
    const [balance, setBalance] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        checkConnection();
        setupEventListeners();
    }, []);

    const checkConnection = async () => {
        if (typeof window !== 'undefined' && window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    setAccountId(accounts[0]);
                    setIsConnected(true);
                    await fetchBalanceInternal(accounts[0]);
                }
            } catch (error) {
                console.error('Error checking connection:', error);
            }
        }
    };

    const setupEventListeners = () => {
        if (typeof window !== 'undefined' && window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts: string[]) => {
                if (accounts.length > 0) {
                    setAccountId(accounts[0]);
                    setIsConnected(true);
                    fetchBalanceInternal(accounts[0]);
                } else {
                    setAccountId(null);
                    setIsConnected(false);
                    setBalance(null);
                }
            });

            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });
        }
    };

    const connect = async () => {
        if (typeof window === 'undefined' || !window.ethereum) {
            throw new Error('MetaMask is not installed');
        }

        setIsConnecting(true);
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if (accounts.length > 0) {
                setAccountId(accounts[0]);
                setIsConnected(true);
                await fetchBalanceInternal(accounts[0]);
            }
        } catch (error) {
            console.error('Failed to connect wallet:', error);
            throw error;
        } finally {
            setIsConnecting(false);
        }
    };

    const disconnect = async () => {
        setAccountId(null);
        setIsConnected(false);
        setBalance(null);
    };

    const fetchBalanceInternal = async (address: string) => {
        if (typeof window === 'undefined' || !window.ethereum) return;
        
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const balance = await provider.getBalance(address);
            setBalance(ethers.utils.formatEther(balance));
        } catch (error) {
            console.error('Failed to fetch balance:', error);
        }
    };

    const fetchBalance = async () => {
        if (accountId) {
            await fetchBalanceInternal(accountId);
        }
    };

    const signMessage = async (input: { message: string }): Promise<{ signature: string }> => {
        if (!accountId) throw new Error('Wallet not connected');
        if (typeof window === 'undefined' || !window.ethereum) {
            throw new Error('MetaMask is not installed');
        }
        
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const signature = await signer.signMessage(input.message);
            return { signature };
        } catch (error) {
            console.error('Failed to sign message:', error);
            throw error;
        }
    };

    return (
        <WalletContext.Provider
            value={{
                connect,
                disconnect,
                accountId,
                balance,
                isConnecting,
                isConnected,
                fetchBalance,
                signMessage,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
}

export const useWallet = () => useContext(WalletContext);