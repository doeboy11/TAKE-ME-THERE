"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { businessStore, Business } from "@/lib/business-store"
import { Star, MapPin, ArrowRight, Loader2 } from "lucide-react"

interface RelatedBusinessesProps {
  currentId: string
  category: string
}

export function RelatedBusinesses({ currentId, category }: RelatedBusinessesProps) {
  const [related, setRelated] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const all = await businessStore.getApprovedBusinesses()
        const sameCategory = all
          .filter((b) => b.id !== currentId && b.category === category)
          .slice(0, 4)
        setRelated(sameCategory)
      } catch {
        setRelated([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [currentId, category])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (related.length === 0) return null

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Similar Businesses</h2>
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
          <Link href={`/?category=${encodeURIComponent(category)}`}>
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {related.map((biz) => (
          <Link key={biz.id} href={`/business/${biz.id}`}>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow group h-full">
              <div className="flex h-full">
                <div className="w-24 h-24 flex-shrink-0 bg-muted overflow-hidden">
                  <img
                    src={biz.image || "/placeholder.svg"}
                    alt={biz.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-3 flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{biz.name}</h3>
                  <Badge variant="secondary" className="mt-1 text-[10px] px-1.5 py-0 bg-primary/10 text-primary">
                    {biz.category}
                  </Badge>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 fill-primary text-primary" />
                    <span className="text-xs font-medium">{biz.rating?.toFixed(1) || "—"}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground truncate">
                    <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                    <span className="truncate">{biz.address}</span>
                  </div>
                </CardContent>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
