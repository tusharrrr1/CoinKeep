import React from 'react'
import { Bot, Wallet, ArrowRightLeft, Shield, Zap } from 'lucide-react'
import { useWallet } from '../hooks/useWallet'

export default function Header() {
  const { address, isConnected, isConnecting, connect, disconnect } = useWallet()

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-primary-600 p-2 rounded-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">CoinKeep</h1>
              <p className="text-xs text-gray-500">AI Agent Registry</p>
            </div>
          </div>

          {/* Features */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Shield className="w-4 h-4" />
              <span>Secure</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <ArrowRightLeft className="w-4 h-4" />
              <span>Cross-chain</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Zap className="w-4 h-4" />
              <span>AI Powered</span>
            </div>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {!isConnected ? (
              <button
                onClick={connect}
                disabled={isConnecting}
                className="btn btn-primary flex items-center space-x-2"
              >
                <Wallet className="w-4 h-4" />
                <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-700">
                    {formatAddress(address!)}
                  </span>
                </div>
                <button
                  onClick={disconnect}
                  className="btn btn-secondary text-sm"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}