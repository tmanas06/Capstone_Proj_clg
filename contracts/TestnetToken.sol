// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TestnetToken
 * @dev ERC20 token for testing on Ethereum testnets
 * @notice This token can be obtained from Ethereum testnet faucets
 */
contract TestnetToken is ERC20, Ownable {
    uint256 public constant INITIAL_SUPPLY = 1000000 * 10**18; // 1 million tokens
    
    constructor() ERC20("Testnet Token", "TEST") Ownable() {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    
    /**
     * @dev Mint tokens for testing (only owner)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @dev Faucet function - anyone can get test tokens
     */
    function faucet() external {
        uint256 faucetAmount = 1000 * 10**18; // 1000 tokens
        _mint(msg.sender, faucetAmount);
    }
}
