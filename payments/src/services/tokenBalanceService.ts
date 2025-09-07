import { ethers } from 'ethers';

// Common token addresses on Arbitrum Sepolia
const TOKEN_ADDRESSES = {
  // Native ETH
  ETH: '0x0000000000000000000000000000000000000000',
  
  // Test tokens on Arbitrum Sepolia
  USDC: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
  USDT: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
  DAI: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
  WETH: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
  ARB: '0x912ce59144191c1204e64559fe8253a0e49e6548',
  
  // Add more tokens as needed
  LINK: '0xf97f4df75117a78c1a5a0dbb814af92458539fb4',
  UNI: '0xfa7f8980b0f1e64a2062791cc3b0871572f1f7f0',
  AAVE: '0xe50fa9b3c56ffb159cb0fca61f5c9d750e8128c8',
};

// ERC20 ABI for token interactions
const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
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
  },
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [{"name": "", "type": "string"}],
    "type": "function"
  }
];

export interface TokenBalance {
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  address: string;
  formattedBalance: string;
}

export class TokenBalanceService {
  private provider: ethers.providers.Web3Provider;
  private signer: ethers.Signer;

  constructor(provider: ethers.providers.Web3Provider) {
    this.provider = provider;
    this.signer = provider.getSigner();
  }

  // Get ETH balance
  async getETHBalance(): Promise<TokenBalance> {
    try {
      const address = await this.signer.getAddress();
      const balance = await this.provider.getBalance(address);
      const formattedBalance = ethers.utils.formatEther(balance);
      
      return {
        symbol: 'ETH',
        name: 'Ethereum',
        balance: balance.toString(),
        decimals: 18,
        address: TOKEN_ADDRESSES.ETH,
        formattedBalance: parseFloat(formattedBalance).toFixed(6)
      };
    } catch (error) {
      console.error('Error getting ETH balance:', error);
      throw new Error('Failed to get ETH balance');
    }
  }

  // Get ERC20 token balance
  async getTokenBalance(tokenAddress: string, symbol: string, name: string): Promise<TokenBalance | null> {
    try {
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
      const address = await this.signer.getAddress();
      
      const [balance, decimals] = await Promise.all([
        contract.balanceOf(address),
        contract.decimals()
      ]);
      
      const formattedBalance = ethers.utils.formatUnits(balance, decimals);
      
      // Only return tokens with non-zero balance
      if (balance.gt(0)) {
        return {
          symbol,
          name,
          balance: balance.toString(),
          decimals,
          address: tokenAddress,
          formattedBalance: parseFloat(formattedBalance).toFixed(6)
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Error getting ${symbol} balance:`, error);
      return null;
    }
  }

  // Get all token balances
  async getAllTokenBalances(): Promise<TokenBalance[]> {
    try {
      console.log('Fetching all token balances...');
      
      // Get ETH balance first
      const ethBalance = await this.getETHBalance();
      const balances: TokenBalance[] = [];
      
      // Add ETH if balance > 0
      if (parseFloat(ethBalance.formattedBalance) > 0) {
        balances.push(ethBalance);
      }
      
      // Get ERC20 token balances
      const tokenPromises = Object.entries(TOKEN_ADDRESSES)
        .filter(([symbol]) => symbol !== 'ETH') // Skip ETH as we already got it
        .map(([symbol, address]) => 
          this.getTokenBalance(address, symbol, symbol)
        );
      
      const tokenBalances = await Promise.all(tokenPromises);
      
      // Add non-null balances
      tokenBalances.forEach(balance => {
        if (balance) {
          balances.push(balance);
        }
      });
      
      console.log(`Found ${balances.length} tokens with balances:`, balances);
      return balances;
    } catch (error) {
      console.error('Error getting all token balances:', error);
      throw new Error('Failed to get token balances');
    }
  }

  // Get specific token balance by symbol
  async getTokenBalanceBySymbol(symbol: string): Promise<TokenBalance | null> {
    const tokenAddress = TOKEN_ADDRESSES[symbol as keyof typeof TOKEN_ADDRESSES];
    if (!tokenAddress) {
      console.error(`Token ${symbol} not found in token list`);
      return null;
    }
    
    return this.getTokenBalance(tokenAddress, symbol, symbol);
  }
}
