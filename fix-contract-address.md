# Fix: Frontend Using Old Contract Address

## Problem
Frontend is using old contract address: `0x3Aa5ebB10DC797CAC828524e59A333d0A371443c`
Backend has correct address: `0x610178dA211FEF7D417bC0e6FeD39F05609AD788`

## Solution

### Step 1: Stop Next.js Server
Press `Ctrl+C` in the terminal running `npm run dev`

### Step 2: Clear Next.js Cache
```bash
# Delete the .next folder (Next.js build cache)
rm -rf .next
# Or on Windows PowerShell:
Remove-Item -Recurse -Force .next
```

### Step 3: Check for .env.local
If you have a `.env.local` file, make sure it has:
```env
NEXT_PUBLIC_JOB_POSTING_ADDRESS=0x610178dA211FEF7D417bC0e6FeD39F05609AD788
```

Or delete `.env.local` to use the fallback address in code.

### Step 4: Restart Next.js
```bash
npm run dev
```

### Step 5: Hard Refresh Browser
- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

## Verify

After restarting, check browser console. You should see:
```
📋 JobPosting Address: 0x610178dA211FEF7D417bC0e6FeD39F05609AD788
Contract address: 0x610178dA211FEF7D417bC0e6FeD39F05609AD788
Contract code exists: ✅ YES
```

## Quick Fix Script

Run this in PowerShell:
```powershell
# Stop Next.js if running (Ctrl+C first)
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Write-Host "✅ Cleared Next.js cache" -ForegroundColor Green
Write-Host "Now run: npm run dev" -ForegroundColor Yellow
```

