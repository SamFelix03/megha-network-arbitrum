'use client';

import { useState, useEffect } from 'react';
import { contractService } from '@/services/contractService';
import { Device } from '@/types/contract';
import { useDevice } from '@/providers/DeviceProvider';

interface DeviceSelectionPopupProps {
  onDeviceSelected: (device: Device) => void;
  onClose: () => void;
}

export const DeviceSelectionPopup = ({ onDeviceSelected, onClose }: DeviceSelectionPopupProps) => {
  const { setSelectedDevice } = useDevice();
  const [deviceIndex, setDeviceIndex] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [deviceCount, setDeviceCount] = useState<number>(0);

  // Fetch device count on component mount
  useEffect(() => {
    const fetchDeviceCount = async () => {
      try {
        const count = await contractService.getDeviceCount();
        setDeviceCount(count);
      } catch (error) {
        console.error('Failed to fetch device count:', error);
      }
    };
    fetchDeviceCount();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!deviceIndex.trim()) {
      setError('Please enter a device index');
      return;
    }

    const index = parseInt(deviceIndex);
    if (isNaN(index) || index < 0) {
      setError('Please enter a valid device index (0 or greater)');
      return;
    }

    if (deviceCount > 0 && index >= deviceCount) {
      setError(`Device index must be less than ${deviceCount}`);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const device = await contractService.getDevice(index);
      setSelectedDevice(device);
      onDeviceSelected(device);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch device');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Select Device
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Available Devices:</strong> {deviceCount > 0 ? `${deviceCount} devices` : 'Loading...'}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Enter a device index (0 to {deviceCount > 0 ? deviceCount - 1 : '?'})
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="deviceIndex" className="block text-sm font-medium text-gray-700 mb-2">
              Device Index
            </label>
            <input
              type="number"
              id="deviceIndex"
              value={deviceIndex}
              onChange={(e) => setDeviceIndex(e.target.value)}
              placeholder="Enter device index (e.g., 2)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !deviceIndex.trim()}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Loading...
                </div>
              ) : (
                'Connect Device'
              )}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            This will connect you to the selected device for AI chat
          </p>
        </div>
      </div>
    </div>
  );
};
