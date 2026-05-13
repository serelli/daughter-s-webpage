import { NextRequest } from "next/server"
import type { HelloEntry } from "@/app/api/hello/route"

function checkAuth(req: NextRequest) {
  const password = req.headers.get("x-admin-password")
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword || password !== adminPassword) return false
  return true
}

async function getKv() {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) return null
  const { kv } = await import("@vercel/kv")
  return kv
}

// GET — fetch all pending messages
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const kv = await getKv()
    if (!kv) return Response.json({ error: "KV not configured", messages: [] })

    const ids: string[] = await kv.smembers("hellos:pending")
    if (!ids || ids.length === 0) return Response.json({ messages: [] })

    const entries = await Promise.all(
      ids.map((id) => kv.hgetall<HelloEntry>(`hello:${id}`))
    )

    const messages = entries
      .filter(Boolean)
      .sort((a, b) => new Date(b!.date).getTime() - new Date(a!.date).getTime())

    return Response.json({ messages })
  } catch (e) {
    return Response.json({ error: String(e), messages: [] })
  }
}

// POST — approve or reject a message
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id, action } = await req.json()
  if (!id || !["approve", "reject"].includes(action)) {
    return Response.json({ error: "Invalid request" }, { status: 400 })
  }

  try {
    const kv = await getKv()
    if (!kv) return Response.json({ error: "KV not configured" }, { status: 500 })

    await kv.srem("hellos:pending", id)

    if (action === "approve") {
      await kv.hset(`hello:${id}`, { status: "approved" })
      await kv.sadd("hellos:approved", id)
    } else {
      await kv.del(`hello:${id}`)
    }

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: "Failed" }, { status: 500 })
  }
}
