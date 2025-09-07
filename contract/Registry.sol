/**
 *Submitted for verification at Sepolia.Arbiscan.io on 2025-09-05
*/

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

contract Registry {
    // Device Struct
    struct Device {
        string deviceModel;
        string ram;
        string cpu;
        string storageCapacity;
        string os;
        address walletAddress;
        address ownerAddress; 
        string timestamp;
        string ngrokLink;       // NEW
        string hostingFee;      // NEW
    }

    // Agent Struct
    struct Agent {
        string uuid;
        string name;
        string description;
        string personality;
        string scenario;
        string messageExample;
        string[] tools;
        string imageUrl;
        address ownerAddress; 
    }

    // Storage
    mapping(uint256 => Device) private devices;
    uint256 private deviceCount;

    mapping(uint256 => Agent) private agents;
    uint256 private agentCount;

    // New mapping for UUID → Agent
    mapping(string => Agent) private agentsByUUID;

    // Owner mappings (for msg.sender addresses)
    mapping(address => uint256[]) private ownerDevices;
    mapping(address => uint256[]) private ownerAgents;

    // Contract owner
    address private contractOwner;

    // Events
    event DeviceRegistered(uint256 indexed deviceId, string deviceModel, address ownerAddress);
    event AgentCreated(uint256 indexed agentId, string uuid, address ownerAddress);
    event DeviceUpdated(uint256 indexed deviceId, string deviceModel);
    event AgentUpdated(uint256 indexed agentId, string uuid);

    constructor() {
        contractOwner = msg.sender;
    }

    modifier onlyContractOwner() {
        require(msg.sender == contractOwner, "Only contract owner can perform this action");
        _;
    }

    // Write Functions

    function registerDevice(
        string memory _deviceModel,
        string memory _ram,
        string memory _cpu,
        string memory _storageCapacity,
        string memory _os,
        address _walletAddress,
        address _ownerAddress,
        string memory _timestamp,
        string memory _ngrokLink,       // NEW
        string memory _hostingFee       // NEW
    ) public {
        devices[deviceCount] = Device(
            _deviceModel,
            _ram,
            _cpu,
            _storageCapacity,
            _os,
            _walletAddress,
            _ownerAddress,
            _timestamp,
            _ngrokLink,
            _hostingFee
        );
        ownerDevices[msg.sender].push(deviceCount);
        emit DeviceRegistered(deviceCount, _deviceModel, _ownerAddress);
        deviceCount++;
    }

    function createAgent(
        string memory _uuid,
        string memory _name,
        string memory _description,
        string memory _personality,
        string memory _scenario,
        string memory _messageExample,
        string[] memory _tools,
        string memory _imageUrl,
        address _ownerAddress
    ) public {
        Agent memory newAgent = Agent(
            _uuid,
            _name,
            _description,
            _personality,
            _scenario,
            _messageExample,
            _tools,
            _imageUrl,
            _ownerAddress
        );

        agents[agentCount] = newAgent;
        agentsByUUID[_uuid] = newAgent; //store in mapping
        ownerAgents[msg.sender].push(agentCount);

        emit AgentCreated(agentCount, _uuid, _ownerAddress);
        agentCount++;
    }

    // Update Functions (only contract owner)

    function updateDevice(
        uint256 _id,
        string memory _deviceModel,
        string memory _ram,
        string memory _cpu,
        string memory _storageCapacity,
        string memory _os,
        address _walletAddress,
        address _ownerAddress,
        string memory _timestamp,
        string memory _ngrokLink,       // NEW
        string memory _hostingFee       // NEW
    ) public onlyContractOwner {
        require(_id < deviceCount, "Device does not exist");
        devices[_id] = Device(
            _deviceModel,
            _ram,
            _cpu,
            _storageCapacity,
            _os,
            _walletAddress,
            _ownerAddress,
            _timestamp,
            _ngrokLink,
            _hostingFee
        );
        emit DeviceUpdated(_id, _deviceModel);
    }

    function updateAgent(
        uint256 _id,
        string memory _uuid,
        string memory _name,
        string memory _description,
        string memory _personality,
        string memory _scenario,
        string memory _messageExample,
        string[] memory _tools,
        string memory _imageUrl,
        address _ownerAddress
    ) public onlyContractOwner {
        require(_id < agentCount, "Agent does not exist");
        Agent memory updated = Agent(
            _uuid,
            _name,
            _description,
            _personality,
            _scenario,
            _messageExample,
            _tools,
            _imageUrl,
            _ownerAddress
        );
        agents[_id] = updated;
        agentsByUUID[_uuid] = updated; // keeping UUID mapping updated
        emit AgentUpdated(_id, _uuid);
    }

    // Read Functions

    function getDeviceCount() public view returns (uint256) {
        return deviceCount;
    }

    function getAgentCount() public view returns (uint256) {
        return agentCount;
    }

    function getDevice(uint256 _id) public view returns (Device memory) {
        require(_id < deviceCount, "Device does not exist");
        return devices[_id];
    }

    function getAgent(uint256 _id) public view returns (Agent memory) {
        require(_id < agentCount, "Agent does not exist");
        return agents[_id];
    }

    function getAgentByUUID(string memory _uuid) public view returns (Agent memory) {
        return agentsByUUID[_uuid];
    }

    function getAllDevices() public view returns (Device[] memory) {
        Device[] memory allDevices = new Device[](deviceCount);
        for (uint256 i = 0; i < deviceCount; i++) {
            allDevices[i] = devices[i];
        }
        return allDevices;
    }

    function getAllAgents() public view returns (Agent[] memory) {
        Agent[] memory allAgents = new Agent[](agentCount);
        for (uint256 i = 0; i < agentCount; i++) {
            allAgents[i] = agents[i];
        }
        return allAgents;
    }

    function getDevicesByOwner(address _owner) public view returns (Device[] memory) {
        uint256[] memory ids = ownerDevices[_owner];
        Device[] memory result = new Device[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = devices[ids[i]];
        }
        return result;
    }

    function getAgentsByOwner(address _owner) public view returns (Agent[] memory) {
        uint256[] memory ids = ownerAgents[_owner];
        Agent[] memory result = new Agent[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = agents[ids[i]];
        }
        return result;
    }

    // New function: Allow device wallet to update its own ngrok link (non-breaking addition)
    function updateDeviceNgrokLink(string memory _newNgrokLink) public {
        // Find device where msg.sender is the device wallet address
        for (uint256 i = 0; i < deviceCount; i++) {
            if (devices[i].walletAddress == msg.sender) {
                // Update only the ngrok link, keeping all other data unchanged
                devices[i].ngrokLink = _newNgrokLink;
                
                // Emit existing event (non-breaking)
                emit DeviceUpdated(i, devices[i].deviceModel);
                return;
            }
        }
        revert("Device not found or unauthorized");
    }
}