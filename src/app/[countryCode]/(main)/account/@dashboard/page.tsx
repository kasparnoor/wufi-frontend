import { Metadata } from "next"

import { Dashboard } from "@lib/components"
import { notFound } from "next/navigation"
import { retrieveCustomer } from "@lib/data/customer"
import { listOrders } from "@lib/data/orders"

export const metadata: Metadata = {
  title: "Konto ülevaade",
  description: "Ülevaade teie konto tegevusest ja lemmikloomadest.",
}

export default async function DashboardPage() {
  const customer = await retrieveCustomer().catch(() => null)
  const orders = (await listOrders().catch(() => null)) || null

  if (!customer) {
    notFound()
  }

  return <Dashboard customer={customer} />
}
