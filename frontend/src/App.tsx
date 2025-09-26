import React, { useState } from 'react'
import Header from './components/Header'
import AgentRegistration from './components/AgentRegistration'
import Dashboard from './components/Dashboard'
import { WalletProvider } from './hooks/useWallet'
import { AgentProvider } from './hooks/useAgents'
import { Toaster } from 'react-hot-toast'

function App() {
  const [activeTab, setActiveTab] = useState<'register' | 'dashboard'>('register')

  return (
    <WalletProvider>
      <AgentProvider>
        <div className="min-h-screen bg-gray-50">
          <Header />
        
        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('register')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'register'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Register Agent
                </button>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'dashboard'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Dashboard
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="animate-fade-in">
            {activeTab === 'register' && <AgentRegistration />}
            {activeTab === 'dashboard' && <Dashboard />}
          </div>
        </div>
      </div>
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      </AgentProvider>
    </WalletProvider>
  )
}

export default App