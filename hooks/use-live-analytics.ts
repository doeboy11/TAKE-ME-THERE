"use client"

import { useState, useEffect, useCallback, useRef } from "react"

interface BusinessAnalytics {
  id: string
  searchCount: number
  visitCount: number
  lastSearched?: Date
  lastVisited?: Date
  trending: boolean
}

interface LiveAnalyticsHook {
  analytics: Record<string, BusinessAnalytics>
  incrementSearch: (businessId: string) => void
  incrementVisit: (businessId: string) => void
  getTotalSearches: () => number
  getTotalVisits: () => number
  getTrendingBusinesses: () => string[]
  isConnected: boolean
}

// Simulate real-time updates
const LIVE_UPDATE_INTERVAL = 3000 // 3 seconds
const TRENDING_THRESHOLD = 10 // searches in last 5 minutes

export function useLiveAnalytics(businessIds: string[]): LiveAnalyticsHook {
  const [analytics, setAnalytics] = useState<Record<string, BusinessAnalytics>>({})
  const [isConnected, setIsConnected] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const businessIdsRef = useRef<string[]>([])

  // Initialize analytics for all businesses
  useEffect(() => {
    // Only initialize if businessIds changed
    const idsChanged = JSON.stringify(businessIdsRef.current) !== JSON.stringify(businessIds)

    if (idsChanged && businessIds.length > 0) {
      const initialAnalytics: Record<string, BusinessAnalytics> = {}

      businessIds.forEach((id) => {
        initialAnalytics[id] = {
          id,
          searchCount: Math.floor(Math.random() * 500) + 50,
          visitCount: Math.floor(Math.random() * 1000) + 100,
          trending: false,
        }
      })

      setAnalytics(initialAnalytics)
      setIsConnected(true)
      businessIdsRef.current = businessIds
    }
  }, [businessIds])

  // Simulate live updates from other users
  useEffect(() => {
    if (!isConnected || Object.keys(analytics).length === 0) return

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(() => {
      setAnalytics((prev) => {
        const updated = { ...prev }
        const currentBusinessIds = Object.keys(updated)

        // Randomly update some businesses
        const businessesToUpdate = currentBusinessIds.filter(() => Math.random() < 0.3) // 30% chance

        businessesToUpdate.forEach((businessId) => {
          if (updated[businessId]) {
            const current = updated[businessId]
            const now = new Date()

            // Random chance of search or visit
            if (Math.random() < 0.6) {
              // 60% chance of search
              updated[businessId] = {
                ...current,
                searchCount: current.searchCount + Math.floor(Math.random() * 3) + 1,
                lastSearched: now,
              }
            }

            if (Math.random() < 0.4) {
              // 40% chance of visit
              updated[businessId] = {
                ...updated[businessId],
                visitCount: updated[businessId].visitCount + Math.floor(Math.random() * 2) + 1,
                lastVisited: now,
              }
            }
          }
        })

        // Update trending status
        Object.keys(updated).forEach((businessId) => {
          const business = updated[businessId]
          const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

          // Check if business has been searched recently and frequently
          const recentSearches = business.lastSearched && business.lastSearched > fiveMinutesAgo
          updated[businessId] = {
            ...business,
            trending: recentSearches && business.searchCount % 50 > TRENDING_THRESHOLD,
          }
        })

        return updated
      })
    }, LIVE_UPDATE_INTERVAL)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isConnected]) // Remove analytics from dependencies

  // Increment search count
  const incrementSearch = useCallback((businessId: string) => {
    setAnalytics((prev) => ({
      ...prev,
      [businessId]: {
        ...prev[businessId],
        searchCount: (prev[businessId]?.searchCount || 0) + 1,
        lastSearched: new Date(),
      },
    }))
  }, [])

  // Increment visit count
  const incrementVisit = useCallback((businessId: string) => {
    setAnalytics((prev) => ({
      ...prev,
      [businessId]: {
        ...prev[businessId],
        visitCount: (prev[businessId]?.visitCount || 0) + 1,
        lastVisited: new Date(),
      },
    }))
  }, [])

  // Get total searches across all businesses
  const getTotalSearches = useCallback(() => {
    return Object.values(analytics).reduce((sum, business) => sum + business.searchCount, 0)
  }, [analytics])

  // Get total visits across all businesses
  const getTotalVisits = useCallback(() => {
    return Object.values(analytics).reduce((sum, business) => sum + business.visitCount, 0)
  }, [analytics])

  // Get trending businesses
  const getTrendingBusinesses = useCallback(() => {
    return Object.values(analytics)
      .filter((business) => business.trending)
      .map((business) => business.id)
  }, [analytics])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    analytics,
    incrementSearch,
    incrementVisit,
    getTotalSearches,
    getTotalVisits,
    getTrendingBusinesses,
    isConnected,
  }
}
