# Troubleshooting Guide

## ✅ Backend Verification

The backend is working correctly:
- **Contract Address**: `0x610178dA211FEF7D417bC0e6FeD39F05609AD788`
- **Total Jobs**: 3
- **Network**: localhost (chainId: 31337)

All 3 jobs are accessible:
1. Senior Blockchain Developer
2. Full Stack Web3 Developer
3. Smart Contract Auditor

## 🔧 Frontend Fix Applied

I've added:
1. ✅ Enhanced logging (shows exact contract address being used)
2. ✅ Contract existence verification (checks if contract exists before calling)
3. ✅ Fallback mechanism (fetches jobs directly if `getTotalJobs()` fails)
4. ✅ Updated contract addresses in `useContract.ts`

## ⚠️ IMPORTANT: Restart Next.js Server

**The code changes won't take effect until you restart Next.js!**

### Steps:
1. **Stop Next.js** (press `Ctrl+C` in the terminal running `npm run dev`)
2. **Start it again**: `npm run dev`
3. **Hard refresh browser**: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

## 🔍 Debugging

After restarting, check the browser console. You should see:
```
📋 Contract Addresses: {...}
📋 JobPosting Address: 0x610178dA211FEF7D417bC0e6FeD39F05609AD788
📋 Using env var? NO (using fallback)
Contract address from instance: 0x610178dA211FEF7D417bC0e6FeD39F05609AD788
Contract code exists: YES
Calling getTotalJobs() on address: 0x610178dA211FEF7D417bC0e6FeD39F05609AD788
Total jobs: 3
```

## 🚨 If Still Not Working

### Check 1: Verify Contract Address
Run this command to verify the contract:
```bash
npx hardhat run verify-setup.js --network localhost
```

### Check 2: Browser Console
Open browser DevTools (F12) and check:
- What address is shown in the console logs?
- Does it match `0x610178dA211FEF7D417bC0e6FeD39F05609AD788`?
- Is there an error about contract not existing?

### Check 3: Hardhat Node
Make sure Hardhat node is still running:
```bash
npx hardhat node
```

### Check 4: Environment Variables
If you have a `.env.local` file, make sure it has:
```env
NEXT_PUBLIC_JOB_POSTING_ADDRESS=0x610178dA211FEF7D417bC0e6FeD39F05609AD788
```

If you don't have `.env.local`, the code will use the fallback address (which is correct).

## 📝 Quick Fixes

### If Hardhat Node Was Restarted:
1. Redeploy contracts: `npx hardhat run scripts/deploy-jobverify.ts --network localhost`
2. Reseed data: `npx hardhat run scripts/seed-dummy-data.ts --network localhost`
3. Restart Next.js: `npm run dev`
4. Refresh browser

### If Contract Address Changed:
1. Update `src/hooks/useContract.ts` with new address
2. Update `scripts/seed-dummy-data.ts` with new address
3. Restart Next.js
4. Refresh browser

## ✅ Success Indicators

When everything is working, you should see:
- ✅ 3 jobs displayed on dashboard
- ✅ 3 jobs displayed on job search page
- ✅ No errors in browser console
- ✅ `getTotalJobs()` returns 3

