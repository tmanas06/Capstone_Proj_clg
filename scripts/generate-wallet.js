const { ethers } = require("hardhat");

async function main() {
  const wallet = ethers.Wallet.createRandom();
  console.log("\n🔐 New Wallet Generated");
  console.log("Address:", wallet.address);
  console.log("Private Key:", wallet.privateKey);
  console.log("Mnemonic:", wallet.mnemonic?.phrase || "<none>");
  console.log("\n⚠️  Store this securely. Anyone with the private key controls funds.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


