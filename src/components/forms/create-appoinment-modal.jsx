"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"

/**
 * Create Appointment Modal Component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 */
export default function CreateAppointmentModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    date: "",
    doctorName: "",
    timeSlot: "",
    procedure: "",
    patientName: "",
    contactNo: "",
    category: "",
    department: "",
    agent: "",
    source: "",
    notes: "",
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Creating appointment:", formData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-semibold">Create New Appointment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date*</Label>
              <Select value={formData.date} onValueChange={(value) => setFormData({ ...formData, date: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Monday 12 Aug, 2025" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025-08-12">Monday 12 Aug, 2025</SelectItem>
                  <SelectItem value="2025-08-13">Tuesday 13 Aug, 2025</SelectItem>
                  <SelectItem value="2025-08-14">Wednesday 14 Aug, 2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="doctorName">Doctor Name*</Label>
              <Select
                value={formData.doctorName}
                onValueChange={(value) => setFormData({ ...formData, doctorName: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Dr. Tariq Aslam" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dr-tariq">Dr. Tariq Aslam</SelectItem>
                  <SelectItem value="dr-amna">Dr. Amna</SelectItem>
                  <SelectItem value="dr-nimra">Dr. Nimra</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeSlot">Time Slot*</Label>
              <Select
                value={formData.timeSlot}
                onValueChange={(value) => setFormData({ ...formData, timeSlot: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="9pm to 10pm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="9-10">9pm to 10pm</SelectItem>
                  <SelectItem value="10-11">10pm to 11pm</SelectItem>
                  <SelectItem value="11-12">11pm to 12pm</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="procedure">Procedure*</Label>
              <Select
                value={formData.procedure}
                onValueChange={(value) => setFormData({ ...formData, procedure: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Laser hair removal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="laser-hair">Laser hair removal</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="checkup">Regular Checkup</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patientName">Patient Name*</Label>
              <Input
                id="patientName"
                placeholder="Mrs. Hafeez"
                value={formData.patientName}
                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactNo">Contact No.*</Label>
              <Input
                id="contactNo"
                placeholder="0306-4445652"
                value={formData.contactNo}
                onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category*</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="New Bookings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New Bookings</SelectItem>
                  <SelectItem value="followup">Follow-up</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="agent">Agent*</Label>
              <Input
                id="agent"
                placeholder="Iqra"
                value={formData.agent}
                onChange={(e) => setFormData({ ...formData, agent: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Source*</Label>
              <Select value={formData.source} onValueChange={(value) => setFormData({ ...formData, source: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Insta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="insta">Insta</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Add Notes</Label>
            <Textarea
              id="notes"
              placeholder="lorem ipsum aj ajbcaiodu ajgajbcnjcnb"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="min-h-[80px]"
            />
            <div className="text-xs text-gray-400 text-right">50/200</div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-teal-500 hover:bg-teal-600">
              Create Appointment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
