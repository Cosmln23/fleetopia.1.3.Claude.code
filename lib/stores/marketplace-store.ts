import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CargoOffer } from '@prisma/client';

export type { CargoOffer };

export interface SystemAlert {
  id: string
  message: string
  type: string
  createdAt: string
  read: boolean
}

export type AgentMode = 'ACTIVE' | 'INACTIVE'
export type UserPlan = 'BASIC' | 'PRO'

interface MarketplaceStore {
  // Data
  cargoOffers: CargoOffer[]
  systemAlerts: SystemAlert[]
  
  // Agent Control
  agentMode: AgentMode
  userPlan: UserPlan
  
  // Loading States
  isLoading: boolean
  isSubmitting: boolean
  
  // Error States
  error: string | null
  
  // Actions
  setCargoOffers: (offers: CargoOffer[]) => void
  setSystemAlerts: (alerts: SystemAlert[]) => void
  setAgentMode: (mode: AgentMode) => void
  setUserPlan: (plan: UserPlan) => void
  setLoading: (loading: boolean) => void
  setSubmitting: (submitting: boolean) => void
  setError: (error: string | null) => void
  
  // Business Logic
  toggleAgent: () => void
  canUseAgent: () => boolean
  refreshData: () => Promise<void>
  addCargoOffer: (offer: CargoOffer) => void
  removeCargoOffer: (offerId: string) => void
  updateCargoOffer: (offerId: string, updates: Partial<CargoOffer>) => void
  markAlertAsRead: (alertId: string) => void
}

const useMarketplaceStore = create<MarketplaceStore>()(
  persist(
    (set, get) => ({
      // Initial State
      cargoOffers: [],
      systemAlerts: [],
      agentMode: 'INACTIVE',
      userPlan: 'BASIC',
      isLoading: false,
      isSubmitting: false,
      error: null,

      // Basic Setters
      setCargoOffers: (offers) => set({ cargoOffers: offers }),
      setSystemAlerts: (alerts) => set({ systemAlerts: alerts }),
      setAgentMode: (mode) => set({ agentMode: mode }),
      setUserPlan: (plan) => set({ userPlan: plan }),
      setLoading: (loading) => set({ isLoading: loading }),
      setSubmitting: (submitting) => set({ isSubmitting: submitting }),
      setError: (error) => set({ error }),

      // Business Logic
      toggleAgent: () => {
        const { agentMode, canUseAgent } = get()
        
        if (!canUseAgent()) {
          set({ error: 'Agent AI este disponibil doar pentru planul PRO' })
          return
        }
        
        const newMode: AgentMode = agentMode === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
        set({ agentMode: newMode, error: null })
        
        // Notify polling service about the change
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('agentModeChanged', { 
            detail: { mode: newMode } 
          }))
        }
      },

      canUseAgent: () => {
        const { userPlan } = get()
        return userPlan === 'PRO'
      },

      refreshData: async (listType: string = 'all') => {
        const { setLoading, setError } = get()
        
        try {
          setLoading(true)
          setError(null)
          
          // Build URL with listType parameter
          const cargoUrl = `/api/marketplace/cargo?listType=${listType}`;
          
          // Parallel fetch for better performance
          const [cargoResponse, alertsResponse] = await Promise.all([
            fetch(cargoUrl),
            fetch('/api/dispatcher/alerts')
          ])
          
          if (!cargoResponse.ok || !alertsResponse.ok) {
            throw new Error('Failed to fetch data')
          }
          
          const [cargoData, alertsData] = await Promise.all([
            cargoResponse.json(),
            alertsResponse.json()
          ])
          
          // Handle different API response structures
          const offers = cargoData.offers || cargoData.data?.cargoOffers || cargoData || []
          const alerts = alertsData.alerts || alertsData.data?.alerts || alertsData || []
          
          console.log('📦 Store update - offers:', offers.length, 'alerts:', alerts.length)
          
          set({ 
            cargoOffers: offers,
            systemAlerts: alerts
          })
          
        } catch (error) {
          console.error('Error refreshing data:', error)
          set({ error: 'Eroare la încărcarea datelor' })
        } finally {
          setLoading(false)
        }
      },

      // Optimistic Updates
      addCargoOffer: (offer) => {
        const { cargoOffers } = get()
        console.log('🎯 Adding new offer to store:', offer.id || 'no-id', offer.title)
        console.log('📋 Current offers count:', cargoOffers.length)
        
        const newOffers = [offer, ...cargoOffers]
        set({ cargoOffers: newOffers })
        
        console.log('✅ Store updated, new count:', newOffers.length)
      },

      removeCargoOffer: (offerId) => {
        const { cargoOffers } = get()
        set({ cargoOffers: cargoOffers.filter(offer => offer.id !== offerId) })
      },

      updateCargoOffer: (offerId, updates) => {
        const { cargoOffers } = get()
        set({
          cargoOffers: cargoOffers.map(offer => 
            offer.id === offerId ? { ...offer, ...updates } : offer
          )
        })
      },

      markAlertAsRead: (alertId) => {
        const { systemAlerts } = get()
        set({
          systemAlerts: systemAlerts.map(alert =>
            alert.id === alertId ? { ...alert, read: true } : alert
          )
        })
      }
    }),
    {
      name: 'marketplace-storage',
      partialize: (state) => ({
        agentMode: state.agentMode,
        userPlan: state.userPlan
      })
    }
  )
)

export default useMarketplaceStore