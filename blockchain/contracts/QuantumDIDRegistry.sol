pragma solidity ^0.8.20;

/// @title Quantum DID Registry
/// @notice Base contract to register and resolve decentralized quantum identities
contract QuantumDIDRegistry {
    struct DIDRecord {
        address owner;
        string metadata; // JSON/IPFS reference to quantum state + biometric data
        uint256 createdAt;
    }

    mapping(bytes32 => DIDRecord) private dids;

    event DIDRegistered(bytes32 indexed did, address indexed owner, string metadata);
    event DIDUpdated(bytes32 indexed did, string newMetadata);

    modifier onlyOwner(bytes32 did) {
        require(dids[did].owner == msg.sender, "Not owner of DID");
        _;
    }

    function registerDID(bytes32 did, string memory metadata) external {
        require(dids[did].owner == address(0), "DID already exists");

        dids[did] = DIDRecord({
            owner: msg.sender,
            metadata: metadata,
            createdAt: block.timestamp
        });

        emit DIDRegistered(did, msg.sender, metadata);
    }

    function updateDID(bytes32 did, string memory newMetadata) external onlyOwner(did) {
        dids[did].metadata = newMetadata;
        emit DIDUpdated(did, newMetadata);
    }

    function resolveDID(bytes32 did) external view returns (DIDRecord memory) {
        return dids[did];
    }
}