const { ethers } = require("hardhat");

async function main() {
  const [deployer, user1, user2, company1, company2] = await ethers.getSigners();

  console.log("Seeding dummy data with account:", deployer.address);

  // Contract addresses from latest deployment (updated after redeployment)
  // Updated: 2025-11-15 - Latest deployment with getJobDetails() function
  const USER_VERIFICATION = "0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44";
  const COMPANY_VERIFICATION = "0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f";
  const CREDENTIAL_REGISTRY = "0x4A679253410272dd5232B3Ff7cF5dbB88f295319";
  const JOB_POSTING = "0x7a2088a1bFc9d81c55368AE168C2C02570cB814F";

  // Get contract instances
  const UserVerification = await ethers.getContractAt("UserVerification", USER_VERIFICATION);
  const CompanyVerification = await ethers.getContractAt("CompanyVerification", COMPANY_VERIFICATION);
  const CredentialRegistry = await ethers.getContractAt("CredentialRegistry", CREDENTIAL_REGISTRY);
  const JobPosting = await ethers.getContractAt("JobPosting", JOB_POSTING);

  console.log("\n=== Seeding User Verifications ===");
  
  // User 1: Complete KYC
  const identityHash1 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("user1-identity-proof"));
  await UserVerification.connect(user1).initiateKYC(identityHash1);
  await UserVerification.completeKYC(user1.address, true);
  console.log("✓ User 1 KYC completed:", user1.address);

  // User 2: Complete KYC
  const identityHash2 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("user2-identity-proof"));
  await UserVerification.connect(user2).initiateKYC(identityHash2);
  await UserVerification.completeKYC(user2.address, true);
  console.log("✓ User 2 KYC completed:", user2.address);

  console.log("\n=== Seeding Company Registrations ===");
  
  // Company 1: Register and verify
  const companyHash1 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("TechCorp Inc"));
  await CompanyVerification.connect(company1).registerCompany(
    companyHash1,
    [company1.address] // Single officer
  );
  await CompanyVerification.verifyCompanyOfficer(company1.address, company1.address, true);
  console.log("✓ Company 1 registered and verified:", company1.address);

  // Company 2: Register and verify
  const companyHash2 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Blockchain Solutions Ltd"));
  await CompanyVerification.connect(company2).registerCompany(
    companyHash2,
    [company2.address]
  );
  await CompanyVerification.verifyCompanyOfficer(company2.address, company2.address, true);
  console.log("✓ Company 2 registered and verified:", company2.address);

  // Update trust scores
  await CompanyVerification.connect(company1).calculateTrustScore(company1.address);
  await CompanyVerification.connect(company2).calculateTrustScore(company2.address);

  console.log("\n=== Seeding Credentials ===");
  
  // Issue credentials to users
  const credHash1 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("user1-bsc-degree"));
  await CredentialRegistry.issueCredential(
    user1.address,
    credHash1,
    0, // EDUCATIONAL
    0, // No expiration
    "Bachelor of Science in Computer Science - MIT"
  );
  console.log("✓ Credential issued to User 1");

  const credHash2 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("user2-aws-cert"));
  await CredentialRegistry.issueCredential(
    user2.address,
    credHash2,
    1, // PROFESSIONAL_CERTIFICATION
    0,
    "AWS Certified Solutions Architect"
  );
  console.log("✓ Credential issued to User 2");

  // Link credentials - credentials are automatically linked when issued
  // The linkCredentialToUser function is for users to manually link existing credentials
  // Since we just issued them, they're already in the candidateCredentials mapping
  console.log("✓ Credentials automatically linked to users");

  console.log("\n=== Seeding Job Postings ===");
  
  // Company 1 posts jobs
  const job1Title = "Senior Blockchain Developer";
  const job1Desc = "Looking for an experienced blockchain developer with Solidity expertise";
  const requiredCreds1: string[] = [];
  await JobPosting.connect(company1).createJobPosting(
    job1Title,
    job1Desc,
    requiredCreds1,
    60 // Minimum trust score
  );
  console.log("✓ Job 1 posted by Company 1");

  const job2Title = "Full Stack Web3 Developer";
  const job2Desc = "Join our team to build the next generation of Web3 applications";
  await JobPosting.connect(company1).createJobPosting(
    job2Title,
    job2Desc,
    [],
    50
  );
  console.log("✓ Job 2 posted by Company 1");

  const job3Title = "Smart Contract Auditor";
  const job3Desc = "Security-focused role for auditing smart contracts";
  await JobPosting.connect(company2).createJobPosting(
    job3Title,
    job3Desc,
    [],
    70
  );
  console.log("✓ Job 3 posted by Company 2");

  // We know we created 3 jobs, so we can directly reference them
  console.log(`\nTotal jobs created: 3`);

  // User 1 applies for job 1
  try {
    // Apply without credentials for now (jobs don't require credentials in this seed)
    await JobPosting.connect(user1).applyForJob(
      1,
      "I am a passionate blockchain developer with 5 years of experience...",
      [] // Empty credentials array - jobs posted without required credentials
    );
    console.log("✓ User 1 applied for Job 1");
  } catch (e: any) {
    console.log("⚠ Could not apply:", e.message?.substring(0, 100) || e.toString().substring(0, 100));
  }

  // Record some hires for trust score
  await CompanyVerification.recordHire(company1.address, user1.address);
  console.log("✓ Recorded hire for Company 1");

  console.log("\n=== Seeding Complete ===");
  console.log("\nDummy Data Summary:");
  console.log("- 2 Users with completed KYC");
  console.log("- 2 Companies registered and verified");
  console.log("- 2 Credentials issued");
  console.log("- 3 Job postings");
  console.log("- 1 Job application");
  console.log("- 1 Successful hire recorded");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

