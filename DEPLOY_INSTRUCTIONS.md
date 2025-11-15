# Quick Deployment Instructions

## The Problem
You're getting `CALL_EXCEPTION` errors because contracts are not deployed or the Hardhat node was restarted.

## Solution: Deploy Contracts

### Step 1: Make sure Hardhat node is running
```bash
# In Terminal 1
npx hardhat node
```
Keep this running!

### Step 2: Deploy contracts
```bash
# In Terminal 2 (new terminal)
npx hardhat run scripts/deploy-jobverify.ts --network localhost
```

This will:
- Deploy all 5 contracts
- Print the contract addresses
- Save them to `deployments/jobverify-contracts.json`

### Step 3: Update environment variables
After deployment, copy the addresses to `.env.local`:

```env
NEXT_PUBLIC_USER_VERIFICATION_ADDRESS=<address from deployment>
NEXT_PUBLIC_COMPANY_VERIFICATION_ADDRESS=<address from deployment>
NEXT_PUBLIC_CREDENTIAL_REGISTRY_ADDRESS=<address from deployment>
NEXT_PUBLIC_JOB_POSTING_ADDRESS=<address from deployment>
NEXT_PUBLIC_DISPUTE_RESOLUTION_ADDRESS=<address from deployment>
```

### Step 4: Seed dummy data (optional)
```bash
npx hardhat run scripts/seed-dummy-data.ts --network localhost
```

### Step 5: Restart Next.js
```bash
# Stop Next.js (Ctrl+C) and restart
npm run dev
```

## Quick One-Liner
```bash
# Deploy everything at once
npx hardhat run scripts/deploy-jobverify.ts --network localhost && npx hardhat run scripts/seed-dummy-data.ts --network localhost
```

## Troubleshooting

### "Contract not found" error
- Make sure Hardhat node is running
- Redeploy contracts
- Update `.env.local` with new addresses
- Restart Next.js

### "Invalid address" error
- Check that addresses in `.env.local` match deployment output
- Make sure addresses start with `0x` and are 42 characters

### Still not working?
1. Stop Hardhat node (Ctrl+C)
2. Restart Hardhat node: `npx hardhat node`
3. Redeploy: `npx hardhat run scripts/deploy-jobverify.ts --network localhost`
4. Update `.env.local`
5. Restart Next.js: `npm run dev`

