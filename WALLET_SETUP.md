# Wallet Connector Setup

## ✅ What's Been Configured

1. **RainbowKit Integration**
   - Wallet connector configured for localhost network
   - Supports MetaMask, WalletConnect, and other wallets
   - Themed to match your app (purple accent)

2. **Network Configuration**
   - Localhost network (Chain ID: 31337) set as primary
   - Hardhat network also supported
   - Testnets (Sepolia) and Mainnet available

3. **UI Components**
   - ConnectButton on home page
   - WalletConnectButton in Navbar
   - Auto-connect on page load

## 🔌 Connecting Your Wallet

### Option 1: MetaMask (Recommended for Localhost)

1. **Install MetaMask** (if not already installed)
   - Chrome: https://chrome.google.com/webstore/detail/metamask
   - Firefox: https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/

2. **Add Localhost Network**
   - Open MetaMask
   - Click network dropdown → Add Network → Add Network Manually
   - Enter:
     - Network Name: `Localhost 8545`
     - RPC URL: `http://127.0.0.1:8545`
     - Chain ID: `31337`
     - Currency Symbol: `ETH`

3. **Import Test Account**
   - Click account icon → Import Account
   - Use private key from Hardhat node:
     ```
     0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
     ```
   - This is Account #0 (Deployer) with 10,000 ETH

4. **Connect in dApp**
   - Visit `http://localhost:3000`
   - Click "Connect Wallet" button
   - Select MetaMask
   - Approve connection

### Option 2: WalletConnect (For Mobile)

1. Get WalletConnect Project ID:
   - Visit: https://cloud.walletconnect.com
   - Create project
   - Copy Project ID
   - Add to `.env.local`: `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_id`

2. Connect via QR code
   - Click "Connect Wallet"
   - Select WalletConnect
   - Scan QR with mobile wallet

## 🧪 Test Accounts

Use these accounts for testing (from Hardhat node):

| Account | Address | Private Key | Balance |
|---------|---------|-------------|---------|
| #0 (Deployer) | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` | 10,000 ETH |
| #1 (User 1) | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d` | 10,000 ETH |
| #2 (User 2) | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a` | 10,000 ETH |
| #3 (Company 1) | `0x90F79bf6EB2c4f870365E785982E1f101E93b906` | `0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6` | 10,000 ETH |

## 🔧 Troubleshooting

### "Unsupported Chain"
- Make sure you're connected to Localhost network (Chain ID: 31337)
- Check MetaMask network settings

### "No Provider Found"
- Make sure MetaMask is installed and unlocked
- Refresh the page
- Check browser console for errors

### "Transaction Failed"
- Ensure Hardhat node is running
- Check you have enough ETH (should have 10,000 ETH on localhost)
- Verify contract addresses in `.env.local`

### Wallet Not Connecting
- Clear browser cache
- Restart Hardhat node
- Check that `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` is set (optional, only for WalletConnect)

## 📱 Mobile Testing

For mobile testing:
1. Use WalletConnect option
2. Or use MetaMask mobile app with localhost RPC
3. Or use a testnet (Sepolia) for easier mobile testing

## 🎨 Customization

The wallet connector theme matches your app:
- Accent Color: Purple (#7C3AED)
- Supports light/dark mode
- Compact modal size

To customize, edit `src/contexts/Web3Provider.tsx`

