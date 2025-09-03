import { Metadata } from "next"
import { notFound } from "next/navigation"
import { retrieveCustomer } from "@lib/data/customer"
import { listRegions } from "@lib/data/regions"
import { ProfileManagement } from "@lib/components"

export const metadata: Metadata = {
  title: "Profiil",
  description: "Hallige oma kasutajaprofiili ja kontaktandmeid.",
}

export default async function ProfilePage() {
  const customer = await retrieveCustomer().catch(() => null)
  const regions = await listRegions().catch(() => null)

  // In parallel routes, avoid throwing notFound() or it will 404 the whole parent route.
  // The parent layout decides whether to show @dashboard or @login based on auth.
  if (!customer || !regions) return null

  return <ProfileManagement customer={customer} regions={regions} />
}
