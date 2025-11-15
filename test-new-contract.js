const { ethers } = require("ethers");

async function test() {
  const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
  const address = "0x851356ae760d987E095750cCeb3bC6014560891C"; // New JobPosting address
  
  // Check if contract has code
  const code = await provider.getCode(address);
  console.log("Contract code length:", code.length);
  console.log("Has code:", code !== "0x");
  
  if (code !== "0x") {
    console.log(" Contract exists, testing getTotalJobs()...");
    const abi = ["function getTotalJobs() view returns (uint256)"];
    const contract = new ethers.Contract(address, abi, provider);
    try {
      const totalJobs = await contract.getTotalJobs();
      console.log(" Total jobs:", totalJobs.toString());
    } catch (e) {
      console.error(" Error calling getTotalJobs():", e.message);
    }
  } else {
    console.log(" Contract NOT deployed at this address!");
  }
}

test().catch(console.error);
