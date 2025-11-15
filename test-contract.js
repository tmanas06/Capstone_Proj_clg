const { ethers } = require("hardhat");

async function testContract() {
  const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
  const jobPostingAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
  
  const abi = ["function getTotalJobs() view returns (uint256)"];
  const contract = new ethers.Contract(jobPostingAddress, abi, provider);
  
  try {
    const totalJobs = await contract.getTotalJobs();
    console.log("Total jobs:", totalJobs.toString());
    return true;
  } catch (e) {
    console.error("Error:", e.message);
    return false;
  }
}

testContract();
