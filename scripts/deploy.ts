// @ts-nocheck
import { ethers } from "hardhat";
import fs from "fs-extra";
import path from "path";

// Create a type for the contract addresses
interface ContractAddresses {
  TestnetToken: string;
  PlatformToken: string;
  UserProfile: string;
  FraudDetection: string;
  Web3JobPlatform: string;
}

interface ContractAddresses {
  TestnetToken: string;
  PlatformToken: string;
  UserProfile: string;
  FraudDetection: string;
  Web3JobPlatform: string;
}

interface DeploymentInfo {
  network: string;
  timestamp: string;
  contracts: ContractAddresses;
}

async function main() {
  const network = await ethers.provider.getNetwork();
  console.log("Deploying contracts...");
  
  // Deploy TestnetToken first
  const TestnetToken = await ethers.getContractFactory("TestnetToken");
  const testnetToken = await TestnetToken.deploy();
  await testnetToken.waitForDeployment();
  console.log(`TestnetToken deployed to: ${await testnetToken.getAddress()}`);

  // Deploy PlatformToken
  const PlatformToken = await ethers.getContractFactory("PlatformToken");
  const platformToken = await PlatformToken.deploy();
  await platformToken.waitForDeployment();
  console.log(`PlatformToken deployed to: ${await platformToken.getAddress()}`);

  // Deploy UserProfile
  const UserProfile = await ethers.getContractFactory("UserProfile");
  const userProfile = await UserProfile.deploy();
  await userProfile.waitForDeployment();
  console.log(`UserProfile deployed to: ${await userProfile.getAddress()}`);

  // Deploy FraudDetection
  const FraudDetection = await ethers.getContractFactory("FraudDetection");
  const fraudDetection = await FraudDetection.deploy(await userProfile.getAddress());
  await fraudDetection.waitForDeployment();
  console.log(`FraudDetection deployed to: ${await fraudDetection.getAddress()}`);

  // Deploy Web3JobPlatform with all dependencies
  const Web3JobPlatform = await ethers.getContractFactory("Web3JobPlatform");
  const web3JobPlatform = await Web3JobPlatform.deploy(
    await userProfile.getAddress(),
    await platformToken.getAddress(),
    await fraudDetection.getAddress()
  );
  await web3JobPlatform.waitForDeployment();
  console.log(`Web3JobPlatform deployed to: ${await web3JobPlatform.getAddress()}`);

  // Save deployment addresses to a JSON file
  const contracts: ContractAddresses = {
    TestnetToken: await testnetToken.getAddress(),
    PlatformToken: await platformToken.getAddress(),
    UserProfile: await userProfile.getAddress(),
    FraudDetection: await fraudDetection.getAddress(),
    Web3JobPlatform: await web3JobPlatform.getAddress(),
  };

  const contractsDir = path.join(__dirname, "..", "deployments");
  await fs.ensureDir(contractsDir);
  
  const deploymentInfo: DeploymentInfo = {
    network: network.name || 'localhost',
    timestamp: new Date().toISOString(),
    contracts: contracts
  };

  const networkName = network.name || 'localhost';
  const deploymentFile = path.join(contractsDir, `deployed-contracts-${networkName}.json`);
  await fs.writeJson(
    deploymentFile,
    deploymentInfo,
    { spaces: 2 }
  );
  
  console.log("Deployment info:", JSON.stringify(deploymentInfo, null, 2));
  console.log(`Deployment addresses saved to ${deploymentFile}`);
  
  // Verify contracts on Etherscan if not on localhost
  if (network.name && network.name !== "hardhat" && network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await testnetToken.deploymentTransaction()?.wait(6);
    await platformToken.deploymentTransaction()?.wait(6);
    await userProfile.deploymentTransaction()?.wait(6);
    await fraudDetection.deploymentTransaction()?.wait(6);
    await web3JobPlatform.deploymentTransaction()?.wait(6);
    
    console.log("Verification skipped for local deployment");
  }
}

// Helper function to verify contracts on Etherscan (placeholder for now)
async function verify(contractAddress: string, args: any[]) {
  console.log(`Verification would be done for ${contractAddress} with args:`, args);
  // Implementation would go here for actual verification
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
