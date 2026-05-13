import { NextRequest } from "next/server"
import type { HelloEntry } from "@/app/api/hello/route"

function checkAuth(req: NextRequest) {
  const password = req.headers.get("x-admin-password")
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword || password !== adminPassword) return false
  return true
}

function getRedis() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null
  const { Redis } = require("@upstash/redis")
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const redis = getRedis()
    if (!redis) return Response.json({ error: "Redis not configured", messages: [] })

    const ids: string[] = await redis.smembers("hellos:pending")
    if (!ids || ids.length === 0) return Response.json({ messages: [] })

    const entries = await Promise.all(
      ids.map((id: string) => redis.hgetall(`hello:${id}`))
    )

    const messages = entries
      .filter(Boolean)
      .sort((a: HelloEntry, b: HelloEntry) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return Response.json({ messages })
  } catch (e) {
    return Response.json({ error: String(e), messages: [] })
  }
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id, action } = await req.json()
  if (!id || !["approve", "reject"].includes(action)) {
    return Response.json({ error: "Invalid request" }, { status: 400 })
  }

  try {
    const redis = getRedis()
    if (!redis) return Response.json({ error: "Redis not configured" }, { status: 500 })

    await redis.srem("hellos:pending", id)

    if (action === "approve") {
      await redis.hset(`hello:${id}`, { status: "approved" })
      await redis.sadd("hellos:approved", id)
    } else {
      await redis.del(`hello:${id}`)
    }

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: "Failed" }, { status: 500 })
  }
}
