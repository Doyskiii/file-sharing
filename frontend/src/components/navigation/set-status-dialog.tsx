"use client"

import * as React from "react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Circle, Moon, MinusCircle, EyeOff } from "lucide-react"
import { useStatusStore } from "@/lib/status-store"
import { toast } from "sonner"

export default function SetStatusDialog() {
  const [open, setOpen] = useState(false)
  const { status, message, duration, setStatus, setMessage, setDuration, clearStatus, startAutoClear } =
    useStatusStore()

  const handleSetStatus = () => {
    startAutoClear()
    setOpen(false) // Close dialog

    if (duration !== "none") {
      toast("Auto-clear aktif", {
        description:
          duration === "30m"
            ? "Status akan dihapus dalam 30 menit"
            : duration === "1h"
            ? "Status akan dihapus dalam 1 jam"
            : "Status akan dihapus pada akhir hari",
      })
    }
  }

  const statusOptions = [
    { id: "online", label: "Online", icon: <Circle className="w-4 h-4 text-green-500" /> },
    { id: "away", label: "Away", icon: <Moon className="w-4 h-4 text-yellow-500" /> },
    { id: "dnd", label: "Do not disturb", icon: <MinusCircle className="w-4 h-4 text-red-500" />, desc: "Mute all notifications" },
    { id: "invisible", label: "Invisible", icon: <EyeOff className="w-4 h-4 text-gray-400" />, desc: "Appear offline" },
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center gap-2 text-gray-200 hover:bg-gray-700/40 p-2 rounded cursor-pointer w-full">
          {statusOptions.find((s) => s.id === status)?.icon}
          Set status
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-md bg-[#1f2023] text-gray-200 border border-gray-700 rounded-xl shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-center mb-4">
            Online status
          </DialogTitle>
        </DialogHeader>

        {/* Status Pilihan */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {statusOptions.map((item) => (
            <div
              key={item.id}
              onClick={() => setStatus(item.id as any)}
              className={`p-3 rounded-md border cursor-pointer transition ${
                status === item.id
                  ? "border-blue-500 bg-gray-800/60"
                  : "border-gray-700 hover:bg-gray-800/40"
              }`}
            >
              <div className="flex items-center gap-2 font-medium">
                {item.icon}
                {item.label}
              </div>
              {item.desc && (
                <p className="text-xs text-gray-400 ml-6 mt-1">{item.desc}</p>
              )}
            </div>
          ))}
        </div>

        {/* Status Message */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Status message</h3>
          <Input
            placeholder="What is your status?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="bg-[#2a2b2f] border-none text-gray-200 placeholder-gray-500"
          />

          {/* Quick Presets */}
          <div className="space-y-1 mt-3 text-sm">
            {[
              { label: "🗓 In a meeting", time: "an hour" },
              { label: "🚗 Commuting", time: "30 minutes" },
              { label: "🏡 Working remotely", time: "Today" },
              { label: "🤒 Out sick", time: "Today" },
              { label: "🏖 Vacationing", time: "Don't clear" },
            ].map((item, i) => (
              <div
                key={i}
                onClick={() => setMessage(item.label)}
                className="flex justify-between items-center hover:bg-gray-800/40 px-2 py-1 rounded-md cursor-pointer"
              >
                <span>{item.label}</span>
                <span className="text-xs text-gray-400">{item.time}</span>
              </div>
            ))}
          </div>

          {/* Clear After */}
          <div className="mt-4">
            <label className="text-sm font-semibold">Clear status after</label>
            <Select onValueChange={setDuration} defaultValue={duration}>
              <SelectTrigger className="bg-[#2a2b2f] border-none text-gray-200 mt-1">
                <SelectValue placeholder="Don't clear" />
              </SelectTrigger>
              <SelectContent className="bg-[#1f2023] text-gray-200 border border-gray-700">
                <SelectItem value="none">Don't clear</SelectItem>
                <SelectItem value="30m">30 minutes</SelectItem>
                <SelectItem value="1h">1 hour</SelectItem>
                <SelectItem value="today">Today</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between mt-5">
            <Button
              variant="ghost"
              className="bg-transparent text-gray-300 hover:bg-gray-700/40"
              onClick={clearStatus}
            >
              Clear status message
            </Button>

            <Button
              className="bg-gray-600 hover:bg-gray-500 text-white"
              onClick={handleSetStatus}
            >
              Set status message
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
