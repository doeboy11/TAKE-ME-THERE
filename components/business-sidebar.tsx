"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, TrendingUp, Eye, Award, MapPin } from 'lucide-react'
import { useLiveAnalytics } from "@/hooks/use-live-analytics"
import { LiveIndicator } from "@/components/live-indicator"
import { TrendingBadge } from "@/components/trending-badge"
import { LiveCounter } from "@/components/live-counter"

interface Business {
  id: string
  name: string
  category: string
  rating?: number
  reviewCount?: number
  address: string
  phone: string
  hours: string
  distance?: number
  image?: string
  images?: string[]
  description: string
  priceRange?: string
  lat?: number
  lng?: number
  searchCount?: number
  visitCount?: number
  trending?: boolean
}

interface BusinessSidebarProps {
  businesses: Business[]
  onBusinessSelect?: (business: Business) => void
  selectedBusiness?: Business | null
  onBusinessSearch?: (businessId: string) => void
  onBusinessVisit?: (businessId: string) => void
}

export function BusinessSidebar({
  businesses,
  onBusinessSelect,
  selectedBusiness,
  onBusinessSearch,
  onBusinessVisit,
}: BusinessSidebarProps) {
  const [activeTab, setActiveTab] = useState<"searched" | "visited" | "rated">("searched")

  // Use live analytics hook
  const {
    analytics,
    incrementSearch,
    incrementVisit,
    getTotalSearches,
    getTotalVisits,
    getTrendingBusinesses,
    isConnected,
  } = useLiveAnalytics(businesses.map((b) => b.id))

  // Simple activity indicator based on connection status
  const recentUpdates = isConnected ? Math.floor(Math.random() * 3) : 0

  // Combine business data with live analytics
  const businessesWithStats = businesses.map((business) => ({
    ...business,
    searchCount: analytics[business.id]?.searchCount || 0,
    visitCount: analytics[business.id]?.visitCount || 0,
    trending: analytics[business.id]?.trending || false,
  }))

  // Get top businesses by different criteria
  const topSearched = businessesWithStats.sort((a, b) => (b.searchCount || 0) - (a.searchCount || 0)).slice(0, 5)

  const mostVisited = businessesWithStats.sort((a, b) => (b.visitCount || 0) - (a.visitCount || 0)).slice(0, 5)

  const highlyRated = businessesWithStats
    .filter((b) => b.reviewCount >= 50) // Only businesses with substantial reviews
    .sort((a, b) => {
      // Sort by rating first, then by review count
      if (b.rating !== a.rating) return b.rating - a.rating
      return b.reviewCount - a.reviewCount
    })
    .slice(0, 5)

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ))
  }

  const renderBusinessCard = (business: Business & { trending?: boolean }, showStat: "search" | "visit" | "rating") => (
    <div
      key={business.id}
      className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
        selectedBusiness?.id === business.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
      }`}
      onClick={() => {
        onBusinessSelect?.(business)
        if (showStat === "search") {
          onBusinessSearch?.(business.id)
        } else if (showStat === "visit") {
          onBusinessVisit?.(business.id)
        }
      }}
    >
      <div className="flex gap-3">
        <img
          src={business.image || "/placeholder.svg"}
          alt={business.name}
          className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-sm text-gray-900 truncate">{business.name}</h4>
            <TrendingBadge isTrending={business.trending || false} />
          </div>
          <div className="flex items-center gap-1 mt-1">
            {renderStars(business.rating)}
            <span className="text-xs text-gray-500 ml-1">
              {business.rating} ({business.reviewCount})
            </span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <Badge variant="secondary" className="text-xs">
              {business.category}
            </Badge>
            {showStat === "search" && (
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <TrendingUp className="w-3 h-3" />
                <LiveCounter value={business.searchCount || 0} suffix=" searches" />
              </div>
            )}
            {showStat === "visit" && (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <Eye className="w-3 h-3" />
                <LiveCounter value={business.visitCount || 0} suffix=" visits" />
              </div>
            )}
            {showStat === "rating" && (
              <div className="flex items-center gap-1 text-xs text-yellow-600">
                <Award className="w-3 h-3" />
                Top Rated
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{business.address.split(",")[0]}</span>
          </div>
        </div>
      </div>
    </div>
  )

  const getCurrentList = () => {
    switch (activeTab) {
      case "searched":
        return topSearched
      case "visited":
        return mostVisited
      case "rated":
        return highlyRated
      default:
        return topSearched
    }
  }

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case "searched":
        return <TrendingUp className="w-4 h-4" />
      case "visited":
        return <Eye className="w-4 h-4" />
      case "rated":
        return <Award className="w-4 h-4" />
      default:
        return <TrendingUp className="w-4 h-4" />
    }
  }

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case "searched":
        return "Top Searched"
      case "visited":
        return "Most Visited"
      case "rated":
        return "Highly Rated"
      default:
        return "Top Searched"
    }
  }

  const getTabDescription = (tab: string) => {
    switch (tab) {
      case "searched":
        return "Most searched businesses this week"
      case "visited":
        return "Most visited business profiles"
      case "rated":
        return "Highest rated businesses with 50+ reviews"
      default:
        return "Most searched businesses this week"
    }
  }

  return (
    <div className="w-full xl:w-80 space-y-4">
      {/* Tab Navigation */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Popular Businesses</CardTitle>
            <LiveIndicator isConnected={isConnected} showActivity={true} recentUpdates={recentUpdates} />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-1 mb-4">
            {(["searched", "visited", "rated"] as const).map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab)}
                className="flex-1 text-xs"
              >
                {getTabIcon(tab)}
                <span className="ml-1 hidden sm:inline">
                  {tab === "searched" ? "Searched" : tab === "visited" ? "Visited" : "Rated"}
                </span>
              </Button>
            ))}
          </div>

          {/* Current Tab Content */}
          <div className="space-y-3">
            <div className="text-center mb-3">
              <h3 className="font-medium text-gray-900">{getTabTitle(activeTab)}</h3>
              <p className="text-xs text-gray-500 mt-1">{getTabDescription(activeTab)}</p>
            </div>

            {getCurrentList().length > 0 ? (
              <div className="space-y-3">
                {getCurrentList().map((business, index) => (
                  <div key={business.id} className="relative">
                    {/* Ranking Badge */}
                    <div className="absolute -left-2 -top-2 z-10">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          index === 0
                            ? "bg-yellow-500"
                            : index === 1
                              ? "bg-gray-400"
                              : index === 2
                                ? "bg-amber-600"
                                : "bg-blue-500"
                        }`}
                      >
                        {index + 1}
                      </div>
                    </div>
                    {renderBusinessCard(
                      business,
                      activeTab === "searched" ? "search" : activeTab === "visited" ? "visit" : "rating",
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No businesses found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Total Searches</span>
              </div>
              <LiveCounter value={getTotalSearches()} className="text-lg font-bold text-blue-600" />
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Profile Views</span>
              </div>
              <LiveCounter value={getTotalVisits()} className="text-lg font-bold text-green-600" />
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-900">Avg Rating</span>
              </div>
              <span className="text-lg font-bold text-yellow-600">
                {(businesses.reduce((sum, b) => sum + b.rating, 0) / businesses.length).toFixed(1)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Featured Categories */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Popular Categories</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {Array.from(new Set(businesses.map((b) => b.category)))
              .slice(0, 6)
              .map((category) => {
                const count = businesses.filter((b) => b.category === category).length
                return (
                  <div
                    key={category}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-700">{category}</span>
                    <Badge variant="outline" className="text-xs">
                      {count}
                    </Badge>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
