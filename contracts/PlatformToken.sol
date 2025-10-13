// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title PlatformToken
 * @dev ERC20 token for the Web3 Job Platform
 * @notice This token is used for staking, payments, and reputation mechanisms
 */
contract PlatformToken is ERC20, ERC20Burnable, ERC20Pausable, Ownable, ReentrancyGuard {
    // Token configuration
    uint256 public constant INITIAL_SUPPLY = 10000000 * 10**18; // 10 million tokens
    uint256 public constant MAX_SUPPLY = 100000000 * 10**18; // 100 million tokens max
    
    // Staking and rewards
    mapping(address => uint256) public stakingBalances;
    mapping(address => uint256) public stakingTimestamps;
    mapping(address => uint256) public lastClaimedRewards;
    
    uint256 public constant STAKING_REWARD_RATE = 10; // 10% annual reward
    uint256 public constant MIN_STAKING_DURATION = 7 days;
    
    // Platform fees
    uint256 public constant PLATFORM_FEE_PERCENTAGE = 2; // 2% fee on transfers
    address public feeRecipient;
    uint256 public totalFeesCollected;
    
    // Events
    event TokensStaked(address indexed user, uint256 amount, uint256 timestamp);
    event TokensUnstaked(address indexed user, uint256 amount, uint256 rewards);
    event RewardsClaimed(address indexed user, uint256 amount);
    event FeeCollected(address indexed from, uint256 amount);
    
    constructor() ERC20("WJD", "WJD") Ownable() {
        feeRecipient = msg.sender;
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    
    /**
     * @dev Stake tokens to earn rewards
     */
    function stakeTokens(uint256 _amount) external nonReentrant whenNotPaused {
        require(_amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= _amount, "Insufficient balance");
        
        // Claim pending rewards before staking
        _claimRewards();
        
        // Transfer tokens to contract
        _transfer(msg.sender, address(this), _amount);
        
        // Update staking info
        stakingBalances[msg.sender] += _amount;
        stakingTimestamps[msg.sender] = block.timestamp;
        
        emit TokensStaked(msg.sender, _amount, block.timestamp);
    }
    
    /**
     * @dev Unstake tokens and claim rewards
     */
    function unstakeTokens(uint256 _amount) external nonReentrant whenNotPaused {
        require(_amount > 0, "Amount must be greater than 0");
        require(stakingBalances[msg.sender] >= _amount, "Insufficient staked amount");
        require(
            block.timestamp >= stakingTimestamps[msg.sender] + MIN_STAKING_DURATION,
            "Minimum staking duration not met"
        );
        
        // Calculate and claim rewards
        uint256 rewards = _calculateRewards(msg.sender);
        _claimRewards();
        
        // Update staking balance
        stakingBalances[msg.sender] -= _amount;
        
        // Transfer tokens back to user
        _transfer(address(this), msg.sender, _amount);
        
        emit TokensUnstaked(msg.sender, _amount, rewards);
    }
    
    /**
     * @dev Claim staking rewards
     */
    function claimRewards() external nonReentrant whenNotPaused {
        uint256 rewards = _calculateRewards(msg.sender);
        require(rewards > 0, "No rewards to claim");
        
        _claimRewards();
        emit RewardsClaimed(msg.sender, rewards);
    }
    
    /**
     * @dev Internal function to claim rewards
     */
    function _claimRewards() internal {
        uint256 rewards = _calculateRewards(msg.sender);
        if (rewards > 0) {
            lastClaimedRewards[msg.sender] = block.timestamp;
            _mint(msg.sender, rewards);
        }
    }
    
    /**
     * @dev Calculate staking rewards for a user
     */
    function _calculateRewards(address _user) internal view returns (uint256) {
        if (stakingBalances[_user] == 0) {
            return 0;
        }
        
        uint256 stakingDuration = block.timestamp - lastClaimedRewards[_user];
        uint256 annualRewards = (stakingBalances[_user] * STAKING_REWARD_RATE) / 100;
        uint256 rewards = (annualRewards * stakingDuration) / 365 days;
        
        return rewards;
    }
    
    /**
     * @dev Override transfer to include platform fees
     */
    function _transfer(address from, address to, uint256 amount) internal override {
        if (from == owner() || to == owner() || from == address(this) || to == address(this)) {
            // No fees for owner, contract, or internal transfers
            super._transfer(from, to, amount);
        } else {
            // Calculate platform fee
            uint256 fee = (amount * PLATFORM_FEE_PERCENTAGE) / 100;
            uint256 transferAmount = amount - fee;
            
            // Transfer main amount
            super._transfer(from, to, transferAmount);
            
            // Transfer fee to fee recipient
            if (fee > 0) {
                super._transfer(from, feeRecipient, fee);
                totalFeesCollected += fee;
                emit FeeCollected(from, fee);
            }
        }
    }
    
    /**
     * @dev Mint new tokens (only owner, up to max supply)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Would exceed max supply");
        _mint(to, amount);
    }
    
    /**
     * @dev Set fee recipient (only owner)
     */
    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _feeRecipient;
    }
    
    /**
     * @dev Pause token operations (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause token operations (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev View functions
     */
    function getStakingInfo(address _user) external view returns (
        uint256 stakedAmount,
        uint256 stakingTimestamp,
        uint256 pendingRewards
    ) {
        return (
            stakingBalances[_user],
            stakingTimestamps[_user],
            _calculateRewards(_user)
        );
    }
    
    function getTotalStaked() external view returns (uint256) {
        return balanceOf(address(this));
    }
    
    /**
     * @dev Override required functions
     */
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Pausable)
    {
        super._beforeTokenTransfer(from, to, amount);
    }
}


