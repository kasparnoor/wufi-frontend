import { Metadata } from "next"

import { Dashboard } from "@lib/components"
import { retrieveCustomer } from "@lib/data/customer"

export const metadata: Metadata = {
  title: "Konto ülevaade",
  description: "Ülevaade teie konto tegevusest ja lemmikloomadest.",
}

export default async function DashboardPage() {
  const customer = await retrieveCustomer().catch(() => null)

  // In parallel routes, avoid throwing notFound() or it will 404 the whole parent route.
  // The parent layout decides whether to show @dashboard or @login based on auth.
  if (!customer) return null

  return <Dashboard customer={customer} />
}
