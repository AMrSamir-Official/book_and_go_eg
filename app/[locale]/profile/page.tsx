import type { Metadata } from "next"
import ProfilePageClient from "./profile-page-client"

export const metadata: Metadata = {
  title: "Profile & Settings - Book & Go Travel",
  description: "Manage your profile and account settings",
}

// SSG - Static page with client-side data
export default function ProfilePage() {
  return <ProfilePageClient />
}
