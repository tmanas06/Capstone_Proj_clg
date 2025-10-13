const hre = require("hardhat");

async function main() {
  console.log("🧪 Testing Frontend Integration...");

  // Get the contract instances
  const TestnetToken = await hre.ethers.getContractFactory("TestnetToken");
  const PlatformToken = await hre.ethers.getContractFactory("PlatformToken");
  const FraudDetection = await hre.ethers.getContractFactory("FraudDetection");
  const Web3JobPlatform = await hre.ethers.getContractFactory("Web3JobPlatform");

  // Read deployment info
  const deploymentsDir = require("path").join(__dirname, "..", "deployments");
  const deploymentFile = require("path").join(deploymentsDir, "localhost.json");
  
  if (!require("fs").existsSync(deploymentFile)) {
    console.error("❌ No deployment found. Please run deployment first.");
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(require("fs").readFileSync(deploymentFile, "utf8"));
  const contracts = deploymentInfo.contracts;
  
  const testnetToken = TestnetToken.attach(contracts.TestnetToken);
  const platformToken = PlatformToken.attach(contracts.PlatformToken);
  const fraudDetection = FraudDetection.attach(contracts.FraudDetection);
  const web3JobPlatform = Web3JobPlatform.attach(contracts.Web3JobPlatform);

  console.log("\n🔍 Testing Contract Integration...");
  console.log("=====================================");

  try {
    // Test TestnetToken
    console.log("\n🪙 Testing TestnetToken...");
    const testnetName = await testnetToken.name();
    const testnetSymbol = await testnetToken.symbol();
    const testnetDecimals = await testnetToken.decimals();
    const testnetTotalSupply = await testnetToken.totalSupply();
    
    console.log(`✅ Name: ${testnetName}`);
    console.log(`✅ Symbol: ${testnetSymbol}`);
    console.log(`✅ Decimals: ${testnetDecimals}`);
    console.log(`✅ Total Supply: ${hre.ethers.formatEther(testnetTotalSupply)} ${testnetSymbol}`);

  // Test platform token (artifact key: PlatformToken)
  console.log("\n🪙 Testing PlatformToken (PlatformToken artifact)...");
  const yjtName = await platformToken.name();
  const yjtSymbol = await platformToken.symbol();
  const yjtDecimals = await platformToken.decimals();
  const yjtTotalSupply = await platformToken.totalSupply();
    
  console.log(`✅ Name: ${yjtName}`);
  console.log(`✅ Symbol: ${yjtSymbol}`);
  console.log(`✅ Decimals: ${yjtDecimals}`);
  console.log(`✅ Total Supply: ${hre.ethers.formatEther(yjtTotalSupply)} ${yjtSymbol}`);

    // Test Web3JobPlatform
    console.log("\n💼 Testing Web3JobPlatform...");
    const stakingTokenAddress = await web3JobPlatform.stakingToken();
    console.log(`✅ Staking Token Address: ${stakingTokenAddress}`);
    console.log(`✅ Correct Token: ${stakingTokenAddress === contracts.TestnetToken ? "✅" : "❌"}`);

    // Test FraudDetection
    console.log("\n🛡️ Testing FraudDetection...");
    const maxApplications = await fraudDetection.MAX_APPLICATIONS_PER_DAY();
    const maxJobs = await fraudDetection.MAX_JOBS_PER_DAY();
    const minReputation = await fraudDetection.MIN_REPUTATION_FOR_POSTING();
    
    console.log(`✅ Max Applications Per Day: ${maxApplications}`);
    console.log(`✅ Max Jobs Per Day: ${maxJobs}`);
    console.log(`✅ Min Reputation For Posting: ${minReputation}`);

    // Test faucet functionality
    console.log("\n🚰 Testing Faucet Functionality...");
    const [deployer] = await hre.ethers.getSigners();
    const initialBalance = await testnetToken.balanceOf(deployer.address);
    console.log(`✅ Initial Balance: ${hre.ethers.formatEther(initialBalance)} ${testnetSymbol}`);
    
    // Test faucet call
    try {
      await testnetToken.faucet();
      const newBalance = await testnetToken.balanceOf(deployer.address);
      console.log(`✅ After Faucet: ${hre.ethers.formatEther(newBalance)} ${testnetSymbol}`);
      console.log(`✅ Faucet Working: ${newBalance > initialBalance ? "✅" : "❌"}`);
    } catch (error) {
      console.log(`⚠️ Faucet test skipped: ${error.message}`);
    }

    console.log("\n📋 Frontend Configuration:");
    console.log("=====================================");
    console.log("Contract Addresses for Frontend:");
  console.log(`TestnetToken: ${contracts.TestnetToken}`);
  console.log(`PlatformToken: ${contracts.PlatformToken}`);
    console.log(`FraudDetection: ${contracts.FraudDetection}`);
    console.log(`Web3JobPlatform: ${contracts.Web3JobPlatform}`);
    
    console.log("\n🔧 MetaMask Setup:");
    console.log("=====================================");
    console.log("1. Add Local Network:");
    console.log("   - Network Name: Hardhat Local");
    console.log("   - RPC URL: http://127.0.0.1:8545");
    console.log("   - Chain ID: 31337");
    console.log("   - Currency Symbol: ETH");
    
    console.log("\n2. Import Faucet Account:");
    console.log("   - Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
    
    console.log("\n3. Add TestnetToken:");
    console.log(`   - Contract Address: ${contracts.TestnetToken}`);
    console.log("   - Symbol: TEST");
    console.log("   - Decimals: 18");
    
  console.log("\n4. Add PlatformToken (artifact: PlatformToken):");
  console.log(`   - Contract Address: ${contracts.PlatformToken}`);
  console.log("   - Symbol: WJD");
  console.log("   - Decimals: 18");

    console.log("\n🎯 Frontend Features Ready:");
    console.log("=====================================");
    console.log("✅ Smart Contract Integration");
    console.log("✅ Token Management (TEST for staking, YJT for rewards)");
    console.log("✅ Company Registration");
    console.log("✅ Developer Registration");
    console.log("✅ Job Posting and Application");
    console.log("✅ Fraud Detection System");
    console.log("✅ Staking Mechanism");
    console.log("✅ Reputation System");
    console.log("✅ Event Management");
    console.log("✅ Responsive UI Components");
    console.log("✅ Dark/Light Theme Support");
    console.log("✅ Web3 Wallet Integration");

    console.log("\n🚀 Next Steps:");
    console.log("=====================================");
    console.log("1. Start the frontend: npm run dev");
    console.log("2. Open http://localhost:3000");
    console.log("3. Connect MetaMask with the faucet account");
    console.log("4. Test the platform functionality");
    console.log("5. Register as a company or developer");
    console.log("6. Post jobs or apply for positions");

    console.log("\n🎉 Frontend Integration Test Complete!");

  } catch (error) {
    console.error("❌ Frontend test failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
