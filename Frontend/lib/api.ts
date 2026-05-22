import axios from "axios"

// Ensure baseURL always ends with /api regardless of how the env var is set
const rawBase = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"
const apiBase = rawBase.endsWith('/api') ? rawBase : `${rawBase}/api`

const api = axios.create({
  baseURL: apiBase,
  headers: { "Content-Type": "application/json" },
  timeout: 8000,
})

// Attach token from localStorage on every request (browser only)
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
        // Keep cookie in sync for Next.js server-side API routes
        if (!document.cookie.split(';').some(c => c.trim().startsWith('token='))) {
          document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`
        }
      }
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Handle 401 globally — clear token and redirect to home
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token")
      localStorage.removeItem("userId")
      localStorage.removeItem("userRole")
      window.location.href = "/"
    }
    return Promise.reject(error)
  },
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (userData: any) => api.post("/auth/register", userData),
  login: (credentials: { email: string; password: string }) => api.post("/auth/login", credentials),
  logout: () => api.get("/auth/logout"),
  getProfile: () => api.get("/auth/me"),
  updateProfile: (data: any) => api.put("/auth/updatedetails", data),
  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put("/auth/updatepassword", data),
}

// ── Mentors ───────────────────────────────────────────────────────────────────
export const mentorAPI = {
  getAllMentors: (params?: any) => api.get("/mentors", { params }),
  getMentor: (id: string) => api.get(`/mentors/${id}`),
  getMentorProfile: () => api.get("/mentors/profile"),
  updateMentorProfile: (data: any) => api.put("/mentors/profile", data),
  submitReview: (mentorId: string, data: { rating: number; comment: string }) =>
    api.post(`/mentors/${mentorId}/reviews`, data),
}

// ── Mentees ───────────────────────────────────────────────────────────────────
export const menteeAPI = {
  getMenteeProfile: () => api.get("/mentees/profile"),
  updateMenteeProfile: (data: any) => api.put("/mentees/profile", data),
  getConnectedMentors: () => api.get("/mentees/mentors"),
  connectWithMentor: (mentorId: string) => api.post(`/mentees/connect/${mentorId}`),
  disconnectFromMentor: (mentorId: string) => api.delete(`/mentees/disconnect/${mentorId}`),
}

// ── Sessions ──────────────────────────────────────────────────────────────────
export const sessionAPI = {
  getSessions: () => api.get("/sessions"),
  getSession: (id: string) => api.get(`/sessions/${id}`),
  createSession: (data: any) => api.post("/sessions", data),
  updateSession: (id: string, data: any) => api.put(`/sessions/${id}`, data),
  deleteSession: (id: string) => api.delete(`/sessions/${id}`),
  updateSessionStatus: (id: string, status: string) => api.put(`/sessions/${id}/status`, { status }),
}

// ── Reviews ───────────────────────────────────────────────────────────────────
export const reviewAPI = {
  addReview: (mentorId: string, data: { rating: number; comment: string }) =>
    api.post(`/mentors/${mentorId}/reviews`, data),
  updateReview: (id: string, data: any) => api.put(`/reviews/${id}`, data),
  deleteReview: (id: string) => api.delete(`/reviews/${id}`),
}

// ── Messages ──────────────────────────────────────────────────────────────────
export const messageAPI = {
  getConversations: () => api.get("/messages/conversations"),
  getMessages: (userId: string) => api.get(`/messages/${userId}`),
  sendMessage: (data: any) => api.post("/messages", data),
  deleteMessage: (id: string) => api.delete(`/messages/${id}`),
  getUnreadCount: () => api.get("/messages/unread"),
}

export default api
