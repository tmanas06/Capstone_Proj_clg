// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title DisputeResolution
 * @dev Smart contract for handling disputes and arbitration
 * @notice Manages credential disputes, fraud allegations, and appeals
 */
contract DisputeResolution is AccessControl, Pausable, ReentrancyGuard {
    using Counters for Counters.Counter;

    bytes32 public constant ARBITRATOR_ROLE = keccak256("ARBITRATOR_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    Counters.Counter private _disputeIds;

    struct Dispute {
        uint256 disputeId;
        address disputer;
        address disputedParty;
        string reason;
        bytes32[] evidence; // IPFS hashes
        DisputeType disputeType;
        DisputeStatus status;
        uint256 createdAt;
        uint256 resolvedAt;
        address resolvedBy;
        bool favorDisputer;
        string resolutionNotes;
        uint256 appealDeadline;
        bool appealed;
    }

    struct Arbitration {
        uint256 disputeId;
        address arbitrator;
        bool favorDisputer;
        string notes;
        uint256 timestamp;
    }

    enum DisputeType {
        CREDENTIAL_VERIFICATION,
        FRAUD_ALLEGATION,
        REJECTED_CANDIDATE,
        JOB_POSTING_DISPUTE,
        PAYMENT_DISPUTE
    }

    enum DisputeStatus {
        Pending,
        UnderReview,
        Resolved,
        Appealed,
        Closed
    }

    mapping(uint256 => Dispute) public disputes;
    mapping(uint256 => Arbitration[]) public arbitrations; // disputeId => arbitrations
    mapping(address => bool) public arbitrators; // Multi-sig arbitrators
    mapping(address => uint256[]) public userDisputes; // user => dispute IDs

    uint256 public constant REQUIRED_ARBITRATOR_VOTES = 3;
    uint256 public constant TOTAL_ARBITRATORS = 5;
    uint256 public constant APPEAL_DEADLINE = 7 days;

    // Events
    event DisputeFiled(
        uint256 indexed disputeId,
        address indexed disputer,
        address indexed disputedParty,
        DisputeType disputeType
    );
    event ArbitrationSubmitted(
        uint256 indexed disputeId,
        address indexed arbitrator,
        bool favorDisputer
    );
    event DisputeResolved(
        uint256 indexed disputeId,
        bool favorDisputer,
        address resolvedBy
    );
    event DisputeAppealed(uint256 indexed disputeId, string newEvidence);
    event ArbitratorAdded(address indexed arbitrator);
    event ArbitratorRemoved(address indexed arbitrator);

    modifier validDispute(uint256 _disputeId) {
        require(_disputeId > 0 && _disputeId <= _disputeIds.current(), "Invalid dispute ID");
        _;
    }

    modifier onlyArbitrator() {
        require(arbitrators[msg.sender], "Not an arbitrator");
        _;
    }

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev File a dispute
     * @param _disputedParty Address of disputed party
     * @param _reason Reason for dispute
     * @param _evidence Array of evidence IPFS hashes
     * @param _disputeType Type of dispute
     */
    function fileDispute(
        address _disputedParty,
        string memory _reason,
        bytes32[] memory _evidence,
        DisputeType _disputeType
    ) external whenNotPaused {
        require(_disputedParty != address(0), "Invalid disputed party");
        require(_disputedParty != msg.sender, "Cannot dispute yourself");
        require(bytes(_reason).length > 0, "Reason required");
        require(_evidence.length > 0, "Evidence required");

        _disputeIds.increment();
        uint256 disputeId = _disputeIds.current();

        disputes[disputeId] = Dispute({
            disputeId: disputeId,
            disputer: msg.sender,
            disputedParty: _disputedParty,
            reason: _reason,
            evidence: _evidence,
            disputeType: _disputeType,
            status: DisputeStatus.Pending,
            createdAt: block.timestamp,
            resolvedAt: 0,
            resolvedBy: address(0),
            favorDisputer: false,
            resolutionNotes: "",
            appealDeadline: block.timestamp + APPEAL_DEADLINE,
            appealed: false
        });

        userDisputes[msg.sender].push(disputeId);
        userDisputes[_disputedParty].push(disputeId);

        emit DisputeFiled(disputeId, msg.sender, _disputedParty, _disputeType);
    }

    /**
     * @dev Submit arbitration decision
     * @param _disputeId ID of dispute
     * @param _favorDisputer Whether decision favors disputer
     * @param _notes Arbitration notes
     */
    function submitArbitration(
        uint256 _disputeId,
        bool _favorDisputer,
        string memory _notes
    ) external onlyArbitrator validDispute(_disputeId) whenNotPaused {
        Dispute storage dispute = disputes[_disputeId];
        require(
            dispute.status == DisputeStatus.Pending ||
                dispute.status == DisputeStatus.UnderReview,
            "Dispute not in review"
        );

        // Check if arbitrator already voted
        bool alreadyVoted = false;
        for (uint256 i = 0; i < arbitrations[_disputeId].length; i++) {
            if (arbitrations[_disputeId][i].arbitrator == msg.sender) {
                alreadyVoted = true;
                break;
            }
        }
        require(!alreadyVoted, "Already voted");

        // Record arbitration
        arbitrations[_disputeId].push(
            Arbitration({
                disputeId: _disputeId,
                arbitrator: msg.sender,
                favorDisputer: _favorDisputer,
                notes: _notes,
                timestamp: block.timestamp
            })
        );

        dispute.status = DisputeStatus.UnderReview;

        emit ArbitrationSubmitted(_disputeId, msg.sender, _favorDisputer);

        // Check if we have enough votes
        if (arbitrations[_disputeId].length >= REQUIRED_ARBITRATOR_VOTES) {
            _resolveDispute(_disputeId);
        }
    }

    /**
     * @dev Internal function to resolve dispute based on majority vote
     * @param _disputeId ID of dispute
     */
    function _resolveDispute(uint256 _disputeId) internal {
        Dispute storage dispute = disputes[_disputeId];
        Arbitration[] memory votes = arbitrations[_disputeId];

        uint256 favorVotes = 0;
        uint256 againstVotes = 0;

        for (uint256 i = 0; i < votes.length; i++) {
            if (votes[i].favorDisputer) {
                favorVotes++;
            } else {
                againstVotes++;
            }
        }

        dispute.favorDisputer = favorVotes > againstVotes;
        dispute.status = DisputeStatus.Resolved;
        dispute.resolvedAt = block.timestamp;
        dispute.resolvedBy = address(this); // Contract resolved

        emit DisputeResolved(_disputeId, dispute.favorDisputer, address(this));
    }

    /**
     * @dev Appeal a dispute resolution
     * @param _disputeId ID of dispute
     * @param _newEvidence New evidence (IPFS hash)
     */
    function appealDispute(uint256 _disputeId, string memory _newEvidence)
        external
        validDispute(_disputeId)
        whenNotPaused
    {
        Dispute storage dispute = disputes[_disputeId];
        require(
            dispute.disputer == msg.sender || dispute.disputedParty == msg.sender,
            "Not party to dispute"
        );
        require(dispute.status == DisputeStatus.Resolved, "Dispute not resolved");
        require(block.timestamp <= dispute.appealDeadline, "Appeal deadline passed");
        require(!dispute.appealed, "Already appealed");

        dispute.appealed = true;
        dispute.status = DisputeStatus.Appealed;

        // Add new evidence
        bytes32 evidenceHash = keccak256(bytes(_newEvidence));
        dispute.evidence.push(evidenceHash);

        // Reset arbitration votes for new review
        delete arbitrations[_disputeId];

        emit DisputeAppealed(_disputeId, _newEvidence);
    }

    /**
     * @dev Get dispute status
     * @param _disputeId ID of dispute
     */
    function getDisputeStatus(uint256 _disputeId)
        external
        view
        validDispute(_disputeId)
        returns (
            DisputeStatus status,
            address disputer,
            address disputedParty,
            DisputeType disputeType,
            uint256 createdAt,
            bool favorDisputer,
            uint256 arbitrationVotes
        )
    {
        Dispute memory dispute = disputes[_disputeId];
        return (
            dispute.status,
            dispute.disputer,
            dispute.disputedParty,
            dispute.disputeType,
            dispute.createdAt,
            dispute.favorDisputer,
            arbitrations[_disputeId].length
        );
    }

    /**
     * @dev Get dispute details
     * @param _disputeId ID of dispute
     */
    function getDisputeDetails(uint256 _disputeId)
        external
        view
        validDispute(_disputeId)
        returns (
            address disputer,
            address disputedParty,
            string memory reason,
            bytes32[] memory evidence,
            DisputeType disputeType,
            DisputeStatus status,
            uint256 createdAt,
            bool favorDisputer,
            string memory resolutionNotes
        )
    {
        Dispute memory dispute = disputes[_disputeId];
        return (
            dispute.disputer,
            dispute.disputedParty,
            dispute.reason,
            dispute.evidence,
            dispute.disputeType,
            dispute.status,
            dispute.createdAt,
            dispute.favorDisputer,
            dispute.resolutionNotes
        );
    }

    /**
     * @dev Get disputes for a user
     * @param _user Address of user
     * @return disputeIds Array of dispute IDs
     */
    function getUserDisputes(address _user)
        external
        view
        returns (uint256[] memory disputeIds)
    {
        return userDisputes[_user];
    }

    /**
     * @dev Admin functions
     */
    function addArbitrator(address _arbitrator) external onlyRole(ADMIN_ROLE) {
        require(
            !arbitrators[_arbitrator],
            "Already an arbitrator"
        );
        require(
            _getArbitratorCount() < TOTAL_ARBITRATORS,
            "Maximum arbitrators reached"
        );

        arbitrators[_arbitrator] = true;
        _grantRole(ARBITRATOR_ROLE, _arbitrator);

        emit ArbitratorAdded(_arbitrator);
    }

    function removeArbitrator(address _arbitrator) external onlyRole(ADMIN_ROLE) {
        require(arbitrators[_arbitrator], "Not an arbitrator");

        arbitrators[_arbitrator] = false;
        _revokeRole(ARBITRATOR_ROLE, _arbitrator);

        emit ArbitratorRemoved(_arbitrator);
    }

    function _getArbitratorCount() internal view returns (uint256) {
        // This would need to track count separately or iterate
        // For simplicity, we'll use a separate counter
        return 0; // Placeholder
    }

    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Get total disputes count
     */
    function getTotalDisputes() external view returns (uint256) {
        return _disputeIds.current();
    }
}

