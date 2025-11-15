const { ethers } = require("hardhat");

/**
 * Script to complete KYC verification for a specific address
 * Usage: npx hardhat run scripts/complete-kyc-for-address.ts --network localhost
 * 
 * This will complete KYC for the address specified in the script.
 * For development, you can modify the USER_ADDRESS constant below.
 */

async function main() {
  const [deployer] = await ethers.getSigners();
  
  // Contract address from latest deployment
  const USER_VERIFICATION = "0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44";
  
  // Address to complete KYC for (change this to your wallet address)
  // Current user from error: 0xB5E7a017e2bBdD4349d7974506B56E2d4D6937fA
  const USER_ADDRESS = "0xB5E7a017e2bBdD4349d7974506B56E2d4D6937fA";
  
  console.log("Completing KYC for address:", USER_ADDRESS);
  console.log("Using deployer account:", deployer.address);
  
  const UserVerification = await ethers.getContractAt("UserVerification", USER_VERIFICATION);
  
  // Check current status
  try {
    const [kycComplete, identityHash, verificationTime, credentialCount] = 
      await UserVerification.getVerificationStatus(USER_ADDRESS);
    
    console.log("\nCurrent KYC Status:");
    console.log("  - KYC Complete:", kycComplete);
    console.log("  - Identity Hash:", identityHash);
    console.log("  - Verification Time:", verificationTime.toString());
    
    if (kycComplete) {
      console.log("\n✅ KYC already completed for this address!");
      return;
    }
  } catch (e) {
    console.log("User not found or KYC not initiated");
  }
  
  // Step 1: Initiate KYC (user needs to do this, but for dev we can simulate)
  // We'll use the deployer to initiate if not already done
  try {
    const hasInitiated = await UserVerification.hasInitiatedKYC(USER_ADDRESS);
    if (!hasInitiated) {
      console.log("\n⚠️  KYC not initiated. Initiating KYC first...");
      // For development, we'll use a dummy identity hash
      // In production, this should come from Self Protocol
      const identityHash = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(`identity-proof-${USER_ADDRESS}-${Date.now()}`)
      );
      
      // We need to call initiateKYC from the user's address
      // For dev purposes, we'll use a signer with that address
      // But since we don't have the private key, we'll just complete it if already initiated
      console.log("   Note: User needs to initiate KYC first via frontend or with their private key");
      console.log("   For now, we'll try to complete it if already initiated...");
    }
  } catch (e) {
    console.log("Could not check initiation status");
  }
  
  // Step 2: Complete KYC (requires VERIFIER_ROLE)
  try {
    console.log("\nCompleting KYC verification...");
    
    // First, initiate KYC if not already done (using deployer as proxy)
    // Actually, we can't do this without the user's private key
    // So let's check if we can complete it directly
    
    // For development: If user hasn't initiated, we'll need to do it differently
    // Let's try to complete KYC - if it fails, we'll know why
    const tx = await UserVerification.completeKYC(USER_ADDRESS, true);
    await tx.wait();
    
    console.log("✅ KYC verification completed successfully!");
    console.log("   Transaction hash:", tx.hash);
    
    // Verify
    const [kycComplete] = await UserVerification.getVerificationStatus(USER_ADDRESS);
    console.log("\n✅ Verification confirmed - KYC Complete:", kycComplete);
    
  } catch (error: any) {
    if (error.message?.includes("KYC not initiated")) {
      console.error("\n❌ Error: KYC not initiated for this address.");
      console.error("   The user needs to initiate KYC first.");
      console.error("   Options:");
      console.error("   1. Use the frontend KYC flow at /auth/kyc-verification");
      console.error("   2. Call initiateKYC() from the user's wallet");
      console.error("   3. For testing, use one of the seeded accounts:");
      console.error("      - User 1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
      console.error("      - User 2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC");
    } else if (error.message?.includes("AccessControl")) {
      console.error("\n❌ Error: Deployer account doesn't have VERIFIER_ROLE");
      console.error("   The deployer should have this role. Checking roles...");
    } else {
      console.error("\n❌ Error completing KYC:", error.message);
    }
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

