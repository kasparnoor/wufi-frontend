import { Metadata } from "next"

import { BillingManagement } from "@lib/components"

import { notFound } from "next/navigation"
import { retrieveCustomer } from "@lib/data/customer"

export const metadata: Metadata = {
  title: "Arveldus",
  description: "Hallige makseviise, vaadake arveid ja kontrollite arveldusandmeid.",
}

export default async function Billing() {
  const customer = await retrieveCustomer().catch(() => null)

  // Avoid notFound in parallel slots
  if (!customer) return null

  return <BillingManagement customer={customer} />
} 