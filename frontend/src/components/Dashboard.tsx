import React, { useState, useEffect } from 'react'
import { useWallet } from '../hooks/useWallet'
import { useAgents } from '../hooks/useAgents'
import { Users, Plus, Trash2, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { Agent } from '../types'

export default function Dashboard() {
  const { isConnected, address } = useWallet()
  const { getAgentsByOwner, addMerchantToAgent, removeMerchantFromAgent } = useAgents()
  const [userAgents, setUserAgents] = useState<Agent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [showMerchantModal, setShowMerchantModal] = useState(false)
  const [newMerchantAddress, setNewMerchantAddress] = useState('')

  // Load user's agents
  useEffect(() => {
    if (isConnected && address) {
      const agents = getAgentsByOwner(address)
      setUserAgents(agents)
      if (agents.length > 0 && !selectedAgent) {
        setSelectedAgent(agents[0])
      }
    } else {
      setUserAgents([])
      setSelectedAgent(null)
    }
  }, [isConnected, address, getAgentsByOwner, selectedAgent])

  const handleAddMerchant = () => {
    if (!newMerchantAddress || !selectedAgent) return

    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(newMerchantAddress)) {
      toast.error('Invalid Ethereum address')
      return
    }

    if (selectedAgent.whitelistedMerchants.includes(newMerchantAddress)) {
      toast.error('Merchant already whitelisted')
      return
    }

    // Add merchant using context
    addMerchantToAgent(selectedAgent.id, newMerchantAddress)
    
    // Update local state
    const updatedAgent = {
      ...selectedAgent,
      whitelistedMerchants: [...selectedAgent.whitelistedMerchants, newMerchantAddress]
    }
    setSelectedAgent(updatedAgent)
    
    // Update user agents list
    setUserAgents(prev => prev.map(agent => 
      agent.id === selectedAgent.id ? updatedAgent : agent
    ))

    setNewMerchantAddress('')
    setShowMerchantModal(false)
    toast.success('Merchant whitelisted successfully!')
  }

  const handleRemoveMerchant = (merchantAddress: string) => {
    if (!selectedAgent) return

    // Remove merchant using context
    removeMerchantFromAgent(selectedAgent.id, merchantAddress)
    
    // Update local state
    const updatedAgent = {
      ...selectedAgent,
      whitelistedMerchants: selectedAgent.whitelistedMerchants.filter(
        addr => addr !== merchantAddress
      )
    }
    setSelectedAgent(updatedAgent)
    
    // Update user agents list  
    setUserAgents(prev => prev.map(agent => 
      agent.id === selectedAgent.id ? updatedAgent : agent
    ))

    toast.success('Merchant removed successfully!')
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">Dashboard</h3>
        <p className="text-gray-600">Please connect your wallet to view your agents</p>
      </div>
    )
  }

  if (userAgents.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">No Agents Found</h3>
        <p className="text-gray-600 mb-4">You haven't registered any AI agents yet</p>
        <p className="text-sm text-gray-500">Go to the "Register Agent" tab to create your first agent</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Agent Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userAgents.map((agent) => (
          <div key={agent.id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-primary-100 p-2 rounded-lg">
                  <Send className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{agent.agentName}</h3>
                  <p className="text-sm text-gray-600">{agent.telegramHandle}</p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                agent.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {agent.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">{agent.description}</p>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Merchants:</span>
                <span className="font-medium">{agent.whitelistedMerchants.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Registered:</span>
                <span className="font-medium">
                  {new Date(agent.registrationTime).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => setSelectedAgent(agent)}
              className="w-full mt-4 btn btn-primary"
            >
              Manage Agent
            </button>
          </div>
        ))}
      </div>

      {/* Selected Agent Details */}
      {selectedAgent && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Whitelisted Merchants */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Whitelisted Merchants</h3>
              <button
                onClick={() => setShowMerchantModal(true)}
                className="btn btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Merchant</span>
              </button>
            </div>

            <div className="space-y-3">
              {selectedAgent.whitelistedMerchants.map((merchant, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-mono text-sm">{formatAddress(merchant)}</p>
                    <p className="text-xs text-gray-500">Merchant #{index + 1}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveMerchant(merchant)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {selectedAgent.whitelistedMerchants.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>No merchants whitelisted yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Requests */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Payment Requests</h3>
            </div>

            <div className="text-center py-8 text-gray-500">
              <Send className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>No payment requests yet</p>
              <p className="text-xs mt-1">Payment requests will appear here once your agent is integrated with Telegram</p>
            </div>
          </div>
        </div>
      )}

      {/* Add Merchant Modal */}
      {showMerchantModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Add Merchant</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Merchant Address</label>
                <input
                  type="text"
                  value={newMerchantAddress}
                  onChange={(e) => setNewMerchantAddress(e.target.value)}
                  placeholder="0x742d35Cc6634C0532925a3b8D95A4b95aE824123"
                  className="input"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleAddMerchant}
                  className="btn btn-primary flex-1"
                >
                  Add Merchant
                </button>
                <button
                  onClick={() => {
                    setShowMerchantModal(false)
                    setNewMerchantAddress('')
                  }}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}