"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Users,
  Calendar,
  Phone,
  Clock,
  CheckCircle,
  Plus
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function AgentDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  const navigationItems = [
    { id: "overview", label: "Overview", icon: Calendar },
    { id: "patients", label: "My Patients", icon: Users },
    { id: "appointments", label: "Appointments", icon: Calendar },
    { id: "tasks", label: "Tasks", icon: CheckCircle },
    { id: "messages", label: "Messages", icon: Phone },
  ]

  const headerActions = (
    <Button size="sm" className="bg-teal-400 hover:bg-teal-500">
      <Plus className="h-4 w-4 mr-2" />
      New Appointment
    </Button>
  )

  const stats = [
    { title: "My Patients", value: "24", change: "+3", icon: Users },
    { title: "Today's Appointments", value: "8", change: "2 pending", icon: Calendar },
    { title: "Calls Made", value: "15", change: "+5 today", icon: Phone },
    { title: "Tasks Completed", value: "12/15", change: "80%", icon: CheckCircle },
  ]

  const todayAppointments = [
    { id: 1, patient: "John Doe", time: "9:00 AM", type: "Consultation", status: "confirmed" },
    { id: 2, patient: "Sarah Wilson", time: "10:30 AM", type: "Follow-up", status: "confirmed" },
    { id: 3, patient: "Mike Johnson", time: "2:00 PM", type: "Check-up", status: "pending" },
    { id: 4, patient: "Emily Davis", time: "3:30 PM", type: "Consultation", status: "pending" },
  ]

  const recentTasks = [
    { id: 1, task: "Call patient for appointment confirmation", priority: "high", completed: false },
    { id: 2, task: "Update patient medical records", priority: "medium", completed: true },
    { id: 3, task: "Schedule follow-up appointment", priority: "high", completed: false },
    { id: 4, task: "Send prescription to pharmacy", priority: "low", completed: true },
  ]

  const patientMessages = [
    { id: 1, patient: "John Doe", message: "Can I reschedule my appointment?", time: "5 min ago", unread: true },
    { id: 2, patient: "Sarah Wilson", message: "Thank you for the follow-up call", time: "1 hour ago", unread: false },
    { id: 3, patient: "Mike Johnson", message: "I have some questions about my medication", time: "2 hours ago", unread: true },
  ]

  return (
    <DashboardLayout
      navigationItems={navigationItems}
      role="agent"
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
                      <p className="text-sm text-teal-600">{stat.change}</p>
                    </div>
                    <div className="p-3 bg-teal-50 rounded-full">
                      <stat.icon className="h-6 w-6 text-teal-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Today's Appointments */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Today's Appointments</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {todayAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">{appointment.time}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{appointment.patient}</p>
                            <p className="text-xs text-gray-500">{appointment.type}</p>
                          </div>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          appointment.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Tasks */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Tasks</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {recentTasks.map((task) => (
                      <div key={task.id} className="flex items-center space-x-4">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          task.completed ? "bg-green-100" : "bg-gray-100"
                        }`}>
                          {task.completed && <CheckCircle className="h-3 w-3 text-green-600" />}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm ${task.completed ? "line-through text-gray-500" : "text-gray-900"}`}>
                            {task.task}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className={`w-2 h-2 rounded-full ${
                              task.priority === "high" ? "bg-red-400" :
                              task.priority === "medium" ? "bg-yellow-400" : "bg-green-400"
                            }`}></div>
                            <p className="text-xs text-gray-500 capitalize">{task.priority} priority</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Patient Messages */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Recent Messages</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {patientMessages.map((message) => (
                    <div key={message.id} className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900">{message.patient}</p>
                          {message.unread && (
                            <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{message.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{message.time}</p>
                      </div>
                    </div>
                  ))}
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