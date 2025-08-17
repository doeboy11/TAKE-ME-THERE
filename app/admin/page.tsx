"use client"
import dynamic from "next/dynamic"

const AdminDashboardCode = dynamic(
  () => import("@/components/admin-dashboard-code").then(m => m.AdminDashboardCode),
  {
    ssr: false,
    loading: () => <div className="min-h-screen flex items-center justify-center">Loading admin dashboard...</div>,
  }
)

export default function AdminPage() {
  return <AdminDashboardCode />
}