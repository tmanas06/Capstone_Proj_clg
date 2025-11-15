# Quick Start Guide

## Step-by-Step Setup

### 1. Start Hardhat Node (Terminal 1)
```bash
npx hardhat node
```
**Keep this terminal running!** This is your local blockchain.

### 2. Deploy Contracts (Terminal 2 - NEW terminal)
```bash
npx hardhat run scripts/deploy-jobverify.ts --network localhost
```

### 3. Seed Dummy Data (Terminal 2 - same terminal as step 2)
```bash
npx hardhat run scripts/seed-dummy-data.ts --network localhost
```

### 4. Start Next.js Frontend (Terminal 3 - NEW terminal)
```bash
npm run dev
```

### 5. Open Browser
Visit: `http://localhost:3000`

## Important Notes

- **Hardhat node must be running** before deploying or seeding
- **Restart Hardhat node** = Need to redeploy contracts and reseed data
- **Keep all terminals running** while using the dApp

## Troubleshooting

### "Cannot connect to localhost:8545"
→ Hardhat node is not running. Start it with `npx hardhat node`

### "CALL_EXCEPTION" errors
→ Contracts not deployed or using wrong addresses. Redeploy and update `.env.local`

### No jobs showing
→ Data not seeded or seeded to wrong contracts. Reseed with updated addresses

### Wallet not connecting
→ Make sure wallet is on localhost network (chainId 31337)
