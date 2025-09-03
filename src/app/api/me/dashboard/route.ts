import { NextResponse } from "next/server"
import { retrieveCustomerDashboard } from "@lib/data/customer"

export async function GET() {
  try {
    const dashboard = await retrieveCustomerDashboard()
    if (!dashboard) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ dashboard })
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || "Failed" }, { status: 500 })
  }
}


