import { NextResponse } from "next/server"
import { headers as nextHeaders } from "next/headers"

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:9000"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const cartId = url.searchParams.get("cart_id")
    const fields = url.searchParams.get("fields") || undefined

    if (!cartId) {
      return NextResponse.json({ message: "cart_id is required" }, { status: 400 })
    }

    const qs = new URLSearchParams()
    qs.set("cart_id", cartId)
    if (fields) qs.set("fields", fields)

    const hdrs = new Headers()
    hdrs.set("Content-Type", "application/json")
    if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
      hdrs.set("x-publishable-api-key", process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY)
    }
    // Forward auth header if present (for customer-specific shipping logic)
    const incoming = nextHeaders()
    const auth = incoming.get("authorization")
    if (auth) hdrs.set("authorization", auth)

    const backendUrl = `${MEDUSA_BACKEND_URL}/store/shipping-options?${qs.toString()}`
    const resp = await fetch(backendUrl, { method: "GET", headers: hdrs, cache: "no-store" })

    if (!resp.ok) {
      const text = await resp.text()
      return NextResponse.json({ message: "Upstream error", status: resp.status, body: text }, { status: 500 })
    }

    const data = await resp.json()
    return NextResponse.json(data, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || "Unknown error" }, { status: 500 })
  }
}


