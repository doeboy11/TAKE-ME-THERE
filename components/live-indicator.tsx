"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, Activity } from "lucide-react"

interface LiveIndicatorProps {
  isConnected: boolean
  showActivity?: boolean
  recentUpdates?: number
  className?: string
}

export function LiveIndicator({
  isConnected,
  showActivity = false,
  recentUpdates = 0,
  className = "",
}: LiveIndicatorProps) {
  const [pulse, setPulse] = useState(false)

  // Pulse animation when there are updates
  useEffect(() => {
    if (recentUpdates > 0) {
      setPulse(true)
      const timer = setTimeout(() => setPulse(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [recentUpdates])

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        {isConnected ? (
          <Wifi className={`w-3 h-3 text-green-500 ${pulse ? "animate-pulse" : ""}`} />
        ) : (
          <WifiOff className="w-3 h-3 text-red-500" />
        )}
        <Badge variant={isConnected ? "default" : "destructive"} className={`text-xs ${pulse ? "animate-pulse" : ""}`}>
          {isConnected ? "Live" : "Offline"}
        </Badge>
      </div>

      {showActivity && isConnected && (
        <div className="flex items-center gap-1">
          <Activity className="w-3 h-3 text-blue-500" />
          <span className="text-xs text-gray-500">{recentUpdates > 0 ? `${recentUpdates} updates` : "Monitoring"}</span>
        </div>
      )}
    </div>
  )
}
