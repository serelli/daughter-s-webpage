import { NextRequest, NextResponse } from "next/server"

type Difficulty = "easy" | "medium" | "hard"

interface ScoreEntry {
  id: string
  name: string
  moves: number
  seconds: number
  date: string
}

function getRedis() {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) return null
  const { Redis } = require("@upstash/redis")
  return new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  })
}

function leaderboardKey(difficulty: Difficulty) {
  return `puzzle:leaderboard:${difficulty}`
}

function toEntry(m: unknown): ScoreEntry | null {
  try {
    // @upstash/redis auto-deserializes JSON, so m may already be an object
    const obj = typeof m === "string" ? JSON.parse(m) : m
    if (obj && typeof obj === "object") return obj as ScoreEntry
    return null
  } catch {
    return null
  }
}

// GET /api/puzzle/scores?difficulty=easy
export async function GET(req: NextRequest) {
  const difficulty = req.nextUrl.searchParams.get("difficulty") as Difficulty | null
  if (!difficulty || !["easy", "medium", "hard"].includes(difficulty)) {
    return NextResponse.json({ error: "Invalid difficulty" }, { status: 400 })
  }

  const redis = getRedis()
  if (!redis) {
    return NextResponse.json({ scores: [], error: "Leaderboard not configured" })
  }

  try {
    const members: unknown[] = await redis.zrange(leaderboardKey(difficulty), 0, 9)
    const scores: ScoreEntry[] = (members ?? []).map(toEntry).filter(Boolean) as ScoreEntry[]
    return NextResponse.json({ scores })
  } catch (err) {
    console.error("zrange error:", err)
    return NextResponse.json({ scores: [], error: "Failed to fetch scores" })
  }
}

// POST /api/puzzle/scores
// Body: { name, moves, seconds, difficulty }
export async function POST(req: NextRequest) {
  let body: { name?: string; moves?: number; seconds?: number; difficulty?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { name, moves, seconds, difficulty } = body
  if (
    !name || typeof name !== "string" ||
    typeof moves !== "number" ||
    typeof seconds !== "number" ||
    !difficulty || !["easy", "medium", "hard"].includes(difficulty)
  ) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const cleanName = name.trim().slice(0, 30)
  if (!cleanName) return NextResponse.json({ error: "Name required" }, { status: 400 })

  const redis = getRedis()
  if (!redis) {
    return NextResponse.json({ error: "Leaderboard not configured" }, { status: 503 })
  }

  const entry: ScoreEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: cleanName,
    moves,
    seconds,
    date: new Date().toISOString(),
  }

  // Lower score = better rank: fewest moves first, then fewest seconds as tiebreaker
  const redisScore = moves * 100000 + seconds

  try {
    // Store entry as plain object — @upstash/redis will serialize it
    await redis.zadd(leaderboardKey(difficulty as Difficulty), {
      score: redisScore,
      member: entry,
    })
    // Keep only top 50 entries per difficulty
    await redis.zremrangebyrank(leaderboardKey(difficulty as Difficulty), 50, -1)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("zadd error:", err)
    return NextResponse.json({ error: "Failed to save score" }, { status: 500 })
  }
}
