import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  console.log("Deploying contracts...");
  
  // Get the contract factory
  const TestnetToken = await ethers.getContractFactory("TestnetToken");
  const PlatformToken = await ethers.getContractFactory("PlatformToken");
  const UserProfile = await ethers.getContractFactory("UserProfile");
  const FraudDetection = await ethers.getContractFactory("FraudDetection");
  const Web3JobPlatform = await ethers.getContractFactory("Web3JobPlatform");

  // Deploy TestnetToken
  console.log("Deploying TestnetToken...");
  const testnetToken = await TestnetToken.deploy();
  await testnetToken.deployed();
  
  // Deploy PlatformToken
  console.log("Deploying PlatformToken...");
  const platformToken = await PlatformToken.deploy();
  await platformToken.deployed();
  
  // Deploy UserProfile
  console.log("Deploying UserProfile...");
  const userProfile = await UserProfile.deploy();
  await userProfile.deployed();
  
  // Deploy FraudDetection
  console.log("Deploying FraudDetection...");
  const fraudDetection = await FraudDetection.deploy(userProfile.address);
  await fraudDetection.deployed();
  
  // Deploy Web3JobPlatform
  console.log("Deploying Web3JobPlatform...");
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
