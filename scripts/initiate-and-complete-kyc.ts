const { ethers } = require("hardhat");

/**
 * Complete KYC setup for a user address
 * This script requires the user to have their private key available
 * OR you can use it with Hardhat's accounts
 * 
 * Usage: 
 *   npx hardhat run scripts/initiate-and-complete-kyc.ts --network localhost
 * 
 * For testing with Hardhat accounts, modify USER_INDEX below
 */

async function main() {
  const [deployer, user1, user2] = await ethers.getSigners();
  
  // Contract address
  const USER_VERIFICATION = "0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44";
  
  // For testing: Use one of Hardhat's default accounts (user1 or user2)
  // These accounts already have KYC completed in seed script
  // Change this to match your wallet, or use user1/user2 for testing
  const USER_INDEX = 0; // 0 = deployer, 1 = user1, 2 = user2
  
  const testUsers = [deployer, user1, user2];
  const selectedUser = testUsers[USER_INDEX];
  
  console.log("=== KYC Setup Script ===");
  console.log("Selected user:", selectedUser.address);
  console.log("Deployer (verifier):", deployer.address);
  
  const UserVerification = await ethers.getContractAt("UserVerification", USER_VERIFICATION);
  
  // Check current status
  const [kycComplete, identityHash] = await UserVerification.getVerificationStatus(selectedUser.address);
  
  if (kycComplete) {
    console.log("\n✅ KYC already completed!");
    return;
  }
  
  // Step 1: Initiate KYC (must be called from user's address)
  try {
    const hasInitiated = await UserVerification.hasInitiatedKYC(selectedUser.address);
    
    if (!hasInitiated) {
      console.log("\n1. Initiating KYC...");
      const identityHash = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(`identity-${selectedUser.address}-${Date.now()}`)
      );
      
      const tx1 = await UserVerification.connect(selectedUser).initiateKYC(identityHash);
      await tx1.wait();
      console.log("   ✅ KYC initiated");
    } else {
      console.log("\n1. KYC already initiated");
    }
  } catch (error: any) {
    console.error("   ❌ Failed to initiate KYC:", error.message);
    throw error;
  }
  
  // Step 2: Complete KYC (called by verifier/deployer)
  try {
    console.log("\n2. Completing KYC verification...");
    const tx2 = await UserVerification.completeKYC(selectedUser.address, true);
    await tx2.wait();
    console.log("   ✅ KYC completed");
    
    // Verify
    const [verified] = await UserVerification.getVerificationStatus(selectedUser.address);
    console.log("\n✅ Final Status - KYC Complete:", verified);
    
  } catch (error: any) {
    console.error("   ❌ Failed to complete KYC:", error.message);
    throw error;
  }
  
  console.log("\n🎉 KYC setup complete! You can now apply for jobs.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

