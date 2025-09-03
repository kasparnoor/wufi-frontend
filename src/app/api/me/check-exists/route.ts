import { NextRequest, NextResponse } from "next/server"

const BASE = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const res = await fetch(`${BASE}/store/customers/check-exists`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "" },
    body: JSON.stringify(body),
    cache: "no-store",
  })
  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const res = await fetch(`${BASE}/store/customers/check-exists${url.search}`, {
    headers: { "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "" },
    cache: "no-store",
  })
  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}


