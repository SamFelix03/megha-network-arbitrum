const express = require('express');
const axios = require('axios');
const fs = require('fs');

// Configuration
const OLLAMA_BASE_URL = 'http://127.0.0.1:11434';
const MODEL_NAME = 'nemotron-mini:latest';
const COVALENT_API_KEY = 'cqt_rQ74pJpygBVcWprTpbDrr6GrwPG9';
const PORT = 3000;

// Load character data
let characterData = null;
try {
  characterData = JSON.parse(fs.readFileSync('./agent.json', 'utf8'));
  console.log('✅ Character data loaded:', characterData.name);
} catch (error) {
  console.log('⚠️ No character data found, using default system prompt');
}

// Conversation history storage
const conversationHistory = new Map(); // Map to store conversation history per session
const MAX_HISTORY_LENGTH = 3; // Keep last 3 exchanges (reduced from 5 to prevent issues)
const ENABLE_CONVERSATION_HISTORY = true; // Set to false to disable conversation history

// Helper functions for conversation history
function getOrCreateHistory(sessionId) {
  if (!conversationHistory.has(sessionId)) {
    conversationHistory.set(sessionId, []);
  }
  return conversationHistory.get(sessionId);
}

function addToHistory(sessionId, userMessage, aiResponse) {
  const history = getOrCreateHistory(sessionId);
  
  // Add new exchange
  history.push({
    user: userMessage,
    assistant: aiResponse,
    timestamp: new Date().toISOString()
  });
  
  // Keep only last MAX_HISTORY_LENGTH exchanges
  if (history.length > MAX_HISTORY_LENGTH) {
    history.shift(); // Remove oldest exchange
  }
  
  conversationHistory.set(sessionId, history);
}

function formatHistoryForPrompt(history) {
  if (history.length === 0) return '';
  
  let historyText = '\n\nPrevious conversation:\n';
  history.forEach((exchange, index) => {
    // Truncate long responses to prevent prompt from getting too long
    const userMsg = exchange.user.length > 200 ? exchange.user.substring(0, 200) + '...' : exchange.user;
    const assistantMsg = exchange.assistant.length > 300 ? exchange.assistant.substring(0, 300) + '...' : exchange.assistant;
    
    historyText += `User: ${userMsg}\n`;
    historyText += `Assistant: ${assistantMsg}\n\n`;
  });
  
  return historyText;
}

const app = express();
app.use(express.json());

// Wallet activity tool definition
const walletActivityTool = {
  name: 'getWalletActivity',
  description: 'Get the chains the wallet is active on and lists those chains along with their information',
  parameters: {
    type: 'object',
    properties: {
      walletAddress: {
        type: 'string',
        description: 'The wallet address to check activity for (e.g., 0x1234...)'
      }
    },
    required: ['walletAddress']
  }
};

// Native token balance tool definition
const nativeBalanceTool = {
  name: 'getNativeBalance',
  description: 'Get the native token balance for a wallet address on a specific chain',
  parameters: {
    type: 'object',
    properties: {
      walletAddress: {
        type: 'string',
        description: 'The wallet address to check balance for (e.g., 0x1234...)'
      },
      chainId: {
        type: 'string',
        description: 'The chain ID or name (e.g., eth-sepolia, eth-mainnet, polygon-mainnet)',
        default: 'eth-sepolia'
      }
    },
    required: ['walletAddress']
  }
};

// NFT balances tool definition
const nftBalancesTool = {
  name: 'getNftBalances',
  description: 'Get NFTs (ERC721 and ERC1155) held by a wallet on a specific chain',
  parameters: {
    type: 'object',
    properties: {
      walletAddress: {
        type: 'string',
        description: 'The wallet address to get NFT balances for (e.g., 0x1234...)'
      },
      chainId: {
        type: 'string',
        description: 'The chain ID or name (e.g., eth-mainnet, eth-sepolia, polygon-mainnet)',
        default: 'eth-mainnet'
      }
    },
    required: ['walletAddress']
  }
};

// Approvals tool definition
const approvalsTool = {
  name: 'getApprovals',
  description: "Get a wallet's token approvals across contracts categorized by spender",
  parameters: {
    type: 'object',
    properties: {
      walletAddress: {
        type: 'string',
        description: 'The wallet address to get approvals for (e.g., 0x1234...)'
      },
      chainId: {
        type: 'string',
        description: 'The chain ID or name (e.g., eth-sepolia, eth-mainnet, polygon-mainnet)',
        default: 'eth-sepolia'
      }
    },
    required: ['walletAddress']
  }
};

// BTC HD wallet balances tool definition
const btcHdWalletTool = {
  name: 'getBtcHdWalletBalances',
  description: 'Fetch balances for each active child address derived from a Bitcoin HD wallet (xpub/ypub/zpub)',
  parameters: {
    type: 'object',
    properties: {
      walletXpub: {
        type: 'string',
        description: 'The xpub/ypub/zpub of the HD wallet'
      },
      chainId: {
        type: 'string',
        description: 'Bitcoin chain identifier (e.g., btc-mainnet, btc-testnet)',
        default: 'btc-mainnet'
      }
    },
    required: ['walletXpub']
  }
};

// Transaction summary tool definition
const transactionSummaryTool = {
  name: 'getTransactionSummary',
  description: 'Get a summary of transactions for a wallet address on a specific chain including total count, latest and earliest transactions',
  parameters: {
    type: 'object',
    properties: {
      walletAddress: {
        type: 'string',
        description: 'The wallet address to get transaction summary for (e.g., 0x1234...)'
      },
      chainId: {
        type: 'string',
        description: 'The chain ID or name (e.g., eth-sepolia, eth-mainnet, polygon-mainnet)',
        default: 'eth-sepolia'
      }
    },
    required: ['walletAddress']
  }
};

// Function implementation for wallet activity
const functionImplementations = {
  getWalletActivity: async (args) => {
    const { walletAddress } = args;
    
    if (!walletAddress) {
      return JSON.stringify({ error: 'Wallet address is required' });
    }
    
    const url = `https://api.covalenthq.com/v1/address/${walletAddress}/activity/?testnets=true`;
    const options = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${COVALENT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      
      if (!response.ok) {
        return JSON.stringify({ 
          error: `API Error: ${response.status}`, 
          message: data.error_message || 'Unknown error'
        });
      }
      
      // Return a simplified version of the data
      return JSON.stringify({
        address: data.data?.address || walletAddress,
        total_count: data.data?.total_count || 0,
        page_number: data.data?.page_number || 0,
        page_size: data.data?.page_size || 0,
        activities: data.data?.items?.slice(0, 5) || [], // Limit to first 5 activities
        has_more: (data.data?.total_count || 0) > 5
      });
    } catch (error) {
      console.error('Covalent API Error:', error);
      return JSON.stringify({ 
        error: 'Failed to fetch wallet activity', 
        details: error.message 
      });
    }
  },

  getNativeBalance: async (args) => {
    const { walletAddress, chainId = 'eth-sepolia' } = args;
    
    if (!walletAddress) {
      return JSON.stringify({ error: 'Wallet address is required' });
    }
    
    const url = `https://api.covalenthq.com/v1/${chainId}/address/${walletAddress}/balances_native/?quote-currency=USD`;
    const options = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${COVALENT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      
      if (!response.ok) {
        return JSON.stringify({ 
          error: `API Error: ${response.status}`, 
          message: data.error_message || 'Unknown error'
        });
      }
      
      // Return a simplified version of the data
      return JSON.stringify({
        address: data.data?.address || walletAddress,
        chain_id: data.data?.chain_id || chainId,
        balance: data.data?.items?.[0]?.balance || '0',
        balance_formatted: data.data?.items?.[0]?.balance_formatted || '0',
        quote_currency: data.data?.items?.[0]?.quote_currency || 'USD',
        quote: data.data?.items?.[0]?.quote || 0,
        quote_rate: data.data?.items?.[0]?.quote_rate || 0,
        contract_name: data.data?.items?.[0]?.contract_name || 'Native Token',
        contract_ticker_symbol: data.data?.items?.[0]?.contract_ticker_symbol || 'ETH'
      });
    } catch (error) {
      console.error('Covalent API Error:', error);
      return JSON.stringify({ 
        error: 'Failed to fetch native balance', 
        details: error.message 
      });
    }
  },

  getTransactionSummary: async (args) => {
    const { walletAddress, chainId = 'eth-sepolia' } = args;
    
    if (!walletAddress) {
      return JSON.stringify({ error: 'Wallet address is required' });
    }
    
    const url = `https://api.covalenthq.com/v1/${chainId}/address/${walletAddress}/transactions_summary/?quote-currency=USD`;
    const options = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${COVALENT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      
      if (!response.ok) {
        return JSON.stringify({ 
          error: `API Error: ${response.status}`, 
          message: data.error_message || 'Unknown error'
        });
      }
      
      // Return a simplified version of the data
      return JSON.stringify({
        address: data.data?.address || walletAddress,
        chain_id: data.data?.chain_id || chainId,
        chain_name: data.data?.chain_name || chainId,
        updated_at: data.data?.updated_at,
        total_transactions: data.data?.items?.[0]?.total_count || 0,
        latest_transaction: {
          block_signed_at: data.data?.items?.[0]?.latest_transaction?.block_signed_at,
          tx_hash: data.data?.items?.[0]?.latest_transaction?.tx_hash,
          tx_detail_link: data.data?.items?.[0]?.latest_transaction?.tx_detail_link
        },
        earliest_transaction: {
          block_signed_at: data.data?.items?.[0]?.earliest_transaction?.block_signed_at,
          tx_hash: data.data?.items?.[0]?.earliest_transaction?.tx_hash,
          tx_detail_link: data.data?.items?.[0]?.earliest_transaction?.tx_detail_link
        }
      });
    } catch (error) {
      console.error('Covalent API Error:', error);
      return JSON.stringify({ 
        error: 'Failed to fetch transaction summary', 
        details: error.message 
      });
    }
  }
  ,

  getNftBalances: async (args) => {
    const { walletAddress, chainId = 'eth-mainnet' } = args;
    
    if (!walletAddress) {
      return JSON.stringify({ error: 'Wallet address is required' });
    }
    
    const url = `https://api.covalenthq.com/v1/${chainId}/address/${walletAddress}/balances_nft/`;
    const options = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${COVALENT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      
      if (!response.ok) {
        return JSON.stringify({ 
          error: `API Error: ${response.status}`, 
          message: data.error_message || 'Unknown error'
        });
      }
      
      // Return a simplified subset useful for rendering
      const items = Array.isArray(data.data?.items) ? data.data.items : [];
      const summarized = items.slice(0, 20).map((nft) => ({
        contract_address: nft.contract_address,
        contract_name: nft.contract_name,
        contract_ticker_symbol: nft.contract_ticker_symbol,
        supports_erc: nft.supports_erc,
        type: nft.type,
        balance: nft.balance,
        balance_24h: nft.balance_24h,
        nft_data: Array.isArray(nft.nft_data) ? nft.nft_data.slice(0, 5).map((t) => ({
          token_id: t.token_id,
          token_url: t.token_url,
          original_owner: t.original_owner,
          owner: t.owner,
          external_data: t.external_data ? {
            name: t.external_data.name,
            description: t.external_data.description,
            image: t.external_data.image,
            image_256: t.external_data.image_256,
            image_512: t.external_data.image_512,
            image_1024: t.external_data.image_1024
          } : undefined
        })) : []
      }));

      return JSON.stringify({
        address: data.data?.address || walletAddress,
        chain_id: data.data?.chain_id || chainId,
        chain_name: data.data?.chain_name,
        updated_at: data.data?.updated_at,
        total_collections: items.length,
        items: summarized
      });
    } catch (error) {
      console.error('Covalent API Error:', error);
      return JSON.stringify({ 
        error: 'Failed to fetch NFT balances', 
        details: error.message 
      });
    }
  }
  ,

  getApprovals: async (args) => {
    const { walletAddress, chainId = 'eth-sepolia' } = args;
    
    if (!walletAddress) {
      return JSON.stringify({ error: 'Wallet address is required' });
    }
    
    const url = `https://api.covalenthq.com/v1/${chainId}/approvals/${walletAddress}/`;
    const options = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${COVALENT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      
      if (!response.ok) {
        return JSON.stringify({ 
          error: `API Error: ${response.status}`, 
          message: data.error_message || 'Unknown error'
        });
      }
      // Return RAW approvals payload to avoid losing fields due to undefined keys
      return JSON.stringify(data);
    } catch (error) {
      console.error('Covalent API Error:', error);
      return JSON.stringify({ 
        error: 'Failed to fetch approvals', 
        details: error.message 
      });
    }
  }
  ,

  getBtcHdWalletBalances: async (args) => {
    const { walletXpub, chainId = 'btc-mainnet' } = args;
    
    if (!walletXpub) {
      return JSON.stringify({ error: 'HD wallet xpub is required' });
    }
    
    const url = `https://api.covalenthq.com/v1/${chainId}/address/${walletXpub}/hd_wallets/?quote-currency=USD`;
    const options = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${COVALENT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      
      if (!response.ok) {
        return JSON.stringify({ 
          error: `API Error: ${response.status}`, 
          message: data.error_message || 'Unknown error'
        });
      }
      
      // Return RAW data for full fidelity
      return JSON.stringify(data);
    } catch (error) {
      console.error('Covalent API Error:', error);
      return JSON.stringify({ 
        error: 'Failed to fetch BTC HD wallet balances', 
        details: error.message 
      });
    }
  }
};

// Format messages according to Nemotron Mini's prompt format
function formatNemotronPrompt(systemPrompt, userMessage, toolDefinitions = null, toolResponse = null, conversationHistory = '') {
  let prompt = `<extra_id_0>System\n${systemPrompt}${conversationHistory}\n\n`;
  
  if (toolDefinitions) {
    // Handle both single tool and array of tools
    const tools = Array.isArray(toolDefinitions) ? toolDefinitions : [toolDefinitions];
    tools.forEach(tool => {
      prompt += `<tool>\n${JSON.stringify(tool, null, 2)}\n</tool>\n`;
    });
  }
  
  if (toolResponse) {
    prompt += `<context>\n${toolResponse}\n</context>\n\n`;
  }
  
  prompt += `<extra_id_1>User\n${userMessage}\n<extra_id_1>Assistant\n`;
  
  return prompt;
}

// Function to make API call to Ollama with raw prompt
async function callOllamaRaw(prompt) {
  try {
    const payload = {
      model: MODEL_NAME,
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.3,
        top_p: 0.9,
        stop: ['<extra_id_0>', '<extra_id_1>']
      }
    };

    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, payload);
    return response.data;
  } catch (error) {
    console.error('Error calling Ollama:', error.message);
    throw error;
  }
}

// Simple function to detect if there are tool calls in the response (no parsing)
function hasToolCalls(content) {
  return content.includes('<toolcall>') && content.includes('</toolcall>');
}

// Execute function calls - simplified to just return raw results
async function executeFunctionCall(functionName, rawArguments) {
  if (functionImplementations[functionName]) {
    try {
      const result = await functionImplementations[functionName](rawArguments);
      return result;
    } catch (error) {
      console.error(`Error executing function ${functionName}:`, error);
      return JSON.stringify({ error: `Failed to execute ${functionName}`, details: error.message });
    }
  } else {
    return JSON.stringify({ error: `Function ${functionName} not found` });
  }
}

// Function to detect if message is wallet/crypto related
function isWalletRelatedMessage(message) {
  const walletKeywords = [
    'wallet', 'address', 'balance', 'transaction', 'nft', 'approval', 'approvals',
    'btc', 'bitcoin', 'xpub', 'ypub', 'zpub', 'hd wallet', 'child address',
    'eth', 'ethereum', 'polygon', 'bsc', 'avalanche', 'fantom',
    '0x', 'crypto', 'blockchain', 'chain', 'token', 'tool', 'coin'
  ];
  
  const lowerMessage = message.toLowerCase();
  return walletKeywords.some(keyword => lowerMessage.includes(keyword));
}

// Main chat function - returns raw responses without parsing
async function chatWithFunctionCalling(userMessage, sessionId = 'default') {
  // Check if this is a wallet-related query
  const isWalletQuery = isWalletRelatedMessage(userMessage);
  
  // Create character-based system prompt for general conversations
  const characterSystemPrompt = characterData ? 
    `You are ${characterData.name}. ${characterData.description}

Personality: ${characterData.personality}

Scenario: ${characterData.scenario}

Example message: ${characterData.messageExample}

Respond as this character would, staying in character while being helpful and friendly.` :
    `You are a helpful AI assistant.`;

  // Original system prompt for tool calling
  const toolSystemPrompt = `You are a helpful cryptocurrency and blockchain assistant. You have access to six tools:

IMPORTANT: After executing a tool call and receiving the tool response, you must provide a clear, human-readable summary of the information. Do NOT repeat the tool call format. Instead, explain the results in a natural, conversational way.

1. getWalletActivity - Get the chains the wallet is active on and lists those chains along with their information. Use this format:
<toolcall>
{"name": "getWalletActivity", "arguments": {"walletAddress": "wallet_address_here"}}
</toolcall>

2. getNativeBalance - Get the native token balance for a wallet address on a specific chain. Use this format:
<toolcall>
{"name": "getNativeBalance", "arguments": {"walletAddress": "wallet_address_here", "chainId": "eth-sepolia"}}
</toolcall>

3. getTransactionSummary - Get a summary of transactions for a wallet address on a specific chain including total count, latest and earliest transactions. Use this format:
<toolcall>
{"name": "getTransactionSummary", "arguments": {"walletAddress": "wallet_address_here", "chainId": "eth-sepolia"}}
</toolcall>

4. getNftBalances - Get NFTs (ERC721 and ERC1155) held by a wallet on a specific chain. Use this format:
<toolcall>
{"name": "getNftBalances", "arguments": {"walletAddress": "wallet_address_here", "chainId": "eth-mainnet"}}
</toolcall>

5. getApprovals - Get a wallet's token approvals across contracts categorized by spender. Use this format:
<toolcall>
{"name": "getApprovals", "arguments": {"walletAddress": "wallet_address_here", "chainId": "eth-sepolia"}}
</toolcall>

6. getBtcHdWalletBalances - Fetch balances for each active child address derived from a Bitcoin HD wallet. Use this format:
<toolcall>
{"name": "getBtcHdWalletBalances", "arguments": {"walletXpub": "xpub_here", "chainId": "btc-mainnet"}}
</toolcall>

Available chain IDs include: eth-sepolia, eth-mainnet, polygon-mainnet, bsc-mainnet, etc.

After getting wallet data, list the chains the wallet is active on. This could be identified by checking the chain name, next to the value "name" in the response. For balance queries, provide the balance in both raw and formatted amounts with USD value. For transaction summaries, provide the total transaction count and details about the latest and earliest transactions.`;

  try {
    // Step 1: Choose system prompt based on message type
    let systemPrompt, tools;
    
    if (isWalletQuery) {
      // Use tool system prompt for wallet-related queries
      systemPrompt = toolSystemPrompt;
      tools = [walletActivityTool, nativeBalanceTool, transactionSummaryTool, nftBalancesTool, approvalsTool, btcHdWalletTool];
    } else {
      // Use character system prompt for general conversation
      systemPrompt = characterSystemPrompt;
      tools = null;
    }
    
    // Get conversation history for this session (if enabled)
    let historyText = '';
    if (ENABLE_CONVERSATION_HISTORY) {
      const history = getOrCreateHistory(sessionId);
      historyText = formatHistoryForPrompt(history);
      
      console.log(`Session ${sessionId} - History length: ${history.length}`);
      console.log('History text:', historyText);
    } else {
      console.log('Conversation history disabled');
    }
    
    let prompt = formatNemotronPrompt(systemPrompt, userMessage, tools, null, historyText);
    console.log('Full prompt length:', prompt.length);
    
    // Check if prompt is getting too long (roughly 4000+ characters might cause issues)
    if (prompt.length > 4000) {
      console.log('⚠️ Warning: Prompt is getting very long, this might cause issues');
    }
    
    let response = await callOllamaRaw(prompt);
    let aiResponse = response.response.trim();
    
    console.log('AI response length:', aiResponse.length);
    console.log('AI response:', aiResponse);
    
    // If response is empty, try without conversation history as fallback
    if (aiResponse.length === 0) {
      console.log('❌ Empty response detected! Trying without conversation history...');
      
      // Try again without conversation history
      const fallbackPrompt = formatNemotronPrompt(systemPrompt, userMessage, tools, null, '');
      const fallbackResponse = await callOllamaRaw(fallbackPrompt);
      const fallbackAnswer = fallbackResponse.response.trim();
      
      if (fallbackAnswer.length > 0) {
        console.log('✅ Fallback response successful:', fallbackAnswer);
        aiResponse = fallbackAnswer;
      } else {
        console.log('❌ Fallback also failed. Full response object:', fallbackResponse);
      }
    }
    
    // Step 2: Check if there are tool calls (no parsing, just detection)
    const hasToolCall = hasToolCalls(aiResponse);
    
    if (hasToolCall) {
      // Extract the raw tool call content between <toolcall> tags
      const toolCallMatch = aiResponse.match(/<toolcall>\s*({.*?})\s*<\/toolcall>/s);
      
      if (toolCallMatch) {
        const rawToolCall = toolCallMatch[1];
        console.log('Raw tool call detected:', rawToolCall);
        
        // Try to extract function name and arguments for execution
        try {
          const toolCallData = JSON.parse(rawToolCall);
          const functionName = toolCallData.name;
          const functionArgs = toolCallData.arguments || toolCallData.parameters;
          
          console.log(`Executing function: ${functionName} with args:`, functionArgs);
          
          // Execute the function
          const functionResult = await executeFunctionCall(functionName, functionArgs);
          
          // Step 3: Create follow-up prompt with tool response
          const followUpPrompt = `You are a helpful cryptocurrency and blockchain assistant. 

User asked: "${userMessage}"

Tool call was made: ${rawToolCall}

Tool response: ${functionResult}

Please respond with a simple one-liner acknowledging that you found the results for the query. Keep it brief and conversational.`;
          
          console.log('Follow-up prompt:', followUpPrompt);
          
          // Get final response (without stop tokens to allow full generation)
          const finalResponsePayload = {
            model: MODEL_NAME,
            prompt: followUpPrompt,
            stream: false,
            options: {
              temperature: 0.3,
              top_p: 0.9
              // No stop tokens for final response
            }
          };
          
          const finalResponse = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, finalResponsePayload);
          const finalAnswer = finalResponse.data.response.trim();
          
          console.log('Final response from model:', finalAnswer);
          console.log('Full response object:', finalResponse.data);
          
          // Add to conversation history
          if (ENABLE_CONVERSATION_HISTORY) {
            addToHistory(sessionId, userMessage, finalAnswer);
          }
          
          return {
            rawModelResponse: aiResponse,
            rawToolCall: rawToolCall,
            rawToolResponse: functionResult,
            rawFinalResponse: finalAnswer,
            hasToolCall: true,
            functionName: functionName,
            functionArgs: functionArgs
          };
        } catch (parseError) {
          console.error('Error parsing tool call:', parseError);
          return {
            rawModelResponse: aiResponse,
            rawToolCall: rawToolCall,
            parseError: parseError.message,
            hasToolCall: true
          };
        }
      }
    }
    
    // No function calls needed - add to conversation history and return response
    if (ENABLE_CONVERSATION_HISTORY) {
      addToHistory(sessionId, userMessage, aiResponse);
    }
    
    return {
      rawModelResponse: aiResponse,
      hasToolCall: false,
      characterResponse: !isWalletQuery
    };
    
  } catch (error) {
    console.error('Chat error:', error.message);
    throw error;
  }
}

// API Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Wallet AI API is running' });
});

// Chat endpoint
app.post('/chat', async (req, res) => {
  try {
    const { message, sessionId = 'default' } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const result = await chatWithFunctionCalling(message, sessionId);
    res.json(result);
    
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

// Conversation history management endpoints
app.get('/chat/history/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const history = getOrCreateHistory(sessionId);
    res.json({
      sessionId,
      history,
      count: history.length
    });
  } catch (error) {
    console.error('History API Error:', error);
    res.status(500).json({ 
      error: 'Failed to get conversation history', 
      details: error.message 
    });
  }
});

app.delete('/chat/history/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    conversationHistory.delete(sessionId);
    res.json({
      message: `Conversation history cleared for session: ${sessionId}`,
      sessionId
    });
  } catch (error) {
    console.error('History API Error:', error);
    res.status(500).json({ 
      error: 'Failed to clear conversation history', 
      details: error.message 
    });
  }
});

app.get('/chat/sessions', (req, res) => {
  try {
    const sessions = Array.from(conversationHistory.keys()).map(sessionId => ({
      sessionId,
      messageCount: conversationHistory.get(sessionId).length,
      lastActivity: conversationHistory.get(sessionId).length > 0 
        ? conversationHistory.get(sessionId)[conversationHistory.get(sessionId).length - 1].timestamp
        : null
    }));
    
    res.json({
      activeSessions: sessions,
      totalSessions: sessions.length
    });
  } catch (error) {
    console.error('Sessions API Error:', error);
    res.status(500).json({ 
      error: 'Failed to get active sessions', 
      details: error.message 
    });
  }
});

// Direct wallet activity endpoint
app.get('/wallet/:address/activity', async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!address) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }
    
    const result = await functionImplementations.getWalletActivity({ walletAddress: address });
    const data = JSON.parse(result);
    
    res.json(data);
    
  } catch (error) {
    console.error('Wallet API Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch wallet activity', 
      details: error.message 
    });
  }
});

// Direct native balance endpoint
app.get('/wallet/:address/balance/:chainId', async (req, res) => {
  try {
    const { address, chainId } = req.params;
    
    if (!address) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }
    
    const result = await functionImplementations.getNativeBalance({ 
      walletAddress: address, 
      chainId: chainId 
    });
    const data = JSON.parse(result);
    
    res.json(data);
    
  } catch (error) {
    console.error('Balance API Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch native balance', 
      details: error.message 
    });
  }
});

// Direct native balance endpoint with default chain (eth-sepolia)
app.get('/wallet/:address/balance', async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!address) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }
    
    const result = await functionImplementations.getNativeBalance({ 
      walletAddress: address, 
      chainId: 'eth-sepolia' 
    });
    const data = JSON.parse(result);
    
    res.json(data);
    
  } catch (error) {
    console.error('Balance API Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch native balance', 
      details: error.message 
    });
  }
});

// Direct transaction summary endpoint
app.get('/wallet/:address/transactions/:chainId', async (req, res) => {
  try {
    const { address, chainId } = req.params;
    
    if (!address) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }
    
    const result = await functionImplementations.getTransactionSummary({ 
      walletAddress: address, 
      chainId: chainId 
    });
    const data = JSON.parse(result);
    
    res.json(data);
    
  } catch (error) {
    console.error('Transaction Summary API Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch transaction summary', 
      details: error.message 
    });
  }
});

// Direct transaction summary endpoint with default chain (eth-sepolia)
app.get('/wallet/:address/transactions', async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!address) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }
    
    const result = await functionImplementations.getTransactionSummary({ 
      walletAddress: address, 
      chainId: 'eth-sepolia' 
    });
    const data = JSON.parse(result);
    
    res.json(data);
    
  } catch (error) {
    console.error('Transaction Summary API Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch transaction summary', 
      details: error.message 
    });
  }
});

// Direct approvals endpoint
app.get('/wallet/:address/approvals/:chainId', async (req, res) => {
  try {
    const { address, chainId } = req.params;
    
    if (!address) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }
    
    const result = await functionImplementations.getApprovals({ 
      walletAddress: address, 
      chainId: chainId 
    });
    const data = JSON.parse(result);
    
    res.json(data);
    
  } catch (error) {
    console.error('Approvals API Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch approvals', 
      details: error.message 
    });
  }
});

// Direct approvals endpoint with default chain (eth-sepolia)
app.get('/wallet/:address/approvals', async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!address) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }
    
    const result = await functionImplementations.getApprovals({ 
      walletAddress: address, 
      chainId: 'eth-sepolia' 
    });
    const data = JSON.parse(result);
    
    res.json(data);
    
  } catch (error) {
    console.error('Approvals API Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch approvals', 
      details: error.message 
    });
  }
});

// Direct BTC HD wallet balances endpoints
app.get('/wallet/btc/:xpub/hd_wallets/:chainId', async (req, res) => {
  try {
    const { xpub, chainId } = req.params;
    
    if (!xpub) {
      return res.status(400).json({ error: 'HD wallet xpub is required' });
    }
    
    const result = await functionImplementations.getBtcHdWalletBalances({ 
      walletXpub: xpub, 
      chainId: chainId 
    });
    const data = JSON.parse(result);
    
    res.json(data);
    
  } catch (error) {
    console.error('BTC HD API Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch BTC HD wallet balances', 
      details: error.message 
    });
  }
});

app.get('/wallet/btc/:xpub/hd_wallets', async (req, res) => {
  try {
    const { xpub } = req.params;
    
    if (!xpub) {
      return res.status(400).json({ error: 'HD wallet xpub is required' });
    }
    
    const result = await functionImplementations.getBtcHdWalletBalances({ 
      walletXpub: xpub, 
      chainId: 'btc-mainnet' 
    });
    const data = JSON.parse(result);
    
    res.json(data);
    
  } catch (error) {
    console.error('BTC HD API Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch BTC HD wallet balances', 
      details: error.message 
    });
  }
});

// Direct NFT balances endpoint
app.get('/wallet/:address/nfts/:chainId', async (req, res) => {
  try {
    const { address, chainId } = req.params;
    
    if (!address) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }
    
    const result = await functionImplementations.getNftBalances({ 
      walletAddress: address, 
      chainId: chainId 
    });
    const data = JSON.parse(result);
    
    res.json(data);
    
  } catch (error) {
    console.error('NFT API Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch NFT balances', 
      details: error.message 
    });
  }
});

// Direct NFT balances endpoint with default chain (eth-mainnet)
app.get('/wallet/:address/nfts', async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!address) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }
    
    const result = await functionImplementations.getNftBalances({ 
      walletAddress: address, 
      chainId: 'eth-mainnet' 
    });
    const data = JSON.parse(result);
    
    res.json(data);
    
  } catch (error) {
    console.error('NFT API Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch NFT balances', 
      details: error.message 
    });
  }
});

// Check Ollama status
app.get('/status', async (req, res) => {
  try {
    const response = await axios.get(`${OLLAMA_BASE_URL}/api/tags`);
    const models = response.data.models || [];
    const hasNemotron = models.some(model => model.name.includes('nemotron-mini'));
    
    res.json({
      ollama: 'running',
      nemotron_available: hasNemotron,
      models: models.map(m => m.name)
    });
  } catch (error) {
    res.status(503).json({
      ollama: 'not running',
      error: error.message
    });
  }
});

// Example usage endpoint
app.get('/examples', (req, res) => {
  res.json({
    endpoints: {
      chat: {
        method: 'POST',
        url: '/chat',
        body: { message: 'Check the activity for wallet 0x1234...', sessionId: 'user123' },
        description: 'Chat with conversation history support'
      },
      chat_history: {
        method: 'GET',
        url: '/chat/history/{sessionId}',
        description: 'Get conversation history for a session'
      },
      clear_history: {
        method: 'DELETE',
        url: '/chat/history/{sessionId}',
        description: 'Clear conversation history for a session'
      },
      active_sessions: {
        method: 'GET',
        url: '/chat/sessions',
        description: 'Get all active conversation sessions'
      },
      wallet_activity: {
        method: 'GET',
        url: '/wallet/{address}/activity'
      },
      native_balance: {
        method: 'GET',
        url: '/wallet/{address}/balance/{chainId}',
        description: 'Get native token balance for a wallet on a specific chain'
      },
      native_balance_default: {
        method: 'GET',
        url: '/wallet/{address}/balance',
        description: 'Get native token balance for a wallet on eth-sepolia (default)'
      },
      transaction_summary: {
        method: 'GET',
        url: '/wallet/{address}/transactions/{chainId}',
        description: 'Get transaction summary for a wallet on a specific chain'
      },
      transaction_summary_default: {
        method: 'GET',
        url: '/wallet/{address}/transactions',
        description: 'Get transaction summary for a wallet on eth-sepolia (default)'
      },
      approvals: {
        method: 'GET',
        url: '/wallet/{address}/approvals/{chainId}',
        description: "Get a wallet's token approvals categorized by spender on a chain"
      },
      approvals_default: {
        method: 'GET',
        url: '/wallet/{address}/approvals',
        description: "Get a wallet's token approvals on eth-sepolia (default)"
      },
      btc_hd_wallets: {
        method: 'GET',
        url: '/wallet/btc/{xpub}/hd_wallets/{chainId}',
        description: 'Fetch balances for each active child address for a BTC HD wallet on a chain'
      },
      btc_hd_wallets_default: {
        method: 'GET',
        url: '/wallet/btc/{xpub}/hd_wallets',
        description: 'Fetch balances for each active child address for a BTC HD wallet on btc-mainnet (default)'
      },
      nft_balances: {
        method: 'GET',
        url: '/wallet/{address}/nfts/{chainId}',
        description: 'Get NFTs (ERC721/ERC1155) held by a wallet on a chain'
      },
      nft_balances_default: {
        method: 'GET',
        url: '/wallet/{address}/nfts',
        description: 'Get NFTs held by a wallet on eth-mainnet (default)'
      },
      health: {
        method: 'GET',
        url: '/health'
      },
      status: {
        method: 'GET',
        url: '/status'
      }
    },
    example_queries: [
      'What is the activity for wallet 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045?',
      'Show me the transaction history for 0x742d35Cc6634C0532925a3b8D45C5D6d2d5f9e8C',
      'Analyze the wallet activity for vitalik.eth',
      'What is the ETH balance for wallet 0x2514844f312c02ae3c9d4feb40db4ec8830b6844 on Sepolia?',
      'Check the native token balance for 0x1234... on Ethereum mainnet',
      'Get transaction summary for wallet 0x2514844f312c02ae3c9d4feb40db4ec8830b6844 on Sepolia',
      'Show me the transaction count and latest activity for 0x1234... on Polygon',
      'List NFTs owned by 0x2514... on Ethereum mainnet',
      'Show top 10 NFTs for 0x1234... on Polygon',
      'List all spenders and approvals for 0x2514... on Sepolia',
      'Show token approvals for 0x1234... on Ethereum mainnet',
      'Fetch BTC HD wallet child balances for xpub6DUM... on mainnet'
    ],
    available_chains: [
      'eth-sepolia',
      'eth-mainnet', 
      'polygon-mainnet',
      'bsc-mainnet',
      'avalanche-mainnet',
      'fantom-mainnet'
    ]
  });
});

// Start the server
async function startServer() {
  try {
    // Check if Ollama is running
    await axios.get(`${OLLAMA_BASE_URL}/api/tags`);
    console.log('✅ Ollama is running');
    
    app.listen(PORT, () => {
      console.log(`🚀 Wallet AI API server running on http://localhost:${PORT}`);
      console.log(`💬 Test chat: POST http://localhost:${PORT}/chat`);
      console.log(`📊 Check status: GET http://localhost:${PORT}/status`);
      console.log(`💚 Health check: GET http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Ollama is not running. Please start Ollama first.');
    process.exit(1);
  }
}

startServer();
