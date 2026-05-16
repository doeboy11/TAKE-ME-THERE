"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { businessStore } from "@/lib/business-store"

interface FavoriteButtonProps {
  businessId: string
  size?: "sm" | "default" | "icon"
  className?: string
  onToggle?: (isFavorite: boolean) => void
}

export function FavoriteButton({ businessId, size = "icon", className, onToggle }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then((result: any) => {
      const uid = result.data?.user?.id || null
      setUserId(uid)
      if (uid) {
        businessStore.isFavorite(uid, businessId).then(setIsFavorite)
      } else {
        // Check localStorage fallback
        const stored = localStorage.getItem('tmt_favorites')
        if (stored) {
          const ids = JSON.parse(stored) as string[]
          setIsFavorite(ids.includes(businessId))
        }
      }
    })
  }, [businessId])

  const handleToggle = async () => {
    if (loading) return
    setLoading(true)
    try {
      if (userId) {
        if (isFavorite) {
          await businessStore.removeFavorite(userId, businessId)
        } else {
          await businessStore.addFavorite(userId, businessId)
        }
      } else {
        // localStorage fallback for unauthenticated users
        const stored = localStorage.getItem('tmt_favorites')
        let ids: string[] = stored ? JSON.parse(stored) : []
        if (isFavorite) {
          ids = ids.filter((id) => id !== businessId)
        } else {
          ids.push(businessId)
        }
        localStorage.setItem('tmt_favorites', JSON.stringify(ids))
      }
      setIsFavorite(!isFavorite)
      onToggle?.(!isFavorite)
    } catch (err) {
      console.error('FavoriteButton toggle error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size={size}
      className={className}
      onClick={(e) => {
        e.stopPropagation()
        handleToggle()
      }}
      disabled={loading}
    >
      <Heart
        className={`w-5 h-5 transition-all ${
          isFavorite
            ? "fill-red-500 text-red-500 scale-110"
            : "text-muted-foreground hover:text-red-400"
        }`}
      />
    </Button>
  )
}
