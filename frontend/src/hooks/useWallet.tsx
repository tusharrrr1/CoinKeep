import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { WalletState } from '../types'

interface WalletContextType extends WalletState {
  connect: () => Promise<void>
  disconnect: () => void
  switchChain: (chainId: number) => Promise<void>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

type WalletAction = 
  | { type: 'CONNECT_START' }
  | { type: 'CONNECT_SUCCESS'; payload: { address: string; chainId: number } }
  | { type: 'CONNECT_ERROR' }
  | { type: 'DISCONNECT' }
  | { type: 'CHAIN_CHANGED'; payload: number }

const initialState: WalletState = {
  address: null,
  chainId: null,
  isConnected: false,
  isConnecting: false,
}

function walletReducer(state: WalletState, action: WalletAction): WalletState {
  switch (action.type) {
    case 'CONNECT_START':
      return { ...state, isConnecting: true }
    case 'CONNECT_SUCCESS':
      return {
        ...state,
        address: action.payload.address,
        chainId: action.payload.chainId,
        isConnected: true,
        isConnecting: false,
      }
    case 'CONNECT_ERROR':
      return { ...state, isConnecting: false }
    case 'DISCONNECT':
      return initialState
    case 'CHAIN_CHANGED':
      return { ...state, chainId: action.payload }
    default:
      return state
  }
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(walletReducer, initialState)

  const connect = async () => {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed')
    }

    dispatch({ type: 'CONNECT_START' })

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })
      
      const chainId = await window.ethereum.request({
        method: 'eth_chainId',
      })

      dispatch({
        type: 'CONNECT_SUCCESS',
        payload: {
          address: accounts[0],
          chainId: parseInt(chainId, 16),
        },
      })
    } catch (error) {
      dispatch({ type: 'CONNECT_ERROR' })
      throw error
    }
  }

  const disconnect = () => {
    dispatch({ type: 'DISCONNECT' })
  }

  const switchChain = async (chainId: number) => {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed')
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      })
      dispatch({ type: 'CHAIN_CHANGED', payload: chainId })
    } catch (error: any) {
      // Chain not added to MetaMask
      if (error.code === 4902) {
        throw new Error('Please add this network to your wallet')
      }
      throw error
    }
  }

  // Listen for account changes
  React.useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          dispatch({ type: 'DISCONNECT' })
        } else {
          dispatch({
            type: 'CONNECT_SUCCESS',
            payload: {
              address: accounts[0],
              chainId: state.chainId || 1,
            },
          })
        }
      })

      window.ethereum.on('chainChanged', (chainId: string) => {
        dispatch({ type: 'CHAIN_CHANGED', payload: parseInt(chainId, 16) })
      })
    }
  }, [state.chainId])

  const value = {
    ...state,
    connect,
    disconnect,
    switchChain,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}