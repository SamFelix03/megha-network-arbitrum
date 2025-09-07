'use client';

import { Device } from '@/types/contract';
import { useDevice } from '@/providers/DeviceProvider';

interface DeviceInfoProps {
  onDisconnect: () => void;
}

export const DeviceInfo = ({ onDisconnect }: DeviceInfoProps) => {
  const { selectedDevice } = useDevice();
  
  if (!selectedDevice) {
    return null;
  }
  
  const device = selectedDevice;
  const formatTimestamp = (timestamp: string) => {
    try {
      // If timestamp is a number string, convert it
      const numTimestamp = parseInt(timestamp);
      if (!isNaN(numTimestamp)) {
        return new Date(numTimestamp * 1000).toLocaleString();
      }
      // Otherwise, try to parse as date string
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp; // Return as-is if parsing fails
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 mb-4">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Connected Device</h3>
        <button
          onClick={onDisconnect}
          className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
        >
          Disconnect
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-500">Device Model</label>
            <p className="text-gray-800">{device.deviceModel}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">CPU</label>
            <p className="text-gray-800">{device.cpu}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">RAM</label>
            <p className="text-gray-800">{device.ram}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Storage</label>
            <p className="text-gray-800">{device.storageCapacity}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Operating System</label>
            <p className="text-gray-800">{device.os}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-500">Wallet Address</label>
            <p className="text-gray-800 font-mono text-sm">{formatAddress(device.walletAddress)}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Owner Address</label>
            <p className="text-gray-800 font-mono text-sm">{formatAddress(device.ownerAddress)}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Registered</label>
            <p className="text-gray-800 text-sm">{formatTimestamp(device.timestamp)}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Hosting Fee</label>
            <p className="text-gray-800">{device.hostingFee}</p>
          </div>
          
          {device.ngrokLink && (
            <div>
              <label className="text-sm font-medium text-gray-500">Ngrok Link</label>
              <a 
                href={device.ngrokLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm break-all"
              >
                {device.ngrokLink}
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Device Connected</span>
        </div>
      </div>
    </div>
  );
};
