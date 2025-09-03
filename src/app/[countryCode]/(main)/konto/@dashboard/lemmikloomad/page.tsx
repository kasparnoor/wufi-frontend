import { Metadata } from "next"
import { retrieveCustomer } from "@lib/data/customer"
import { PetManagement } from "@lib/components"

export const metadata: Metadata = {
  title: "Lemmikloomad",
  description: "Hallake oma lemmikloomade andmeid.",
}

export default async function LemmikloomadPage() {
  const customer = await retrieveCustomer().catch(() => null)
  if (!customer) return null
  return <PetManagement customer={customer} />
}


