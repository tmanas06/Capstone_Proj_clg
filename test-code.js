const { ethers } = require("ethers");

async function test() {
  const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
  const address = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
  
  // Check if contract has code
  const code = await provider.getCode(address);
  console.log("Contract code length:", code.length);
  console.log("Has code:", code !== "0x");
  
  if (code === "0x") {
    console.log(" Contract NOT deployed at this address!");
  } else {
    console.log(" Contract exists at this address");
  }
}

test().catch(console.error);
