import type { Metadata } from "next"
import AdminUsersClientPage from "./admin-users-client-page"

export const metadata: Metadata = {
  title: "User Management - Book & Go Travel",
  description: "Manage users and view login activity",
}

// SSR - Admin page with user data
export default function AdminUsersPage() {
  return <AdminUsersClientPage />
}
