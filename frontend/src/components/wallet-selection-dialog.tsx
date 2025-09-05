import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@/providers/WalletProvider";

interface WalletSelectionDialogProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  onClose: (value: string) => void;
}

export const WalletSelectionDialog = (props: WalletSelectionDialogProps) => {
  const { onClose, open, setOpen } = props;
  const [hoveredWallet, setHoveredWallet] = useState<string | null>(null);
  const { connect } = useWallet();

  const handleClose = () => {
    setOpen(false);
    onClose("");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-cyber"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-md w-full rounded-xl card-cyber p-6 glow-cyan"
            >
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-franky-orange h-8 w-8 flex items-center justify-center rounded-full bg-black/40 hover:bg-franky-orange/20 transition-all duration-300"
                aria-label="Close modal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <h3 className="text-xl font-bold gradient-franky-text mb-6 pr-8 font-logo">
                Connect Wallet
              </h3>

              <div className="space-y-3">
                <motion.button
                  onClick={async () => {
                    await connect();
                    setOpen(false);
                  }}
                  onMouseEnter={() => setHoveredWallet("metamask")}
                  onMouseLeave={() => setHoveredWallet(null)}
                  className={`w-full flex items-center justify-start p-4 rounded-lg border transition-all duration-300 font-sen ${
                    hoveredWallet === "metamask"
                      ? "border-franky-orange bg-franky-orange-10 glow-franky"
                      : "border-franky-orange-30 bg-black/50"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center">
                      <img
                        src="/metamask.png"
                        alt="MetaMask logo"
                        className="w-8 h-8 object-contain rounded-full"
                      />
                    </div>
                    <div className="flex flex-col items-start">
                      <span
                        className={`text-lg font-medium transition-colors ${
                          hoveredWallet === "metamask"
                            ? "text-franky-orange"
                            : "text-white"
                        }`}
                      >
                        Connect MetaMask
                      </span>
                      <span className="text-xs text-gray-400">
                        Connect using MetaMask wallet
                      </span>
                    </div>
                  </div>
                </motion.button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-400 font-sen mb-3">
                  Choose a wallet to connect to Franky Agents
                </p>
                <div className="flex justify-center space-x-4 text-xs">
                  <span className="text-franky-cyan">Secure</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-franky-orange">Fast</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-franky-yellow">Reliable</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
