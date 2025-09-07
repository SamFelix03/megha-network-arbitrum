'use client'
import { useWallet } from "@/providers/WalletProvider"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { motion } from 'framer-motion'
import { FiCheck } from "react-icons/fi"
import GlowButton from "@/components/ui/GlowButton"
import { toast } from "sonner"
import { createWalletClient, custom, parseUnits } from "viem"
import { arbitrumSepolia } from "viem/chains"
import { FRANKY_ADDRESS, FRANKY_ABI } from "@/lib/constants"

export const DeviceVerification = () => {
    const [showDeviceModal, setShowDeviceModal] = useState(false)
    const [hostingFee, setHostingFee] = useState<string>("0")
    const [isRegistering, setIsRegistering] = useState(false)
    const [deviceDetails, setDeviceDetails] = useState<{
        deviceModel: string;
        ram: string;
        storageCapacity: string;
        cpu: string;
        os: string;
        ngrokLink: string;
        walletAddress: string;
        bytes32Data?: string;
        signature?: string;
    } | null>(null)
    const [transactionHash, setTransactionHash] = useState<`0x${string}` | undefined>(undefined)
    const [transactionError, setTransactionError] = useState<string | null>(null)
    const searchParams = useSearchParams();
    const { accountId } = useWallet()

    useEffect(() => {
        if (!searchParams) return
        const deviceModel = searchParams.get('deviceModel')
        const ram = searchParams.get('ram')
        const storageCapacity = searchParams.get('storage') || searchParams.get('storageCapacity')
        const cpu = searchParams.get('cpu')
        const os = searchParams.get('os') || 'Unknown'
        const ngrokLink = searchParams.get('ngrokLink')
        const walletAddress = searchParams.get('walletAddress')
        const bytes32Data = searchParams.get('bytes32Data')
        const signature = searchParams.get('signature')
        console.log({
            deviceModel,
            ram,
            storageCapacity,
            cpu,
            os,
            ngrokLink,
            walletAddress,
            bytes32Data,
            signature: signature || undefined
        })
        // Check if all required parameters are present
        if (deviceModel && ram && storageCapacity && ngrokLink && walletAddress) {
            // Store device details for display in the modal
            setDeviceDetails({
                deviceModel: deviceModel || "Samsung Galaxy S23",
                ram: ram || "12GB",
                storageCapacity: storageCapacity || "128GB",
                cpu: cpu || "Snapdragon 8 Gen 2",
                os: os || "Android",
                ngrokLink,
                walletAddress,
            })

            // Don't automatically show modal - wait for wallet connection
            console.log('Device parameters detected in URL')
        } else {
            console.log('Some device parameters are missing from the URL')
        }
    }, [searchParams])

    // Handle hosting fee input change
    const handleHostingFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        // Allow numeric values including decimals
        if (/^\d*\.?\d*$/.test(value)) {
            setHostingFee(value)
        }
    }

    // Render the 5th step
    return (
        <section className="py-10 px-6">
            {/* Device Verification Modal */}
            {deviceDetails && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-cyber">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="card-cyber max-w-md w-full glow-cyan max-h-[90vh] overflow-y-auto"
                    >
                        {/* Close button - moved to top-right corner of the header for better usability */}
                        <button
                            onClick={() => {
                                // Close the modal
                                setShowDeviceModal(false);

                                // Remove URL parameters by replacing current URL with base URL
                                if (typeof window !== 'undefined') {
                                    const baseUrl = window.location.pathname;
                                    window.history.replaceState({}, document.title, baseUrl);

                                    // Also reset device details state
                                    setDeviceDetails(null);
                                }
                            }}
                            className="absolute top-3 right-3 text-gray-400 hover:text-white h-7 w-7 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/70 transition-colors"
                            aria-label="Close modal"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <h3 className="text-xl font-bold gradient-franky-text mb-3 pr-8 font-sen">
                            Verify Device
                        </h3>

                        {/* Connected wallet info card - Showing this first as it's most relevant for verification */}
                        <div className="p-3 rounded-lg bg-franky-cyan-10 border border-franky-cyan-30 mb-4">
                            <div className="flex items-center mb-1">
                                <div className="flex justify-center items-center h-6 w-6 rounded-full bg-franky-cyan-20 mr-2">
                                    <FiCheck className="text-franky-cyan text-sm" />
                                </div>
                                <span className="text-franky-cyan text-sm font-medium font-sen">Wallet Status</span>
                                <span className="ml-auto text-xs bg-franky-cyan-20 px-2 py-0.5 rounded-full text-franky-cyan">
                                    {accountId ? 'Connected' : 'Not Connected'}
                                </span>
                            </div>
                            <div className="text-xs text-gray-400 ml-8">
                                <p className="flex justify-between">
                                    <span className="text-gray-300 font-sen">Address:</span>
                                    <span className="text-franky-cyan font-sen">
                                        {accountId ? `${accountId.substring(0, 6)}...${accountId.substring(accountId.length - 4)}` : 'Not connected'}
                                    </span>
                                </p>

                            </div>
                        </div>

                        {/* Integrated hosting fee input section */}
                        <div className="p-4 rounded-lg bg-franky-cyan-10 border border-franky-cyan-30 mb-4">
                            <label htmlFor="hostingFee" className="block text-franky-cyan text-sm font-medium mb-2 font-sen">
                                API Fee (USDC)
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="hostingFee"
                                    value={hostingFee}
                                    onChange={handleHostingFeeChange}
                                    className="w-full p-3 text-lg font-medium rounded-lg bg-black/50 border border-franky-cyan-30 text-white focus:outline-none focus:border-franky-cyan transition-colors font-sen"
                                    placeholder="Enter amount"
                                    autoFocus
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <span className="text-franky-cyan font-sen">USDC</span>
                                </div>
                            </div>

                            <p className="mt-2 text-xs text-gray-400 font-sen">
                                Payment made to you per API Call for any Agent hosted on your device.
                            </p>
                        </div>

                        {/* Device details in a compact accordion/tabs style */}
                        <div className="space-y-2 mb-4">
                            <details className="group rounded-lg bg-black/50 border border-franky-cyan-20 overflow-hidden">
                                <summary className="flex cursor-pointer list-none items-center justify-between p-2 font-medium font-sen">
                                    <div className="flex items-center">
                                        <span className="text-franky-cyan mr-2">📱</span>
                                        <span>Device Specs</span>
                                    </div>
                                    <span className="transition group-open:rotate-180">
                                        <svg fill="none" height="16" width="16" viewBox="0 0 24 24" stroke="currentColor">
                                            <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                                        </svg>
                                    </span>
                                </summary>
                                <div className="p-2 pt-0 text-xs space-y-1">
                                    <div className="flex justify-between py-1 border-t border-franky-cyan-20">
                                        <span className="text-gray-400 font-sen">Model</span>
                                        <span className="text-franky-cyan font-sen">{deviceDetails.deviceModel}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-t border-franky-cyan-20">
                                        <span className="text-gray-400 font-sen">RAM</span>
                                        <span className="text-franky-cyan font-sen">{deviceDetails.ram}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-t border-franky-cyan-20">
                                        <span className="text-gray-400 font-sen">Storage</span>
                                        <span className="text-franky-cyan font-sen">{deviceDetails.storageCapacity}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-t border-franky-cyan-20">
                                        <span className="text-gray-400 font-sen">CPU</span>
                                        <span className="text-franky-cyan font-sen">{deviceDetails.cpu}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-t border-franky-cyan-20">
                                        <span className="text-gray-400 font-sen">OS</span>
                                        <span className="text-franky-cyan font-sen">{deviceDetails.os}</span>
                                    </div>
                                </div>
                            </details>

                            <details className="group rounded-lg bg-black/50 border border-franky-cyan-20 overflow-hidden">
                                <summary className="flex cursor-pointer list-none items-center justify-between p-2 font-medium font-sen">
                                    <div className="flex items-center">
                                        <span className="text-franky-cyan mr-2">🔗</span>
                                        <span>Connection Details</span>
                                    </div>
                                    <span className="transition group-open:rotate-180">
                                        <svg fill="none" height="16" width="16" viewBox="0 0 24 24" stroke="currentColor">
                                            <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                                        </svg>
                                    </span>
                                </summary>
                                <div className="p-2 pt-0 text-xs space-y-1">
                                    <div className="flex justify-between py-1 border-t border-franky-cyan-20">
                                        <span className="text-gray-400 font-sen">Device Address</span>
                                        <span className="text-franky-cyan text-xs break-all font-sen">{deviceDetails.walletAddress.toLowerCase().substring(0, 8)}...{deviceDetails.walletAddress.toLowerCase().substring(deviceDetails.walletAddress.toLowerCase().length - 8)}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-t border-franky-cyan-20">
                                        <span className="text-gray-400 font-sen">Link</span>
                                        <a href={deviceDetails.ngrokLink} target="_blank" rel="noopener noreferrer"
                                            className="text-franky-cyan text-xs underline hover:text-white transition-colors break-all max-w-[200px] truncate font-sen">
                                            {deviceDetails.ngrokLink}
                                        </a>
                                    </div>
                                </div>
                            </details>
                        </div>

                        {transactionHash && transactionHash.length > 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-3 rounded-lg bg-franky-cyan-10 border border-franky-cyan-30 text-center"
                            >
                                <FiCheck className="text-franky-cyan mx-auto text-xl mb-1" />
                                <p className="text-franky-cyan font-medium text-sm font-sen">Device verification successful!</p>

                                {deviceDetails && (
                                    <div className="mt-2 text-sm text-franky-cyan">
                                        <p className="font-bold font-sen">Device Address: <span className="text-white text-xs break-all">{deviceDetails.walletAddress.toLowerCase()}</span></p>
                                        <p className="text-xs mt-1 text-yellow-300 font-medium font-sen">Your device is now registered and ready to host agents</p>
                                    </div>
                                )}

                                <div className="mt-2 text-xs text-franky-cyan">
                                    <p className="font-sen">Transaction confirmed on-chain</p>
                                    <a
                                        href={`https://sepolia.arbiscan.io/tx/${transactionHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-franky-cyan underline hover:text-white text-xs mt-1 inline-block font-sen"
                                    >
                                        View
                                    </a>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="flex flex-col">
                                {transactionError ? (
                                    <div className="p-3 mb-3 rounded-lg bg-red-900/30 border border-red-400/30 text-center text-red-300 text-xs">
                                        <p className="font-sen">{transactionError}</p>
                                    </div>
                                ) : (
                                    <div className="pt-4 border-t border-franky-cyan-20">
                                        <button
                                            onClick={async () => {
                                                if (isRegistering) return
                                                setIsRegistering(true)
                                                try {
                                                    if (accountId) {
                                                        console.log("User wallet detected:", accountId);

                                                        toast.info("Registering device on-chain", {
                                                            description: "Confirm the transaction...",
                                                        });

                                                        console.log("Sending transaction...");
                                                        
                                                        // Create wallet client
                                                        const walletClient = createWalletClient({
                                                            chain: arbitrumSepolia,
                                                            transport: custom(window.ethereum!)
                                                        });
                                                        
                                                        // Call registerDevice function with Registry contract parameters
                                                        const txHash = await walletClient.writeContract({
                                                            address: FRANKY_ADDRESS as `0x${string}`,
                                                            abi: FRANKY_ABI,
                                                            functionName: 'registerDevice',
                                                            args: [
                                                                deviceDetails.deviceModel, // _deviceModel
                                                                deviceDetails.ram, // _ram
                                                                deviceDetails.cpu, // _cpu
                                                                deviceDetails.storageCapacity, // _storageCapacity
                                                                deviceDetails.os, // _os
                                                                deviceDetails.walletAddress.toLowerCase() as `0x${string}`, // _walletAddress
                                                                accountId as `0x${string}`, // _ownerAddress
                                                                Date.now().toString(), // _timestamp
                                                                deviceDetails.ngrokLink, // _ngrokLink
                                                                hostingFee || "0" // _hostingFee (as string)
                                                            ],
                                                            account: accountId as `0x${string}`
                                                        });
                                                        
                                                        console.log("Transaction sent:", txHash);
                                                        
                                                        toast.success("Device registered successfully!", {
                                                            description: "Your device is now available for hosting agents",
                                                            action: {
                                                                label: "View Tx",
                                                                onClick: () => {
                                                                    window.open(`https://sepolia.arbiscan.io/tx/${txHash}`, "_blank");
                                                                }
                                                            }
                                                        });

                                                        setTransactionHash(txHash as `0x${string}`);
                                                    } else {
                                                        console.log("User wallet not detected.");
                                                    }
                                                } catch (e) {
                                                    setTransactionError(JSON.stringify(e))
                                                } finally {
                                                    setIsRegistering(false)
                                                }
                                            }}
                                            disabled={isRegistering}
                                            className="w-full py-3 rounded-lg bg-franky-cyan text-black font-medium hover:bg-franky-cyan/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-sen"
                                        >
                                            {isRegistering ? (
                                                <span className="flex items-center justify-center">
                                                    <span className="mr-2">Registering...</span>
                                                    <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full"></div>
                                                </span>
                                            ) : (
                                                "Register Device"
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </section>
    )
}