// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Trust Fabric
/// @notice Maintains trust scores for identities in a quantum identity network
contract TrustFabric {
    struct TrustRecord {
        uint256 score;     // scaled (e.g. score * 1e6)
        uint256 entropy;   // scaled (e.g. entropy * 1e6)
        uint256 updatedAt; // unix timestamp
    }

    mapping(string => TrustRecord) private trustScores;
    string[] private identities; // for ranking iteration

    event TrustUpdated(string indexed identityId, uint256 score, uint256 entropy, uint256 updatedAt);

    /// @notice Update trust score for an identity
    /// @dev callable by off-chain oracle (FastAPI service)
    function updateTrust(string memory identityId, uint256 score, uint256 entropy) external {
        TrustRecord storage rec = trustScores[identityId];

        if (rec.updatedAt == 0) {
            identities.push(identityId);
        }

        rec.score = score;
        rec.entropy = entropy;
        rec.updatedAt = block.timestamp;

        emit TrustUpdated(identityId, score, entropy, block.timestamp);
    }

    /// @notice Get trust record for an identity
    function getTrust(string memory identityId) external view returns (TrustRecord memory) {
        return trustScores[identityId];
    }

    /// @notice Get all identities tracked
    function getAllIdentities() external view returns (string[] memory) {
        return identities;
    }

    /// @notice Get ranked identities by trust score (descending)
    /// @dev naive on-chain sort — better done off-chain with events
    function rankIdentities() external view returns (string[] memory, uint256[] memory) {
        uint256 n = identities.length;
        uint256[] memory scores = new uint256[](n);
        string[] memory ids = new string[](n);

        for (uint256 i = 0; i < n; i++) {
            ids[i] = identities[i];
            scores[i] = trustScores[identities[i]].score;
        }

        // simple bubble sort (not gas efficient, for demo only)
        for (uint256 i = 0; i < n; i++) {
            for (uint256 j = i + 1; j < n; j++) {
                if (scores[j] > scores[i]) {
                    (scores[i], scores[j]) = (scores[j], scores[i]);
                    (ids[i], ids[j]) = (ids[j], ids[i]);
                }
            }
        }

        return (ids, scores);
    }
}
