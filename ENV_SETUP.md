# Environment Variables Setup Guide

## Contract Addresses (Deployed on localhost)

The following contracts have been deployed to your local Hardhat node:

- **UserVerification**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **CompanyVerification**: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`
- **CredentialRegistry**: `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0`
- **JobPosting**: `0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9`
- **DisputeResolution**: `0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9`

## Frontend Environment Variables (.env.local)

Create a `.env.local` file in the root directory with:

```env
# Contract Addresses
NEXT_PUBLIC_USER_VERIFICATION_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_COMPANY_VERIFICATION_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
NEXT_PUBLIC_CREDENTIAL_REGISTRY_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
NEXT_PUBLIC_JOB_POSTING_ADDRESS=0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
NEXT_PUBLIC_DISPUTE_RESOLUTION_ADDRESS=0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9

# Self Protocol API Key (get from https://self.xyz)
NEXT_PUBLIC_SELF_API_KEY=your_self_protocol_api_key_here

# WalletConnect Project ID (get from https://cloud.walletconnect.com)
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id_here

# API URL
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Network Configuration
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
```

## Backend Environment Variables (backend/.env)

Create a `.env` file in the `backend` directory with:

```env
PORT=3000
NODE_ENV=development

# Fraud Detection Service URL
FRAUD_DETECTION_SERVICE_URL=http://localhost:5000

# Ethereum RPC URL
ETHEREUM_RPC_URL=http://127.0.0.1:8545

# Self Protocol API Key
SELF_PROTOCOL_API_KEY=your_self_protocol_api_key_here

# Contract Addresses
USER_VERIFICATION_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
COMPANY_VERIFICATION_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
CREDENTIAL_REGISTRY_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
JOB_POSTING_ADDRESS=0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
DISPUTE_RESOLUTION_ADDRESS=0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
```

## Quick Setup Commands

### For Frontend:
```bash
cat > .env.local << 'EOF'
NEXT_PUBLIC_USER_VERIFICATION_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_COMPANY_VERIFICATION_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
NEXT_PUBLIC_CREDENTIAL_REGISTRY_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
NEXT_PUBLIC_JOB_POSTING_ADDRESS=0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
NEXT_PUBLIC_DISPUTE_RESOLUTION_ADDRESS=0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
NEXT_PUBLIC_SELF_API_KEY=your_self_protocol_api_key_here
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id_here
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
EOF
```

### For Backend:
```bash
cd backend
cat > .env << 'EOF'
PORT=3000
NODE_ENV=development
FRAUD_DETECTION_SERVICE_URL=http://localhost:5000
ETHEREUM_RPC_URL=http://127.0.0.1:8545
SELF_PROTOCOL_API_KEY=your_self_protocol_api_key_here
USER_VERIFICATION_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
COMPANY_VERIFICATION_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
CREDENTIAL_REGISTRY_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
JOB_POSTING_ADDRESS=0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
DISPUTE_RESOLUTION_ADDRESS=0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
EOF
```

## Notes

1. **Contract Addresses**: These addresses are for localhost deployment. When deploying to testnet/mainnet, update these addresses accordingly.

2. **API Keys**: 
   - Get Self Protocol API key from: https://self.xyz
   - Get WalletConnect Project ID from: https://cloud.walletconnect.com

3. **Network**: The contracts are deployed on localhost (chainId: 31337). Make sure your Hardhat node is running before using the frontend.

4. **Security**: Never commit `.env` or `.env.local` files to version control. They are already in `.gitignore`.


