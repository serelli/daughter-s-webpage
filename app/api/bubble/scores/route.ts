import { NextRequest, NextResponse } from "next/server"

interface ScoreEntry {
  id: string
  name: string
  score: number
  date: string
}

function getRedis() {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) return null
  const { Redis } = require("@upstash/redis")
  return new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN })
}

const KEY = "bubble:leaderboard"

function toEntry(m: unknown): ScoreEntry | null {
  try {
    const obj = typeof m === "string" ? JSON.parse(m) : m
    if (obj && typeof obj === "object") return obj as ScoreEntry
    return null
  } catch { return null }
}

// GET /api/bubble/scores  →  top 10, highest score first
export async function GET() {
  const redis = getRedis()
  if (!redis) return NextResponse.json({ scores: [], error: "Leaderboard not configured" })
  try {
    // Scores stored as negative so ZRANGE (ascending) gives highest first
    const members: unknown[] = await redis.zrange(KEY, 0, 9)
    const scores = (members ?? []).map(toEntry).filter(Boolean) as ScoreEntry[]
    return NextResponse.json({ scores })
  } catch (err) {
    console.error("bubble zrange error:", err)
    return NextResponse.json({ scores: [], error: "Failed to fetch scores" })
  }
}

// POST /api/bubble/scores  body: { name, score }
export async function POST(req: NextRequest) {
  let body: { name?: string; score?: number }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  const { name, score } = body
  if (!name || typeof name !== "string" || typeof score !== "number" || score < 0) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }
  const cleanName = name.trim().slice(0, 30)
  if (!cleanName) return NextResponse.json({ error: "Name required" }, { status: 400 })

  const redis = getRedis()
  if (!redis) return NextResponse.json({ error: "Leaderboard not configured" }, { status: 503 })

  const entry: ScoreEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: cleanName,
    score,
    date: new Date().toISOString(),
  }

  try {
    // Negative score → highest score ranks first in ascending sorted set
    await redis.zadd(KEY, { score: -score, member: entry })
    await redis.zremrangebyrank(KEY, 50, -1)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("bubble zadd error:", err)
    return NextResponse.json({ error: "Failed to save score" }, { status: 500 })
  }
}
