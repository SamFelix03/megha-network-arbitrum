#!/bin/bash

# Constants
BASE_URL="http://localhost:3000"
DEVICE_DETAILS_FILE="device_details.json"
WALLET_FILE="wallet.txt"
METADATA_FILE="device_metadata.json"
API_PORT=8080
REGISTRY_CONTRACT="0xE25e41F820d4AA90Ad0C49001ecb143DD5B46Ea7"
RPC_URL="https://sepolia-rollup.arbitrum.io/rpc"
MAX_POLL_ATTEMPTS=60
POLL_INTERVAL=30

# Colors for better visibility
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to display status updates
log_status() {
  echo -e "${BLUE}[MEGHA NETWORK]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[MEGHA NETWORK]${NC} $1"
}

log_error() {
  echo -e "${RED}[MEGHA NETWORK ERROR]${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}[MEGHA NETWORK WARNING]${NC} $1"
}

# Function to check if a command exists
command_exists() {
  command -v "$1" &> /dev/null
}

# Function to install dependencies
install_dependencies() {
  log_status "Checking and installing required dependencies..."
  
  # Check for Node.js and npm
  if ! command_exists node; then
    log_error "Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
  fi
  
  # Check for npm
  if ! command_exists npm; then
    log_error "npm is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
  fi
  
  # Install all npm packages from package.json
  log_status "Installing/updating npm packages from package.json..."
  npm install --silent
  
  # Check for ngrok
  if ! command_exists ngrok; then
    log_warning "ngrok is not installed. Attempting to install..."
    
    if command_exists pkg; then
      # Termux
      pkg install -y ngrok
    elif command_exists brew; then
      # macOS with Homebrew
      brew install ngrok/ngrok/ngrok
    elif command_exists apt; then
      # Debian-based Linux
      curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
      echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
      sudo apt update && sudo apt install ngrok
    elif command_exists npm; then
      # Fall back to npm install
      npm install --global ngrok
    else
      log_error "Cannot install ngrok automatically. Please install it manually from https://ngrok.com/download"
      exit 1
    fi
  fi
  
  # Check if ngrok is authenticated
  if ! ngrok config check &> /dev/null; then
    log_error "ngrok is not authenticated. Please run 'ngrok config add-authtoken YOUR_TOKEN' first."
    log_error "You can get your authtoken at https://dashboard.ngrok.com/get-started/your-authtoken"
    exit 1
  fi
  
  # Check for jq (JSON processor)
  if ! command_exists jq; then
    log_warning "jq is not installed. Attempting to install..."
    
    if command_exists pkg; then
      # Termux
      pkg install -y jq
    elif command_exists brew; then
      # macOS with Homebrew
      brew install jq
    elif command_exists apt; then
      # Debian-based Linux
      sudo apt install -y jq
    else
      log_warning "Cannot install jq automatically. Some features may not work correctly."
    fi
  fi
  
  log_success "All dependencies are installed and ready!"
}

# Function to check and install Ollama model
check_ollama_model() {
  log_status "Checking Ollama installation and required model..."
  
  # Check if Ollama is installed
  if ! command_exists ollama; then
    log_error "Ollama is not installed. Please install Ollama first:"
    log_error "Visit: https://ollama.ai/download"
    exit 1
  fi
  
  # Check if Ollama service is running
  if ! curl -s http://127.0.0.1:11434/api/tags >/dev/null 2>&1; then
    log_error "Ollama service is not running. Please start Ollama first."
    log_error "Run: ollama serve"
    exit 1
  fi
  
  log_success "Ollama service is running"
  
  # Check if nemotron-mini model is installed
  log_status "Checking for nemotron-mini:latest model..."
  
  if curl -s http://127.0.0.1:11434/api/tags | grep -q "nemotron-mini:latest"; then
    log_success "nemotron-mini:latest model is already installed"
    return 0
  fi
  
  log_warning "nemotron-mini:latest model not found. Installing..."
  log_status "This may take several minutes depending on your internet connection..."
  
  # Pull the model
  if ollama pull nemotron-mini:latest; then
    log_success "Successfully installed nemotron-mini:latest model"
  else
    log_error "Failed to install nemotron-mini:latest model"
    log_error "Please try running manually: ollama pull nemotron-mini:latest"
    exit 1
  fi
  
  # Verify installation
  if curl -s http://127.0.0.1:11434/api/tags | grep -q "nemotron-mini:latest"; then
    log_success "Model installation verified"
  else
    log_error "Model installation verification failed"
    exit 1
  fi
}

# Function to start ngrok early
start_ngrok() {
  log_status "Starting ngrok to create a public URL for your API..."
  
  # Get the API port
  export API_PORT=${API_PORT:-8080}
  
  # Start ngrok in the background
  ngrok http $API_PORT > /dev/null 2>&1 &
  NGROK_PID=$!
  
  # Give ngrok a moment to start
  sleep 3
  
  # Extract the ngrok URL
  if command_exists jq; then
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url')
  else
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*' | head -n1 | cut -d'"' -f4)
  fi
  
  # Check if we got a valid URL
  if [[ -z "$NGROK_URL" || "$NGROK_URL" == "null" ]]; then
    log_error "Could not get ngrok URL. Make sure ngrok is running properly."
    log_error "Continuing without ngrok URL..."
    NGROK_URL="http://localhost:$API_PORT"
  else
    log_success "ngrok URL: $NGROK_URL"
  fi
  
  # Export the NGROK_URL for use in other functions
  export NGROK_URL
  export NGROK_PID
}

# Function to create or load existing EVM wallet
create_evm_wallet() {
  # Check if wallet files already exist
  if [[ -f "$WALLET_FILE" && -f "$DEVICE_DETAILS_FILE" ]]; then
    log_status "Found existing wallet files, loading existing wallet..."
    
    # Extract wallet address from existing files
    if command_exists jq && [ -f "$DEVICE_DETAILS_FILE" ]; then
      WALLET_ADDRESS=$(jq -r '.address' "$DEVICE_DETAILS_FILE" 2>/dev/null)
    fi
    
    # If jq failed or file doesn't have proper JSON, try text file
    if [[ -z "$WALLET_ADDRESS" || "$WALLET_ADDRESS" == "null" ]]; then
      WALLET_ADDRESS=$(grep "Address:" "$WALLET_FILE" 2>/dev/null | cut -d' ' -f2)
    fi
    
    if [[ -n "$WALLET_ADDRESS" && "$WALLET_ADDRESS" != "null" ]]; then
      log_success "Loaded existing wallet with address: $WALLET_ADDRESS"
      export WALLET_ADDRESS
      return 0
    else
      log_warning "Existing wallet files found but address could not be extracted. Creating new wallet..."
      # Remove corrupted files
      rm -f "$WALLET_FILE" "$DEVICE_DETAILS_FILE"
    fi
  fi
  
  log_status "Creating new EVM wallet with deterministic salt from device details..."
  
  # Create a Node.js script to generate EVM wallet
  node -e "
    const { ethers } = require('ethers');
    const si = require('systeminformation');
    const fs = require('fs');
    const os = require('os');
    
    async function createWallet() {
      try {
        // Gather device info for deterministic salt
        const cpu = await si.cpu();
        const mem = await si.mem();
        const system = await si.system();
        const osInfo = await si.osInfo();
        
        // Create deterministic seed from device characteristics
        const deviceSeed = [
          system.manufacturer || 'unknown',
          system.model || 'unknown', 
          cpu.brand || 'unknown',
          Math.round(mem.total / (1024 * 1024 * 1024)).toString(), // RAM in GB
          osInfo.distro || 'unknown',
          os.hostname() || 'unknown'
        ].join('-');
        
        console.log('Device seed for wallet generation:', deviceSeed);
        
        // Create deterministic wallet from device seed
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(deviceSeed));
        const wallet = new ethers.Wallet(hash);
        
        console.log('Generated EVM wallet address:', wallet.address);
        
        // Save wallet details to JSON (for metadata)
        const walletDetails = {
          address: wallet.address,
          privateKey: wallet.privateKey,
          deviceSeed: deviceSeed,
          createdAt: new Date().toISOString()
        };
        
        fs.writeFileSync('$DEVICE_DETAILS_FILE', JSON.stringify(walletDetails, null, 2));
        
        // Save wallet info to text file (simple format for device storage)
        const walletText = [
          '=== MEGHA NETWORK DEVICE WALLET ===',
          \`Address: \${wallet.address}\`,
          \`Private Key: \${wallet.privateKey}\`,
          \`Created: \${new Date().toISOString()}\`,
          '==============================='
        ].join('\\n');
        
        fs.writeFileSync('$WALLET_FILE', walletText);
        console.log('SUCCESS: New wallet created and saved to $DEVICE_DETAILS_FILE and $WALLET_FILE');
        
      } catch (error) {
        console.error('ERROR creating wallet:', error.message);
        process.exit(1);
      }
    }
    
    createWallet();
  "
  
  # Check if wallet creation was successful
  if [ $? -ne 0 ]; then
    log_error "Failed to create EVM wallet"
    exit 1
  fi
  
  # Extract wallet address from the file
  if command_exists jq; then
    WALLET_ADDRESS=$(jq -r '.address' "$DEVICE_DETAILS_FILE")
  else
    WALLET_ADDRESS=$(grep -o '"address":"[^"]*' "$DEVICE_DETAILS_FILE" | sed 's/"address":"//g')
  fi
  
  log_success "EVM wallet ready with address: $WALLET_ADDRESS"
  export WALLET_ADDRESS
}

# Function to gather device metadata
gather_device_metadata() {
  log_status "Gathering device metadata..."
  
  # Create a Node.js script to gather device metadata
  node -e "
    const si = require('systeminformation');
    const fs = require('fs');
    const os = require('os');
    
    async function gatherMetadata() {
      try {
        // Gather CPU info
        const cpu = await si.cpu();
        const cpuInfo = \`\${cpu.manufacturer} \${cpu.brand} (\${cpu.cores} cores)\`;
        
        // Gather memory info
        const mem = await si.mem();
        const ramGB = Math.round(mem.total / (1024 * 1024 * 1024) * 10) / 10;
        
        // Gather disk info
        const disk = await si.fsSize();
        const totalDiskGB = Math.round(disk.reduce((acc, drive) => acc + drive.size, 0) / (1024 * 1024 * 1024) * 10) / 10;
        
        // Get OS info
        const osInfo = await si.osInfo();
        
        // Get system model
        const system = await si.system();
        const deviceModel = (system.manufacturer + ' ' + system.model).trim() || os.hostname();
        
        // Read wallet address from device details
        let walletAddress = 'unknown';
        try {
          const deviceDetails = JSON.parse(fs.readFileSync('$DEVICE_DETAILS_FILE', 'utf8'));
          walletAddress = deviceDetails.address;
        } catch (err) {
          console.log('Could not read wallet address from device details');
        }
        
        // Create metadata object matching verification.tsx requirements
        const metadata = {
          deviceModel: deviceModel,
          ram: \`\${ramGB}GB\`,
          storage: \`\${totalDiskGB}GB\`, // Use 'storage' to match verification.tsx
          storageCapacity: \`\${totalDiskGB}GB\`, // Also include storageCapacity as fallback
          cpu: cpuInfo,
          os: \`\${osInfo.distro} \${osInfo.release}\`,
          timestamp: new Date().toISOString(),
          ngrokLink: process.env.NGROK_URL || 'http://localhost:8080',
          walletAddress: walletAddress
        };
        
        // Save metadata to file
        fs.writeFileSync('$METADATA_FILE', JSON.stringify(metadata, null, 2));
        console.log('SUCCESS: Device metadata gathered');
      } catch (error) {
        console.error('ERROR:', error.message);
        process.exit(1);
      }
    }
    
    gatherMetadata();
  "
  
  # Check if metadata gathering was successful
  if [ $? -ne 0 ]; then
    log_error "Failed to gather device metadata"
    exit 1
  fi
  
  log_success "Device metadata gathered successfully"
}

# Function to create and display registration QR code
create_and_display_qr_code() {
  log_status "Creating registration QR code with device metadata..."
  
  # Create a Node.js script to encode metadata as URL parameters
  node -e "
    const fs = require('fs');
    
    function encodeURIComponentRobust(str) {
      return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
        return '%' + c.charCodeAt(0).toString(16).toUpperCase();
      });
    }
    
    try {
      // Read the metadata
      const metadata = JSON.parse(fs.readFileSync('$METADATA_FILE', 'utf8'));
      
      console.log('Creating registration URL with metadata:', metadata);
      
      // Create URL parameters from metadata (matching verification.tsx expected params)
      const params = [
        \`deviceModel=\${encodeURIComponentRobust(metadata.deviceModel)}\`,
        \`ram=\${encodeURIComponentRobust(metadata.ram)}\`,
        \`storage=\${encodeURIComponentRobust(metadata.storage)}\`,
        \`storageCapacity=\${encodeURIComponentRobust(metadata.storageCapacity)}\`,
        \`cpu=\${encodeURIComponentRobust(metadata.cpu)}\`,
        \`os=\${encodeURIComponentRobust(metadata.os)}\`,
        \`ngrokLink=\${encodeURIComponentRobust(metadata.ngrokLink)}\`,
        \`walletAddress=\${encodeURIComponentRobust(metadata.walletAddress)}\`
      ].join('&');
      
      // Create the full URL with the deploy-device endpoint
      const registrationUrl = \`$BASE_URL/deploy-device?\${params}\`;
      
      // Save the URL to a file
      fs.writeFileSync('registration_url.txt', registrationUrl);
      console.log('SUCCESS: Registration URL created');
    } catch (error) {
      console.error('ERROR:', error.message);
      process.exit(1);
    }
  "
  
  # Get the registration URL
  REGISTRATION_URL=$(cat registration_url.txt)
  
  # Display the URL
  log_status "Registration URL: $REGISTRATION_URL"
  
  # Generate and display QR code
  log_status "Scan this QR code to register your device:"
  node -e "
    const qrcode = require('qrcode-terminal');
    qrcode.generate('$REGISTRATION_URL', {small: true}, function (qrcode) {
      console.log(qrcode);
    });
  "
  
  log_success "QR code displayed successfully with device metadata"
}

# Function to check device registration in registry contract
check_registry_registration() {
  log_status "Checking device registration in registry contract..."
  log_status "Registry Contract: $REGISTRY_CONTRACT"
  log_status "Device Address: $WALLET_ADDRESS"
  
  # Create a Node.js script to poll the registry contract
  node -e "
    const { ethers } = require('ethers');
    
    const REGISTRY_ABI = [
      {
        'inputs': [],
        'name': 'getAllDevices',
        'outputs': [
          {
            'components': [
              { 'internalType': 'string', 'name': 'deviceModel', 'type': 'string' },
              { 'internalType': 'string', 'name': 'ram', 'type': 'string' },
              { 'internalType': 'string', 'name': 'cpu', 'type': 'string' },
              { 'internalType': 'string', 'name': 'storageCapacity', 'type': 'string' },
              { 'internalType': 'string', 'name': 'os', 'type': 'string' },
              { 'internalType': 'address', 'name': 'walletAddress', 'type': 'address' },
              { 'internalType': 'address', 'name': 'ownerAddress', 'type': 'address' },
              { 'internalType': 'string', 'name': 'timestamp', 'type': 'string' },
              { 'internalType': 'string', 'name': 'ngrokLink', 'type': 'string' },
              { 'internalType': 'string', 'name': 'hostingFee', 'type': 'string' }
            ],
            'internalType': 'struct Registry.Device[]',
            'name': '',
            'type': 'tuple[]'
          }
        ],
        'stateMutability': 'view',
        'type': 'function'
      }
    ];
    
    async function checkRegistration() {
      try {
        console.log('Connecting to Arbitrum Sepolia...');
        const provider = new ethers.providers.JsonRpcProvider('$RPC_URL');
        
        const contract = new ethers.Contract('$REGISTRY_CONTRACT', REGISTRY_ABI, provider);
        
        console.log('Calling getAllDevices...');
        const devices = await contract.getAllDevices();
        
        console.log(\`Found \${devices.length} registered devices\`);
        
        // Check if our device is registered
        const ourAddress = '$WALLET_ADDRESS'.toLowerCase();
        const isRegistered = devices.some(device => 
          device.walletAddress.toLowerCase() === ourAddress
        );
        
        if (isRegistered) {
          console.log('SUCCESS: Device is registered in contract!');
          const ourDevice = devices.find(device => 
            device.walletAddress.toLowerCase() === ourAddress
          );
          console.log('Device details:', {
            model: ourDevice.deviceModel,
            owner: ourDevice.ownerAddress,
            ngrokLink: ourDevice.ngrokLink
          });
          process.exit(0);
        } else {
          console.log('PENDING: Device not yet registered in contract');
          process.exit(1);
        }
        
      } catch (error) {
        console.error('ERROR checking registration:', error.message);
        process.exit(1);
      }
    }
    
    checkRegistration();
  "
  
  return $?
}

# Function to wait for device registration
wait_for_registration() {
  log_status "Waiting for device registration in registry contract..."
  log_status "Will check every $POLL_INTERVAL seconds for up to 30 minutes..."
  log_status "Please scan the QR code above to register your device!"
  
  local attempt=0
  
  while [ $attempt -lt $MAX_POLL_ATTEMPTS ]; do
    log_status "Checking registration attempt $((attempt + 1))/$MAX_POLL_ATTEMPTS..."
    
    if check_registry_registration; then
      log_success "Device registration confirmed in contract!"
      return 0
    fi
    
    attempt=$((attempt + 1))
    
    if [ $attempt -lt $MAX_POLL_ATTEMPTS ]; then
      log_status "Device not registered yet. Retrying in $POLL_INTERVAL seconds..."
      sleep $POLL_INTERVAL
    else
      log_error "Device registration timeout after 30 minutes."
      log_error "Please make sure you've scanned the QR code and completed registration."
      exit 1
    fi
  done
  
  return 1
}

# Function to start the main server
start_main_server() {
  log_status "Starting the Megha Network Mobile Server..."
  
  # Set up a trap to kill all background processes on exit
  cleanup() {
    log_status "Shutting down services..."
    if [ -n "$NGROK_PID" ]; then
      kill $NGROK_PID 2>/dev/null
      log_status "Stopped ngrok (PID: $NGROK_PID)"
    fi
    if [ -n "$SERVER_PID" ]; then
      kill $SERVER_PID 2>/dev/null
      log_status "Stopped main server (PID: $SERVER_PID)"
    fi
    log_success "Megha Network Mobile Server stopped."
    exit 0
  }
  
  # Set trap for Ctrl+C
  trap cleanup INT TERM
  
  # Check if main.js exists
  if [ ! -f "main.js" ]; then
    log_error "main.js not found in current directory"
    exit 1
  fi
  
  # Start the main server
  log_status "Launching main server (main.js)..."
  node main.js &
  SERVER_PID=$!
  
  # Wait a moment for startup
  sleep 3
  
  # Check if server process is running
  if ! ps -p $SERVER_PID > /dev/null; then
    log_error "Main server process failed to start."
    exit 1
  fi
  
  log_success "Main server started successfully!"
  
  # Log server information
  echo "-----------------------------------------"
  echo "🤖 Device Address: $WALLET_ADDRESS"
  echo "🌐 Local Server:   http://localhost:$API_PORT"
  echo "🌐 Public URL:     $NGROK_URL"
  echo "📱 Registration:   $BASE_URL/deploy-device"
  echo "-----------------------------------------"
  
  log_success "Megha Network Mobile Server is now running! Press Ctrl+C to stop."
  
  # Wait for the server process
  wait $SERVER_PID
}

# Main function
main() {
  echo -e "${GREEN}"
  echo "Starting Megha Network Mobile Server Setup..."
  echo "This script will:"
  echo "1. Install dependencies and check Ollama"
  echo "2. Create an EVM wallet for your device"
  echo "3. Gather device metadata"
  echo "4. Generate registration QR code"
  echo "5. Wait for device registration in contract"
  echo "6. Start the main server only after registration"
  echo -e "${NC}"
  
  # Step 1: Install dependencies
  install_dependencies
  
  # Step 2: Check and install Ollama model
  check_ollama_model
  
  # Step 3: Start ngrok early in the process
  start_ngrok
  
  # Step 4: Create EVM wallet
  create_evm_wallet
  
  # Step 5: Gather device metadata (now includes ngrok URL and wallet address)
  gather_device_metadata
  
  # Step 6: Create and display QR code
  create_and_display_qr_code
  
  # Step 7: Wait for device registration in registry contract
  wait_for_registration
  
  # Step 8: Start the main server only after confirmed registration
  start_main_server
}

# Run the main function
main