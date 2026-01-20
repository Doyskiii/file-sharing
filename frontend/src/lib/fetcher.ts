// import { SessionType } from "@/types/session.type"
import axios from "axios"
import { getHeaderAuth } from "./utils"
import api from "./api"

export const fetcher = async ({ url, session }: { url: string, session:  any | null }) => { //SessionType.UserData
    const { data } = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}${url}`, {
        headers: getHeaderAuth(session),
    })

    return data
}

export const fetcherWithAutoRefresh = async ({ url, session }: { url: string, session: any | null }) => { //SessionType.UserData

    const { data } = await api.get(`${url}`, {
        headers: getHeaderAuth(session),
    })

    return data
}