import axios, { InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3333',
    withCredentials: false,
})

api.interceptors.request.use(async (config: InternalAxiosRequestConfig<any> & { isPublic?: boolean }) => {
    // Skip adding token for public routes
    if (config.isPublic) return config

    // Get token from localStorage
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
}, error => {
    return Promise.reject(error)
})

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            toast.error('Session expired. Please login again.')
            window.location.href = '/'
        } else if (error.response?.status >= 500) {
            toast.error('Server error. Please try again later.')
        } else if (error.response?.data?.message) {
            toast.error(error.response.data.message)
        }

        return Promise.reject(error)
    }
)

export default api;