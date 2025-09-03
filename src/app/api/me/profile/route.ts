import { NextRequest, NextResponse } from "next/server"
import { getAuthHeaders } from "@lib/data/cookies"

const BASE = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"

export async function GET() {
  const headers = { ...(await getAuthHeaders()), "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "" } as Record<string,string>
  const res = await fetch(`${BASE}/store/customers/me`, { headers, cache: "no-store" })
  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const headers = { "content-type": "application/json", ...(await getAuthHeaders()), "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "" } as Record<string,string>
  const res = await fetch(`${BASE}/store/customers/me`, { method: "PATCH", headers, body: JSON.stringify(body), cache: "no-store" })
  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}


