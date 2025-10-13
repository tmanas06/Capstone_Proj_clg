// @ts-nocheck
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy TestnetToken
  console.log("Deploying TestnetToken...");
  const TestnetToken = await hre.ethers.getContractFactory("TestnetToken");
  const testnetToken = await TestnetToken.deploy();
  await testnetToken.deployed();
  
  // Deploy PlatformToken
  console.log("Deploying PlatformToken...");
  const PlatformToken = await hre.ethers.getContractFactory("PlatformToken");
  const platformToken = await PlatformToken.deploy();
  await platformToken.deployed();
  
  // Deploy UserProfile
  console.log("Deploying UserProfile...");
  const UserProfile = await hre.ethers.getContractFactory("UserProfile");
  const userProfile = await UserProfile.deploy();
  await userProfile.deployed();
  
  // Deploy FraudDetection
  console.log("Deploying FraudDetection...");
  const FraudDetection = await hre.ethers.getContractFactory("FraudDetection");
  const fraudDetection = await FraudDetection.deploy(userProfile.address);
  await fraudDetection.deployed();
  
  // Deploy Web3JobPlatform
  console.log("Deploying Web3JobPlatform...");
  const Web3JobPlatform = await hre.ethers.getContractFactory("Web3JobPlatform");
  const web3JobPlatform = await Web3JobPlatform.deploy(
    userProfile.address,
    platformToken.address,
    fraudDetection.address
  );
  await web3JobPlatform.deployed();
  
  // Save deployment info
  const deploymentInfo = {
    network: "localhost",
    timestamp: new Date().toISOString(),
    contracts: {
      TestnetToken: testnetToken.address,
      PlatformToken: platformToken.address,
      UserProfile: userProfile.address,
      FraudDetection: fraudDetection.address,
      Web3JobPlatform: web3JobPlatform.address
    }
  };
  
  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  // Write deployment info to file
  const deploymentFile = path.join(deploymentsDir, "deployed-contracts.json");
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\nDeployment complete!");
  console.log("TestnetToken:", testnetToken.address);
  console.log("PlatformToken:", platformToken.address);
  console.log("UserProfile:", userProfile.address);
  console.log("FraudDetection:", fraudDetection.address);
  console.log("Web3JobPlatform:", web3JobPlatform.address);
  console.log("\nDeployment info saved to:", deploymentFile);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
