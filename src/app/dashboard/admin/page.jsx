"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Users,
  Calendar,
  FileText,
  Settings,
  BarChart3,
  UserPlus,
  Stethoscope,
  Building2,
  Activity
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import CreateUserModal from "@/components/forms/create-user-modal"
import CreateDoctorModal from "@/components/forms/create-doctor-modal"
import CreateProcedureModal from "@/components/forms/create-procedure-modal"
import CreateDepartmentModal from "@/components/forms/create-department-modal"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [modals, setModals] = useState({
    createUser: false,
    createDoctor: false,
    createProcedure: false,
    createDepartment: false,
  })

  const openModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: true }))
  }

  const closeModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: false }))
  }

  const navigationItems = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "patients", label: "Patients", icon: Users },
    { id: "appointments", label: "Appointments", icon: Calendar },
    { id: "staff", label: "Staff Management", icon: Users },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  const headerActions = (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => openModal('createUser')}
        className="text-teal-600 border-teal-200 hover:bg-teal-50"
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Add User
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => openModal('createDoctor')}
        className="text-teal-600 border-teal-200 hover:bg-teal-50"
      >
        <Stethoscope className="h-4 w-4 mr-2" />
        Add Doctor
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => openModal('createProcedure')}
        className="text-teal-600 border-teal-200 hover:bg-teal-50"
      >
        <Activity className="h-4 w-4 mr-2" />
        Add Procedure
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => openModal('createDepartment')}
        className="text-teal-600 border-teal-200 hover:bg-teal-50"
      >
        <Building2 className="h-4 w-4 mr-2" />
        Add Department
      </Button>
    </>
  )

  const stats = [
    { title: "Total Patients", value: "2,847", change: "+12%", icon: Users },
    { title: "Appointments Today", value: "156", change: "+8%", icon: Calendar },
    { title: "Active Staff", value: "42", change: "+2%", icon: Users },
    { title: "Revenue (Month)", value: "$84,320", change: "+15%", icon: BarChart3 },
  ]

  const recentActivities = [
    { id: 1, action: "New patient registered", user: "Dr. Smith", time: "2 minutes ago" },
    { id: 2, action: "Appointment scheduled", user: "Nurse Johnson", time: "5 minutes ago" },
    { id: 3, action: "Medical record updated", user: "Dr. Wilson", time: "10 minutes ago" },
    { id: 4, action: "Staff member added", user: "Admin", time: "15 minutes ago" },
  ]

  return (
    <>
      <DashboardLayout
        navigationItems={navigationItems}
        role="admin"
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
                        <p className="text-sm text-green-600">{stat.change} from last month</p>
                      </div>
                      <div className="p-3 bg-teal-50 rounded-full">
                        <stat.icon className="h-6 w-6 text-teal-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Activities */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{activity.action}</p>
                          <p className="text-xs text-gray-500">by {activity.user} • {activity.time}</p>
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
                  <Settings className="h-8 w-8 text-gray-400" />
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

      {/* Modals */}
      <CreateUserModal
        isOpen={modals.createUser}
        onClose={() => closeModal('createUser')}
      />
      <CreateDoctorModal
        isOpen={modals.createDoctor}
        onClose={() => closeModal('createDoctor')}
      />
      <CreateProcedureModal
        isOpen={modals.createProcedure}
        onClose={() => closeModal('createProcedure')}
      />
      <CreateDepartmentModal
        isOpen={modals.createDepartment}
        onClose={() => closeModal('createDepartment')}
      />
    </>
  )
}