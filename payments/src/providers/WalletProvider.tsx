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
    chainId: string | null;
    networkName: string | null;
    switchToArbitrumSepolia: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType>({} as WalletContextType);

// Arbitrum Sepolia network configuration
const ARBITRUM_SEPOLIA_CHAIN_ID = '0x66eee'; // 421614 in hex
const ARBITRUM_SEPOLIA_RPC_URL = 'https://sepolia-rollup.arbitrum.io/rpc';
const ARBITRUM_SEPOLIA_BLOCK_EXPLORER = 'https://sepolia.arbiscan.io';

export function WalletProvider({ children }: { children: ReactNode }) {
    const [accountId, setAccountId] = useState<string | null>(null);
    const [balance, setBalance] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [chainId, setChainId] = useState<string | null>(null);
    const [networkName, setNetworkName] = useState<string | null>(null);

    useEffect(() => {
        checkConnection();
        setupEventListeners();
    }, []);

    const checkConnection = async () => {
        if (typeof window !== 'undefined' && window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
                
                setChainId(currentChainId);
                setNetworkName(getNetworkName(currentChainId));
                
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

    const getNetworkName = (chainId: string): string => {
        switch (chainId) {
            case '0x1': return 'Ethereum Mainnet';
            case '0xaa36a7': return 'Ethereum Sepolia';
            case '0x66eee': return 'Arbitrum Sepolia';
            case '0xa4b1': return 'Arbitrum One';
            case '0x89': return 'Polygon Mainnet';
            case '0x13881': return 'Polygon Mumbai';
            default: return `Unknown Network (${chainId})`;
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

            window.ethereum.on('chainChanged', async (newChainId: string) => {
                console.log('Chain changed to:', newChainId);
                setChainId(newChainId);
                setNetworkName(getNetworkName(newChainId));
                // Don't reload the page, just update the state
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

    const switchToArbitrumSepolia = async () => {
        if (typeof window === 'undefined' || !window.ethereum) {
            throw new Error('MetaMask is not installed');
        }

        try {
            console.log('Switching to Arbitrum Sepolia...');
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: ARBITRUM_SEPOLIA_CHAIN_ID }],
            });
        } catch (switchError: any) {
            // This error code indicates that the chain has not been added to MetaMask
            if (switchError.code === 4902) {
                try {
                    console.log('Adding Arbitrum Sepolia to MetaMask...');
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [
                            {
                                chainId: ARBITRUM_SEPOLIA_CHAIN_ID,
                                chainName: 'Arbitrum Sepolia',
                                nativeCurrency: {
                                    name: 'Ethereum',
                                    symbol: 'ETH',
                                    decimals: 18,
                                },
                                rpcUrls: [ARBITRUM_SEPOLIA_RPC_URL],
                                blockExplorerUrls: [ARBITRUM_SEPOLIA_BLOCK_EXPLORER],
                            },
                        ],
                    });
                } catch (addError) {
                    console.error('Failed to add Arbitrum Sepolia:', addError);
                    throw new Error('Failed to add Arbitrum Sepolia network');
                }
            } else {
                console.error('Failed to switch to Arbitrum Sepolia:', switchError);
                throw new Error('Failed to switch to Arbitrum Sepolia network');
            }
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
                chainId,
                networkName,
                switchToArbitrumSepolia,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
}

export const useWallet = () => useContext(WalletContext);
