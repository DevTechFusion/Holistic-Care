"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

export function DashboardLayout({ 
  children, 
  navigationItems, 
  role, 
  headerActions,
  title,
  subtitle 
}) {
  return (
    <SidebarProvider>
      <DashboardSidebar navigationItems={navigationItems} role={role} />
      <SidebarInset>
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <SidebarTrigger className="-ml-1" />
              <div className="flex items-center space-x-3">
                <Image
                  src="/images/logo.svg"
                  alt="Holistic Care Logo"
                  width={32}
                  height={32}
                  className="h-8 w-8 md:hidden"
                />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {title || `${role?.charAt(0).toUpperCase() + role?.slice(1)} Dashboard`}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {subtitle || `Welcome back, ${role === "admin" ? "Administrator" : role === "agent" ? "Agent" : "Manager"}`}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              {headerActions && (
                <div className="flex items-center space-x-2">
                  {headerActions}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 bg-gray-50 min-h-[calc(100vh-80px)]">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}