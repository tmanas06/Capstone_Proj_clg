# JobVerify dApp - Complete Implementation Guide

## Overview

JobVerify is a complete decentralized job application platform with blockchain-based user and company verification using the Self Protocol. This implementation includes smart contracts, frontend interfaces, backend services, and AI fraud detection mechanisms.

## Architecture

```
jobverify-dapp/
├── contracts/              # Ethereum smart contracts
│   ├── UserVerification.sol
│   ├── CompanyVerification.sol
│   ├── CredentialRegistry.sol
│   ├── JobPosting.sol
│   └── DisputeResolution.sol
├── src/                    # Next.js frontend
│   ├── app/               # Pages and routes
│   ├── components/        # React components
│   └── lib/              # Utilities and integrations
├── backend/               # Node.js API server
│   └── src/
│       └── routes/        # API routes
├── ai-service/            # Python ML fraud detection
│   └── fraud_detection/
└── docker-compose.yml      # Docker setup
```

## Features

### 1. User Verification (Self Protocol Integration)
- Zero-knowledge proof identity verification
- Passport biometric scanning (NFC)
- KYC completion tracking
- Credential linking

### 2. Company Verification
- Company registration with authorized officers
- Officer verification through Self Protocol
- Dynamic trust score calculation
- Job posting and hiring tracking

### 3. Credential Registry
- Educational credentials
- Professional certifications
- Work experience verification
- Skill endorsements
- Background checks

### 4. Job Posting System
- Smart contract-based job postings
- Automatic candidate filtering
- Application tracking
- Hiring workflow

### 5. AI Fraud Detection
- Anomaly detection using Isolation Forest
- Credential validation
- Career progression analysis
- Real-time risk scoring

### 6. Dispute Resolution
- Multi-sig arbitration panel
- Credential disputes
- Fraud allegations
- Appeal system

## Setup Instructions

### Prerequisites
- Node.js 18.x or higher
- Python 3.11+
- Docker and Docker Compose
- Hardhat for smart contract development
- MetaMask or compatible Web3 wallet

### 1. Install Dependencies

```bash
# Frontend
npm install

# Backend
cd backend
npm install

# AI Service
cd ../ai-service
pip install -r requirements.txt
```

### 2. Environment Variables

Create `.env` files:

**Frontend (.env.local):**
```
NEXT_PUBLIC_SELF_API_KEY=your_self_protocol_api_key
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

**Backend (.env):**
```
PORT=3000
FRAUD_DETECTION_SERVICE_URL=http://localhost:5000
ETHEREUM_RPC_URL=http://localhost:8545
SELF_PROTOCOL_API_KEY=your_self_protocol_api_key
```

### 3. Deploy Smart Contracts

```bash
# Start local Hardhat node
npm run node

# In another terminal, deploy contracts
npm run deploy
```

### 4. Run Services

**Option 1: Docker Compose (Recommended)**
```bash
docker-compose up
```

**Option 2: Manual**
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: AI Service
cd ai-service
python -m uvicorn fraud_detection.api:app --host 0.0.0.0 --port 5000

# Terminal 3: Frontend
npm run dev
```

## Smart Contracts

### UserVerification.sol
- `initiateKYC(bytes32 _identityHash)` - Start KYC process
- `completeKYC(address _userAddress, bool _status)` - Complete verification
- `grantEmployerAccess(address _employer)` - Grant data access
- `getVerificationStatus(address _user)` - Check verification status

### CompanyVerification.sol
- `registerCompany(bytes32 _companyHash, address[] _officers)` - Register company
- `verifyCompanyOfficer(address _company, address _officer, bool _status)` - Verify officer
- `calculateTrustScore(address _company)` - Calculate trust score
- `recordHire(address _company, address _candidate)` - Record successful hire

### CredentialRegistry.sol
- `issueCredential(...)` - Issue new credential
- `verifyCredential(bytes32 _credentialId)` - Verify credential
- `revokeCredential(bytes32 _credentialId)` - Revoke credential

### JobPosting.sol
- `createJobPosting(...)` - Create job posting
- `applyForJob(uint256 _jobId, ...)` - Apply for job
- `completeHire(uint256 _jobId, address _candidate)` - Complete hire

### DisputeResolution.sol
- `fileDispute(...)` - File a dispute
- `submitArbitration(...)` - Submit arbitration decision
- `appealDispute(...)` - Appeal resolution

## API Endpoints

### User Routes (`/api/users`)
- `POST /kyc/initiate` - Initiate KYC verification
- `GET /profile/:address` - Get user profile
- `POST /credentials/add` - Add credential
- `POST /fraud-check` - Check for fraud

### Job Routes (`/api/jobs`)
- `GET /search` - Search jobs
- `POST /apply` - Apply for job
- `GET /company/:address` - Get company jobs

### Fraud Detection (`/api/fraud-detection`)
- `POST /check-user` - Check user anomalies
- `POST /validate-credential` - Validate credential
- `POST /analyze-career` - Analyze career progression

## Frontend Pages

- `/auth/kyc-verification` - KYC verification flow
- `/dashboard/job-search` - Job search and browsing
- `/employer/job-postings` - Create and manage job postings
- `/employer/company-trust-score` - View company trust metrics
- `/profile` - User profile management

## Testing

### Smart Contract Tests
```bash
npm run test
```

### Integration Tests
```bash
cd backend
npm test
```

## Deployment

### Testnet Deployment
```bash
npm run deploy:sepolia
```

### Mainnet Deployment
```bash
npm run deploy:mainnet
```

## Security Considerations

1. **Smart Contracts**
   - Access control using OpenZeppelin's AccessControl
   - Reentrancy guards on critical functions
   - Input validation on all parameters
   - Events for all state changes

2. **API Security**
   - Rate limiting
   - Input validation
   - CORS configuration
   - Environment variable protection

3. **Frontend Security**
   - Content Security Policy
   - XSS protection
   - Secure wallet integration

## Development Roadmap

### Phase 1 (MVP) - ✅ Complete
- User Verification Smart Contract
- Company Verification Smart Contract
- Self Protocol integration
- Basic KYC flow
- Job posting and search

### Phase 2 (Beta) - In Progress
- Fraud detection AI
- Credential registry
- Full employer dashboard
- Application tracking

### Phase 3 (Production)
- Dispute resolution
- Cross-chain integration
- Advanced analytics
- Governance DAO

## Resources

- [Ethereum Documentation](https://ethereum.org/developers)
- [Hardhat Documentation](https://hardhat.org/)
- [Self Protocol Docs](https://docs.self.xyz/)
- [wagmi Documentation](https://wagmi.sh/)
- [RainbowKit](https://www.rainbowkit.com/)

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.

