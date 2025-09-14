pragma solidity ^0.8.20;

/// @title Swarm Consensus (simple quorum)
/// @notice Validators vote to approve proposals. Once quorum is reached, anyone may execute the proposal.
/// Note: The `execute` function simply marks approved; real effects should call other contracts via governance module.
contract SwarmConsensus {
    address public owner;
    mapping(address => bool) public validators;
    uint256 public validatorCount;
    uint256 public quorumNumerator = 2;
    uint256 public quorumDenominator = 3; // default 2/3

    struct Proposal {
        uint256 id;
        address proposer;
        string metadata; // what is being proposed (IPFS / JSON)
        uint256 createdAt;
        bool executed;
        uint256 yesVotes;
        uint256 noVotes;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    uint256 public nextProposalId = 1;

    event ValidatorAdded(address indexed v);
    event ValidatorRemoved(address indexed v);
    event ProposalCreated(uint256 id, address indexed proposer);
    event Voted(uint256 indexed id, address indexed voter, bool approve);
    event ProposalExecuted(uint256 indexed id);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    modifier onlyValidator() {
        require(validators[msg.sender], "not validator");
        _;
    }

    constructor(address[] memory initialValidators) {
        owner = msg.sender;
        for (uint256 i = 0; i < initialValidators.length; i++) {
            validators[initialValidators[i]] = true;
            validatorCount++;
        }
    }

    function addValidator(address v) external onlyOwner {
        if (!validators[v]) {
            validators[v] = true;
            validatorCount++;
            emit ValidatorAdded(v);
        }
    }

    function removeValidator(address v) external onlyOwner {
        if (validators[v]) {
            validators[v] = false;
            validatorCount--;
            emit ValidatorRemoved(v);
        }
    }

    function setQuorum(uint256 num, uint256 den) external onlyOwner {
        require(den > 0 && num <= den, "invalid quorum");
        quorumNumerator = num;
        quorumDenominator = den;
    }

    function createProposal(string calldata metadata) external onlyValidator returns (uint256) {
        uint256 id = nextProposalId++;
        proposals[id] = Proposal({
            id: id,
            proposer: msg.sender,
            metadata: metadata,
            createdAt: block.timestamp,
            executed: false,
            yesVotes: 0,
            noVotes: 0
        });
        emit ProposalCreated(id, msg.sender);
        return id;
    }

    function vote(uint256 proposalId, bool approve) external onlyValidator {
        require(!hasVoted[proposalId][msg.sender], "already voted");
        Proposal storage p = proposals[proposalId];
        require(!p.executed, "already executed");

        hasVoted[proposalId][msg.sender] = true;
        if (approve) {
            p.yesVotes += 1;
        } else {
            p.noVotes += 1;
        }
        emit Voted(proposalId, msg.sender, approve);
    }

    function isQuorumReached(uint256 proposalId) public view returns (bool) {
        Proposal storage p = proposals[proposalId];
        uint256 totalVotes = p.yesVotes + p.noVotes;
        // quorum is based on validatorCount: require yesVotes >= quorum * validatorCount
        // check yesVotes * denominator >= numerator * validatorCount
        return (p.yesVotes * quorumDenominator) >= (quorumNumerator * validatorCount);
    }

    /// @notice After quorum is reached this marks executed. Extend to call other contracts.
    function execute(uint256 proposalId) external {
        Proposal storage p = proposals[proposalId];
        require(!p.executed, "already executed");
        require(isQuorumReached(proposalId), "quorum not reached");
        p.executed = true;
        emit ProposalExecuted(proposalId);

        // NOTE: actual action (calls to other contracts) should be done via a separate governance/executor.
    }
}
