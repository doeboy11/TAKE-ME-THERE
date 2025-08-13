"use client"

import { Badge } from "@/components/ui/badge"
import { TrendingUp, Flame } from "lucide-react"

interface TrendingBadgeProps {
  isTrending: boolean
  className?: string
  variant?: "fire" | "arrow"
}

export function TrendingBadge({ isTrending, className = "", variant = "fire" }: TrendingBadgeProps) {
  if (!isTrending) return null

  return (
    <Badge
      variant="destructive"
      className={`text-xs bg-gradient-to-r from-orange-500 to-red-500 animate-pulse ${className}`}
    >
      {variant === "fire" ? <Flame className="w-3 h-3 mr-1" /> : <TrendingUp className="w-3 h-3 mr-1" />}
      Trending
    </Badge>
  )
}
