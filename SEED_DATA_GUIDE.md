# Seeding Dummy Data Guide

## Prerequisites

1. **Start Hardhat Node** (in a separate terminal):
   ```bash
   npm run node
   ```
   Keep this terminal running!

2. **Deploy Contracts** (if not already deployed):
   ```bash
   npx hardhat run scripts/deploy-jobverify.ts --network localhost
   ```

## Seed Dummy Data

Once the Hardhat node is running, run:

```bash
npx hardhat run scripts/seed-dummy-data.ts --network localhost
```

## What Gets Created

The seed script creates:

### Users
- **User 1** (Account #1): `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
  - KYC completed
  - 1 Educational credential (BSc Computer Science)
  - Applied for Job #1

- **User 2** (Account #2): `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
  - KYC completed
  - 1 Professional certification (AWS Certified)

### Companies
- **Company 1** (Account #3): `0x90F79bf6EB2c4f870365E785982E1f101E93b906`
  - Registered as "TechCorp Inc"
  - Verified officer
  - Posted 2 jobs
  - 1 successful hire recorded

- **Company 2** (Account #4): `0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65`
  - Registered as "Blockchain Solutions Ltd"
  - Verified officer
  - Posted 1 job

### Jobs
1. **Senior Blockchain Developer** (Company 1)
   - Min Trust Score: 60
   - 1 application from User 1

2. **Full Stack Web3 Developer** (Company 1)
   - Min Trust Score: 50

3. **Smart Contract Auditor** (Company 2)
   - Min Trust Score: 70

## Viewing the Data

### In Your dApp:

1. **Connect Wallet** with one of the test accounts:
   - Import Account #1 (User 1) or Account #3 (Company 1) into MetaMask
   - Connect to Localhost network (Chain ID: 31337)

2. **Visit Dashboard**: `http://localhost:3000/dashboard`
   - See your profile status
   - View job postings
   - Check KYC status

3. **Browse Jobs**: `http://localhost:3000/dashboard/job-search`
   - See all posted jobs
   - Apply for jobs (if KYC verified)

4. **Company Dashboard**: Connect as Company 1
   - View trust score
   - See posted jobs
   - View applications

## Test Accounts

Use these accounts from Hardhat node:

| Account | Address | Private Key | Role |
|---------|---------|-------------|------|
| Deployer | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` | Admin/Verifier |
| User 1 | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d` | Candidate |
| User 2 | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a` | Candidate |
| Company 1 | `0x90F79bf6EB2c4f870365E785982E1f101E93b906` | `0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6` | Employer |
| Company 2 | `0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65` | `0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a` | Employer |

## Importing to MetaMask

1. Open MetaMask
2. Click account icon → Import Account
3. Paste the private key
4. Add Localhost network:
   - Network Name: Localhost 8545
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - Currency Symbol: ETH

## Troubleshooting

### "Cannot connect to network localhost"
- Make sure Hardhat node is running: `npm run node`
- Check it's on port 8545

### "Contract not found"
- Redeploy contracts: `npx hardhat run scripts/deploy-jobverify.ts --network localhost`
- Update `.env.local` with new addresses

### "User not verified"
- Run the seed script again
- Or manually complete KYC through the dApp

## Resetting Data

To start fresh:

1. Stop Hardhat node (Ctrl+C)
2. Restart: `npm run node`
3. Redeploy contracts
4. Run seed script again

