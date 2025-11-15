const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Verifying JobVerify Setup...\n");
  
  // Latest deployed addresses
  const JOB_POSTING = "0x610178dA211FEF7D417bC0e6FeD39F05609AD788";
  
  try {
    // Check if Hardhat node is running
    console.log("1. Checking Hardhat node connection...");
    const provider = ethers.provider;
    const network = await provider.getNetwork();
    console.log(`   ✓ Connected to network: ${network.name} (chainId: ${network.chainId})`);
    
    // Check contract exists
    console.log("\n2. Checking if contract exists...");
    const code = await provider.getCode(JOB_POSTING);
    if (code === "0x") {
      console.log("   ❌ Contract does NOT exist at this address!");
      console.log("   → Hardhat node may have been restarted");
      console.log("   → Run: npx hardhat run scripts/deploy-jobverify.ts --network localhost");
      process.exit(1);
    }
    console.log(`   ✓ Contract exists at: ${JOB_POSTING}`);
    
    // Test getTotalJobs()
    console.log("\n3. Testing getTotalJobs()...");
    const JobPosting = await ethers.getContractAt("JobPosting", JOB_POSTING);
    const totalJobs = await JobPosting.getTotalJobs();
    console.log(`   ✓ getTotalJobs() returned: ${totalJobs.toString()}`);
    
    if (totalJobs.toNumber() === 0) {
      console.log("\n   ⚠️  No jobs found! You need to seed data:");
      console.log("   → Run: npx hardhat run scripts/seed-dummy-data.ts --network localhost");
    } else {
      console.log(`\n4. Fetching ${totalJobs.toString()} jobs...`);
      for (let i = 1; i <= totalJobs.toNumber(); i++) {
        try {
          const job = await JobPosting.jobs(i);
          console.log(`   ✓ Job ${i}: ${job.positionTitle} (Company: ${job.companyAddress})`);
        } catch (e) {
          console.log(`   ❌ Job ${i}: Error - ${e.message}`);
        }
      }
    }
    
    console.log("\n✅ Setup Verification Complete!");
    console.log("\n📋 Summary:");
    console.log(`   • Contract Address: ${JOB_POSTING}`);
    console.log(`   • Total Jobs: ${totalJobs.toString()}`);
    console.log(`   • Network: ${network.name} (${network.chainId})`);
    console.log("\n💡 Frontend should use this address:");
    console.log(`   NEXT_PUBLIC_JOB_POSTING_ADDRESS=${JOB_POSTING}`);
    
  } catch (error) {
    console.error("\n❌ Verification Failed!");
    console.error("Error:", error.message);
    
    if (error.message.includes("ECONNREFUSED")) {
      console.error("\n⚠️  Hardhat node is not running!");
      console.error("   → Start it with: npx hardhat node");
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

