import { createConfig, http } from 'wagmi'
import { mainnet, polygon, arbitrum, base, optimism } from 'wagmi/chains'
import { walletConnect } from 'wagmi/connectors'

// Define custom chains not available in wagmi
const rootstock = {
  id: 30,
  name: 'Rootstock',
  nativeCurrency: {
    decimals: 18,
    name: 'Smart Bitcoin',
    symbol: 'RBTC',
  },
  rpcUrls: {
    default: {
      http: ['https://public-node.rsk.co'],
    },
  },
  blockExplorers: {
    default: { name: 'RSK Explorer', url: 'https://explorer.rsk.co' },
  },
} as const

const hedera = {
  id: 295,
  name: 'Hedera',
  nativeCurrency: {
    decimals: 18,
    name: 'HBAR',
    symbol: 'HBAR',
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet-public.mirrornode.hedera.com'],
    },
  },
  blockExplorers: {
    default: { name: 'HashScan', url: 'https://hashscan.io/mainnet' },
  },
} as const

// Get your projectId at https://cloud.walletconnect.com
const projectId = 'YOUR_WALLET_CONNECT_PROJECT_ID'

export const config = createConfig({
  chains: [mainnet, polygon, arbitrum, base, optimism, rootstock, hedera],
  connectors: [
    walletConnect({ projectId }),
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    [optimism.id]: http(),
    [rootstock.id]: http(),
    [hedera.id]: http(),
  },
})

// Chain configurations for cross-chain support
export const supportedChains = [
  {
    id: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    rpc: 'https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY',
    explorer: 'https://etherscan.io',
    logo: '🇪',
  },
  {
    id: 137,
    name: 'Polygon',
    symbol: 'MATIC',
    rpc: 'https://polygon-rpc.com',
    explorer: 'https://polygonscan.com',
    logo: '🟣',
  },
  {
    id: 42161,
    name: 'Arbitrum',
    symbol: 'ETH',
    rpc: 'https://arb1.arbitrum.io/rpc',
    explorer: 'https://arbiscan.io',
    logo: '🔵',
  },
  {
    id: 8453,
    name: 'Base',
    symbol: 'ETH',
    rpc: 'https://mainnet.base.org',
    explorer: 'https://basescan.org',
    logo: '🔷',
  },
  {
    id: 10,
    name: 'Optimism',
    symbol: 'ETH',
    rpc: 'https://mainnet.optimism.io',
    explorer: 'https://optimistic.etherscan.io',
    logo: '🔴',
  },
  {
    id: 30,
    name: 'Rootstock',
    symbol: 'RBTC',
    rpc: 'https://public-node.rsk.co',
    explorer: 'https://explorer.rsk.co',
    logo: '🟠',
  },
  {
    id: 295,
    name: 'Hedera',
    symbol: 'HBAR',
    rpc: 'https://mainnet-public.mirrornode.hedera.com',
    explorer: 'https://hashscan.io/mainnet',
    logo: '⚡',
  },
]

export const commonTokens = [
  {
    symbol: 'USDC',
    name: 'USD Coin',
    logo: '💵',
    addresses: {
      1: '0xA0b86a33E6441d6aa4fa57bA7d1bc9b8B4C1E4a5',
      137: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
      42161: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
      8453: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
      10: '0x0b2c639c533813f4aa9d7837caf62653d097ff85',
    },
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    logo: '💚',
    addresses: {
      1: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      137: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
      42161: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
      10: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
    },
  },
  {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    logo: '🟨',
    addresses: {
      1: '0x6b175474e89094c44da98b954eedeac495271d0f',
    },
  },
  {
    symbol: 'PYUSD',
    name: 'PayPal USD',
    logo: '🅿️',
    addresses: {
      1: '0x6c3ea9036406852006290770bedfcaba0e23a0e8',
    },
  },
]