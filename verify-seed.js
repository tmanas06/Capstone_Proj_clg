const { ethers } = require("ethers");

async function verify() {
  const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
  const address = "0x851356ae760d987E095750cCeb3bC6014560891C";
  const abi = ["function getTotalJobs() view returns (uint256)"];
  const contract = new ethers.Contract(address, abi, provider);
  
  const totalJobs = await contract.getTotalJobs();
  console.log("Total jobs after seeding:", totalJobs.toString());
  
  if (totalJobs.toNumber() === 3) {
    console.log(" Data seeded successfully!");
  } else {
    console.log(" Expected 3 jobs, got", totalJobs.toString());
  }
}

verify().catch(console.error);
