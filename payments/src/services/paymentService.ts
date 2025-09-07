import { ethers } from 'ethers';

// USDC contract configuration for Arbitrum Sepolia
// Note: USDC might not be available on Arbitrum Sepolia testnet
// Using a mock USDC contract address for testing
const USDC_CONTRACT_ADDRESS = "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d"; // Mock USDC for testing
const USDC_DECIMALS = 6; // USDC has 6 decimals
const MAX_APPROVAL_AMOUNT = ethers.utils.parseUnits("10", USDC_DECIMALS); // 10 USDC

// ERC20 ABI for USDC token
const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_spender", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {"name": "_owner", "type": "address"},
      {"name": "_spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_to", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [{"name": "", "type": "string"}],
    "type": "function"
  }
];

export class PaymentService {
  private provider: ethers.providers.Web3Provider;
  private signer: ethers.Signer;
  private usdcContract: ethers.Contract;

  constructor(provider: ethers.providers.Web3Provider) {
    this.provider = provider;
    this.signer = provider.getSigner();
    this.usdcContract = new ethers.Contract(USDC_CONTRACT_ADDRESS, ERC20_ABI, this.signer);
  }

  // Get USDC balance for the connected wallet
  async getUSDCBalance(): Promise<string> {
    try {
      const address = await this.signer.getAddress();
      console.log('Getting USDC balance for address:', address);
      console.log('USDC contract address:', USDC_CONTRACT_ADDRESS);
      
      const balance = await this.usdcContract.balanceOf(address);
      console.log('Raw balance:', balance.toString());
      
      const formattedBalance = ethers.utils.formatUnits(balance, USDC_DECIMALS);
      console.log('Formatted balance:', formattedBalance);
      
      return formattedBalance;
    } catch (error) {
      console.error('Error getting USDC balance:', error);
      throw new Error(`Failed to get USDC balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Check current allowance for the device wallet
  async getAllowance(deviceWalletAddress: string): Promise<string> {
    try {
      const userAddress = await this.signer.getAddress();
      const allowance = await this.usdcContract.allowance(userAddress, deviceWalletAddress);
      return ethers.utils.formatUnits(allowance, USDC_DECIMALS);
    } catch (error) {
      console.error('Error getting allowance:', error);
      throw new Error('Failed to get allowance');
    }
  }

  // Approve USDC spending for the device wallet
  async approveUSDC(deviceWalletAddress: string): Promise<ethers.providers.TransactionResponse> {
    try {
      console.log('=== USDC Approval Debug Info ===');
      console.log('Device wallet address:', deviceWalletAddress);
      console.log('USDC contract address:', USDC_CONTRACT_ADDRESS);
      console.log('Max approval amount:', MAX_APPROVAL_AMOUNT.toString());
      console.log('Max approval amount (formatted):', ethers.utils.formatUnits(MAX_APPROVAL_AMOUNT, USDC_DECIMALS), 'USDC');
      
      // Check if contract exists
      const code = await this.provider.getCode(USDC_CONTRACT_ADDRESS);
      console.log('Contract code exists:', code !== '0x');
      
      if (code === '0x') {
        throw new Error('USDC contract does not exist at this address on Arbitrum Sepolia');
      }
      
      // Check current balance
      const userAddress = await this.signer.getAddress();
      const balance = await this.getUSDCBalance();
      console.log('User USDC balance:', balance);
      
      if (parseFloat(balance) === 0) {
        throw new Error('You have 0 USDC balance. Please get some USDC tokens first.');
      }
      
      // Check current allowance
      const currentAllowance = await this.getAllowance(deviceWalletAddress);
      console.log('Current allowance:', currentAllowance, 'USDC');
      
      console.log('Sending approval transaction...');
      const tx = await this.usdcContract.approve(deviceWalletAddress, MAX_APPROVAL_AMOUNT);
      
      if (!tx) {
        throw new Error('Transaction failed - no transaction object returned');
      }
      
      console.log('Transaction hash:', tx.hash);
      console.log('Transaction object:', tx);
      
      return tx;
    } catch (error: any) {
      console.error('=== USDC Approval Error ===');
      console.error('Error details:', error);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Error data:', error.data);
      
      // Provide more specific error messages
      if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        throw new Error('Transaction would fail. Check if you have sufficient USDC balance and gas.');
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        throw new Error('Insufficient ETH for gas fees.');
      } else if (error.message.includes('contract does not exist')) {
        throw new Error('USDC contract not found on Arbitrum Sepolia. Please check the contract address.');
      } else if (error.message.includes('0 USDC balance')) {
        throw new Error('You need USDC tokens to approve spending. Please get some USDC first.');
      } else {
        throw new Error(`Failed to approve USDC: ${error.message}`);
      }
    }
  }

  // Transfer USDC to device wallet (automatic payment)
  // This should NOT be called directly - the device should call transferFrom using the approved allowance
  async payHostingFee(deviceWalletAddress: string, feeAmount: string): Promise<ethers.providers.TransactionResponse> {
    try {
      const feeInWei = ethers.utils.parseUnits(feeAmount, USDC_DECIMALS);
      console.log(`Paying hosting fee: ${feeAmount} USDC to ${deviceWalletAddress}`);
      
      // Check if we have sufficient allowance first
      const hasAllowance = await this.hasSufficientAllowance(deviceWalletAddress, feeAmount);
      if (!hasAllowance) {
        throw new Error('Insufficient allowance. Please approve USDC spending first.');
      }
      
      // Use transferFrom instead of transfer - this allows the device to automatically deduct from allowance
      const userAddress = await this.signer.getAddress();
      const tx = await this.usdcContract.transferFrom(userAddress, deviceWalletAddress, feeInWei);
      return tx;
    } catch (error) {
      console.error('Error paying hosting fee:', error);
      throw new Error('Failed to pay hosting fee');
    }
  }

  // Check if user has sufficient allowance for the fee
  async hasSufficientAllowance(deviceWalletAddress: string, feeAmount: string): Promise<boolean> {
    try {
      const allowance = await this.getAllowance(deviceWalletAddress);
      const allowanceInWei = ethers.utils.parseUnits(allowance, USDC_DECIMALS);
      const feeInWei = ethers.utils.parseUnits(feeAmount, USDC_DECIMALS);
      
      return allowanceInWei.gte(feeInWei);
    } catch (error) {
      console.error('Error checking allowance:', error);
      return false;
    }
  }

  // Check if user has sufficient USDC balance
  async hasSufficientBalance(feeAmount: string): Promise<boolean> {
    try {
      const balance = await this.getUSDCBalance();
      const balanceInWei = ethers.utils.parseUnits(balance, USDC_DECIMALS);
      const feeInWei = ethers.utils.parseUnits(feeAmount, USDC_DECIMALS);
      
      return balanceInWei.gte(feeInWei);
    } catch (error) {
      console.error('Error checking balance:', error);
      return false;
    }
  }

  // Format USDC amount for display
  formatUSDC(amount: string): string {
    return parseFloat(amount).toFixed(6);
  }

  // Get contract info for debugging
  async getContractInfo(): Promise<{
    address: string;
    exists: boolean;
    symbol: string | null;
    decimals: number | null;
  }> {
    try {
      const code = await this.provider.getCode(USDC_CONTRACT_ADDRESS);
      const exists = code !== '0x';
      
      let symbol: string | null = null;
      let decimals: number | null = null;
      
      if (exists) {
        try {
          symbol = await this.usdcContract.symbol();
          decimals = await this.usdcContract.decimals();
        } catch (error) {
          console.error('Error getting contract symbol/decimals:', error);
        }
      }
      
      return {
        address: USDC_CONTRACT_ADDRESS,
        exists,
        symbol,
        decimals,
      };
    } catch (error) {
      console.error('Error getting contract info:', error);
      return {
        address: USDC_CONTRACT_ADDRESS,
        exists: false,
        symbol: null,
        decimals: null,
      };
    }
  }
}
