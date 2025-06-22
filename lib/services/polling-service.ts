import useMarketplaceStore, { type AgentMode } from '@/lib/stores/marketplace-store'

class PollingService {
  private intervalId: NodeJS.Timeout | null = null
  private isPolling = false
  private currentMode: AgentMode = 'INACTIVE'
  private pollingInterval = 30000 // 30 seconds

  constructor() {
    // Listen for agent mode changes
    if (typeof window !== 'undefined') {
      window.addEventListener('agentModeChanged', this.handleAgentModeChange.bind(this))
    }
  }

  private handleAgentModeChange = (event: Event) => {
    const { mode } = (event as CustomEvent).detail
    this.currentMode = mode
    
    if (mode === 'ACTIVE') {
      this.start()
    } else {
      this.stop()
    }
  }

  start = () => {
    if (this.isPolling || this.currentMode !== 'ACTIVE') {
      return
    }

    console.log('🤖 Agent AI Dispatcher: PORNIT - Sincronizare automată activă')
    this.isPolling = true

    // Initial fetch
    this.fetchData()

    // Start polling
    this.intervalId = setInterval(() => {
      this.fetchData()
    }, this.pollingInterval)
  }

  stop = () => {
    if (!this.isPolling) return

    console.log('🔴 Agent AI Dispatcher: OPRIT - Sincronizare automată dezactivată')
    this.isPolling = false

    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  private fetchData = async () => {
    try {
      const store = useMarketplaceStore.getState()
      
      // Don't fetch if already loading or submitting to prevent multiple concurrent requests
      if (store.isLoading || store.isSubmitting) return

      // Check if user is currently typing in a form (prevent refreshing during input)
      if (document.activeElement && (
        document.activeElement.tagName === 'INPUT' || 
        document.activeElement.tagName === 'TEXTAREA' ||
        document.activeElement.tagName === 'SELECT'
      )) {
        console.log('🤖 Agent AI: Amânat - utilizatorul scrie în formular...')
        return
      }

      console.log('🔄 Agent AI: Sincronizare date...')
      await store.refreshData()
      
      // Check for new alerts and notify user
      const unreadAlerts = store.systemAlerts.filter(alert => !alert.read)
      if (unreadAlerts.length > 0) {
        console.log(`📢 Agent AI: ${unreadAlerts.length} alerte noi detectate`)
        
        // Show notification if permission granted
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('Fleetopia Agent AI', {
            body: `${unreadAlerts.length} alerte noi detectate`,
            icon: '/favicon.ico'
          })
        }
      }
      
    } catch (error) {
      console.error('Agent AI: Eroare la sincronizare:', error)
    }
  }

  // Manual refresh (for when agent is inactive)
  manualRefresh = async () => {
    console.log('🔄 Refresh manual...')
    const store = useMarketplaceStore.getState()
    await store.refreshData()
  }

  // Get current status
  getStatus = () => ({
    isPolling: this.isPolling,
    mode: this.currentMode,
    interval: this.pollingInterval
  })

  // Update polling interval
  setPollingInterval = (interval: number) => {
    this.pollingInterval = interval
    
    if (this.isPolling) {
      this.stop()
      this.start()
    }
  }

  // Initialize with current agent mode
  initialize = () => {
    const store = useMarketplaceStore.getState()
    this.currentMode = store.agentMode
    
    if (this.currentMode === 'ACTIVE' && store.canUseAgent()) {
      this.start()
    }
  }

  // Cleanup
  destroy = () => {
    this.stop()
    if (typeof window !== 'undefined') {
      window.removeEventListener('agentModeChanged', this.handleAgentModeChange)
    }
  }
}

// Singleton instance
const pollingService = new PollingService()
export default pollingService

// Helper hook for components
export const usePollingService = () => {
  const store = useMarketplaceStore()
  
  return {
    manualRefresh: pollingService.manualRefresh,
    getStatus: pollingService.getStatus,
    isAgentActive: store.agentMode === 'ACTIVE',
    canUseAgent: store.canUseAgent(),
    agentMode: store.agentMode,
    userPlan: store.userPlan
  }
}