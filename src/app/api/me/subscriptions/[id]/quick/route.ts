import { NextRequest, NextResponse } from "next/server"
import { getAuthHeaders } from "@lib/data/cookies"

const BASE = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"

// Proxies quick actions to /store/subscriptions/:id (skip, pause, resume, cancel, interval changes)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}))
  const headers = { "content-type": "application/json", ...(await getAuthHeaders()), "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "" } as Record<string,string>
  const res = await fetch(`${BASE}/store/subscriptions/${params.id}`, { method: "PATCH", headers, body: JSON.stringify(body), cache: "no-store" })
  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}


