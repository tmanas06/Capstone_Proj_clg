import { expect } from "chai";
import { ethers } from "hardhat";

describe("UserVerification", function () {
  let userVerification: any;
  let owner: any, addr1: any, addr2: any;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const UserVerification = await ethers.getContractFactory("UserVerification");
    userVerification = await UserVerification.deploy();
    await userVerification.deployed();
  });

  it("Should initiate KYC verification", async function () {
    const identityHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test"));
    
    await expect(userVerification.connect(addr1).initiateKYC(identityHash))
      .to.emit(userVerification, "KYCInitiated")
      .withArgs(addr1.address, identityHash);

    const status = await userVerification.getVerificationStatus(addr1.address);
    expect(status.kycComplete).to.equal(false);
    expect(status.identityHash).to.equal(identityHash);
  });

  it("Should complete KYC for verified users", async function () {
    const identityHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test"));
    await userVerification.connect(addr1).initiateKYC(identityHash);

    // Add owner as verifier
    await userVerification.addVerifier(owner.address);

    await expect(userVerification.completeKYC(addr1.address, true))
      .to.emit(userVerification, "KYCCompleted")
      .withArgs(addr1.address, true);

    const status = await userVerification.getVerificationStatus(addr1.address);
    expect(status.kycComplete).to.equal(true);
  });

  it("Should grant and revoke employer access", async function () {
    const identityHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test"));
    await userVerification.connect(addr1).initiateKYC(identityHash);
    await userVerification.addVerifier(owner.address);
    await userVerification.completeKYC(addr1.address, true);

    // Grant access
    await expect(userVerification.connect(addr1).grantEmployerAccess(addr2.address))
      .to.emit(userVerification, "AccessGranted")
      .withArgs(addr1.address, addr2.address);

    expect(await userVerification.hasEmployerAccess(addr1.address, addr2.address)).to.equal(true);

    // Revoke access
    await expect(userVerification.connect(addr1).revokeEmployerAccess(addr2.address))
      .to.emit(userVerification, "AccessRevoked")
      .withArgs(addr1.address, addr2.address);

    expect(await userVerification.hasEmployerAccess(addr1.address, addr2.address)).to.equal(false);
  });

  it("Should reject KYC completion from non-verifier", async function () {
    const identityHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test"));
    await userVerification.connect(addr1).initiateKYC(identityHash);

    await expect(
      userVerification.connect(addr2).completeKYC(addr1.address, true)
    ).to.be.reverted;
  });
});

