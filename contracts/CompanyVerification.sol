// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title CompanyVerification
 * @dev Smart contract for company verification with trust scoring
 * @notice Manages company registration, officer verification, and trust metrics
 */
contract CompanyVerification is AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    struct Company {
        bytes32 companyNameHash;
        address[] authorizedOfficers;
        uint256 registrationTime;
        bool verified;
        uint8 trustScore;
        uint256 jobPostingsCount;
        uint256 hiresCount;
        uint256 complaintsCount;
        uint256 lastActivityTime;
        mapping(address => bool) isOfficerVerified;
    }

    mapping(address => Company) public companies;
    mapping(bytes32 => bool) public verifiedDomains; // Domain hash => verified
    address[] public registeredCompanies;

    // Trust score constants
    uint8 public constant BASE_TRUST_SCORE = 50;
    uint8 public constant OFFICER_BONUS = 10;
    uint8 public constant HIRE_BONUS = 2;
    uint8 public constant COMPLAINT_PENALTY = 5;
    uint256 public constant DECAY_PERIOD = 30 days;

    // Events
    event CompanyRegistered(address indexed company, bytes32 indexed companyHash);
    event OfficerVerified(address indexed company, address indexed officer, bool status);
    event TrustScoreUpdated(address indexed company, uint8 newScore);
    event HireRecorded(address indexed company, address indexed candidate);
    event VerificationRevoked(address indexed company, string reason);
    event ComplaintFiled(address indexed company, address indexed complainant);

    modifier onlyCompany(address _company) {
        require(companies[_company].registrationTime > 0, "Company not registered");
        _;
    }

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Register a new company
     * @param _companyHash Hash of company name/identifier
     * @param _officers Array of authorized officer addresses
     */
    function registerCompany(bytes32 _companyHash, address[] memory _officers) 
        external 
        whenNotPaused 
    {
        require(companies[msg.sender].registrationTime == 0, "Company already registered");
        require(_companyHash != bytes32(0), "Invalid company hash");
        require(_officers.length > 0, "At least one officer required");

        companies[msg.sender].companyNameHash = _companyHash;
        companies[msg.sender].authorizedOfficers = _officers;
        companies[msg.sender].registrationTime = block.timestamp;
        companies[msg.sender].trustScore = BASE_TRUST_SCORE;
        companies[msg.sender].lastActivityTime = block.timestamp;
        companies[msg.sender].verified = false;

        registeredCompanies.push(msg.sender);

        emit CompanyRegistered(msg.sender, _companyHash);
    }

    /**
     * @dev Verify a company officer through Self Protocol
     * @param _company Address of company
     * @param _officer Address of officer
     * @param _status Verification status
     */
    function verifyCompanyOfficer(address _company, address _officer, bool _status) 
        external 
        onlyRole(VERIFIER_ROLE) 
        onlyCompany(_company) 
        whenNotPaused 
    {
        require(_officer != address(0), "Invalid officer address");
        
        bool isOfficer = false;
        for (uint256 i = 0; i < companies[_company].authorizedOfficers.length; i++) {
            if (companies[_company].authorizedOfficers[i] == _officer) {
                isOfficer = true;
                break;
            }
        }
        require(isOfficer, "Not an authorized officer");

        companies[_company].isOfficerVerified[_officer] = _status;
        
        // Update trust score
        if (_status) {
            companies[_company].trustScore = uint8(uint256(companies[_company].trustScore) + OFFICER_BONUS);
        }

        // Mark company as verified if all officers are verified
        bool allVerified = true;
        for (uint256 i = 0; i < companies[_company].authorizedOfficers.length; i++) {
            if (!companies[_company].isOfficerVerified[companies[_company].authorizedOfficers[i]]) {
                allVerified = false;
                break;
            }
        }
        
        if (allVerified && companies[_company].authorizedOfficers.length > 0) {
            companies[_company].verified = true;
        }

        emit OfficerVerified(_company, _officer, _status);
        emit TrustScoreUpdated(_company, companies[_company].trustScore);
    }

    /**
     * @dev Calculate and update trust score dynamically
     * @param _company Address of company
     */
    function calculateTrustScore(address _company) 
        external 
        onlyCompany(_company) 
        returns (uint8) 
    {
        Company storage company = companies[_company];
        
        // Base score
        uint256 score = BASE_TRUST_SCORE;
        
        // Add points for verified officers
        uint256 verifiedOfficers = 0;
        for (uint256 i = 0; i < company.authorizedOfficers.length; i++) {
            if (company.isOfficerVerified[company.authorizedOfficers[i]]) {
                verifiedOfficers++;
            }
        }
        score += verifiedOfficers * OFFICER_BONUS;
        
        // Add points for successful hires
        score += company.hiresCount * HIRE_BONUS;
        
        // Subtract points for complaints
        score = score > (company.complaintsCount * COMPLAINT_PENALTY) 
            ? score - (company.complaintsCount * COMPLAINT_PENALTY) 
            : 0;
        
        // Apply decay if no activity for 30 days
        if (block.timestamp > company.lastActivityTime + DECAY_PERIOD) {
            uint256 daysSinceActivity = (block.timestamp - company.lastActivityTime) / 1 days;
            uint256 decayAmount = daysSinceActivity / 30; // 1 point per 30 days
            score = score > decayAmount ? score - decayAmount : 0;
        }
        
        // Cap at 100
        if (score > 100) {
            score = 100;
        }
        
        company.trustScore = uint8(score);
        company.lastActivityTime = block.timestamp;
        
        emit TrustScoreUpdated(_company, company.trustScore);
        
        return company.trustScore;
    }

    /**
     * @dev Update job posting count
     * @param _company Address of company
     */
    function updateJobPostingCount(address _company) 
        external 
        onlyCompany(_company) 
        whenNotPaused 
    {
        companies[_company].jobPostingsCount++;
        companies[_company].lastActivityTime = block.timestamp;
    }

    /**
     * @dev Record a successful hire
     * @param _company Address of company
     * @param _candidate Address of hired candidate
     */
    function recordHire(address _company, address _candidate) 
        external 
        onlyRole(VERIFIER_ROLE) 
        onlyCompany(_company) 
        whenNotPaused 
    {
        require(_candidate != address(0), "Invalid candidate address");
        
        companies[_company].hiresCount++;
        companies[_company].lastActivityTime = block.timestamp;
        
        // Update trust score
        if (companies[_company].trustScore < 100) {
            companies[_company].trustScore = uint8(uint256(companies[_company].trustScore) + HIRE_BONUS);
            if (companies[_company].trustScore > 100) {
                companies[_company].trustScore = 100;
            }
        }
        
        emit HireRecorded(_company, _candidate);
        emit TrustScoreUpdated(_company, companies[_company].trustScore);
    }

    /**
     * @dev File a complaint against a company
     * @param _company Address of company
     */
    function fileComplaint(address _company) 
        external 
        onlyCompany(_company) 
        whenNotPaused 
    {
        companies[_company].complaintsCount++;
        
        // Apply penalty
        if (companies[_company].trustScore >= COMPLAINT_PENALTY) {
            companies[_company].trustScore -= COMPLAINT_PENALTY;
        } else {
            companies[_company].trustScore = 0;
        }
        
        emit ComplaintFiled(_company, msg.sender);
        emit TrustScoreUpdated(_company, companies[_company].trustScore);
    }

    /**
     * @dev Get company trust score
     * @param _company Address of company
     * @return score Current trust score
     */
    function getCompanyTrustScore(address _company) 
        external 
        view 
        onlyCompany(_company) 
        returns (uint8 score) 
    {
        return companies[_company].trustScore;
    }

    /**
     * @dev Revoke company verification (admin only)
     * @param _company Address of company
     * @param _reason Reason for revocation
     */
    function revokeCompanyVerification(address _company, string memory _reason) 
        external 
        onlyRole(ADMIN_ROLE) 
        onlyCompany(_company) 
    {
        companies[_company].verified = false;
        companies[_company].trustScore = 0;
        
        emit VerificationRevoked(_company, _reason);
        emit TrustScoreUpdated(_company, 0);
    }

    /**
     * @dev Get company information
     * @param _company Address of company
     */
    function getCompanyInfo(address _company) 
        external 
        view 
        onlyCompany(_company) 
        returns (
            bytes32 companyNameHash,
            uint256 registrationTime,
            bool verified,
            uint8 trustScore,
            uint256 jobPostingsCount,
            uint256 hiresCount,
            uint256 complaintsCount,
            uint256 officerCount
        ) 
    {
        Company storage company = companies[_company];
        return (
            company.companyNameHash,
            company.registrationTime,
            company.verified,
            company.trustScore,
            company.jobPostingsCount,
            company.hiresCount,
            company.complaintsCount,
            company.authorizedOfficers.length
        );
    }

    /**
     * @dev Get authorized officers for a company
     * @param _company Address of company
     * @return officers Array of officer addresses
     */
    function getAuthorizedOfficers(address _company) 
        external 
        view 
        onlyCompany(_company) 
        returns (address[] memory officers) 
    {
        return companies[_company].authorizedOfficers;
    }

    /**
     * @dev Check if officer is verified
     * @param _company Address of company
     * @param _officer Address of officer
     * @return isVerified Whether officer is verified
     */
    function isOfficerVerified(address _company, address _officer) 
        external 
        view 
        onlyCompany(_company) 
        returns (bool isVerified) 
    {
        return companies[_company].isOfficerVerified[_officer];
    }

    /**
     * @dev Admin functions
     */
    function addVerifier(address _verifier) external onlyRole(ADMIN_ROLE) {
        _grantRole(VERIFIER_ROLE, _verifier);
    }

    function removeVerifier(address _verifier) external onlyRole(ADMIN_ROLE) {
        _revokeRole(VERIFIER_ROLE, _verifier);
    }

    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Get total registered companies
     */
    function getTotalCompanies() external view returns (uint256) {
        return registeredCompanies.length;
    }
}

