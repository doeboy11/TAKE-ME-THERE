"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  User, 
  Settings, 
  LogOut, 
  LayoutDashboard, 
  Building2, 
  Heart, 
  History, 
  HelpCircle,
  X
} from "lucide-react"

interface UserMenuProps {
  isOpen: boolean
  onClose: () => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
}

export function UserMenu({ isOpen, onClose, triggerRef }: UserMenuProps) {
  const router = useRouter()
  const { user, logout } = useAuth()
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose, triggerRef])

  const handleLogout = async () => {
    await logout()
    onClose()
    router.push('/')
  }

  const handleDashboard = () => {
    onClose()
    router.push('/dashboard')
  }

  const handleProfile = () => {
    onClose()
    router.push('/profile')
  }

  const handleSettings = () => {
    onClose()
    router.push('/settings')
  }

  const handleFavorites = () => {
    onClose()
    router.push('/favorites')
  }

  const handleHistory = () => {
    onClose()
    router.push('/history')
  }

  const handleHelp = () => {
    onClose()
    router.push('/help')
  }

  const handleBusinessRegistration = () => {
    onClose()
    router.push('/business-registration')
  }

  if (!isOpen) return null

  const displayName = user?.name || user?.email?.split('@')[0] || 'User'
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div 
        ref={menuRef}
        className="absolute top-16 right-4 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50"
      >
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-gray-900">User Menu</CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-white/50">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {/* User Info Section */}
            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200/50">
              <Avatar className="h-14 w-14">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-gray-900 truncate">
                  {displayName}
                </p>
                <p className="text-sm text-gray-600 truncate">
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Menu Items */}
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start h-14 text-left hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-all duration-200"
                onClick={handleDashboard}
              >
                <LayoutDashboard className="w-5 h-5 mr-4 text-blue-600" />
                <div>
                  <div className="font-semibold">Dashboard</div>
                  <div className="text-xs text-gray-500">Manage your businesses</div>
                </div>
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start h-14 text-left hover:bg-green-50 hover:text-green-700 rounded-xl transition-all duration-200"
                onClick={handleProfile}
              >
                <User className="w-5 h-5 mr-4 text-green-600" />
                <div>
                  <div className="font-semibold">My Profile</div>
                  <div className="text-xs text-gray-500">View and edit your profile</div>
                </div>
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start h-14 text-left hover:bg-purple-50 hover:text-purple-700 rounded-xl transition-all duration-200"
                onClick={handleBusinessRegistration}
              >
                <Building2 className="w-5 h-5 mr-4 text-purple-600" />
                <div>
                  <div className="font-semibold">Register Business</div>
                  <div className="text-xs text-gray-500">Add a new business listing</div>
                </div>
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start h-14 text-left hover:bg-pink-50 hover:text-pink-700 rounded-xl transition-all duration-200"
                onClick={handleFavorites}
              >
                <Heart className="w-5 h-5 mr-4 text-pink-600" />
                <div>
                  <div className="font-semibold">My Favorites</div>
                  <div className="text-xs text-gray-500">Saved businesses</div>
                </div>
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start h-14 text-left hover:bg-orange-50 hover:text-orange-700 rounded-xl transition-all duration-200"
                onClick={handleHistory}
              >
                <History className="w-5 h-5 mr-4 text-orange-600" />
                <div>
                  <div className="font-semibold">Search History</div>
                  <div className="text-xs text-gray-500">Recent searches</div>
                </div>
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start h-14 text-left hover:bg-gray-50 hover:text-gray-700 rounded-xl transition-all duration-200"
                onClick={handleSettings}
              >
                <Settings className="w-5 h-5 mr-4 text-gray-600" />
                <div>
                  <div className="font-semibold">Settings</div>
                  <div className="text-xs text-gray-500">Account preferences</div>
                </div>
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start h-14 text-left hover:bg-teal-50 hover:text-teal-700 rounded-xl transition-all duration-200"
                onClick={handleHelp}
              >
                <HelpCircle className="w-5 h-5 mr-4 text-teal-600" />
                <div>
                  <div className="font-semibold">Help & Support</div>
                  <div className="text-xs text-gray-500">Get assistance</div>
                </div>
              </Button>
            </div>

            {/* Logout Section */}
            <div className="pt-4 border-t border-gray-200">
              <Button
                variant="ghost"
                className="w-full justify-start h-14 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5 mr-4" />
                <div>
                  <div className="font-semibold">Sign Out</div>
                  <div className="text-xs text-gray-500">Log out of your account</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
