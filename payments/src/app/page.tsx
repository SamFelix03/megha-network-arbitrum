'use client';

import { useState } from 'react';
import ChatInterface from '@/components/ChatInterface';
import { WalletConnectionPage } from '@/components/WalletConnectionPage';
import { WalletButton } from '@/components/WalletButton';
import { DeviceSelectionPopup } from '@/components/DeviceSelectionPopup';
import { DeviceInfo } from '@/components/DeviceInfo';
import { TokenBalances } from '@/components/TokenBalances';
import { NetworkStatus } from '@/components/NetworkStatus';
import { USDCHelper } from '@/components/USDCHelper';
import { PaymentInfo } from '@/components/PaymentInfo';
import { TransactionHistory } from '@/components/TransactionHistory';
import { LivePaymentTracker } from '@/components/LivePaymentTracker';
import { ApprovalTestButton } from '@/components/ApprovalTestButton';
import { AutoApprovalModal } from '@/components/AutoApprovalModal';
import { useWallet } from '@/providers/WalletProvider';
import { useDevice } from '@/providers/DeviceProvider';
import { Device } from '@/types/contract';

export default function Home() {
  const { isConnected } = useWallet();
  const { selectedDevice, setSelectedDevice } = useDevice();
  const [showChat, setShowChat] = useState(false);
  const [showDeviceSelection, setShowDeviceSelection] = useState(false);

  const handleWalletConnected = () => {
    setShowChat(true);
    setShowDeviceSelection(true);
  };

  const handleDeviceSelected = (device: Device) => {
    setSelectedDevice(device);
    setShowDeviceSelection(false);
  };

  const handleDeviceDisconnect = () => {
    setSelectedDevice(null);
    setShowDeviceSelection(true);
  };

  const handleCloseDeviceSelection = () => {
    setShowDeviceSelection(false);
  };

  if (!isConnected || !showChat) {
    return <WalletConnectionPage onConnected={handleWalletConnected} />;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Simple Chat UI
            </h1>
            <div className="flex items-center space-x-4">
              <NetworkStatus />
              <TokenBalances />
              <WalletButton />
            </div>
          </div>

          {selectedDevice && (
            <>
              <USDCHelper />
              <ApprovalTestButton />
              <PaymentInfo />
              <LivePaymentTracker />
              <TransactionHistory />
              <DeviceInfo 
                onDisconnect={handleDeviceDisconnect} 
              />
            </>
          )}

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <ChatInterface />
          </div>
        </div>
      </div>

      {showDeviceSelection && (
        <DeviceSelectionPopup
          onDeviceSelected={handleDeviceSelected}
          onClose={handleCloseDeviceSelection}
        />
      )}

      {/* Auto-approval modal */}
      <AutoApprovalModal />
    </main>
  );
}
