"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut, Settings, SunMoon, Circle } from "lucide-react"
import SetStatusDialog from "./set-status-dialog"
import { useRouter } from "next/navigation"
import { useStatusStore } from "@/lib/status-store"
import { useSession } from "@/hooks/use-session"

export default function ProfileDropdown() {
  const router = useRouter()
  const { status } = useStatusStore()
  const { user } = useSession()

  const statusColor =
    status === "online"
      ? "bg-green-500"
      : status === "away"
      ? "bg-yellow-500"
      : status === "dnd"
      ? "bg-red-500"
      : "bg-gray-400"

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      })

      if (res.ok) {
        router.push("/")
      }
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button suppressHydrationWarning={true} className="relative w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer hover:ring-2 hover:ring-gray-400 transition border-none bg-transparent">
          {user?.username?.charAt(0).toUpperCase() || 'U'}
          <span className={`absolute bottom-0 right-0 w-2 h-2 border border-[#1f2023] rounded-full ${statusColor}`} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="w-56 bg-[#1f2023] text-gray-200 border border-gray-700 shadow-lg rounded-md"
      >
        <DropdownMenuLabel className="flex flex-col">
          <span className="font-semibold text-sm">{user?.username || 'User'}</span>
          <span className="text-xs text-gray-400">{user?.roles?.map(r => r.name).join(', ') || 'User'}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-700" />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <SetStatusDialog />
          </DropdownMenuItem>

          <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-gray-700/40">
            <SunMoon className="w-4 h-4" />
            <span>Appearance and accessibility</span>
          </DropdownMenuItem>

          <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-gray-700/40">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-gray-700" />

        <DropdownMenuItem
          className="flex items-center gap-2 text-red-400 cursor-pointer hover:bg-gray-700/40"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
