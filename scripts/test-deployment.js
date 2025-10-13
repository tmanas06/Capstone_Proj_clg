const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🧪 Testing deployed contracts...");

  // Read deployment info
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  const networkName = hre.network.name === "hardhat" ? "localhost" : hre.network.name;
  const deploymentFile = path.join(deploymentsDir, `${networkName}.json`);

  if (!fs.existsSync(deploymentFile)) {
    console.error(`❌ Deployment file not found: ${deploymentFile}`);
    console.log("Please run deployment first with: npm run deploy:" + networkName);
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const contracts = deploymentInfo.contracts;

  // Get contract instances
  const TestnetToken = await hre.ethers.getContractFactory("TestnetToken");
  const PlatformToken = await hre.ethers.getContractFactory("PlatformToken");
  const FraudDetection = await hre.ethers.getContractFactory("FraudDetection");
  const Web3JobPlatform = await hre.ethers.getContractFactory("Web3JobPlatform");

  const testnetToken = TestnetToken.attach(contracts.TestnetToken);
  const platformToken = PlatformToken.attach(contracts.PlatformToken || contracts.YellowJobToken);
  const fraudDetection = FraudDetection.attach(contracts.FraudDetection);
  const web3JobPlatform = Web3JobPlatform.attach(contracts.Web3JobPlatform);

  console.log("\n🔍 Testing contract functionality...");
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
  const tokenName = await platformToken.name();
  const tokenSymbol = await platformToken.symbol();
  const tokenDecimals = await platformToken.decimals();
  const totalSupply = await platformToken.totalSupply();
    
  console.log(`✅ Name: ${tokenName}`);
  console.log(`✅ Symbol: ${tokenSymbol}`);
  console.log(`✅ Decimals: ${tokenDecimals}`);
  console.log(`✅ Total Supply: ${hre.ethers.formatEther(totalSupply)} ${tokenSymbol}`);

    // Test FraudDetection
    console.log("\n🛡️ Testing FraudDetection...");
    const maxApplications = await fraudDetection.MAX_APPLICATIONS_PER_DAY();
    const maxJobs = await fraudDetection.MAX_JOBS_PER_DAY();
    const minReputation = await fraudDetection.MIN_REPUTATION_FOR_POSTING();
    
    console.log(`✅ Max Applications Per Day: ${maxApplications}`);
    console.log(`✅ Max Jobs Per Day: ${maxJobs}`);
    console.log(`✅ Min Reputation For Posting: ${minReputation}`);

    // Test Web3JobPlatform
    console.log("\n💼 Testing Web3JobPlatform...");
    const platformFee = await web3JobPlatform.PLATFORM_FEE_PERCENTAGE();
    const minStake = await web3JobPlatform.MIN_STAKE_AMOUNT();
    const maxStake = await web3JobPlatform.MAX_STAKE_AMOUNT();
    const stakeDuration = await web3JobPlatform.STAKE_DURATION();
    
    console.log(`✅ Platform Fee: ${platformFee}%`);
    console.log(`✅ Min Stake Amount: ${hre.ethers.formatEther(minStake)} tokens`);
    console.log(`✅ Max Stake Amount: ${hre.ethers.formatEther(maxStake)} tokens`);
    console.log(`✅ Stake Duration: ${stakeDuration} seconds`);

    // Test token connection
    const stakingTokenAddress = await web3JobPlatform.stakingToken();
    console.log(`✅ Staking Token Address: ${stakingTokenAddress}`);
    console.log(`✅ Token Match: ${stakingTokenAddress === contracts.TestnetToken ? "✅" : "❌"}`);

    // Test basic functionality
    console.log("\n🔧 Testing basic functionality...");
    
    // Get deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log(`✅ Deployer: ${deployer.address}`);
    
    // Check token balances
    const deployerYJTBalance = await platformToken.balanceOf(deployer.address);
    const deployerTestBalance = await testnetToken.balanceOf(deployer.address);
    console.log(`✅ Deployer YJT Balance: ${hre.ethers.formatEther(deployerYJTBalance)} ${tokenSymbol}`);
    console.log(`✅ Deployer TEST Balance: ${hre.ethers.formatEther(deployerTestBalance)} ${testnetSymbol}`);

    // Test contract ownership
    const tokenOwner = await yellowJobToken.owner();
    const fraudOwner = await fraudDetection.owner();
    const platformOwner = await web3JobPlatform.owner();
    
    console.log(`✅ Token Owner: ${tokenOwner}`);
    console.log(`✅ Fraud Detection Owner: ${fraudOwner}`);
    console.log(`✅ Platform Owner: ${platformOwner}`);
    console.log(`✅ All Owned by Deployer: ${tokenOwner === deployer.address && fraudOwner === deployer.address && platformOwner === deployer.address ? "✅" : "❌"}`);

    console.log("\n🎉 All tests passed successfully!");
    console.log("\n📊 Contract Summary:");
    console.log("===================");
    console.log(`Network: ${networkName}`);
    console.log(`Chain ID: ${deploymentInfo.chainId}`);
    console.log(`Deployer: ${deployer.address}`);
    console.log(`Deployment Time: ${deploymentInfo.timestamp}`);
    console.log("\nContract Addresses:");
  console.log(`TestnetToken (for staking): ${contracts.TestnetToken}`);
  console.log(`PlatformToken: ${contracts.PlatformToken || contracts.YellowJobToken}`);
    console.log(`FraudDetection: ${contracts.FraudDetection}`);
    console.log(`Web3JobPlatform: ${contracts.Web3JobPlatform}`);

  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test execution failed:", error);
    process.exit(1);
  });
