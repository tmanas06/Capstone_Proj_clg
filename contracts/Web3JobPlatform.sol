// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title Web3JobPlatform
 * @dev A comprehensive Web3 job platform with fraud prevention mechanisms
 * @notice Built for Yellow Network with anti-fraud features
 */
contract Web3JobPlatform is ReentrancyGuard, Pausable, Ownable {
    using Counters for Counters.Counter;
    using ECDSA for bytes32;

    // Counters for unique IDs
    Counters.Counter private _jobIds;
    Counters.Counter private _applicationIds;
    Counters.Counter private _companyIds;
    Counters.Counter private _developerIds;

    // Token for staking (can be any ERC20 token)
    IERC20 public stakingToken;

    // Platform fees and limits
    uint256 public constant PLATFORM_FEE_PERCENTAGE = 5; // 5% platform fee
    uint256 public constant MIN_STAKE_AMOUNT = 1000 * 10**18; // 1000 tokens minimum stake
    uint256 public constant MAX_STAKE_AMOUNT = 100000 * 10**18; // 100k tokens maximum stake
    uint256 public constant STAKE_DURATION = 30 days; // Minimum stake duration

    // Structs
    struct Company {
        uint256 id;
        address wallet;
        string name;
        string description;
        string website;
        string logoUrl;
        uint256 reputation;
        uint256 stakedAmount;
        uint256 stakeTimestamp;
        bool isVerified;
        bool isActive;
        mapping(string => bool) skillsVerified; // Skills they can verify
    }

    struct Developer {
        uint256 id;
        address wallet;
        string name;
        string email;
        string github;
        string portfolio;
        uint256 reputation;
        uint256[] skillScores; // Array of skill scores
        string[] skills; // Array of skills
        bool isVerified;
        bool isActive;
        mapping(address => uint256) companyEndorsements; // Company endorsements
    }

    struct Job {
        uint256 id;
        uint256 companyId;
        string title;
        string description;
        string[] requiredSkills;
        uint256[] skillWeights; // Weight for each required skill
        uint256 salaryMin;
        uint256 salaryMax;
        uint256 deadline;
        JobStatus status;
        JobType jobType;
        uint256 maxApplications;
        uint256 applicationCount;
        uint256 stakedAmount;
        uint256 createdAt;
        uint256 updatedAt;
    }

    struct Application {
        uint256 id;
        uint256 jobId;
        uint256 developerId;
        string coverLetter;
        uint256[] skillScores; // Developer's claimed skill scores
        uint256[] portfolioLinks; // Array of portfolio item IDs
        ApplicationStatus status;
        uint256 appliedAt;
        uint256 reviewedAt;
        uint256 hiredAt;
        uint256 completedAt;
        string companyFeedback;
        uint256 rating;
    }

    struct SkillVerification {
        address verifier;
        uint256 developerId;
        string skill;
        uint256 score;
        string evidence; // IPFS hash or URL
        uint256 timestamp;
        bool isValid;
    }

    // Enums
    enum JobStatus { Active, Paused, Closed, Completed }
    enum JobType { FullTime, PartTime, Contract, Internship, Freelance }
    enum ApplicationStatus { Pending, UnderReview, Accepted, Rejected, Hired, Completed }

    // Mappings
    mapping(uint256 => Company) public companies;
    mapping(address => uint256) public companyAddressToId;
    mapping(uint256 => Developer) public developers;
    mapping(address => uint256) public developerAddressToId;
    mapping(uint256 => Job) public jobs;
    mapping(uint256 => Application) public applications;
    mapping(bytes32 => SkillVerification) public skillVerifications;
    mapping(address => bool) public verifiedSkillVerifiers;
    mapping(uint256 => mapping(uint256 => bool)) public hasApplied; // jobId => developerId => applied

    // Events
    event CompanyRegistered(uint256 indexed companyId, address indexed wallet, string name);
    event DeveloperRegistered(uint256 indexed developerId, address indexed wallet, string name);
    event JobPosted(uint256 indexed jobId, uint256 indexed companyId, string title);
    event ApplicationSubmitted(uint256 indexed applicationId, uint256 indexed jobId, uint256 indexed developerId);
    event SkillVerified(uint256 indexed developerId, string skill, uint256 score, address verifier);
    event StakeDeposited(uint256 indexed companyId, uint256 amount);
    event StakeWithdrawn(uint256 indexed companyId, uint256 amount);
    event ApplicationHired(uint256 indexed applicationId, uint256 indexed jobId, uint256 indexed developerId);
    event JobCompleted(uint256 indexed applicationId, uint256 indexed jobId, uint256 rating);
    event ReputationUpdated(uint256 indexed entityId, uint256 newReputation, bool isCompany);

    // Modifiers
    modifier onlyCompany(uint256 companyId) {
        require(companyAddressToId[msg.sender] == companyId, "Not authorized company");
        require(companies[companyId].isActive, "Company not active");
        _;
    }

    modifier onlyDeveloper(uint256 developerId) {
        require(developerAddressToId[msg.sender] == developerId, "Not authorized developer");
        require(developers[developerId].isActive, "Developer not active");
        _;
    }

    modifier onlyVerifiedSkillVerifier() {
        require(verifiedSkillVerifiers[msg.sender], "Not a verified skill verifier");
        _;
    }

    modifier validJob(uint256 jobId) {
        require(jobId > 0 && jobId <= _jobIds.current(), "Invalid job ID");
        _;
    }

    modifier validApplication(uint256 applicationId) {
        require(applicationId > 0 && applicationId <= _applicationIds.current(), "Invalid application ID");
        _;
    }

    constructor(address _stakingToken) Ownable() {
        stakingToken = IERC20(_stakingToken);
    }

    /**
     * @dev Register a new company
     */
    function registerCompany(
        string memory _name,
        string memory _description,
        string memory _website,
        string memory _logoUrl,
        string[] memory _verifiableSkills
    ) external whenNotPaused {
        require(companyAddressToId[msg.sender] == 0, "Company already registered");
        require(bytes(_name).length > 0, "Name required");

        _companyIds.increment();
        uint256 companyId = _companyIds.current();

        companies[companyId].id = companyId;
        companies[companyId].wallet = msg.sender;
        companies[companyId].name = _name;
        companies[companyId].description = _description;
        companies[companyId].website = _website;
        companies[companyId].logoUrl = _logoUrl;
        companies[companyId].reputation = 100; // Starting reputation
        companies[companyId].isActive = true;

        // Set verifiable skills
        for (uint256 i = 0; i < _verifiableSkills.length; i++) {
            companies[companyId].skillsVerified[_verifiableSkills[i]] = true;
        }

        companyAddressToId[msg.sender] = companyId;

        emit CompanyRegistered(companyId, msg.sender, _name);
    }

    /**
     * @dev Register a new developer
     */
    function registerDeveloper(
        string memory _name,
        string memory _email,
        string memory _github,
        string memory _portfolio,
        string[] memory _skills,
        uint256[] memory _skillScores
    ) external whenNotPaused {
        require(developerAddressToId[msg.sender] == 0, "Developer already registered");
        require(bytes(_name).length > 0, "Name required");
        require(_skills.length == _skillScores.length, "Skills and scores length mismatch");

        _developerIds.increment();
        uint256 developerId = _developerIds.current();

        developers[developerId].id = developerId;
        developers[developerId].wallet = msg.sender;
        developers[developerId].name = _name;
        developers[developerId].email = _email;
        developers[developerId].github = _github;
        developers[developerId].portfolio = _portfolio;
        developers[developerId].reputation = 100; // Starting reputation
        developers[developerId].isActive = true;

        // Set skills and scores
        for (uint256 i = 0; i < _skills.length; i++) {
            developers[developerId].skills.push(_skills[i]);
            developers[developerId].skillScores.push(_skillScores[i]);
        }

        developerAddressToId[msg.sender] = developerId;

        emit DeveloperRegistered(developerId, msg.sender, _name);
    }

    /**
     * @dev Stake tokens to post jobs (anti-fraud mechanism)
     */
    function stakeTokens(uint256 _amount) external nonReentrant whenNotPaused {
        uint256 companyId = companyAddressToId[msg.sender];
        require(companyId > 0, "Company not registered");
        require(_amount >= MIN_STAKE_AMOUNT, "Stake amount too low");
        require(_amount <= MAX_STAKE_AMOUNT, "Stake amount too high");

        require(stakingToken.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        
        companies[companyId].stakedAmount += _amount;
        companies[companyId].stakeTimestamp = block.timestamp;

        emit StakeDeposited(companyId, _amount);
    }

    /**
     * @dev Withdraw staked tokens (after minimum duration)
     */
    function withdrawStake(uint256 _amount) external nonReentrant whenNotPaused {
        uint256 companyId = companyAddressToId[msg.sender];
        require(companyId > 0, "Company not registered");
        require(companies[companyId].stakedAmount >= _amount, "Insufficient stake");
        require(
            block.timestamp >= companies[companyId].stakeTimestamp + STAKE_DURATION,
            "Stake not matured"
        );

        companies[companyId].stakedAmount -= _amount;
        require(stakingToken.transfer(msg.sender, _amount), "Transfer failed");

        emit StakeWithdrawn(companyId, _amount);
    }

    /**
     * @dev Post a new job (requires staking)
     */
    function postJob(
        string memory _title,
        string memory _description,
        string[] memory _requiredSkills,
        uint256[] memory _skillWeights,
        uint256 _salaryMin,
        uint256 _salaryMax,
        uint256 _deadline,
        JobType _jobType,
        uint256 _maxApplications
    ) external whenNotPaused {
        uint256 companyId = companyAddressToId[msg.sender];
        require(companyId > 0, "Company not registered");
        require(companies[companyId].stakedAmount >= MIN_STAKE_AMOUNT, "Insufficient stake");
        require(_requiredSkills.length == _skillWeights.length, "Skills and weights length mismatch");
        require(_deadline > block.timestamp, "Invalid deadline");
        require(_maxApplications > 0, "Max applications must be > 0");

        _jobIds.increment();
        uint256 jobId = _jobIds.current();

        jobs[jobId].id = jobId;
        jobs[jobId].companyId = companyId;
        jobs[jobId].title = _title;
        jobs[jobId].description = _description;
        jobs[jobId].salaryMin = _salaryMin;
        jobs[jobId].salaryMax = _salaryMax;
        jobs[jobId].deadline = _deadline;
        jobs[jobId].status = JobStatus.Active;
        jobs[jobId].jobType = _jobType;
        jobs[jobId].maxApplications = _maxApplications;
        jobs[jobId].createdAt = block.timestamp;
        jobs[jobId].updatedAt = block.timestamp;

        // Set required skills and weights
        for (uint256 i = 0; i < _requiredSkills.length; i++) {
            jobs[jobId].requiredSkills.push(_requiredSkills[i]);
            jobs[jobId].skillWeights.push(_skillWeights[i]);
        }

        emit JobPosted(jobId, companyId, _title);
    }

    /**
     * @dev Apply for a job
     */
    function applyForJob(
        uint256 _jobId,
        string memory _coverLetter,
        uint256[] memory _skillScores,
        uint256[] memory _portfolioLinks
    ) external validJob(_jobId) whenNotPaused {
        uint256 developerId = developerAddressToId[msg.sender];
        require(developerId > 0, "Developer not registered");
        require(jobs[_jobId].status == JobStatus.Active, "Job not active");
        require(block.timestamp <= jobs[_jobId].deadline, "Application deadline passed");
        require(jobs[_jobId].applicationCount < jobs[_jobId].maxApplications, "Max applications reached");
        require(!hasApplied[_jobId][developerId], "Already applied");

        _applicationIds.increment();
        uint256 applicationId = _applicationIds.current();

        applications[applicationId].id = applicationId;
        applications[applicationId].jobId = _jobId;
        applications[applicationId].developerId = developerId;
        applications[applicationId].coverLetter = _coverLetter;
        applications[applicationId].status = ApplicationStatus.Pending;
        applications[applicationId].appliedAt = block.timestamp;

        // Set skill scores and portfolio links
        for (uint256 i = 0; i < _skillScores.length; i++) {
            applications[applicationId].skillScores.push(_skillScores[i]);
        }
        for (uint256 i = 0; i < _portfolioLinks.length; i++) {
            applications[applicationId].portfolioLinks.push(_portfolioLinks[i]);
        }

        jobs[_jobId].applicationCount++;
        hasApplied[_jobId][developerId] = true;

        emit ApplicationSubmitted(applicationId, _jobId, developerId);
    }

    /**
     * @dev Verify a developer's skill (only verified verifiers)
     */
    function verifySkill(
        uint256 _developerId,
        string memory _skill,
        uint256 _score,
        string memory _evidence,
        bytes memory _signature
    ) external onlyVerifiedSkillVerifier whenNotPaused {
        require(_developerId > 0 && _developerId <= _developerIds.current(), "Invalid developer ID");
        require(_score >= 0 && _score <= 100, "Invalid score");
        require(bytes(_skill).length > 0, "Skill required");
        require(bytes(_evidence).length > 0, "Evidence required");

        // Verify signature
        bytes32 messageHash = keccak256(abi.encodePacked(_developerId, _skill, _score, _evidence));
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        address signer = ethSignedMessageHash.recover(_signature);
        require(signer == msg.sender, "Invalid signature");

        bytes32 verificationId = keccak256(abi.encodePacked(_developerId, _skill, msg.sender));
        require(!skillVerifications[verificationId].isValid, "Already verified by this verifier");

        skillVerifications[verificationId] = SkillVerification({
            verifier: msg.sender,
            developerId: _developerId,
            skill: _skill,
            score: _score,
            evidence: _evidence,
            timestamp: block.timestamp,
            isValid: true
        });

        emit SkillVerified(_developerId, _skill, _score, msg.sender);
    }

    /**
     * @dev Hire an applicant (company only)
     */
    function hireApplicant(uint256 _applicationId) external validApplication(_applicationId) whenNotPaused {
        Application storage application = applications[_applicationId];
        Job storage job = jobs[application.jobId];
        uint256 companyId = companyAddressToId[msg.sender];
        
        require(companyId == job.companyId, "Not job owner");
        require(application.status == ApplicationStatus.Pending || application.status == ApplicationStatus.UnderReview, "Invalid status");

        application.status = ApplicationStatus.Hired;
        application.hiredAt = block.timestamp;
        job.status = JobStatus.Closed;

        emit ApplicationHired(_applicationId, application.jobId, application.developerId);
    }

    /**
     * @dev Complete a job and rate the developer
     */
    function completeJob(uint256 _applicationId, uint256 _rating, string memory _feedback) 
        external 
        validApplication(_applicationId) 
        whenNotPaused 
    {
        Application storage application = applications[_applicationId];
        Job storage job = jobs[application.jobId];
        uint256 companyId = companyAddressToId[msg.sender];
        
        require(companyId == job.companyId, "Not job owner");
        require(application.status == ApplicationStatus.Hired, "Not hired");
        require(_rating >= 1 && _rating <= 5, "Invalid rating");

        application.status = ApplicationStatus.Completed;
        application.completedAt = block.timestamp;
        application.rating = _rating;
        application.companyFeedback = _feedback;

        // Update developer reputation
        uint256 developerId = application.developerId;
        uint256 reputationChange = _rating * 20; // 1-5 stars = 20-100 reputation points
        developers[developerId].reputation += reputationChange;

        // Update company reputation (bonus for completing jobs)
        companies[companyId].reputation += 10;

        emit JobCompleted(_applicationId, application.jobId, _rating);
        emit ReputationUpdated(developerId, developers[developerId].reputation, false);
        emit ReputationUpdated(companyId, companies[companyId].reputation, true);
    }

    /**
     * @dev Admin functions
     */
    function addVerifiedSkillVerifier(address _verifier) external onlyOwner {
        verifiedSkillVerifiers[_verifier] = true;
    }

    function removeVerifiedSkillVerifier(address _verifier) external onlyOwner {
        verifiedSkillVerifiers[_verifier] = false;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev View functions
     */
    function getCompanySkills() external pure returns (string[] memory) {
        // This is a simplified version - in practice, you'd need to iterate through all possible skills
        // For now, return empty array as skills are stored in mapping
        string[] memory skills = new string[](0);
        return skills;
    }

    function getDeveloperSkills(uint256 _developerId) external view returns (string[] memory, uint256[] memory) {
        return (developers[_developerId].skills, developers[_developerId].skillScores);
    }

    function getJobApplications() external pure returns (uint256[] memory) {
        // This would require additional storage to track applications per job
        // For now, return empty array
        uint256[] memory jobApplications = new uint256[](0);
        return jobApplications;
    }

    function getTotalJobs() external view returns (uint256) {
        return _jobIds.current();
    }

    function getTotalCompanies() external view returns (uint256) {
        return _companyIds.current();
    }

    function getTotalDevelopers() external view returns (uint256) {
        return _developerIds.current();
    }
}
