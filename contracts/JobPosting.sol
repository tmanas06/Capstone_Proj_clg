// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./CompanyVerification.sol";
import "./UserVerification.sol";
import "./CredentialRegistry.sol";

/**
 * @title JobPosting
 * @dev Smart contract for job postings with automatic candidate filtering
 * @notice Manages job creation, applications, and hiring workflow
 */
contract JobPosting is AccessControl, Pausable, ReentrancyGuard {
    using Counters for Counters.Counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    CompanyVerification public companyVerification;
    UserVerification public userVerification;
    CredentialRegistry public credentialRegistry;

    Counters.Counter private _jobIds;

    struct JobListing {
        uint256 jobId;
        address companyAddress;
        string positionTitle;
        string description;
        bytes32[] requiredCredentials;
        uint8 minimumTrustScore;
        uint256 createdTime;
        address[] applications;
        address hireAddress;
        JobStatus status;
    }

    struct Application {
        address candidate;
        uint256 appliedAt;
        ApplicationStatus status;
        string coverLetter; // IPFS hash
        bytes32[] submittedCredentials;
    }

    enum JobStatus {
        Active,
        Closed,
        Filled,
        Cancelled
    }

    enum ApplicationStatus {
        Pending,
        UnderReview,
        Accepted,
        Rejected,
        Hired
    }

    mapping(uint256 => JobListing) public jobs;
    mapping(uint256 => mapping(address => Application)) public applications; // jobId => candidate => Application
    mapping(address => uint256[]) public companyJobs; // company => job IDs
    mapping(address => uint256[]) public candidateApplications; // candidate => job IDs

    // Events
    event JobPosted(
        uint256 indexed jobId,
        address indexed company,
        string title,
        uint8 minimumTrustScore
    );
    event ApplicationSubmitted(
        uint256 indexed jobId,
        address indexed candidate,
        uint256 timestamp
    );
    event ApplicationReviewed(
        uint256 indexed jobId,
        address indexed candidate,
        ApplicationStatus status
    );
    event JobOfferExtended(uint256 indexed jobId, address indexed candidate);
    event HireCompleted(uint256 indexed jobId, address indexed candidate);
    event JobCancelled(uint256 indexed jobId, address indexed company);

    modifier onlyCompany(address _company) {
        // Check if company is registered by calling a view function
        (bytes32 companyHash, uint256 registrationTime, , , , , , ) = companyVerification.getCompanyInfo(_company);
        require(registrationTime > 0, "Company not registered");
        _;
    }

    modifier validJob(uint256 _jobId) {
        require(_jobId > 0 && _jobId <= _jobIds.current(), "Invalid job ID");
        _;
    }

    constructor(
        address _companyVerification,
        address _userVerification,
        address _credentialRegistry
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);

        companyVerification = CompanyVerification(_companyVerification);
        userVerification = UserVerification(_userVerification);
        credentialRegistry = CredentialRegistry(_credentialRegistry);
    }

    /**
     * @dev Create a new job posting
     * @param _title Job title
     * @param _description Job description (IPFS hash)
     * @param _requiredCreds Array of required credential IDs
     * @param _minScore Minimum trust score required
     */
    function createJobPosting(
        string memory _title,
        string memory _description,
        bytes32[] memory _requiredCreds,
        uint8 _minScore
    ) external whenNotPaused onlyCompany(msg.sender) {
        (, , bool verified, , , , , ) = companyVerification.getCompanyInfo(msg.sender);
        require(
            verified,
            "Company must be verified"
        );
        require(bytes(_title).length > 0, "Title required");
        require(_minScore <= 100, "Invalid trust score");

        _jobIds.increment();
        uint256 jobId = _jobIds.current();

        jobs[jobId] = JobListing({
            jobId: jobId,
            companyAddress: msg.sender,
            positionTitle: _title,
            description: _description,
            requiredCredentials: _requiredCreds,
            minimumTrustScore: _minScore,
            createdTime: block.timestamp,
            applications: new address[](0),
            hireAddress: address(0),
            status: JobStatus.Active
        });

        companyJobs[msg.sender].push(jobId);
        companyVerification.updateJobPostingCount(msg.sender);

        emit JobPosted(jobId, msg.sender, _title, _minScore);
    }

    /**
     * @dev Apply for a job
     * @param _jobId ID of job
     * @param _coverLetter Cover letter (IPFS hash)
     * @param _submittedCredentials Array of credential IDs being submitted
     */
    function applyForJob(
        uint256 _jobId,
        string memory _coverLetter,
        bytes32[] memory _submittedCredentials
    ) external validJob(_jobId) whenNotPaused nonReentrant {
        require(jobs[_jobId].status == JobStatus.Active, "Job not active");
        require(
            applications[_jobId][msg.sender].candidate == address(0),
            "Already applied"
        );

        // Check KYC verification
        (bool kycComplete, , , ) = userVerification.getVerificationStatus(msg.sender);
        require(kycComplete, "KYC verification required");

        // Check trust score (if company has minimum requirement)
        // Note: This would require integration with a trust score contract
        // For now, we'll just check KYC

        // Auto-filter: Check if candidate meets minimum credentials
        bool meetsRequirements = _checkCredentialRequirements(
            _jobId,
            _submittedCredentials
        );
        require(meetsRequirements, "Does not meet credential requirements");

        Application memory application = Application({
            candidate: msg.sender,
            appliedAt: block.timestamp,
            status: ApplicationStatus.Pending,
            coverLetter: _coverLetter,
            submittedCredentials: _submittedCredentials
        });

        applications[_jobId][msg.sender] = application;
        jobs[_jobId].applications.push(msg.sender);
        candidateApplications[msg.sender].push(_jobId);

        emit ApplicationSubmitted(_jobId, msg.sender, block.timestamp);
    }

    /**
     * @dev Review an application (company only)
     * @param _jobId ID of job
     * @param _candidate Address of candidate
     * @param _status New application status
     */
    function reviewApplication(
        uint256 _jobId,
        address _candidate,
        ApplicationStatus _status
    ) external validJob(_jobId) onlyCompany(msg.sender) {
        require(
            jobs[_jobId].companyAddress == msg.sender,
            "Not job owner"
        );
        require(
            applications[_jobId][_candidate].candidate != address(0),
            "Application does not exist"
        );

        applications[_jobId][_candidate].status = _status;

        emit ApplicationReviewed(_jobId, _candidate, _status);
    }

    /**
     * @dev Extend job offer to candidate
     * @param _jobId ID of job
     * @param _candidate Address of candidate
     */
    function extendJobOffer(uint256 _jobId, address _candidate)
        external
        validJob(_jobId)
        onlyCompany(msg.sender)
        whenNotPaused
    {
        require(
            jobs[_jobId].companyAddress == msg.sender,
            "Not job owner"
        );
        require(
            applications[_jobId][_candidate].candidate != address(0),
            "Application does not exist"
        );
        require(
            applications[_jobId][_candidate].status == ApplicationStatus.Accepted,
            "Application not accepted"
        );

        applications[_jobId][_candidate].status = ApplicationStatus.Hired;

        emit JobOfferExtended(_jobId, _candidate);
    }

    /**
     * @dev Complete hire (mark as hired)
     * @param _jobId ID of job
     * @param _candidate Address of candidate
     */
    function completeHire(uint256 _jobId, address _candidate)
        external
        validJob(_jobId)
        onlyCompany(msg.sender)
        whenNotPaused
    {
        require(
            jobs[_jobId].companyAddress == msg.sender,
            "Not job owner"
        );
        require(
            applications[_jobId][_candidate].status == ApplicationStatus.Hired,
            "Offer not extended"
        );

        jobs[_jobId].hireAddress = _candidate;
        jobs[_jobId].status = JobStatus.Filled;

        companyVerification.recordHire(msg.sender, _candidate);

        emit HireCompleted(_jobId, _candidate);
    }

    /**
     * @dev Cancel a job posting
     * @param _jobId ID of job
     */
    function cancelJobPosting(uint256 _jobId)
        external
        validJob(_jobId)
        onlyCompany(msg.sender)
    {
        require(
            jobs[_jobId].companyAddress == msg.sender,
            "Not job owner"
        );
        require(
            jobs[_jobId].status == JobStatus.Active,
            "Job not active"
        );

        jobs[_jobId].status = JobStatus.Cancelled;

        emit JobCancelled(_jobId, msg.sender);
    }

    /**
     * @dev Get all applications for a job
     * @param _jobId ID of job
     * @return candidates Array of candidate addresses
     */
    function getJobApplications(uint256 _jobId)
        external
        view
        validJob(_jobId)
        returns (address[] memory candidates)
    {
        return jobs[_jobId].applications;
    }

    /**
     * @dev Get company's active jobs
     * @param _company Address of company
     * @return jobIds Array of job IDs
     */
    function getCompanyActiveJobs(address _company)
        external
        view
        onlyCompany(_company)
        returns (uint256[] memory jobIds)
    {
        uint256[] memory allJobs = companyJobs[_company];
        uint256 activeCount = 0;

        // Count active jobs
        for (uint256 i = 0; i < allJobs.length; i++) {
            if (jobs[allJobs[i]].status == JobStatus.Active) {
                activeCount++;
            }
        }

        // Build result array
        uint256[] memory activeJobs = new uint256[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < allJobs.length; i++) {
            if (jobs[allJobs[i]].status == JobStatus.Active) {
                activeJobs[index] = allJobs[i];
                index++;
            }
        }

        return activeJobs;
    }

    /**
     * @dev Get application details
     * @param _jobId ID of job
     * @param _candidate Address of candidate
     */
    function getApplicationDetails(uint256 _jobId, address _candidate)
        external
        view
        validJob(_jobId)
        returns (
            address candidate,
            uint256 appliedAt,
            ApplicationStatus status,
            string memory coverLetter,
            bytes32[] memory submittedCredentials
        )
    {
        Application memory app = applications[_jobId][_candidate];
        require(app.candidate != address(0), "Application does not exist");

        return (
            app.candidate,
            app.appliedAt,
            app.status,
            app.coverLetter,
            app.submittedCredentials
        );
    }

    /**
     * @dev Internal function to check credential requirements
     * @param _jobId ID of job
     * @param _submittedCredentials Array of submitted credential IDs
     * @return meetsRequirements Whether candidate meets requirements
     */
    function _checkCredentialRequirements(
        uint256 _jobId,
        bytes32[] memory _submittedCredentials
    ) internal view returns (bool meetsRequirements) {
        bytes32[] memory required = jobs[_jobId].requiredCredentials;

        if (required.length == 0) {
            return true; // No requirements
        }

        // Check if all required credentials are present
        for (uint256 i = 0; i < required.length; i++) {
            bool found = false;
            for (uint256 j = 0; j < _submittedCredentials.length; j++) {
                if (required[i] == _submittedCredentials[j]) {
                    // Verify credential is valid
                    (bool isValid, , ) = credentialRegistry.verifyCredential(
                        _submittedCredentials[j]
                    );
                    if (isValid) {
                        found = true;
                        break;
                    }
                }
            }
            if (!found) {
                return false;
            }
        }

        return true;
    }

    /**
     * @dev Admin functions
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Get total jobs count
     */
    function getTotalJobs() external view returns (uint256) {
        return _jobIds.current();
    }
}

