import { NextRequest } from "next/server"

interface HelloEntry {
  name: string
  message: string
  date: string
}

async function getKv() {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) return null
  const { kv } = await import("@vercel/kv")
  return kv
}

export async function GET() {
  try {
    const kv = await getKv()
    if (!kv) return Response.json([])
    const raw = await kv.lrange<string>("hellos", 0, 49)
    const messages: HelloEntry[] = raw.map((m) =>
      typeof m === "string" ? JSON.parse(m) : m
    )
    return Response.json(messages)
  } catch {
    return Response.json([])
  }
}

export async function POST(req: NextRequest) {
  const { name, message } = await req.json()

  if (!name?.trim() || !message?.trim()) {
    return Response.json({ error: "Name and message are required" }, { status: 400 })
  }

  const entry: HelloEntry = {
    name: name.trim().slice(0, 50),
    message: message.trim().slice(0, 300),
    date: new Date().toISOString(),
  }

  try {
    const kv = await getKv()
    if (kv) {
      await kv.lpush("hellos", JSON.stringify(entry))
    }
  } catch {
    // KV not configured — still return success so the form works
  }

  return Response.json({ success: true })
}
