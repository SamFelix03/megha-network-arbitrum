import { ethers } from 'ethers';
import { Device, Agent } from '@/types/contract';

// Registry contract configuration
const REGISTRY_CONTRACT_ADDRESS = "0xE25e41F820d4AA90Ad0C49001ecb143DD5B46Ea7";
const RPC_URL = "https://sepolia-rollup.arbitrum.io/rpc";

// Contract ABI - only the functions we need
const REGISTRY_ABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "_id", "type": "uint256"}],
    "name": "getDevice",
    "outputs": [{
      "components": [
        {"internalType": "string", "name": "deviceModel", "type": "string"},
        {"internalType": "string", "name": "ram", "type": "string"},
        {"internalType": "string", "name": "cpu", "type": "string"},
        {"internalType": "string", "name": "storageCapacity", "type": "string"},
        {"internalType": "string", "name": "os", "type": "string"},
        {"internalType": "address", "name": "walletAddress", "type": "address"},
        {"internalType": "address", "name": "ownerAddress", "type": "address"},
        {"internalType": "string", "name": "timestamp", "type": "string"},
        {"internalType": "string", "name": "ngrokLink", "type": "string"},
        {"internalType": "string", "name": "hostingFee", "type": "string"}
      ],
      "internalType": "struct Registry.Device",
      "name": "",
      "type": "tuple"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getDeviceCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "_uuid", "type": "string"}],
    "name": "getAgentByUUID",
    "outputs": [{
      "components": [
        {"internalType": "string", "name": "uuid", "type": "string"},
        {"internalType": "string", "name": "name", "type": "string"},
        {"internalType": "string", "name": "description", "type": "string"},
        {"internalType": "string", "name": "personality", "type": "string"},
        {"internalType": "string", "name": "scenario", "type": "string"},
        {"internalType": "string", "name": "messageExample", "type": "string"},
        {"internalType": "string[]", "name": "tools", "type": "string[]"},
        {"internalType": "string", "name": "imageUrl", "type": "string"},
        {"internalType": "address", "name": "ownerAddress", "type": "address"}
      ],
      "internalType": "struct Registry.Agent",
      "name": "",
      "type": "tuple"
    }],
    "stateMutability": "view",
    "type": "function"
  }
];

export class ContractService {
  private provider: ethers.providers.JsonRpcProvider;
  private contract: ethers.Contract;

  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    this.contract = new ethers.Contract(REGISTRY_CONTRACT_ADDRESS, REGISTRY_ABI, this.provider);
  }

  async getDevice(deviceId: number): Promise<Device> {
    try {
      const deviceData = await this.contract.getDevice(deviceId);
      
      return {
        deviceModel: deviceData.deviceModel,
        ram: deviceData.ram,
        cpu: deviceData.cpu,
        storageCapacity: deviceData.storageCapacity,
        os: deviceData.os,
        walletAddress: deviceData.walletAddress,
        ownerAddress: deviceData.ownerAddress,
        timestamp: deviceData.timestamp,
        ngrokLink: deviceData.ngrokLink,
        hostingFee: deviceData.hostingFee
      };
    } catch (error) {
      console.error('Error fetching device:', error);
      throw new Error(`Failed to fetch device with ID ${deviceId}`);
    }
  }

  async getDeviceCount(): Promise<number> {
    try {
      const count = await this.contract.getDeviceCount();
      return count.toNumber();
    } catch (error) {
      console.error('Error fetching device count:', error);
      throw new Error('Failed to fetch device count');
    }
  }

  async getAgentByUUID(uuid: string): Promise<Agent> {
    try {
      const agentData = await this.contract.getAgentByUUID(uuid);
      
      return {
        uuid: agentData.uuid,
        name: agentData.name,
        description: agentData.description,
        personality: agentData.personality,
        scenario: agentData.scenario,
        messageExample: agentData.messageExample,
        tools: agentData.tools,
        imageUrl: agentData.imageUrl,
        ownerAddress: agentData.ownerAddress
      };
    } catch (error) {
      console.error('Error fetching agent:', error);
      throw new Error(`Failed to fetch agent with UUID ${uuid}`);
    }
  }
}

// Singleton instance
export const contractService = new ContractService();
