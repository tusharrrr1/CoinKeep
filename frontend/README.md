# CoinKeep Frontend - AI Agent Registry

A modern React frontend for registering and managing AI agents for cross-chain payments on Telegram.

## Features

✨ **Agent Registration**: Register AI agents with Telegram handles and descriptions
🔗 **Wallet Integration**: Connect MetaMask and other Web3 wallets  
🏪 **Merchant Management**: Whitelist trusted merchants for payments
💰 **Payment Tracking**: Monitor cross-chain payment requests
🌐 **Multi-chain Support**: Ethereum, Polygon, Arbitrum, Base
📱 **Responsive Design**: Works on desktop and mobile

## Tech Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Vite** for fast development
- **Web3 Integration** with MetaMask support
- **React Hot Toast** for notifications
- **Lucide React** for icons

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- MetaMask or compatible Web3 wallet

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/          # React components
│   ├── Header.tsx      # Navigation header with wallet connection
│   ├── AgentRegistration.tsx  # Agent registration form
│   └── Dashboard.tsx   # Agent management dashboard
├── hooks/              # Custom React hooks
│   └── useWallet.tsx   # Wallet connection logic
├── config/             # Configuration files
│   └── web3.ts         # Chain and token configurations
├── types/              # TypeScript type definitions
│   ├── index.ts        # Main types
│   └── global.d.ts     # Global type declarations
├── App.tsx             # Main app component
├── main.tsx            # React entry point
└── index.css           # Global styles with Tailwind
```

## Key Components

### Agent Registration
- Connect wallet to register agents
- Enter Telegram handle, name, and description
- Pay registration fee (0.01 ETH)
- Automatic validation and error handling

### Dashboard
- View registered agents and their status
- Manage whitelisted merchants
- Monitor payment requests and their status
- Add/remove merchants with address validation

### Wallet Integration
- MetaMask connection with error handling
- Multi-chain network switching
- Real-time balance and network updates
- Disconnect functionality

## Configuration

### Supported Networks
- **Ethereum Mainnet** (Chain ID: 1)
- **Polygon** (Chain ID: 137)  
- **Arbitrum One** (Chain ID: 42161)
- **Base** (Chain ID: 8453)
- **Optimism** (Chain ID: 8543)
- **Hedera** 
- **Rootstock**

### Supported Tokens
- **USDC** - USD Coin
- **USDT** - Tether
- **DAI** - DAI 
- **

To add more networks or tokens, edit `src/config/web3.ts`.

## Usage

### 1. Connect Wallet
Click "Connect Wallet" in the header to connect your MetaMask wallet.

### 2. Register Agent
- Go to "Register Agent" tab
- Fill in your Telegram handle (must start with @)
- Enter agent name and optional description
- Submit with 0.01 ETH registration fee

### 3. Manage Merchants
- Switch to "Dashboard" tab
- Click "Manage Agent" on your registered agent
- Use "Add Merchant" to whitelist merchant addresses
- Remove merchants with the trash icon

### 4. Monitor Payments
View recent payment requests in the dashboard with:
- Payment status (Pending/Approved/Completed)
- Amount and token details
- Source and target chain information
- Merchant address

## Smart Contract Integration

The frontend is designed to integrate with the AgentRegistry smart contract. Key functions:

- `registerAgent()` - Register new AI agents
- `whitelistMerchant()` - Add trusted merchants  
- `createPaymentRequest()` - Create cross-chain payment requests
- `approvePaymentRequest()` - Merchant approval of requests
- `completePayment()` - Execute approved payments


## Customization

### Styling
The app uses Tailwind CSS with custom components. Main style classes are in `src/index.css`:

- `.btn` - Button styles
- `.card` - Card containers  
- `.input` - Form inputs
- `.label` - Form labels

## License

This project is licensed under the MIT License.

---

**Ready to revolutionize cross-chain payments with AI agents!** 🚀

