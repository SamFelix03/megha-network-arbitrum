#!/bin/bash

# Constants
BASE_URL="https://franky-arbitrum.vercel.app"
DEVICE_DETAILS_FILE="device_details.json"
METADATA_FILE="device_metadata.json"
API_PORT=8080

# Colors for better visibility
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to display status updates
log_status() {
  echo -e "${BLUE}[FRANKY]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[FRANKY]${NC} $1"
}

log_error() {
  echo -e "${RED}[FRANKY ERROR]${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}[FRANKY WARNING]${NC} $1"
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

# Function to create EVM wallet with deterministic salt
create_evm_wallet() {
  log_status "Creating EVM wallet with deterministic salt from device details..."
  
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
        
        // Save wallet details
        const walletDetails = {
          address: wallet.address,
          privateKey: wallet.privateKey,
          deviceSeed: deviceSeed,
          createdAt: new Date().toISOString()
        };
        
        fs.writeFileSync('$DEVICE_DETAILS_FILE', JSON.stringify(walletDetails, null, 2));
        console.log('SUCCESS: Wallet details saved to $DEVICE_DETAILS_FILE');
        
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
  
  log_success "Created EVM wallet with address: $WALLET_ADDRESS"
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

# Function to start the main server
start_main_server() {
  log_status "Starting the Franky Agent main server..."
  
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
    log_success "Franky Agent stopped."
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
  
  log_success "Franky Agent is now running! Press Ctrl+C to stop."
  log_status "Please scan the QR code above to register your device on the web interface."
  
  # Wait for the server process
  wait $SERVER_PID
}

# Main function
main() {
  echo -e "${GREEN}"
  echo "Starting Franky Agent Setup..."
  echo "This script will:"
  echo "1. Create an EVM wallet for your device"
  echo "2. Gather device metadata"
  echo "3. Generate registration QR code"
  echo "4. Start the main server"
  echo -e "${NC}"
  
  # Step 1: Install dependencies
  install_dependencies
  
  # Step 2: Start ngrok early in the process
  start_ngrok
  
  # Step 3: Create EVM wallet
  create_evm_wallet
  
  # Step 4: Gather device metadata (now includes ngrok URL and wallet address)
  gather_device_metadata
  
  # Step 5: Create and display QR code
  create_and_display_qr_code
  
  # Step 6: Start the main server
  start_main_server
}

# Run the main function
main