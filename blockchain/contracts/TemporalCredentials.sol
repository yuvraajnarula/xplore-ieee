pragma solidity ^0.8.20;

import "./QuantumDIDRegistry.sol";

/// @title Temporal Credentials
/// @notice Issue credentials tied to DIDs that become usable only after a release time.
contract TemporalCredentials {
    QuantumDIDRegistry public registry;
    uint256 private _nextCredentialId = 1;

    enum CredentialStatus { Active, Revoked, Claimed }

    struct Credential {
        uint256 id;
        bytes32 subjectDid;   // DID hash
        address issuer;       // who issued
        string uri;           // metadata pointer (IPFS / JSON)
        uint256 issuedAt;
        uint256 validFrom;    // credential effective from
        uint256 validUntil;   // optional expiry (0 = no expiry)
        uint256 releaseAt;    // time lock: cannot claim before this
        CredentialStatus status;
        bytes32 onChainProof; // optional link to temporal-lock tx or proof
    }

    mapping(uint256 => Credential) public credentials;
    mapping(bytes32 => uint256[]) public credentialsByDid;

    event CredentialIssued(uint256 indexed id, bytes32 indexed subjectDid, address indexed issuer, uint256 releaseAt);
    event CredentialRevoked(uint256 indexed id, address indexed revokedBy);
    event CredentialClaimed(uint256 indexed id, address indexed claimer, uint256 at, bytes32 onChainProof);

    modifier onlyIssuer(uint256 credentialId) {
        require(credentials[credentialId].issuer == msg.sender, "Not issuer");
        _;
    }

    constructor(address registryAddr) {
        registry = QuantumDIDRegistry(registryAddr);
    }

    /// @notice Issue a time-locked credential to a DID
    function issueCredential(
        bytes32 subjectDid,
        string calldata uri,
        uint256 validFrom,
        uint256 validUntil,
        uint256 releaseAt,
        bytes32 onChainProof
    ) external returns (uint256) {
        require(releaseAt >= block.timestamp, "releaseAt must be >= now");
        uint256 id = _nextCredentialId++;
        credentials[id] = Credential({
            id: id,
            subjectDid: subjectDid,
            issuer: msg.sender,
            uri: uri,
            issuedAt: block.timestamp,
            validFrom: validFrom,
            validUntil: validUntil,
            releaseAt: releaseAt,
            status: CredentialStatus.Active,
            onChainProof: onChainProof
        });
        credentialsByDid[subjectDid].push(id);

        emit CredentialIssued(id, subjectDid, msg.sender, releaseAt);
        return id;
    }

    /// @notice Revoke credential (issuer-only)
    function revokeCredential(uint256 id) external onlyIssuer(id) {
        Credential storage c = credentials[id];
        require(c.status == CredentialStatus.Active, "Not active");
        c.status = CredentialStatus.Revoked;
        emit CredentialRevoked(id, msg.sender);
    }

    /// @notice Claim a credential after releaseAt; callable by DID owner or subject
    /// Returns onChainProof if present.
    function claimCredential(uint256 id) external returns (bytes32) {
        Credential storage c = credentials[id];
        require(c.status == CredentialStatus.Active, "Credential not active");
        require(block.timestamp >= c.releaseAt, "Credential is time-locked");
        if (c.validFrom != 0) {
            require(block.timestamp >= c.validFrom, "Not yet valid");
        }
        if (c.validUntil != 0) {
            require(block.timestamp <= c.validUntil, "Credential expired");
        }

        // Allow claim only by DID owner or the issuer (flexible)
        address didOwner = registry.ownerOf(c.subjectDid);
        require(msg.sender == didOwner || msg.sender == c.issuer, "Not authorized to claim");

        c.status = CredentialStatus.Claimed;
        emit CredentialClaimed(id, msg.sender, block.timestamp, c.onChainProof);
        return c.onChainProof;
    }

    /// @notice Query credentials for a DID
    function getCredentialsForDid(bytes32 did) external view returns (uint256[] memory) {
        return credentialsByDid[did];
    }

    /// @notice Simple helper to check if credential is claimable now
    function isClaimable(uint256 id) external view returns (bool) {
        Credential storage c = credentials[id];
        if (c.status != CredentialStatus.Active) return false;
        if (block.timestamp < c.releaseAt) return false;
        if (c.validFrom != 0 && block.timestamp < c.validFrom) return false;
        if (c.validUntil != 0 && block.timestamp > c.validUntil) return false;
        return true;
    }
}
