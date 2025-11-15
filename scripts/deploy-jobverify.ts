const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy UserVerification
  console.log("\nDeploying UserVerification...");
  const UserVerification = await ethers.getContractFactory("UserVerification");
  const userVerification = await UserVerification.deploy();
  await userVerification.deployed();
  console.log("UserVerification deployed to:", userVerification.address);

  // Deploy CompanyVerification
  console.log("\nDeploying CompanyVerification...");
  const CompanyVerification = await ethers.getContractFactory("CompanyVerification");
  const companyVerification = await CompanyVerification.deploy();
  await companyVerification.deployed();
  console.log("CompanyVerification deployed to:", companyVerification.address);

  // Deploy CredentialRegistry
  console.log("\nDeploying CredentialRegistry...");
  const CredentialRegistry = await ethers.getContractFactory("CredentialRegistry");
  const credentialRegistry = await CredentialRegistry.deploy();
  await credentialRegistry.deployed();
  console.log("CredentialRegistry deployed to:", credentialRegistry.address);

  // Deploy JobPosting (requires addresses of other contracts)
  console.log("\nDeploying JobPosting...");
  const JobPosting = await ethers.getContractFactory("JobPosting");
  const jobPosting = await JobPosting.deploy(
    companyVerification.address,
    userVerification.address,
    credentialRegistry.address
  );
  await jobPosting.deployed();
  console.log("JobPosting deployed to:", jobPosting.address);

  // Deploy DisputeResolution
  console.log("\nDeploying DisputeResolution...");
  const DisputeResolution = await ethers.getContractFactory("DisputeResolution");
  const disputeResolution = await DisputeResolution.deploy();
  await disputeResolution.deployed();
  console.log("DisputeResolution deployed to:", disputeResolution.address);

  // Save deployment addresses
  const deploymentInfo = {
    network: "localhost",
    contracts: {
      UserVerification: userVerification.address,
      CompanyVerification: companyVerification.address,
      CredentialRegistry: credentialRegistry.address,
      JobPosting: jobPosting.address,
      DisputeResolution: disputeResolution.address,
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  console.log("\n=== Deployment Summary ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Grant roles
  console.log("\nSetting up roles...");
  
  // Add deployer as verifier in UserVerification
  await userVerification.addVerifier(deployer.address);
  console.log("Added deployer as verifier in UserVerification");

  // Add deployer as verifier in CompanyVerification
  await companyVerification.addVerifier(deployer.address);
  console.log("Added deployer as verifier in CompanyVerification");

  // Authorize deployer as issuer in CredentialRegistry
  await credentialRegistry.authorizeIssuer(deployer.address);
  console.log("Authorized deployer as issuer in CredentialRegistry");

  // Add deployer as arbitrator in DisputeResolution
  await disputeResolution.addArbitrator(deployer.address);
  console.log("Added deployer as arbitrator in DisputeResolution");

  console.log("\n✅ All contracts deployed and configured successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

