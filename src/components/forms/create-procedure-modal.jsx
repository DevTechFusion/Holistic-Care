"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"

/**
 * Create Procedure Modal Component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 */
export default function CreateProcedureModal({ isOpen, onClose }) {
  const [procedure, setProcedure] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Creating procedure:", procedure)
    onClose()
    setProcedure("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-semibold">Create procedure</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="procedure">Procedure*</Label>
            <Input
              id="procedure"
              placeholder="Laser hair removal"
              value={procedure}
              onChange={(e) => setProcedure(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-teal-500 hover:bg-teal-600">
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
