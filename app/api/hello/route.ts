import { NextRequest } from "next/server"

export interface HelloEntry {
  id: string
  name: string
  message: string
  date: string
  status: "pending" | "approved"
}

async function getKv() {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) return null
  const { kv } = await import("@vercel/kv")
  return kv
}

// GET — returns only approved messages for the public wall
export async function GET() {
  try {
    const kv = await getKv()
    if (!kv) return Response.json([])

    const ids = await kv.smembers<string[]>("hellos:approved")
    if (!ids || ids.length === 0) return Response.json([])

    const entries = await Promise.all(
      ids.map((id) => kv.hgetall<HelloEntry>(`hello:${id}`))
    )

    const messages = entries
      .filter(Boolean)
      .sort((a, b) => new Date(b!.date).getTime() - new Date(a!.date).getTime())
      .slice(0, 50)

    return Response.json(messages)
  } catch {
    return Response.json([])
  }
}

// POST — submit a new hello (goes to pending queue)
export async function POST(req: NextRequest) {
  const { name, message } = await req.json()

  if (!name?.trim() || !message?.trim()) {
    return Response.json({ error: "Name and message are required" }, { status: 400 })
  }

  const entry: HelloEntry = {
    id: crypto.randomUUID(),
    name: name.trim().slice(0, 50),
    message: message.trim().slice(0, 300),
    date: new Date().toISOString(),
    status: "pending",
  }

  try {
    const kv = await getKv()
    if (kv) {
      await kv.hset(`hello:${entry.id}`, entry)
      await kv.sadd("hellos:pending", entry.id)
    }
  } catch {
    // KV not configured — still return success
  }

  return Response.json({ success: true })
}
