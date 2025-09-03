import { Metadata } from "next"
import { retrieveCustomer } from "@lib/data/customer"
import { SubscriptionManagement } from "@lib/components"

export const metadata: Metadata = {
  title: "Püsitellimused",
  description: "Hallake oma püsitellimusi ja tarneaegu.",
}

export default async function PusitellimusedPage() {
  const customer = await retrieveCustomer().catch(() => null)
  if (!customer) return null
  return <SubscriptionManagement customer={customer} />
}


