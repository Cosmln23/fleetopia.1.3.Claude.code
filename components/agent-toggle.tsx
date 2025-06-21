'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Bot, 
  Zap, 
  Crown, 
  RefreshCw,
  Activity,
  Clock,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useMarketplaceStore from '@/lib/stores/marketplace-store'
import { usePollingService } from '@/lib/services/polling-service'
import { toast } from 'sonner'

interface AgentToggleProps {
  className?: string
  variant?: 'default' | 'compact'
}

export function AgentToggle({ className = '', variant = 'default' }: AgentToggleProps) {
  const {
    agentMode,
    userPlan,
    canUseAgent,
    toggleAgent,
    isLoading,
    error
  } = useMarketplaceStore()
  
  const { manualRefresh, getStatus } = usePollingService()
  const [pollingStatus, setPollingStatus] = useState(getStatus())

  // Update polling status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setPollingStatus(getStatus())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleToggle = () => {
    if (!canUseAgent()) {
      toast.error('Agent AI este disponibil doar pentru planul PRO! 👑', {
        description: 'Upgradează planul pentru a accesa funcții avansate',
        action: {
          label: 'Upgrade',
          onClick: () => {
            // TODO: Implement upgrade flow
            console.log('Redirect to upgrade page')
          }
        }
      })
      return
    }

    toggleAgent()
    
    if (agentMode === 'INACTIVE') {
      toast.success('🤖 Agent AI Dispatcher PORNIT!', {
        description: 'Sincronizarea automată este acum activă'
      })
    } else {
      toast.info('🔴 Agent AI Dispatcher OPRIT', {
        description: 'Sincronizarea automată este dezactivată'
      })
    }
  }

  const handleManualRefresh = async () => {
    try {
      await manualRefresh()
      toast.success('Date actualizate cu succes! ✅')
    } catch (error) {
      toast.error('Eroare la actualizarea datelor')
    }
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className="flex items-center space-x-2">
          <Bot className={`w-4 h-4 ${agentMode === 'ACTIVE' ? 'text-green-400' : 'text-gray-400'}`} />
          <span className="text-sm font-medium">Agent AI</span>
        </div>
        <Switch
          checked={agentMode === 'ACTIVE'}
          onCheckedChange={handleToggle}
          disabled={!canUseAgent()}
        />
        <Badge variant={agentMode === 'ACTIVE' ? 'default' : 'secondary'} className="text-xs">
          {agentMode === 'ACTIVE' ? 'ON' : 'OFF'}
        </Badge>
      </div>
    )
  }

  return (
    <Card className={`border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-blue-900/20 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <motion.div
              animate={agentMode === 'ACTIVE' ? { rotate: 360 } : {}}
              transition={{ duration: 2, repeat: agentMode === 'ACTIVE' ? Infinity : 0 }}
            >
              <Bot className={`w-5 h-5 ${agentMode === 'ACTIVE' ? 'text-green-400' : 'text-gray-400'}`} />
            </motion.div>
            <span className="text-lg font-semibold">Agent AI Dispatcher</span>
            {!canUseAgent() && (
              <Crown className="w-4 h-4 text-yellow-400" />
            )}
          </div>
          <Switch
            checked={agentMode === 'ACTIVE'}
            onCheckedChange={handleToggle}
            disabled={!canUseAgent()}
            className="data-[state=checked]:bg-green-500"
          />
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status Display */}
        <AnimatePresence mode="wait">
          {agentMode === 'ACTIVE' ? (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center space-x-2"
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-400">ACTIV</span>
              </div>
              <Badge variant="outline" className="text-green-400 border-green-400">
                <Activity className="w-3 h-3 mr-1" />
                Sincronizare automată
              </Badge>
            </motion.div>
          ) : (
            <motion.div
              key="inactive"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center space-x-2"
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full" />
                <span className="text-sm font-medium text-gray-400">INACTIV</span>
              </div>
              <Badge variant="outline" className="text-gray-400 border-gray-400">
                Doar manual
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Description */}
        <div className="text-sm text-muted-foreground">
          {canUseAgent() ? (
            agentMode === 'ACTIVE' ? (
              <div className="space-y-1">
                <p>✅ Sincronizare automată activă la 30 secunde</p>
                <p>✅ Analiză inteligentă oferte marfă</p>
                <p>✅ Notificări în timp real</p>
              </div>
            ) : (
              <p>Agentul AI este disponibil. Activează pentru sincronizare automată și analiză inteligentă.</p>
            )
          ) : (
            <div className="space-y-2">
              <p className="text-yellow-400 font-medium">
                ⚡ Funcție disponibilă doar pentru planul PRO
              </p>
              <p>Upgradează pentru a accesa:</p>
              <ul className="text-xs space-y-1 ml-4">
                <li>• Agent AI Dispatcher automat</li>
                <li>• Analiză inteligentă marfă</li>
                <li>• Optimizare rute ML</li>
                <li>• Predicții combustibil</li>
              </ul>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-2 text-red-400 text-sm"
          >
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-purple-500/20">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>
              {agentMode === 'ACTIVE' ? 'Urmează: ~30s' : 'Manual'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {agentMode === 'INACTIVE' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualRefresh}
                disabled={isLoading}
                className="h-7 px-3 text-xs"
              >
                {isLoading ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Refresh
                  </>
                )}
              </Button>
            )}
            
            <Badge variant={userPlan === 'PRO' ? 'default' : 'secondary'} className="text-xs">
              {userPlan === 'PRO' ? (
                <>
                  <Crown className="w-3 h-3 mr-1" />
                  PRO
                </>
              ) : (
                'BASIC'
              )}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}