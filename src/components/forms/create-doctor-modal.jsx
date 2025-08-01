"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

/**
 * Create Doctor Modal Component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 */
export default function CreateDoctorModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    phoneNo: "",
    department: "",
    procedures: [],
  })

  const [availability, setAvailability] = useState({
    monday: { available: true, startTime: "9 AM", endTime: "10 AM" },
    tuesday: { available: true, startTime: "9 AM", endTime: "10 AM" },
    wednesday: { available: false, startTime: "9 AM", endTime: "10 AM" },
    thursday: { available: true, startTime: "9 AM", endTime: "10 AM" },
    friday: { available: true, startTime: "9 AM", endTime: "10 AM" },
    saturday: { available: false, startTime: "9 AM", endTime: "10 AM" },
  })

  const procedures = ["Carbon Facial", "Lip Laser", "Laser Hair Removal", "Botox", "Consultation"]

  const handleProcedureToggle = (procedure) => {
    setFormData((prev) => ({
      ...prev,
      procedures: prev.procedures.includes(procedure)
        ? prev.procedures.filter((p) => p !== procedure)
        : [...prev.procedures, procedure],
    }))
  }

  const removeProcedure = (procedure) => {
    setFormData((prev) => ({
      ...prev,
      procedures: prev.procedures.filter((p) => p !== procedure),
    }))
  }

  const handleAvailabilityChange = (day, field, value) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Creating doctor:", { ...formData, availability })
    onClose()
  }

  const days = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-semibold">Create Doctor</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name*</Label>
              <Input
                id="name"
                placeholder="Dr. Iqra Jamil"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNo">Phone No.*</Label>
              <Input
                id="phoneNo"
                placeholder="0300-1231236"
                value={formData.phoneNo}
                onChange={(e) => setFormData({ ...formData, phoneNo: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department*</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData({ ...formData, department: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Dermatology" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dermatology">Dermatology</SelectItem>
                  <SelectItem value="cardiology">Cardiology</SelectItem>
                  <SelectItem value="nutrition">Nutrition</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Procedures*</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.procedures.map((procedure) => (
                  <Badge key={procedure} variant="secondary" className="bg-gray-100">
                    {procedure}
                    <button
                      type="button"
                      onClick={() => removeProcedure(procedure)}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Select onValueChange={handleProcedureToggle}>
                <SelectTrigger>
                  <SelectValue placeholder="Select procedures" />
                </SelectTrigger>
                <SelectContent>
                  {procedures.map((procedure) => (
                    <SelectItem key={procedure} value={procedure}>
                      {procedure}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-medium">Availability</Label>
            <div className="grid grid-cols-3 gap-4">
              {days.map(({ key, label }) => {
                const dayData = availability[key]
                return (
                  <div key={key} className="space-y-3 p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={dayData.available}
                        onCheckedChange={(checked) => handleAvailabilityChange(key, "available", checked)}
                      />
                      <Label htmlFor={key} className="font-medium">
                        {label}
                      </Label>
                    </div>
                    {dayData.available && (
                      <>
                        <div className="space-y-1">
                          <Label className="text-xs text-blue-500">Start Time*</Label>
                          <Input
                            value={dayData.startTime}
                            onChange={(e) => handleAvailabilityChange(key, "startTime", e.target.value)}
                            className="text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-blue-500">End Time*</Label>
                          <Input
                            value={dayData.endTime}
                            onChange={(e) => handleAvailabilityChange(key, "endTime", e.target.value)}
                            className="text-xs"
                          />
                        </div>
                      </>
                    )}
                    {!dayData.available && <div className="text-xs text-gray-400">Available</div>}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-teal-500 hover:bg-teal-600">
              Create Doctor
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
