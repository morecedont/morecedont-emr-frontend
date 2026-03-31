export type UserRole = "doctor" | "admin"

export type Profile = {
  id: string
  full_name: string
  email: string
  phone: string | null
  role: UserRole
  created_at: string
}
