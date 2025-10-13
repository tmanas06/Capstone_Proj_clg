const hre = require('hardhat');
const fs = require('fs');
const path = require('path');

function getExplorerBase(network) {
  if (network === 'localhost' || network === 'hardhat') return 'http://localhost:8545';
  if (network === 'sepolia') return 'https://sepolia.etherscan.io';
  return '';
}

async function main() {
  const networkName = hre.network.name;
  console.log(`Seeding dummy data on ${networkName}...`);

  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  const deploymentFile = path.join(deploymentsDir, `${networkName}.json`);
  if (!fs.existsSync(deploymentFile)) {
    throw new Error(`Deployment file not found: ${deploymentFile}`);
  }
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  const { Web3JobPlatform, TestnetToken, UserProfile } = deploymentInfo.contracts;

  const [deployer, company1, company2, dev1, dev2] = await hre.ethers.getSigners();

  const platform = await hre.ethers.getContractAt('Web3JobPlatform', Web3JobPlatform);
  const testToken = await hre.ethers.getContractAt('TestnetToken', TestnetToken);
  const userProfile = await hre.ethers.getContractAt('UserProfile', UserProfile);

  const explorer = getExplorerBase(networkName);

  // Fund accounts with TEST token for staking
  const mint1 = await testToken.mint(company1.address, hre.ethers.parseEther('20000'));
  await mint1.wait();
  console.log('Minted TEST to company1:', mint1.hash, explorer ? `${explorer}/tx/${mint1.hash}` : '');

  const mint2 = await testToken.mint(company2.address, hre.ethers.parseEther('20000'));
  await mint2.wait();
  console.log('Minted TEST to company2:', mint2.hash, explorer ? `${explorer}/tx/${mint2.hash}` : '');

  // Companies register
  const reg1 = await platform.connect(company1).registerCompany(
    'NeoTech Labs',
    'R&D for decentralized compute and ZK infra',
    'https://neotech.example',
    'https://picsum.photos/seed/neotech/200',
    ['Solidity', 'ZK Proofs', 'TypeScript']
  );
  await reg1.wait();
  console.log('Company1 registered:', reg1.hash, explorer ? `${explorer}/tx/${reg1.hash}` : '');

  const reg2 = await platform.connect(company2).registerCompany(
    'Orbit Finance',
    'DeFi risk analytics and portfolio management',
    'https://orbit.example',
    'https://picsum.photos/seed/orbit/200',
    ['Solidity', 'Subgraph', 'Data Engineering']
  );
  await reg2.wait();
  console.log('Company2 registered:', reg2.hash, explorer ? `${explorer}/tx/${reg2.hash}` : '');

  // Stake for posting jobs
  const approve1 = await testToken.connect(company1).approve(Web3JobPlatform, hre.ethers.parseEther('5000'));
  await approve1.wait();
  const stake1 = await platform.connect(company1).stakeTokens(hre.ethers.parseEther('5000'));
  await stake1.wait();
  console.log('Company1 staked:', stake1.hash, explorer ? `${explorer}/tx/${stake1.hash}` : '');

  const approve2 = await testToken.connect(company2).approve(Web3JobPlatform, hre.ethers.parseEther('5000'));
  await approve2.wait();
  const stake2 = await platform.connect(company2).stakeTokens(hre.ethers.parseEther('5000'));
  await stake2.wait();
  console.log('Company2 staked:', stake2.hash, explorer ? `${explorer}/tx/${stake2.hash}` : '');

  // Post jobs
  const now = Math.floor(Date.now() / 1000);
  const job1 = await platform.connect(company1).postJob(
    'Senior Solidity Engineer',
    'Design smart contracts for DeFi protocols, audits a plus',
    ['Solidity', 'TypeScript'],
    [90, 60],
    hre.ethers.parseEther('3').toString(),
    hre.ethers.parseEther('6').toString(),
    BigInt(now + 30 * 24 * 60 * 60),
    0,
    25
  );
  await job1.wait();
  console.log('Job1 posted:', job1.hash, explorer ? `${explorer}/tx/${job1.hash}` : '');

  const job2 = await platform.connect(company2).postJob(
    'Data Engineer (Web3)',
    'Build indexing pipelines and analytics for on-chain data',
    ['Subgraph', 'TypeScript'],
    [80, 70],
    hre.ethers.parseEther('2').toString(),
    hre.ethers.parseEther('4').toString(),
    BigInt(now + 21 * 24 * 60 * 60),
    2,
    20
  );
  await job2.wait();
  console.log('Job2 posted:', job2.hash, explorer ? `${explorer}/tx/${job2.hash}` : '');

  // Create developer profiles
  const prof1 = await userProfile.connect(dev1).createProfile(
    'Ava Lin',
    'ava@example.com',
    'Smart contract dev, security reviews, ZK curious',
    '', '',
    ['https://avalin.dev', 'https://github.com/avalin'],
    ['Solidity', 'TypeScript'],
    [92, 85],
    'Singapore',
    'https://avalin.dev',
    'https://github.com/avalin',
    'https://linkedin.com/in/avalin',
    'https://twitter.com/avalin'
  );
  await prof1.wait();
  console.log('Dev1 profile:', prof1.hash, explorer ? `${explorer}/tx/${prof1.hash}` : '');

  const prof2 = await userProfile.connect(dev2).createProfile(
    'Diego Ramos',
    'diego@example.com',
    'Data pipelines, subgraphs, and dashboards for DeFi',
    '', '',
    ['https://diegor.dev', 'https://github.com/diegor'],
    ['Subgraph', 'TypeScript'],
    [88, 80],
    'Lisbon',
    'https://diegor.dev',
    'https://github.com/diegor',
    'https://linkedin.com/in/diegor',
    'https://twitter.com/diegor'
  );
  await prof2.wait();
  console.log('Dev2 profile:', prof2.hash, explorer ? `${explorer}/tx/${prof2.hash}` : '');

  console.log('Seeding complete.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


