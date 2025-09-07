'use client';

import { createContext, useContext, ReactNode, useState } from 'react';
import { Device } from '@/types/contract';

interface DeviceContextType {
  selectedDevice: Device | null;
  setSelectedDevice: (device: Device | null) => void;
  uuid: string; // Fixed UUID for the agent
}

const DeviceContext = createContext<DeviceContextType>({} as DeviceContextType);

export function DeviceProvider({ children }: { children: ReactNode }) {
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  
  // Fixed UUID for the agent - you can change this as needed
  const uuid = "uuid-furrychan";

  return (
    <DeviceContext.Provider
      value={{
        selectedDevice,
        setSelectedDevice,
        uuid,
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
}

export const useDevice = () => useContext(DeviceContext);
