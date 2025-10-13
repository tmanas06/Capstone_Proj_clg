import { ethers } from 'ethers';

// These will be populated after deployment
let Web3JobPlatform: any;
let UserProfile: any;
let PlatformToken: any;

// This will be populated from the deployment file
let deployedContracts: any = {};

// Try to load the deployment file
try {
  const deploymentFile = require('../../deployments/deployed-contracts-localhost.json');
  deployedContracts = deploymentFile.contracts;
  
  // Import contract ABIs
  Web3JobPlatform = require('../../artifacts/contracts/Web3JobPlatform.sol/Web3JobPlatform.json');
  UserProfile = require('../../artifacts/contracts/UserProfile.sol/UserProfile.json');
  PlatformToken = require('../../artifacts/contracts/PlatformToken.sol/PlatformToken.json');
} catch (e) {
  console.warn('Could not load deployment files. Make sure to deploy contracts first.');
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

// Get contract addresses for the current network
const getContractAddresses = () => {
  return {
    Web3JobPlatform: deployedContracts.Web3JobPlatform,
    UserProfile: deployedContracts.UserProfile,
    PlatformToken: deployedContracts.PlatformToken,
  };
};

export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error('Please install MetaMask!');
  }

  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts',
  });
  
  // Using Web3Provider from ethers v6
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const network = await provider.getNetwork();
  const chainId = network.chainId.toString();
  
  return { account: accounts[0], provider, signer, chainId };
};

export const getContracts = async (signer: any) => {
  const addresses = getContractAddresses();
  
  if (!addresses.Web3JobPlatform || !addresses.UserProfile || !addresses.PlatformToken) {
    throw new Error('Contract addresses not found. Please deploy the contracts first.');
  }

  const web3JobPlatform = new ethers.Contract(
    addresses.Web3JobPlatform,
    Web3JobPlatform.abi,
    signer
  );

  const userProfile = new ethers.Contract(
    addresses.UserProfile,
    UserProfile.abi,
    signer
  );

  const platformToken = new ethers.Contract(
    addresses.PlatformToken,
    PlatformToken.abi,
    signer
  );

  return { web3JobPlatform, userProfile, platformToken };
};

export const formatAddress = (address: string) => {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};
