import { Metadata } from "next"
import { notFound } from "next/navigation"
import { retrieveCustomer } from "@lib/data/customer"
import { listRegions } from "@lib/data/regions"
import { ProfileManagement } from "@lib/components"

export const metadata: Metadata = {
  title: "Profiil",
  description: "Hallige oma kasutajaprofiili ja kontaktandmeid.",
}

export default async function ProfiilPage() {
  const customer = await retrieveCustomer().catch(() => null)
  const regions = await listRegions().catch(() => null)

  // Parallel routes: don't notFound to avoid 404ing parent
  if (!customer || !regions) return null

  return <ProfileManagement customer={customer} regions={regions} />
}


