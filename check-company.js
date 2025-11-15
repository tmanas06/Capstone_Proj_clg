const { ethers } = require("ethers");

async function checkCompany() {
  const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
  const address = "0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9"; // CompanyVerification
  const abi = ["function getCompanyInfo(address) view returns (bytes32, uint256, bool, uint8, uint256, uint256, uint256, uint256)"];
  const contract = new ethers.Contract(address, abi, provider);
  
  // Check the user's address from the error
  const userAddress = "0xB5E7a017e2bBdD4349d7974506B56E2d4D6937fA";
  
  try {
    const info = await contract.getCompanyInfo(userAddress);
    console.log("Company registered:", info[2]); // verified field
    console.log("Company info:", info);
  } catch (e) {
    console.log("Company NOT registered:", e.message);
  }
  
  // Check seeded companies
  const seeded1 = "0x90F79bf6EB2c4f870365E785982E1f101E93b906";
  const seeded2 = "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65";
  
  console.log("\nChecking seeded companies:");
  try {
    const info1 = await contract.getCompanyInfo(seeded1);
    console.log("Company 1 registered:", info1[2]);
  } catch (e) {
    console.log("Company 1 error:", e.message);
  }
  
  try {
    const info2 = await contract.getCompanyInfo(seeded2);
    console.log("Company 2 registered:", info2[2]);
  } catch (e) {
    console.log("Company 2 error:", e.message);
  }
}

checkCompany().catch(console.error);
