import { NextRequest } from "next/server"

export interface HelloEntry {
  id: string
  name: string
  message: string
  date: string
  status: "pending" | "approved"
}

function getRedis() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null
  const { Redis } = require("@upstash/redis")
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}

export async function GET() {
  try {
    const redis = getRedis()
    if (!redis) return Response.json([])

    const ids: string[] = await redis.smembers("hellos:approved")
    if (!ids || ids.length === 0) return Response.json([])

    const entries = await Promise.all(
      ids.map((id: string) => redis.hgetall(`hello:${id}`))
    )

    const messages = entries
      .filter(Boolean)
      .sort((a: HelloEntry, b: HelloEntry) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 50)

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
    id: crypto.randomUUID(),
    name: name.trim().slice(0, 50),
    message: message.trim().slice(0, 300),
    date: new Date().toISOString(),
    status: "pending",
  }

  try {
    const redis = getRedis()
    if (redis) {
      await redis.hset(`hello:${entry.id}`, entry)
      await redis.sadd("hellos:pending", entry.id)
    }
  } catch {
    // Redis not configured — still return success
  }

  return Response.json({ success: true })
}
