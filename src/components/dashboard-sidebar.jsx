"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function DashboardSidebar({ navigationItems, role }) {
  const pathname = usePathname()

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center space-x-3 px-2 py-2">
          <Image
            src="/images/logo.svg"
            alt="Holistic Care Logo"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {role === "admin" && "Admin Dashboard"}
              {role === "agent" && "Agent Dashboard"}
              {role === "manager" && "Manager Dashboard"}
            </h2>
            <p className="text-sm text-gray-500">
              Welcome back, {role === "admin" ? "Administrator" : role === "agent" ? "Agent" : "Manager"}
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isActive = pathname === item.href || 
                  (item.id === "overview" && pathname.endsWith(`/${role}`))
                
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                    >
                      <Link href={item.href || `#${item.id}`}>
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}