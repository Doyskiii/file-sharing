"use client"

import { Search, Bell, Folder, Image, Zap, Users, List } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import ProfileDropdown from "./profile-dropdown"
import Link from "next/link"

export default function TopNavbar() {
  return (
    <TooltipProvider>
      <header className="w-full bg-[#1f2023] text-gray-200 flex items-center justify-between px-4 py-2 border-b border-gray-700">
        {/* Left */}
        <div className="flex items-center gap-3">
          <img src="/republikorp-logo.png" alt="Republikorp Logo" className="w-8 h-8 object-contain" />

          {/* Icon Group - Moved to Sidebar */}
          {/* Now in sidebar below overview */}
        </div>

        {/* Search */}
        <div className="flex-1 mx-6 max-w-md">
          <Input
            placeholder="Filter file names..."
            className="bg-[#2a2b2f] text-sm text-gray-200 border-none placeholder-gray-500"
          />
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          <Button
            size="sm"
            className="bg-[#2a2b2f] hover:bg-[#3a3b40] text-white px-3 py-1 rounded-md"
          >
            + New
          </Button>

          <div className="hidden sm:flex items-center gap-3 text-gray-400">
            {[
              { icon: Search, label: "Search" },
              { icon: Bell, label: "Notifications" },
              { icon: List, label: "View mode" },
            ].map(({ icon: Icon, label }, i) => (
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <Icon
                    size={18}
                    className="cursor-pointer hover:text-white transition"
                  />
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs bg-gray-800 text-white">
                  {label}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          {/* Profile */}
          <ProfileDropdown />
        </div>
      </header>
    </TooltipProvider>
  )
}
