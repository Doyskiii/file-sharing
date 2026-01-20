// import { SessionType } from "@/types/session.type"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isStringNotEmpty(str: string) {
  return str && str.trim() !== ''
}

export function getHeaderAuth(session: any | null) { //SessionType.UserData
  return {
    'Authorization': `Bearer ${session?.access_token}`
  }
}

export const urlToFile = async (url: string, filename: string) => {
  try {
    const response = await fetch(`${url}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch the file from the URL: ${response.statusText}`)
    }

    const blob = await response.blob()
    return new File([blob], filename, { type: 'image/jpeg' })

  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error(String(error))
  }
}

export function returnStringifyOrEmptyString(value: unknown): string {

  if (value === null || value === undefined) return ""

  return String(value).trim()

}
