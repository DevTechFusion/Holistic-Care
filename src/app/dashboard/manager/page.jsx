"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Users,
  Calendar,
  FileText,
  BarChart3,
  TrendingUp,
  Clock,
  UserCheck
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  const navigationItems = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "team", label: "Team Management", icon: Users },
    { id: "schedule", label: "Schedule", icon: Calendar },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "performance", label: "Performance", icon: TrendingUp },
  ]

  const headerActions = (
    <Button size="sm" className="bg-teal-400 hover:bg-teal-500">
      <Calendar className="h-4 w-4 mr-2" />
      Schedule Meeting
    </Button>
  )

  const stats = [
    { title: "Team Members", value: "12", change: "+1", icon: Users },
    { title: "Today's Appointments", value: "48", change: "+5%", icon: Calendar },
    { title: "Completed Tasks", value: "89%", change: "+3%", icon: UserCheck },
    { title: "Department Revenue", value: "$24,580", change: "+12%", icon: TrendingUp },
  ]

  const teamMembers = [
    { id: 1, name: "Dr. Sarah Johnson", role: "Senior Doctor", status: "Available", patients: 8 },
    { id: 2, name: "Nurse Mike Wilson", role: "Head Nurse", status: "Busy", patients: 12 },
    { id: 3, name: "Dr. Emily Davis", role: "Specialist", status: "Available", patients: 6 },
    { id: 4, name: "Agent John Smith", role: "Patient Coordinator", status: "Available", patients: 15 },
  ]

  const upcomingTasks = [
    { id: 1, task: "Weekly team meeting", time: "10:00 AM", priority: "high" },
    { id: 2, task: "Review patient reports", time: "2:00 PM", priority: "medium" },
    { id: 3, task: "Staff performance review", time: "4:00 PM", priority: "high" },
    { id: 4, task: "Department budget review", time: "Tomorrow", priority: "low" },
  ]

  return (
    <DashboardLayout
      navigationItems={navigationItems}
      role="manager"
      headerActions={headerActions}
    >
      <div className="space-y-6">
        {activeTab === "overview" && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-green-600">{stat.change} from last week</p>
                    </div>
                    <div className="p-3 bg-teal-50 rounded-full">
                      <stat.icon className="h-6 w-6 text-teal-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Team Status */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Team Status</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-teal-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{member.name}</p>
                            <p className="text-xs text-gray-500">{member.role}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                            member.status === "Available"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {member.status}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">{member.patients} patients</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Upcoming Tasks */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {upcomingTasks.map((task) => (
                      <div key={task.id} className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                          task.priority === "high" ? "bg-red-400" :
                          task.priority === "medium" ? "bg-yellow-400" : "bg-green-400"
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{task.task}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <p className="text-xs text-gray-500">{task.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab !== "overview" && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Section
              </h3>
              <p className="text-gray-500">
                This section is under development. Full functionality will be available soon.
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}