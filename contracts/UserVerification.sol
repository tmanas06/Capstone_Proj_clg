// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title UserVerification
 * @dev Smart contract for user KYC verification using Self Protocol integration
 * @notice Handles identity verification, credential linking, and access control
 */
contract UserVerification is AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    struct User {
        address userAddress;
        bool kycComplete;
        bytes32 identityHash;
        uint256 verificationTime;
        address[] linkedCredentials;
        mapping(address => bool) employerAccess; // Employer address => has access
    }

    mapping(address => User) public users;
    mapping(address => bool) public hasInitiatedKYC;
    address[] public verifiedUsers;

    // Events
    event KYCInitiated(address indexed user, bytes32 indexed identityHash);
    event KYCCompleted(address indexed user, bool status);
    event AccessGranted(address indexed user, address indexed employer);
    event AccessRevoked(address indexed user, address indexed employer);
    event CredentialLinked(address indexed user, address indexed credentialAddress);
    event IdentityHashUpdated(address indexed user, bytes32 indexed newHash);

    modifier onlyUser(address _user) {
        require(msg.sender == _user, "Not authorized user");
        _;
    }

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Initiate KYC verification process
     * @param _identityHash Hash of zero-knowledge proof from Self Protocol
     */
    function initiateKYC(bytes32 _identityHash) external whenNotPaused {
        require(!hasInitiatedKYC[msg.sender], "KYC already initiated");
        require(_identityHash != bytes32(0), "Invalid identity hash");

        hasInitiatedKYC[msg.sender] = true;
        users[msg.sender].userAddress = msg.sender;
        users[msg.sender].identityHash = _identityHash;
        users[msg.sender].kycComplete = false;

        emit KYCInitiated(msg.sender, _identityHash);
    }

    /**
     * @dev Complete KYC verification (admin/verifier only)
     * @param _userAddress Address of user to verify
     * @param _status Verification status
     */
    function completeKYC(address _userAddress, bool _status) 
        external 
        onlyRole(VERIFIER_ROLE) 
        whenNotPaused 
    {
        require(hasInitiatedKYC[_userAddress], "KYC not initiated");
        require(users[_userAddress].identityHash != bytes32(0), "No identity hash");

        users[_userAddress].kycComplete = _status;
        users[_userAddress].verificationTime = block.timestamp;

        if (_status) {
            verifiedUsers.push(_userAddress);
        }

        emit KYCCompleted(_userAddress, _status);
    }

    /**
     * @dev Link a verified credential to user profile
     * @param _credentialAddress Address of credential contract
     */
    function addLinkedCredential(address _credentialAddress) 
        external 
        whenNotPaused 
        onlyUser(msg.sender) 
    {
        require(_credentialAddress != address(0), "Invalid credential address");
        require(users[msg.sender].kycComplete, "KYC not complete");

        // Check if already linked
        bool alreadyLinked = false;
        for (uint256 i = 0; i < users[msg.sender].linkedCredentials.length; i++) {
            if (users[msg.sender].linkedCredentials[i] == _credentialAddress) {
                alreadyLinked = true;
                break;
            }
        }

        require(!alreadyLinked, "Credential already linked");

        users[msg.sender].linkedCredentials.push(_credentialAddress);
        emit CredentialLinked(msg.sender, _credentialAddress);
    }

    /**
     * @dev Grant employer access to user data
     * @param _employer Address of employer
     */
    function grantEmployerAccess(address _employer) 
        external 
        whenNotPaused 
        onlyUser(msg.sender) 
    {
        require(_employer != address(0), "Invalid employer address");
        require(!users[msg.sender].employerAccess[_employer], "Access already granted");

        users[msg.sender].employerAccess[_employer] = true;
        emit AccessGranted(msg.sender, _employer);
    }

    /**
     * @dev Revoke employer access to user data
     * @param _employer Address of employer
     */
    function revokeEmployerAccess(address _employer) 
        external 
        whenNotPaused 
        onlyUser(msg.sender) 
    {
        require(users[msg.sender].employerAccess[_employer], "Access not granted");

        users[msg.sender].employerAccess[_employer] = false;
        emit AccessRevoked(msg.sender, _employer);
    }

    /**
     * @dev Get verification status of a user
     * @param _user Address of user
     * @return kycComplete Whether KYC is complete
     * @return identityHash Hash of identity proof
     * @return verificationTime Timestamp of verification
     * @return credentialCount Number of linked credentials
     */
    function getVerificationStatus(address _user) 
        external 
        view 
        returns (
            bool kycComplete,
            bytes32 identityHash,
            uint256 verificationTime,
            uint256 credentialCount
        ) 
    {
        User storage user = users[_user];
        return (
            user.kycComplete,
            user.identityHash,
            user.verificationTime,
            user.linkedCredentials.length
        );
    }

    /**
     * @dev Update identity hash (user can update their proof)
     * @param _newHash New identity hash
     */
    function updateIdentityHash(bytes32 _newHash) 
        external 
        whenNotPaused 
        onlyUser(msg.sender) 
    {
        require(_newHash != bytes32(0), "Invalid identity hash");
        require(hasInitiatedKYC[msg.sender], "KYC not initiated");

        users[msg.sender].identityHash = _newHash;
        // Reset verification status when hash is updated
        users[msg.sender].kycComplete = false;

        emit IdentityHashUpdated(msg.sender, _newHash);
    }

    /**
     * @dev Check if employer has access to user data
     * @param _user Address of user
     * @param _employer Address of employer
     * @return hasAccess Whether employer has access
     */
    function hasEmployerAccess(address _user, address _employer) 
        external 
        view 
        returns (bool hasAccess) 
    {
        return users[_user].employerAccess[_employer];
    }

    /**
     * @dev Get linked credentials for a user
     * @param _user Address of user
     * @return credentials Array of credential addresses
     */
    function getLinkedCredentials(address _user) 
        external 
        view 
        returns (address[] memory credentials) 
    {
        return users[_user].linkedCredentials;
    }

    /**
     * @dev Batch complete KYC for multiple users
     * @param _userAddresses Array of user addresses
     * @param _statuses Array of verification statuses
     */
    function batchCompleteKYC(address[] calldata _userAddresses, bool[] calldata _statuses) 
        external 
        onlyRole(VERIFIER_ROLE) 
        whenNotPaused 
    {
        require(_userAddresses.length == _statuses.length, "Array length mismatch");

        for (uint256 i = 0; i < _userAddresses.length; i++) {
            if (hasInitiatedKYC[_userAddresses[i]]) {
                users[_userAddresses[i]].kycComplete = _statuses[i];
                users[_userAddresses[i]].verificationTime = block.timestamp;

                if (_statuses[i]) {
                    verifiedUsers.push(_userAddresses[i]);
                }

                emit KYCCompleted(_userAddresses[i], _statuses[i]);
            }
        }
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
     * @dev Get total verified users count
     */
    function getTotalVerifiedUsers() external view returns (uint256) {
        return verifiedUsers.length;
    }
}

