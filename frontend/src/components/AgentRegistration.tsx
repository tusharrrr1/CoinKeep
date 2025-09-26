import React, { useState } from 'react'
import { useWallet } from '../hooks/useWallet'
import { useAgents } from '../hooks/useAgents'
import { Bot, Send, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import { supportedChains } from '../config/web3'

export default function AgentRegistration() {
  const { isConnected, address, chainId } = useWallet()
  const { addAgent } = useAgents()
  const [formData, setFormData] = useState({
    telegramHandle: '',
    agentName: '',
    description: '',
    agentAddress: '',
  })
  const [isRegistering, setIsRegistering] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!formData.telegramHandle || !formData.agentName || !formData.agentAddress) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!formData.telegramHandle.startsWith('@')) {
      toast.error('Telegram handle must start with @')
      return
    }

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(formData.agentAddress)) {
      toast.error('Please enter a valid Ethereum address')
      return
    }

    setIsRegistering(true)

    try {
      // Simulate contract interaction
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Save the agent data locally
      addAgent({
        owner: address!,
        telegramHandle: formData.telegramHandle,
        agentName: formData.agentName,
        description: formData.description,
        isActive: true,
      })
      
      toast.success('Agent registered successfully!')
      
      // Reset form
      setFormData({
        telegramHandle: '',
        agentName: '',
        description: '',
        agentAddress: '',
      })
    } catch (error) {
      toast.error('Registration failed. Please try again.')
      console.error('Registration error:', error)
    } finally {
      setIsRegistering(false)
    }
  }

  const currentChain = supportedChains.find(chain => chain.id === chainId)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-primary-100 p-3 rounded-lg">
            <Bot className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Register AI Agent</h2>
            <p className="text-gray-600">Create your AI agent for cross-chain payments</p>
          </div>
        </div>

        {!isConnected ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Wallet Not Connected</h3>
            <p className="text-gray-600 mb-4">Please connect your wallet to register an AI agent</p>
          </div>
        ) : (
          <>
            {/* Chain Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="text-lg">{currentChain?.logo || '⚡'}</div>
                  <div>
                    <p className="font-medium text-blue-900">
                      {currentChain?.name || 'Unknown Network'}
                    </p>
                    <p className="text-sm text-blue-700">
                      Ready to register agent
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-sm text-blue-700">
                  <CheckCircle className="w-4 h-4" />
                  <span>Connected</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
              {/* Telegram Handle */}
              <div>
                <label htmlFor="telegramHandle" className="label">
                  Telegram Handle *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="telegramHandle"
                    name="telegramHandle"
                    value={formData.telegramHandle}
                    onChange={handleInputChange}
                    placeholder="@your_telegram_handle"
                    className="input pl-10"
                    required
                  />
                  <Send className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  This will be used to identify your agent on Telegram
                </p>
              </div>

              {/* Agent Name */}
              <div>
                <label htmlFor="agentName" className="label">
                  Agent Name *
                </label>
                <input
                  type="text"
                  id="agentName"
                  name="agentName"
                  value={formData.agentName}
                  onChange={handleInputChange}
                  placeholder="e.g., PaymentBot, CrossChainAgent"
                  className="input"
                  required
                />
              </div>

              {/* Agent Address */}
              <div>
                <label htmlFor="agentAddress" className="label">
                  Agent Address *
                </label>
                <input
                  type="text"
                  id="agentAddress"
                  name="agentAddress"
                  value={formData.agentAddress}
                  onChange={handleInputChange}
                  placeholder="0x742d35Cc6634C0532925a3b8D95A4b95aE824123"
                  className="input font-mono text-sm"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Ethereum address that will control this agent
                </p>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="label">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Brief description of what your agent does..."
                  className="input resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isRegistering || !isConnected}
                className="w-full btn btn-primary py-3 text-lg"
              >
                {isRegistering ? (
                  <span className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Registering...</span>
                  </span>
                ) : (
                  'Register Agent'
                )}
              </button>
            </form>
          </>
        )}

        {/* Info Section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="font-medium text-gray-900 mb-3">How it works:</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <div className="w-4 h-4 rounded-full bg-primary-100 flex-shrink-0 mt-0.5"></div>
              <p>Register your AI agent with Telegram handle and control address</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-4 h-4 rounded-full bg-primary-200 flex-shrink-0 mt-0.5"></div>
              <p>Whitelist trusted merchants for cross-chain payments</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-4 h-4 rounded-full bg-primary-300 flex-shrink-0 mt-0.5"></div>
              <p>Users can request payments through your agent on Telegram</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-4 h-4 rounded-full bg-primary-400 flex-shrink-0 mt-0.5"></div>
              <p>Merchants approve and complete cross-chain transactions</p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> After registration, you'll need to set up your Telegram bot 
              and configure webhook endpoints. Check our documentation for detailed setup instructions.
            </p>
            <a 
              href="#" 
              className="inline-flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700 mt-2"
            >
              <ExternalLink className="w-3 h-3" />
              <span>View Documentation</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}