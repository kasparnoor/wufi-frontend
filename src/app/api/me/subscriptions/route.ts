import { NextResponse } from "next/server"
import { getAuthHeaders } from "@lib/data/cookies"

const BASE = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"

export async function GET() {
  const headers = { ...(await getAuthHeaders()), "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "" } as Record<string,string>
  const res = await fetch(`${BASE}/store/subscriptions`, { headers, cache: "no-store" })
  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}


