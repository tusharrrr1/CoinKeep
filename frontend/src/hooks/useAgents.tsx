import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { Agent } from '../types'

interface AgentContextType {
  agents: Agent[]
  addAgent: (agent: Omit<Agent, 'id' | 'registrationTime' | 'whitelistedMerchants'>) => void
  updateAgent: (id: string, updates: Partial<Agent>) => void
  addMerchantToAgent: (agentId: string, merchantAddress: string) => void
  removeMerchantFromAgent: (agentId: string, merchantAddress: string) => void
  getAgentsByOwner: (ownerAddress: string) => Agent[]
}

const AgentContext = createContext<AgentContextType | undefined>(undefined)

type AgentAction = 
  | { type: 'ADD_AGENT'; payload: Agent }
  | { type: 'UPDATE_AGENT'; payload: { id: string; updates: Partial<Agent> } }
  | { type: 'ADD_MERCHANT'; payload: { agentId: string; merchantAddress: string } }
  | { type: 'REMOVE_MERCHANT'; payload: { agentId: string; merchantAddress: string } }
  | { type: 'LOAD_AGENTS'; payload: Agent[] }

function agentReducer(state: Agent[], action: AgentAction): Agent[] {
  switch (action.type) {
    case 'ADD_AGENT':
      const newAgents = [...state, action.payload]
      // Save to localStorage
      localStorage.setItem('coinkeep_agents', JSON.stringify(newAgents))
      return newAgents

    case 'UPDATE_AGENT':
      const updatedAgents = state.map(agent =>
        agent.id === action.payload.id
          ? { ...agent, ...action.payload.updates }
          : agent
      )
      localStorage.setItem('coinkeep_agents', JSON.stringify(updatedAgents))
      return updatedAgents

    case 'ADD_MERCHANT':
      const agentsWithNewMerchant = state.map(agent =>
        agent.id === action.payload.agentId
          ? {
              ...agent,
              whitelistedMerchants: [...agent.whitelistedMerchants, action.payload.merchantAddress]
            }
          : agent
      )
      localStorage.setItem('coinkeep_agents', JSON.stringify(agentsWithNewMerchant))
      return agentsWithNewMerchant

    case 'REMOVE_MERCHANT':
      const agentsWithoutMerchant = state.map(agent =>
        agent.id === action.payload.agentId
          ? {
              ...agent,
              whitelistedMerchants: agent.whitelistedMerchants.filter(
                addr => addr !== action.payload.merchantAddress
              )
            }
          : agent
      )
      localStorage.setItem('coinkeep_agents', JSON.stringify(agentsWithoutMerchant))
      return agentsWithoutMerchant

    case 'LOAD_AGENTS':
      return action.payload

    default:
      return state
  }
}

export function AgentProvider({ children }: { children: ReactNode }) {
  const [agents, dispatch] = useReducer(agentReducer, [])

  // Load agents from localStorage on mount
  React.useEffect(() => {
    const savedAgents = localStorage.getItem('coinkeep_agents')
    if (savedAgents) {
      try {
        const parsedAgents = JSON.parse(savedAgents)
        dispatch({ type: 'LOAD_AGENTS', payload: parsedAgents })
      } catch (error) {
        console.error('Error loading agents from localStorage:', error)
      }
    }
  }, [])

  const addAgent = (agentData: Omit<Agent, 'id' | 'registrationTime' | 'whitelistedMerchants'>) => {
    const newAgent: Agent = {
      ...agentData,
      id: Date.now().toString(), // Simple ID generation
      registrationTime: Date.now(),
      whitelistedMerchants: [],
    }
    dispatch({ type: 'ADD_AGENT', payload: newAgent })
  }

  const updateAgent = (id: string, updates: Partial<Agent>) => {
    dispatch({ type: 'UPDATE_AGENT', payload: { id, updates } })
  }

  const addMerchantToAgent = (agentId: string, merchantAddress: string) => {
    dispatch({ type: 'ADD_MERCHANT', payload: { agentId, merchantAddress } })
  }

  const removeMerchantFromAgent = (agentId: string, merchantAddress: string) => {
    dispatch({ type: 'REMOVE_MERCHANT', payload: { agentId, merchantAddress } })
  }

  const getAgentsByOwner = (ownerAddress: string) => {
    return agents.filter(agent => 
      agent.owner.toLowerCase() === ownerAddress.toLowerCase()
    )
  }

  const value = {
    agents,
    addAgent,
    updateAgent,
    addMerchantToAgent,
    removeMerchantFromAgent,
    getAgentsByOwner,
  }

  return <AgentContext.Provider value={value}>{children}</AgentContext.Provider>
}

export function useAgents() {
  const context = useContext(AgentContext)
  if (context === undefined) {
    throw new Error('useAgents must be used within an AgentProvider')
  }
  return context
}