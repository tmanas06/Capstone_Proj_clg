# How to Start Hardhat Node

## The Problem
You're seeing `ERR_CONNECTION_REFUSED` errors because the Hardhat local blockchain node is not running.

## Solution

### Step 1: Start Hardhat Node
Open a **new terminal** and run:

```bash
npx hardhat node
```

This will:
- Start a local Ethereum node on `http://127.0.0.1:8545`
- Create 20 test accounts with 10,000 ETH each
- Keep running until you stop it (Ctrl+C)

### Step 2: Deploy Contracts (if not already deployed)
In another terminal, run:

```bash
npx hardhat run scripts/deploy-jobverify.ts --network localhost
```

### Step 3: Seed Dummy Data (optional)
```bash
npx hardhat run scripts/seed-dummy-data.ts --network localhost
```

### Step 4: Keep the Node Running
**IMPORTANT**: Keep the Hardhat node terminal open and running while you use the dApp!

## Quick Start Script

You can also create a script to do everything at once. Create `start-dev.sh`:

```bash
#!/bin/bash
# Start Hardhat node in background
npx hardhat node &
HARDHAT_PID=$!

# Wait for node to start
sleep 5

# Deploy contracts
npx hardhat run scripts/deploy-jobverify.ts --network localhost

# Seed data
npx hardhat run scripts/seed-dummy-data.ts --network localhost

echo "✅ Hardhat node running on http://127.0.0.1:8545"
echo "Press Ctrl+C to stop"

# Wait for user to stop
wait $HARDHAT_PID
```

## Troubleshooting

### Port Already in Use
If port 8545 is already in use:
```bash
# Find and kill the process
lsof -ti:8545 | xargs kill -9
# Or on Windows:
netstat -ano | findstr :8545
taskkill /PID <PID> /F
```

### Contracts Not Found
Make sure you've deployed contracts:
```bash
npx hardhat run scripts/deploy-jobverify.ts --network localhost
```

### Still Getting Errors?
1. Make sure Hardhat node is running
2. Check that it's on port 8545
3. Verify contracts are deployed
4. Hard refresh your browser (Ctrl+Shift+R)

