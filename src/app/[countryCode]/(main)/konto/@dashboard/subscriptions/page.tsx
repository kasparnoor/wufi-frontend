import { Metadata } from "next"
import { notFound } from "next/navigation"

import { retrieveCustomer } from "@lib/data/customer"
import { SubscriptionManagement } from "@lib/components"

export const metadata: Metadata = {
  title: "Püsitellimused",
  description: "Hallake oma püsitellimusi ja tarneaegu.",
}

export default async function SubscriptionsPage() {
  const customer = await retrieveCustomer().catch(() => null)

  // Avoid notFound in parallel slots
  if (!customer) return null

  return <SubscriptionManagement customer={customer} />
}