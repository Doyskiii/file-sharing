import { create } from "zustand"

type StatusType = "online" | "away" | "dnd" | "invisible"

interface StatusState {
  status: StatusType
  message: string
  duration: string
  timeoutId?: NodeJS.Timeout
  setStatus: (status: StatusType) => void
  setMessage: (message: string) => void
  setDuration: (duration: string) => void
  clearStatus: () => void
  startAutoClear: () => void
}

export const useStatusStore = create<StatusState>((set, get) => ({
  status: "online",
  message: "",
  duration: "none",
  timeoutId: undefined,

  setStatus: (status) => set({ status }),
  setMessage: (message) => set({ message }),
  setDuration: (duration) => set({ duration }),

  clearStatus: () => {
    const { timeoutId } = get()
    if (timeoutId) clearTimeout(timeoutId)
    set({
      status: "online",
      message: "",
      duration: "none",
      timeoutId: undefined,
    })
  },

  startAutoClear: () => {
    const { duration, clearStatus } = get()

    // Hapus timer sebelumnya jika ada
    const prevTimeout = get().timeoutId
    if (prevTimeout) clearTimeout(prevTimeout)

    let time = 0

    switch (duration) {
      case "30m":
        time = 30 * 60 * 1000
        break
      case "1h":
        time = 60 * 60 * 1000
        break
      case "today":
        const now = new Date()
        const endOfDay = new Date()
        endOfDay.setHours(23, 59, 59, 999)
        time = endOfDay.getTime() - now.getTime()
        break
      default:
        return // Don't clear
    }

    const id = setTimeout(() => {
      clearStatus()
    }, time)

    set({ timeoutId: id })
  },
}))
