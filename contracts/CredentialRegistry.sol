// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title CredentialRegistry
 * @dev Registry for educational and professional credentials
 * @notice Manages credential issuance, verification, and revocation
 */
contract CredentialRegistry is AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    enum CredentialType {
        EDUCATIONAL,
        PROFESSIONAL_CERTIFICATION,
        WORK_EXPERIENCE,
        SKILL_ENDORSEMENT,
        BACKGROUND_CHECK
    }

    struct Credential {
        bytes32 credentialId;
        CredentialType credentialType;
        bytes32 credentialHash;
        address issuer;
        address candidate;
        uint256 issuanceTime;
        uint256 expirationTime;
        bool revoked;
        string metadata; // IPFS hash or JSON string
    }

    mapping(bytes32 => Credential) public credentials;
    mapping(address => bytes32[]) public candidateCredentials; // candidate => credential IDs
    mapping(address => bool) public authorizedIssuers; // Issuer address => authorized
    bytes32[] public allCredentialIds;

    // Events
    event CredentialIssued(
        bytes32 indexed credentialId,
        address indexed candidate,
        address indexed issuer,
        CredentialType credentialType
    );
    event CredentialRevoked(bytes32 indexed credentialId, address indexed issuer);
    event CredentialLinked(bytes32 indexed credentialId, address indexed candidate);
    event IssuerAuthorized(address indexed issuer);
    event IssuerRevoked(address indexed issuer);

    modifier onlyIssuer() {
        require(authorizedIssuers[msg.sender], "Not authorized issuer");
        _;
    }

    modifier validCredential(bytes32 _credentialId) {
        require(credentials[_credentialId].issuer != address(0), "Credential does not exist");
        _;
    }

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Issue a new credential
     * @param _candidate Address of credential recipient
     * @param _credHash Hash of credential data
     * @param _type Type of credential
     * @param _expiry Expiration timestamp (0 for no expiration)
     * @param _metadata Additional metadata (IPFS hash or JSON)
     */
    function issueCredential(
        address _candidate,
        bytes32 _credHash,
        CredentialType _type,
        uint256 _expiry,
        string memory _metadata
    ) external onlyIssuer whenNotPaused {
        require(_candidate != address(0), "Invalid candidate address");
        require(_credHash != bytes32(0), "Invalid credential hash");
        require(_expiry == 0 || _expiry > block.timestamp, "Invalid expiration");

        bytes32 credentialId = keccak256(
            abi.encodePacked(_candidate, _credHash, _type, block.timestamp, msg.sender)
        );

        require(credentials[credentialId].issuer == address(0), "Credential already exists");

        credentials[credentialId] = Credential({
            credentialId: credentialId,
            credentialType: _type,
            credentialHash: _credHash,
            issuer: msg.sender,
            candidate: _candidate,
            issuanceTime: block.timestamp,
            expirationTime: _expiry,
            revoked: false,
            metadata: _metadata
        });

        candidateCredentials[_candidate].push(credentialId);
        allCredentialIds.push(credentialId);

        emit CredentialIssued(credentialId, _candidate, msg.sender, _type);
    }

    /**
     * @dev Verify credential status
     * @param _credentialId ID of credential to verify
     * @return isValid Whether credential is valid
     * @return isExpired Whether credential is expired
     * @return isRevoked Whether credential is revoked
     */
    function verifyCredential(bytes32 _credentialId)
        external
        view
        validCredential(_credentialId)
        returns (
            bool isValid,
            bool isExpired,
            bool isRevoked
        )
    {
        Credential memory cred = credentials[_credentialId];
        
        isRevoked = cred.revoked;
        isExpired = cred.expirationTime > 0 && block.timestamp > cred.expirationTime;
        isValid = !isRevoked && !isExpired;

        return (isValid, isExpired, isRevoked);
    }

    /**
     * @dev Revoke a credential (issuer only)
     * @param _credentialId ID of credential to revoke
     */
    function revokeCredential(bytes32 _credentialId)
        external
        validCredential(_credentialId)
        whenNotPaused
    {
        Credential storage cred = credentials[_credentialId];
        require(cred.issuer == msg.sender || hasRole(ADMIN_ROLE, msg.sender), "Not authorized");
        require(!cred.revoked, "Already revoked");

        cred.revoked = true;

        emit CredentialRevoked(_credentialId, msg.sender);
    }

    /**
     * @dev Link credential to user profile
     * @param _user Address of user
     * @param _credentialId ID of credential
     */
    function linkCredentialToUser(address _user, bytes32 _credentialId)
        external
        validCredential(_credentialId)
        whenNotPaused
    {
        require(_user != address(0), "Invalid user address");
        require(credentials[_credentialId].candidate == _user, "Credential not issued to this user");

        // Check if already linked
        bytes32[] memory userCreds = candidateCredentials[_user];
        bool alreadyLinked = false;
        for (uint256 i = 0; i < userCreds.length; i++) {
            if (userCreds[i] == _credentialId) {
                alreadyLinked = true;
                break;
            }
        }

        if (!alreadyLinked) {
            candidateCredentials[_user].push(_credentialId);
            emit CredentialLinked(_credentialId, _user);
        }
    }

    /**
     * @dev Get all credentials for a candidate
     * @param _candidate Address of candidate
     * @return credentialIds Array of credential IDs
     */
    function getCandidateCredentials(address _candidate)
        external
        view
        returns (bytes32[] memory credentialIds)
    {
        return candidateCredentials[_candidate];
    }

    /**
     * @dev Validate credential chain (verify issuer authenticity)
     * @param _credentialId ID of credential
     * @return isValid Whether credential chain is valid
     * @return issuer Address of issuer
     */
    function validateCredentialChain(bytes32 _credentialId)
        external
        view
        validCredential(_credentialId)
        returns (bool isValid, address issuer)
    {
        Credential memory cred = credentials[_credentialId];
        isValid = authorizedIssuers[cred.issuer];
        issuer = cred.issuer;

        return (isValid, issuer);
    }

    /**
     * @dev Get credential details
     * @param _credentialId ID of credential
     */
    function getCredentialDetails(bytes32 _credentialId)
        external
        view
        validCredential(_credentialId)
        returns (
            CredentialType credentialType,
            bytes32 credentialHash,
            address issuer,
            address candidate,
            uint256 issuanceTime,
            uint256 expirationTime,
            bool revoked,
            string memory metadata
        )
    {
        Credential memory cred = credentials[_credentialId];
        return (
            cred.credentialType,
            cred.credentialHash,
            cred.issuer,
            cred.candidate,
            cred.issuanceTime,
            cred.expirationTime,
            cred.revoked,
            cred.metadata
        );
    }

    /**
     * @dev Admin functions
     */
    function authorizeIssuer(address _issuer) external onlyRole(ADMIN_ROLE) {
        authorizedIssuers[_issuer] = true;
        _grantRole(ISSUER_ROLE, _issuer);
        emit IssuerAuthorized(_issuer);
    }

    function revokeIssuer(address _issuer) external onlyRole(ADMIN_ROLE) {
        authorizedIssuers[_issuer] = false;
        _revokeRole(ISSUER_ROLE, _issuer);
        emit IssuerRevoked(_issuer);
    }

    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Get total credentials count
     */
    function getTotalCredentials() external view returns (uint256) {
        return allCredentialIds.length;
    }
}

