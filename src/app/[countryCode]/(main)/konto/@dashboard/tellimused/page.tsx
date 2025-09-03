import { Metadata } from "next"
import { retrieveCustomer } from "@lib/data/customer"
import { listOrders } from "@lib/data/orders"
import { OrdersManagement } from "@lib/components"

export const metadata: Metadata = {
  title: "Tellimused",
  description: "Vaadake ja hallake oma tellimusi.",
}

export default async function TellimusedPage() {
  const customer = await retrieveCustomer().catch(() => null)
  if (!customer) return null
  const orders = (await listOrders().catch(() => [])) || []
  return <OrdersManagement orders={orders} />
}


