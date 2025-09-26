export interface Agent {
  id: string
  owner: string
  telegramHandle: string
  agentName: string
  description: string
  isActive: boolean
  registrationTime: number
  whitelistedMerchants: string[]
}

export interface PaymentRequest {
  requestId: string
  requester: string
  merchant: string
  tokenAddress: string
  amount: string
  sourceChain: number
  targetChain: number
  targetToken: string
  isCompleted: boolean
  isApproved: boolean
  timestamp: number
}

export interface Chain {
  id: number
  name: string
  symbol: string
  rpc: string
  explorer: string
  logo: string
}

export interface Token {
  symbol: string
  name: string
  logo: string
  addresses: { [chainId: number]: string }
}

export interface WalletState {
  address: string | null
  chainId: number | null
  isConnected: boolean
  isConnecting: boolean
}