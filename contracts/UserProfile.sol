// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title UserProfile
 * @dev Contract for storing user profile data on blockchain with IPFS integration
 */
contract UserProfile is Ownable, ReentrancyGuard, Pausable {
    
    struct Profile {
        string name;
        string email;
        string bio;
        string avatarHash; // IPFS hash for avatar image
        string coverHash;  // IPFS hash for cover image
        string[] socialLinks; // Array of social media links
        string[] skills;      // Array of skills
        uint256[] skillScores; // Array of skill scores
        string location;
        string website;
        string github;
        string linkedin;
        string twitter;
        uint256 createdAt;
        uint256 updatedAt;
        bool isActive;
    }

    // Mapping from user address to profile
    mapping(address => Profile) public profiles;
    
    // Mapping from user address to profile existence
    mapping(address => bool) public hasProfile;
    
    // Array of all profile addresses
    address[] public profileAddresses;
    
    // Events
    event ProfileCreated(address indexed user, string name, string avatarHash);
    event ProfileUpdated(address indexed user, string name, string avatarHash);
    event ProfileDeactivated(address indexed user);
    event ProfileReactivated(address indexed user);
    
    // Modifiers
    modifier onlyProfileOwner(address user) {
        require(msg.sender == user || msg.sender == owner(), "Not authorized");
        _;
    }
    
    modifier profileExists(address user) {
        require(hasProfile[user], "Profile does not exist");
        _;
    }
    
    modifier profileNotExists(address user) {
        require(!hasProfile[user], "Profile already exists");
        _;
    }

    /**
     * @dev Create a new user profile
     * @param _name User's name
     * @param _email User's email
     * @param _bio User's bio
     * @param _avatarHash IPFS hash for avatar image
     * @param _coverHash IPFS hash for cover image
     * @param _socialLinks Array of social media links
     * @param _skills Array of skills
     * @param _skillScores Array of skill scores
     * @param _location User's location
     * @param _website User's website
     * @param _github User's GitHub
     * @param _linkedin User's LinkedIn
     * @param _twitter User's Twitter
     */
    function createProfile(
        string memory _name,
        string memory _email,
        string memory _bio,
        string memory _avatarHash,
        string memory _coverHash,
        string[] memory _socialLinks,
        string[] memory _skills,
        uint256[] memory _skillScores,
        string memory _location,
        string memory _website,
        string memory _github,
        string memory _linkedin,
        string memory _twitter
    ) external whenNotPaused nonReentrant profileNotExists(msg.sender) {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(_skills.length == _skillScores.length, "Skills and scores length mismatch");
        
        Profile storage profile = profiles[msg.sender];
        profile.name = _name;
        profile.email = _email;
        profile.bio = _bio;
        profile.avatarHash = _avatarHash;
        profile.coverHash = _coverHash;
        profile.location = _location;
        profile.website = _website;
        profile.github = _github;
        profile.linkedin = _linkedin;
        profile.twitter = _twitter;
        profile.createdAt = block.timestamp;
        profile.updatedAt = block.timestamp;
        profile.isActive = true;
        
        // Add social links
        for (uint256 i = 0; i < _socialLinks.length; i++) {
            profile.socialLinks.push(_socialLinks[i]);
        }
        
        // Add skills and scores
        for (uint256 i = 0; i < _skills.length; i++) {
            profile.skills.push(_skills[i]);
            profile.skillScores.push(_skillScores[i]);
        }
        
        hasProfile[msg.sender] = true;
        profileAddresses.push(msg.sender);
        
        emit ProfileCreated(msg.sender, _name, _avatarHash);
    }

    /**
     * @dev Update user profile
     * @param _name User's name
     * @param _email User's email
     * @param _bio User's bio
     * @param _avatarHash IPFS hash for avatar image
     * @param _coverHash IPFS hash for cover image
     * @param _socialLinks Array of social media links
     * @param _skills Array of skills
     * @param _skillScores Array of skill scores
     * @param _location User's location
     * @param _website User's website
     * @param _github User's GitHub
     * @param _linkedin User's LinkedIn
     * @param _twitter User's Twitter
     */
    function updateProfile(
        string memory _name,
        string memory _email,
        string memory _bio,
        string memory _avatarHash,
        string memory _coverHash,
        string[] memory _socialLinks,
        string[] memory _skills,
        uint256[] memory _skillScores,
        string memory _location,
        string memory _website,
        string memory _github,
        string memory _linkedin,
        string memory _twitter
    ) external whenNotPaused nonReentrant profileExists(msg.sender) {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(_skills.length == _skillScores.length, "Skills and scores length mismatch");
        
        Profile storage profile = profiles[msg.sender];
        profile.name = _name;
        profile.email = _email;
        profile.bio = _bio;
        profile.avatarHash = _avatarHash;
        profile.coverHash = _coverHash;
        profile.location = _location;
        profile.website = _website;
        profile.github = _github;
        profile.linkedin = _linkedin;
        profile.twitter = _twitter;
        profile.updatedAt = block.timestamp;
        
        // Clear existing social links
        delete profile.socialLinks;
        for (uint256 i = 0; i < _socialLinks.length; i++) {
            profile.socialLinks.push(_socialLinks[i]);
        }
        
        // Clear existing skills and scores
        delete profile.skills;
        delete profile.skillScores;
        for (uint256 i = 0; i < _skills.length; i++) {
            profile.skills.push(_skills[i]);
            profile.skillScores.push(_skillScores[i]);
        }
        
        emit ProfileUpdated(msg.sender, _name, _avatarHash);
    }

    /**
     * @dev Update only avatar image
     * @param _avatarHash IPFS hash for new avatar image
     */
    function updateAvatar(string memory _avatarHash) external whenNotPaused profileExists(msg.sender) {
        profiles[msg.sender].avatarHash = _avatarHash;
        profiles[msg.sender].updatedAt = block.timestamp;
        
        emit ProfileUpdated(msg.sender, profiles[msg.sender].name, _avatarHash);
    }

    /**
     * @dev Update only cover image
     * @param _coverHash IPFS hash for new cover image
     */
    function updateCover(string memory _coverHash) external whenNotPaused profileExists(msg.sender) {
        profiles[msg.sender].coverHash = _coverHash;
        profiles[msg.sender].updatedAt = block.timestamp;
        
        emit ProfileUpdated(msg.sender, profiles[msg.sender].name, profiles[msg.sender].avatarHash);
    }

    /**
     * @dev Deactivate user profile
     */
    function deactivateProfile() external whenNotPaused profileExists(msg.sender) {
        profiles[msg.sender].isActive = false;
        profiles[msg.sender].updatedAt = block.timestamp;
        
        emit ProfileDeactivated(msg.sender);
    }

    /**
     * @dev Reactivate user profile
     */
    function reactivateProfile() external whenNotPaused profileExists(msg.sender) {
        profiles[msg.sender].isActive = true;
        profiles[msg.sender].updatedAt = block.timestamp;
        
        emit ProfileReactivated(msg.sender);
    }

    /**
     * @dev Get user profile
     * @param user User address
     * @return Profile struct
     */
    function getProfile(address user) external view profileExists(user) returns (Profile memory) {
        return profiles[user];
    }

    /**
     * @dev Get user profile basic info
     * @param user User address
     * @return name, email, bio, avatarHash, coverHash, location, website, github, linkedin, twitter, createdAt, updatedAt, isActive
     */
    function getProfileBasicInfo(address user) external view profileExists(user) returns (
        string memory,
        string memory,
        string memory,
        string memory,
        string memory,
        string memory,
        string memory,
        string memory,
        string memory,
        string memory,
        uint256,
        uint256,
        bool
    ) {
        Profile memory profile = profiles[user];
        return (
            profile.name,
            profile.email,
            profile.bio,
            profile.avatarHash,
            profile.coverHash,
            profile.location,
            profile.website,
            profile.github,
            profile.linkedin,
            profile.twitter,
            profile.createdAt,
            profile.updatedAt,
            profile.isActive
        );
    }

    /**
     * @dev Get user skills
     * @param user User address
     * @return skills array and skillScores array
     */
    function getUserSkills(address user) external view profileExists(user) returns (string[] memory, uint256[] memory) {
        return (profiles[user].skills, profiles[user].skillScores);
    }

    /**
     * @dev Get user social links
     * @param user User address
     * @return socialLinks array
     */
    function getUserSocialLinks(address user) external view profileExists(user) returns (string[] memory) {
        return profiles[user].socialLinks;
    }

    /**
     * @dev Get total number of profiles
     * @return Total count
     */
    function getTotalProfiles() external view returns (uint256) {
        return profileAddresses.length;
    }

    /**
     * @dev Get profile address by index
     * @param index Index in profileAddresses array
     * @return User address
     */
    function getProfileAddress(uint256 index) external view returns (address) {
        require(index < profileAddresses.length, "Index out of bounds");
        return profileAddresses[index];
    }

    /**
     * @dev Check if user has profile
     * @param user User address
     * @return True if profile exists
     */
    function checkProfileExists(address user) external view returns (bool) {
        return hasProfile[user];
    }

    /**
     * @dev Emergency pause function
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Emergency unpause function
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
