import { Metadata } from "next"
import { notFound } from "next/navigation"
import { retrieveCustomer } from "@lib/data/customer"
import { PetManagement } from "@lib/components"

export const metadata: Metadata = {
  title: "Minu lemmikloomad",
  description: "Hallake oma lemmikloomade andmeid.",
}

export default async function PetsPage() {
  const customer = await retrieveCustomer().catch(() => null)
  // Avoid notFound in parallel slots
  if (!customer) return null
  return <PetManagement customer={customer} />
}