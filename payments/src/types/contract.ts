export interface Device {
  deviceModel: string;
  ram: string;
  cpu: string;
  storageCapacity: string;
  os: string;
  walletAddress: string;
  ownerAddress: string;
  timestamp: string;
  ngrokLink: string;
  hostingFee: string;
}

export interface Agent {
  uuid: string;
  name: string;
  description: string;
  personality: string;
  scenario: string;
  messageExample: string;
  tools: string[];
  imageUrl: string;
  ownerAddress: string;
}
