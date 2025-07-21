import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "user"
  avatar?: string
  permissions: string[]
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (user: User) => void
  logout: () => void
  updateUser: (user: User) => void
  setLoading: (loading: boolean) => void
  hasPermission: (permission: string) => boolean
  canAccessRoute: (route: string) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: (user) => {
        set({ user, isAuthenticated: true })
        // Set cookie for SSR
        document.cookie = `auth-token=authenticated; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
      },
      logout: () => {
        set({ user: null, isAuthenticated: false })
        // Clear cookie
        document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      },
      updateUser: (user) => set({ user }),
      setLoading: (loading) => set({ isLoading: loading }),
      hasPermission: (permission) => {
        const { user } = get()
        return user?.permissions?.includes(permission) || user?.role === "admin" || false
      },
      canAccessRoute: (route) => {
        const { user, isAuthenticated } = get()

        if (!isAuthenticated) return false

        // Admin routes
        if (route.startsWith("/admin")) {
          return user?.role === "admin"
        }

        // Protected routes that require authentication
        const protectedRoutes = ["/dashboard", "/bookings", "/invoices", "/profile", "/notifications", "/dues"]
        if (protectedRoutes.some((r) => route.startsWith(r))) {
          return isAuthenticated
        }

        return true
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)

// Mock authentication function
export const authenticateUser = async (email: string, password: string): Promise<User | null> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  if (email === "admin@bookandgo.com" && password === "admin123") {
    return {
      id: "1",
      name: "Admin User",
      email: "admin@bookandgo.com",
      role: "admin",
      permissions: ["all"],
      avatar: "/placeholder.svg?height=100&width=100&text=AU",
    }
  }

  if (email === "user@bookandgo.com" && password === "user123") {
    return {
      id: "2",
      name: "Regular User",
      email: "user@bookandgo.com",
      role: "user",
      permissions: ["bookings", "invoices"],
      avatar: "/placeholder.svg?height=100&width=100&text=RU",
    }
  }

  return null
}
