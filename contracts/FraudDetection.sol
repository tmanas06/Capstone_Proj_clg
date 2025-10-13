// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title FraudDetection
 * @dev Advanced fraud detection system for Web3 Job Platform
 * @notice Implements multiple fraud detection mechanisms and reputation scoring
 */
contract FraudDetection is Ownable, ReentrancyGuard {
    using ECDSA for bytes32;

    // Fraud detection parameters
    uint256 public constant MAX_APPLICATIONS_PER_DAY = 10;
    uint256 public constant MAX_JOBS_PER_DAY = 5;
    uint256 public constant MIN_REPUTATION_FOR_POSTING = 50;
    uint256 public constant FRAUD_PENALTY_PERCENTAGE = 25; // 25% reputation penalty
    
    // Reputation thresholds
    uint256 public constant EXCELLENT_REPUTATION = 800;
    uint256 public constant GOOD_REPUTATION = 600;
    uint256 public constant AVERAGE_REPUTATION = 400;
    uint256 public constant POOR_REPUTATION = 200;
    
    // Structs for fraud detection
    struct UserActivity {
        uint256 lastActivityTimestamp;
        uint256 dailyApplications;
        uint256 dailyJobPosts;
        uint256 totalApplications;
        uint256 totalJobPosts;
        uint256 fraudReports;
        uint256 successfulJobs;
        uint256 failedJobs;
        mapping(uint256 => bool) reportedJobs; // jobId => reported
        mapping(uint256 => bool) reportedApplications; // applicationId => reported
    }
    
    struct FraudReport {
        uint256 reportId;
        address reporter;
        address reportedUser;
        string reason;
        uint256 severity; // 1-5 scale
        string evidence; // IPFS hash or URL
        bool isResolved;
        bool isValid;
        uint256 timestamp;
        uint256 resolvedAt;
        address resolvedBy;
    }
    
    struct ReputationScore {
        uint256 baseScore;
        uint256 activityScore;
        uint256 qualityScore;
        uint256 fraudPenalty;
        uint256 totalScore;
        uint256 lastUpdated;
    }
    
    // Mappings
    mapping(address => UserActivity) public userActivities;
    mapping(uint256 => FraudReport) public fraudReports;
    mapping(address => ReputationScore) public reputationScores;
    mapping(address => bool) public trustedVerifiers;
    mapping(address => bool) public blacklistedUsers;
    
    // Counters
    uint256 public totalFraudReports;
    uint256 public resolvedFraudReports;
    
    // Events
    event FraudReported(uint256 indexed reportId, address indexed reporter, address indexed reportedUser, string reason);
    event FraudReportResolved(uint256 indexed reportId, bool isValid, address resolvedBy);
    event UserBlacklisted(address indexed user, string reason);
    event UserUnblacklisted(address indexed user);
    event ReputationUpdated(address indexed user, uint256 newScore, uint256 penalty);
    event ActivityDetected(address indexed user, string activityType, uint256 count);
    
    // Modifiers
    modifier onlyTrustedVerifier() {
        require(trustedVerifiers[msg.sender], "Not a trusted verifier");
        _;
    }
    
    modifier notBlacklisted() {
        require(!blacklistedUsers[msg.sender], "User is blacklisted");
        _;
    }
    
    modifier validSeverity(uint256 _severity) {
        require(_severity >= 1 && _severity <= 5, "Invalid severity level");
        _;
    }
    
    constructor() Ownable() {
        // Initialize owner as trusted verifier
        trustedVerifiers[msg.sender] = true;
    }
    
    /**
     * @dev Report fraud activity
     */
    function reportFraud(
        address _reportedUser,
        string memory _reason,
        uint256 _severity,
        string memory _evidence,
        bytes memory _signature
    ) external notBlacklisted validSeverity(_severity) {
        require(_reportedUser != address(0), "Invalid reported user");
        require(_reportedUser != msg.sender, "Cannot report yourself");
        require(bytes(_reason).length > 0, "Reason required");
        require(bytes(_evidence).length > 0, "Evidence required");
        
        // Verify signature
        bytes32 messageHash = keccak256(abi.encodePacked(_reportedUser, _reason, _severity, _evidence));
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        address signer = ethSignedMessageHash.recover(_signature);
        require(signer == msg.sender, "Invalid signature");
        
        totalFraudReports++;
        uint256 reportId = totalFraudReports;
        
        fraudReports[reportId] = FraudReport({
            reportId: reportId,
            reporter: msg.sender,
            reportedUser: _reportedUser,
            reason: _reason,
            severity: _severity,
            evidence: _evidence,
            isResolved: false,
            isValid: false,
            timestamp: block.timestamp,
            resolvedAt: 0,
            resolvedBy: address(0)
        });
        
        // Update user activity
        userActivities[_reportedUser].fraudReports++;
        
        emit FraudReported(reportId, msg.sender, _reportedUser, _reason);
    }
    
    /**
     * @dev Resolve fraud report (only trusted verifiers)
     */
    function resolveFraudReport(uint256 _reportId, bool _isValid) 
        external 
        onlyTrustedVerifier 
    {
        require(_reportId > 0 && _reportId <= totalFraudReports, "Invalid report ID");
        FraudReport storage report = fraudReports[_reportId];
        require(!report.isResolved, "Report already resolved");
        
        report.isResolved = true;
        report.isValid = _isValid;
        report.resolvedAt = block.timestamp;
        report.resolvedBy = msg.sender;
        
        resolvedFraudReports++;
        
        if (_isValid) {
            // Apply fraud penalty
            _applyFraudPenalty(report.reportedUser, report.severity);
        }
        
        emit FraudReportResolved(_reportId, _isValid, msg.sender);
    }
    
    /**
     * @dev Apply fraud penalty to user reputation
     */
    function _applyFraudPenalty(address _user, uint256 _severity) internal {
        ReputationScore storage score = reputationScores[_user];
        
        // Calculate penalty based on severity
        uint256 penalty = (score.totalScore * FRAUD_PENALTY_PERCENTAGE * _severity) / 100;
        score.fraudPenalty += penalty;
        score.totalScore = _calculateTotalScore(_user);
        score.lastUpdated = block.timestamp;
        
        // Blacklist user if reputation falls below threshold
        if (score.totalScore < 50) {
            blacklistedUsers[_user] = true;
            emit UserBlacklisted(_user, "Reputation below threshold");
        }
        
        emit ReputationUpdated(_user, score.totalScore, penalty);
    }
    
    /**
     * @dev Track user activity for fraud detection
     */
    function trackActivity(address _user, string memory _activityType) external {
        UserActivity storage activity = userActivities[_user];
        
        // Reset daily counters if new day
        if (block.timestamp >= activity.lastActivityTimestamp + 1 days) {
            activity.dailyApplications = 0;
            activity.dailyJobPosts = 0;
            activity.lastActivityTimestamp = block.timestamp;
        }
        
        if (keccak256(bytes(_activityType)) == keccak256(bytes("application"))) {
            activity.dailyApplications++;
            activity.totalApplications++;
            
            // Check for suspicious activity
            if (activity.dailyApplications > MAX_APPLICATIONS_PER_DAY) {
                _flagSuspiciousActivity(_user, "Excessive applications");
            }
        } else if (keccak256(bytes(_activityType)) == keccak256(bytes("job_post"))) {
            activity.dailyJobPosts++;
            activity.totalJobPosts++;
            
            // Check for suspicious activity
            if (activity.dailyJobPosts > MAX_JOBS_PER_DAY) {
                _flagSuspiciousActivity(_user, "Excessive job posts");
            }
        }
        
        emit ActivityDetected(_user, _activityType, 
            keccak256(bytes(_activityType)) == keccak256(bytes("application")) 
                ? activity.dailyApplications 
                : activity.dailyJobPosts
        );
    }
    
    /**
     * @dev Flag suspicious activity
     */
    function _flagSuspiciousActivity(address _user, string memory _reason) internal {
        // In a real implementation, this would trigger additional verification
        // For now, we'll just emit an event
        emit FraudReported(0, address(this), _user, _reason);
    }
    
    /**
     * @dev Calculate comprehensive reputation score
     */
    function calculateReputationScore(address _user) external view returns (uint256) {
        return _calculateTotalScore(_user);
    }
    
    /**
     * @dev Internal function to calculate total reputation score
     */
    function _calculateTotalScore(address _user) internal view returns (uint256) {
        UserActivity storage activity = userActivities[_user];
        ReputationScore storage score = reputationScores[_user];
        
        // Base score (starts at 100)
        uint256 baseScore = 100;
        
        // Activity score based on successful jobs
        uint256 activityScore = activity.successfulJobs * 10;
        
        // Quality score based on success rate
        uint256 totalJobs = activity.successfulJobs + activity.failedJobs;
        uint256 qualityScore = 0;
        if (totalJobs > 0) {
            qualityScore = (activity.successfulJobs * 100) / totalJobs;
        }
        
        // Calculate total score
        uint256 totalScore = baseScore + activityScore + qualityScore - score.fraudPenalty;
        
        // Ensure score doesn't go below 0
        if (totalScore < 0) {
            totalScore = 0;
        }
        
        return totalScore;
    }
    
    /**
     * @dev Update reputation score
     */
    function updateReputationScore(address _user) external {
        ReputationScore storage score = reputationScores[_user];
        UserActivity storage activity = userActivities[_user];
        
        score.baseScore = 100;
        score.activityScore = activity.successfulJobs * 10;
        
        uint256 totalJobs = activity.successfulJobs + activity.failedJobs;
        score.qualityScore = 0;
        if (totalJobs > 0) {
            score.qualityScore = (activity.successfulJobs * 100) / totalJobs;
        }
        
        score.totalScore = _calculateTotalScore(_user);
        score.lastUpdated = block.timestamp;
        
        emit ReputationUpdated(_user, score.totalScore, 0);
    }
    
    /**
     * @dev Record successful job completion
     */
    function recordSuccessfulJob(address _user) external {
        userActivities[_user].successfulJobs++;
        _updateReputationScore(_user);
    }
    
    /**
     * @dev Record failed job
     */
    function recordFailedJob(address _user) external {
        userActivities[_user].failedJobs++;
        _updateReputationScore(_user);
    }
    
    /**
     * @dev Internal function to update reputation score
     */
    function _updateReputationScore(address _user) internal {
        ReputationScore storage score = reputationScores[_user];
        score.totalScore = _calculateTotalScore(_user);
        score.lastUpdated = block.timestamp;
        
        emit ReputationUpdated(_user, score.totalScore, 0);
    }
    
    /**
     * @dev Admin functions
     */
    function addTrustedVerifier(address _verifier) external onlyOwner {
        trustedVerifiers[_verifier] = true;
    }
    
    function removeTrustedVerifier(address _verifier) external onlyOwner {
        trustedVerifiers[_verifier] = false;
    }
    
    function unblacklistUser(address _user) external onlyOwner {
        blacklistedUsers[_user] = false;
        emit UserUnblacklisted(_user);
    }
    
    function blacklistUser(address _user, string memory _reason) external onlyOwner {
        blacklistedUsers[_user] = true;
        emit UserBlacklisted(_user, _reason);
    }
    
    /**
     * @dev View functions
     */
    function getUserActivity(address _user) external view returns (
        uint256 dailyApplications,
        uint256 dailyJobPosts,
        uint256 totalApplications,
        uint256 totalJobPosts,
        uint256 fraudReportCount,
        uint256 successfulJobs,
        uint256 failedJobs
    ) {
        UserActivity storage activity = userActivities[_user];
        return (
            activity.dailyApplications,
            activity.dailyJobPosts,
            activity.totalApplications,
            activity.totalJobPosts,
            activity.fraudReports,
            activity.successfulJobs,
            activity.failedJobs
        );
    }
    
    function getReputationScore(address _user) external view returns (
        uint256 baseScore,
        uint256 activityScore,
        uint256 qualityScore,
        uint256 fraudPenalty,
        uint256 totalScore,
        uint256 lastUpdated
    ) {
        ReputationScore storage score = reputationScores[_user];
        return (
            score.baseScore,
            score.activityScore,
            score.qualityScore,
            score.fraudPenalty,
            score.totalScore,
            score.lastUpdated
        );
    }
    
    function getFraudReport(uint256 _reportId) external view returns (
        uint256 reportId,
        address reporter,
        address reportedUser,
        string memory reason,
        uint256 severity,
        string memory evidence,
        bool isResolved,
        bool isValid,
        uint256 timestamp,
        uint256 resolvedAt,
        address resolvedBy
    ) {
        FraudReport storage report = fraudReports[_reportId];
        return (
            report.reportId,
            report.reporter,
            report.reportedUser,
            report.reason,
            report.severity,
            report.evidence,
            report.isResolved,
            report.isValid,
            report.timestamp,
            report.resolvedAt,
            report.resolvedBy
        );
    }
    
    function isUserBlacklisted(address _user) external view returns (bool) {
        return blacklistedUsers[_user];
    }
    
    function getTotalFraudReports() external view returns (uint256, uint256) {
        return (totalFraudReports, resolvedFraudReports);
    }
}
