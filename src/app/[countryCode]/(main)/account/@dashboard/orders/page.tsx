import { Metadata } from "next"
import { notFound } from "next/navigation"
import { listOrders } from "@lib/data/orders"
import { OrdersManagement } from "@lib/components"

export const metadata: Metadata = {
  title: "Tellimused",
  description: "Vaadake oma tellimuste ajalugu ja staatust.",
}

export default async function Orders() {
  const orders = await listOrders()

  if (!orders) {
    notFound()
  }

  return <OrdersManagement orders={orders} />
}
