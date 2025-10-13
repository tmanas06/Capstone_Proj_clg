const hre = require("hardhat");

async function main() {
  console.log("🚰 Setting up faucet for testing...");

  // Get the contract instances
  const TestnetToken = await hre.ethers.getContractFactory("TestnetToken");
  const deploymentsDir = require("path").join(__dirname, "..", "deployments");
  const deploymentFile = require("path").join(deploymentsDir, "localhost.json");
  
  if (!require("fs").existsSync(deploymentFile)) {
    console.error("❌ No deployment found. Please run deployment first.");
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(require("fs").readFileSync(deploymentFile, "utf8"));
  const testnetTokenAddress = deploymentInfo.contracts.TestnetToken;
  
  const testnetToken = TestnetToken.attach(testnetTokenAddress);
  const [deployer] = await hre.ethers.getSigners();

  console.log(`\n📋 Faucet Setup Information:`);
  console.log("=====================================");
  console.log(`Network: ${hre.network.name}`);
  console.log(`Chain ID: ${await hre.ethers.provider.getNetwork().then(n => n.chainId)}`);
  console.log(`TestnetToken Address: ${testnetTokenAddress}`);
  console.log(`Deployer Address: ${deployer.address}`);
  console.log(`Deployer Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`);

  console.log(`\n🔧 MetaMask Setup Instructions:`);
  console.log("=====================================");
  console.log("1. Open MetaMask");
  console.log("2. Click on network dropdown");
  console.log("3. Click 'Add network' or 'Custom RPC'");
  console.log("4. Enter the following details:");
  console.log("   Network Name: Hardhat Local");
  console.log("   RPC URL: http://127.0.0.1:8545");
  console.log("   Chain ID: 31337");
  console.log("   Currency Symbol: ETH");
  console.log("   Block Explorer URL: (leave empty)");
  console.log("5. Click 'Save'");

  console.log(`\n🔑 Import Faucet Account:`);
  console.log("=====================================");
  console.log("1. In MetaMask, click account icon");
  console.log("2. Click 'Import Account'");
  console.log("3. Select 'Private Key'");
  console.log("4. Enter: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
  console.log("5. Click 'Import'");

  console.log(`\n🪙 Add TestnetToken:`);
  console.log("=====================================");
  console.log("1. In MetaMask, click 'Import tokens'");
  console.log("2. Click 'Custom Token'");
  console.log(`3. Enter contract address: ${testnetTokenAddress}`);
  console.log("4. Token Symbol: TEST");
  console.log("5. Decimals: 18");
  console.log("6. Click 'Add Custom Token'");

  console.log(`\n💰 Current Balances:`);
  console.log("=====================================");
  const ethBalance = await hre.ethers.provider.getBalance(deployer.address);
  const testBalance = await testnetToken.balanceOf(deployer.address);
  console.log(`ETH Balance: ${hre.ethers.formatEther(ethBalance)} ETH`);
  console.log(`TEST Balance: ${hre.ethers.formatEther(testBalance)} TEST`);

  console.log(`\n🎯 Next Steps:`);
  console.log("=====================================");
  console.log("1. Follow the MetaMask setup instructions above");
  console.log("2. Import the faucet account");
  console.log("3. Add the TestnetToken to your wallet");
  console.log("4. Start testing the platform!");
  console.log("5. Use TEST tokens for staking");
  console.log("6. Use YJT tokens for platform rewards");
  console.log("6. Use platform tokens for rewards (minted during deployment if applicable)");

  console.log(`\n📚 Documentation:`);
  console.log("=====================================");
  console.log("- MetaMask Setup: METAMASK_SETUP_GUIDE.md");
  console.log("- Faucet Guide: FAUCET_GUIDE.md");
  console.log("- Deployment Guide: DEPLOYMENT_GUIDE.md");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  });
