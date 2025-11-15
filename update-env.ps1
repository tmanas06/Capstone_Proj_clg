# PowerShell script to update .env.local with correct contract addresses

Write-Host "`n🔧 Updating .env.local with latest contract addresses..." -ForegroundColor Cyan

$envContent = @"
# Contract Addresses (Updated: Latest Deployment - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))
NEXT_PUBLIC_USER_VERIFICATION_ADDRESS=0xa513E6E4b8f2a923D98304ec87F64353C4D5C853
NEXT_PUBLIC_COMPANY_VERIFICATION_ADDRESS=0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6
NEXT_PUBLIC_CREDENTIAL_REGISTRY_ADDRESS=0x8A791620dd6260079BF849Dc5567aDC3F2FdC318
NEXT_PUBLIC_JOB_POSTING_ADDRESS=0x610178dA211FEF7D417bC0e6FeD39F05609AD788
NEXT_PUBLIC_DISPUTE_RESOLUTION_ADDRESS=0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e

# API URL
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Network Configuration
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
"@

$envContent | Out-File -FilePath ".env.local" -Encoding utf8 -NoNewline

Write-Host "✅ .env.local updated successfully!" -ForegroundColor Green
Write-Host "`n📋 Updated JobPosting address:" -ForegroundColor Cyan
Write-Host "   OLD: 0x3Aa5ebB10DC797CAC828524e59A333d0A371443c" -ForegroundColor Red
Write-Host "   NEW: 0x610178dA211FEF7D417bC0e6FeD39F05609AD788" -ForegroundColor Green

Write-Host "`n⚠️  IMPORTANT: Next steps:" -ForegroundColor Yellow
Write-Host "   1. Stop Next.js server (Ctrl+C)" -ForegroundColor White
Write-Host "   2. Clear cache: Remove-Item -Recurse -Force .next" -ForegroundColor White
Write-Host "   3. Restart: npm run dev" -ForegroundColor White
Write-Host "   4. Hard refresh browser: Ctrl+Shift+R" -ForegroundColor White

