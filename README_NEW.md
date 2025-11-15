# Web3 Job Site DApp

A decentralized job marketplace built on the blockchain, connecting web3 talent with employers in the blockchain space.

## 🚀 Features

- **Decentralized Job Listings**: Post and discover web3 jobs on the blockchain
- **Smart Contract Integration**: Secure and transparent job postings and applications
- **Web3 Authentication**: Connect with your Ethereum wallet (MetaMask, WalletConnect, etc.)
- **Modern UI/UX**: Built with Next.js and Tailwind CSS for a responsive design
- **Theming**: Dark/light mode support

## 📦 Tech Stack

- **Frontend**: Next.js 13, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Blockchain**: Solidity, Hardhat, Ethers.js
- **Web3**: Wagmi, Viem, RainbowKit
- **State Management**: Zustand
- **Testing**: Hardhat

## 🛠️ Prerequisites

- Node.js >= 16.0.0
- npm or pnpm
- Git
- MetaMask or compatible Ethereum wallet
- Hardhat (for development)

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/web3-jobsite-dapp.git
cd web3-jobsite-dapp
```

### 2. Install dependencies

Using pnpm (recommended):
```bash
pnpm install
```

Or using npm:
```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory and add the following variables:

```env
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

### 4. Compile smart contracts

```bash
pnpm compile
```

### 5. Run a local development node

```bash
pnpm node
```

In a separate terminal, deploy the contracts:

```bash
pnpm deploy
```

### 6. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📝 Smart Contracts

The project includes the following smart contracts:

- `UserProfile.sol`: Manages user profiles on the blockchain
- `PlatformToken.sol`: ERC-20 token for the platform
- `TestnetToken.sol`: Test tokens for development
- `FraudDetection.sol`: Implements fraud detection mechanisms

## 🧪 Testing

Run the test suite with:

```bash
pnpm test
```

## 🌐 Deploying to a Network

1. Update the network configuration in `hardhat.config.cjs`
2. Add your private key and RPC URL to `.env.local`
3. Run the deployment script:

```bash
pnpm deploy --network <network_name>
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Hardhat](https://hardhat.org/)
- [Wagmi](https://wagmi.sh/)
- [RainbowKit](https://www.rainbowkit.com/)
- [OpenZeppelin](https://openzeppelin.com/)
