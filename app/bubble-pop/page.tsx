"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Trophy, Send, Medal, Heart } from "lucide-react"

// ── Constants ────────────────────────────────────────────────────────────────

const GAME_DURATION = 45          // seconds
const MAX_BUBBLES   = 12          // max on screen at once

const BUBBLE_POOL = [
  { emoji: "🌸", pts: 10, weight: 30 },
  { emoji: "🌺", pts: 10, weight: 30 },
  { emoji: "🌼", pts: 10, weight: 25 },
  { emoji: "🌷", pts: 10, weight: 25 },
  { emoji: "🦋", pts: 20, weight: 15 },
  { emoji: "🍭", pts: 20, weight: 15 },
  { emoji: "🎀", pts: 20, weight: 12 },
  { emoji: "⭐", pts: 30, weight:  8 },
  { emoji: "💎", pts: 50, weight:  3 },
  { emoji: "🌈", pts: 40, weight:  5 },
]

function weightedRandom() {
  const total = BUBBLE_POOL.reduce((s, b) => s + b.weight, 0)
  let r = Math.random() * total
  for (const b of BUBBLE_POOL) { r -= b.weight; if (r <= 0) return b }
  return BUBBLE_POOL[0]
}

function comboMult(combo: number) {
  if (combo >= 15) return 5
  if (combo >= 10) return 3
  if (combo >=  6) return 2
  if (combo >=  3) return 1.5
  return 1
}

function multLabel(combo: number) {
  const m = comboMult(combo)
  return m === 1 ? "" : `${m}×`
}

// ── Types ────────────────────────────────────────────────────────────────────

interface Bubble {
  id: string
  emoji: string
  pts: number
  x: number     // left %
  y: number     // top %
  r: number     // radius px
  ttl: number   // lifetime ms
  born: number  // Date.now()
}

interface PopFx {
  id: string
  x: number; y: number
  emoji: string
  pts: number
  mult: number
}

interface ScoreEntry {
  id: string
  name: string
  score: number
  date: string
}

// ── Component ────────────────────────────────────────────────────────────────

export default function BubblePopPage() {
  const [phase,     setPhase]     = useState<"idle" | "playing" | "over">("idle")
  const [score,     setScore]     = useState(0)
  const [combo,     setCombo]     = useState(0)
  const [bestCombo, setBestCombo] = useState(0)
  const [lives,     setLives]     = useState(3)
  const [timeLeft,  setTimeLeft]  = useState(GAME_DURATION)
  const [bubbles,   setBubbles]   = useState<Bubble[]>([])
  const [popFx,     setPopFx]     = useState<PopFx[]>([])

  // Leaderboard
  const [tab,          setTab]          = useState<"game" | "board">("game")
  const [scores,       setScores]       = useState<ScoreEntry[]>([])
  const [scoresLoading,setScoresLoading]= useState(false)
  const [scoresError,  setScoresError]  = useState("")

  // Score submission
  const [playerName,   setPlayerName]   = useState("")
  const [submitState,  setSubmitState]  = useState<"idle"|"sending"|"done"|"error">("idle")

  // Refs so callbacks don't go stale
  const scoreRef = useRef(score)
  const comboRef = useRef(combo)
  const livesRef = useRef(lives)
  scoreRef.current = score
  comboRef.current = combo
  livesRef.current = lives

  // ── Spawn rate / TTL scale with elapsed time ──────────────────────────────
  function spawnInterval(elapsed: number) {
    // 1500ms → 500ms over 45s
    return Math.max(500, 1500 - elapsed * 22)
  }
  function bubbleTTL(elapsed: number) {
    // 2800ms → 1000ms over 45s
    return Math.max(1000, 2800 - elapsed * 40)
  }
  function bubbleRadius(pts: number) {
    // Rarer (higher pts) = smaller = harder
    if (pts >= 50) return 28
    if (pts >= 30) return 32
    if (pts >= 20) return 38
    return 44
  }

  // ── Spawn a bubble ────────────────────────────────────────────────────────
  const spawnBubble = useCallback((elapsed: number) => {
    setBubbles(prev => {
      if (prev.length >= MAX_BUBBLES) return prev
      const type = weightedRandom()
      const r = bubbleRadius(type.pts)
      const bubble: Bubble = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        emoji: type.emoji,
        pts: type.pts,
        x: 5 + Math.random() * 80,   // 5–85%
        y: 10 + Math.random() * 72,  // 10–82%
        r,
        ttl: bubbleTTL(elapsed),
        born: Date.now(),
      }
      return [...prev, bubble]
    })
  }, [])

  // ── Tick: timer + bubble expiry ───────────────────────────────────────────
  useEffect(() => {
    if (phase !== "playing") return

    const startedAt = Date.now()
    let spawnTimer: ReturnType<typeof setTimeout>

    function scheduleSpawn() {
      const elapsed = (Date.now() - startedAt) / 1000
      spawnBubble(elapsed)
      spawnTimer = setTimeout(scheduleSpawn, spawnInterval(elapsed))
    }
    scheduleSpawn()

    // Countdown timer + expiry check every 100ms
    const tick = setInterval(() => {
      const elapsed = (Date.now() - startedAt) / 1000
      const remaining = Math.max(0, GAME_DURATION - elapsed)
      setTimeLeft(Math.ceil(remaining))

      // Expire bubbles that ran out of time
      const now = Date.now()
      setBubbles(prev => {
        const expired = prev.filter(b => now - b.born >= b.ttl)
        if (expired.length > 0) {
          // Each missed bubble breaks combo
          setCombo(0)
          // Lose a life for each expired bubble (max 1 per tick to avoid spam)
          const newLives = Math.max(0, livesRef.current - 1)
          setLives(newLives)
          if (newLives === 0) {
            setPhase("over")
          }
        }
        return prev.filter(b => now - b.born < b.ttl)
      })

      if (remaining <= 0) {
        setPhase("over")
      }
    }, 100)

    return () => {
      clearTimeout(spawnTimer)
      clearInterval(tick)
    }
  }, [phase, spawnBubble])

  // ── Pop a bubble ──────────────────────────────────────────────────────────
  const popBubble = useCallback((bubble: Bubble, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    if (phase !== "playing") return

    const newCombo = comboRef.current + 1
    const mult = comboMult(newCombo)
    const earned = Math.round(bubble.pts * mult)

    setCombo(newCombo)
    setBestCombo(prev => Math.max(prev, newCombo))
    setScore(prev => prev + earned)
    setBubbles(prev => prev.filter(b => b.id !== bubble.id))

    // Pop effect
    const fx: PopFx = {
      id: `fx-${Date.now()}-${Math.random()}`,
      x: bubble.x,
      y: bubble.y,
      emoji: bubble.emoji,
      pts: bubble.pts,
      mult,
    }
    setPopFx(prev => [...prev, fx])
    setTimeout(() => setPopFx(prev => prev.filter(f => f.id !== fx.id)), 700)
  }, [phase])

  // ── Start / reset ─────────────────────────────────────────────────────────
  const startGame = () => {
    setScore(0)
    setCombo(0)
    setBestCombo(0)
    setLives(3)
    setTimeLeft(GAME_DURATION)
    setBubbles([])
    setPopFx([])
    setSubmitState("idle")
    setPlayerName("")
    setPhase("playing")
  }

  // ── Leaderboard ───────────────────────────────────────────────────────────
  const fetchScores = useCallback(async () => {
    setScoresLoading(true)
    setScoresError("")
    try {
      const res = await fetch("/api/bubble/scores")
      const data = await res.json()
      if (data.error && !data.scores?.length) { setScoresError(data.error); setScores([]) }
      else setScores(data.scores ?? [])
    } catch { setScoresError("Could not load leaderboard."); setScores([]) }
    finally { setScoresLoading(false) }
  }, [])

  useEffect(() => { if (tab === "board") fetchScores() }, [tab, fetchScores])

  const submitScore = async () => {
    if (!playerName.trim()) return
    setSubmitState("sending")
    try {
      const res = await fetch("/api/bubble/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: playerName.trim(), score }),
      })
      if (!res.ok) throw new Error()
      setSubmitState("done")
      if (tab === "board") fetchScores()
    } catch { setSubmitState("error") }
  }

  // ── Timer color ───────────────────────────────────────────────────────────
  const timerColor = timeLeft <= 10 ? "text-red-500" : timeLeft <= 20 ? "text-amber-500" : "text-primary"

  const MEDAL_LABELS = ["🥇", "🥈", "🥉"]

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col select-none">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border/50 px-4 h-14 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />Back
        </Link>
        <div className="flex-1 flex justify-center gap-1 pr-16">
          <button
            onClick={() => setTab("game")}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${tab === "game" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-primary"}`}
          >🎮 Game</button>
          <button
            onClick={() => setTab("board")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${tab === "board" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-primary"}`}
          ><Trophy className="w-3.5 h-3.5" />Leaderboard</button>
        </div>
      </header>

      {tab === "game" ? (
        <main className="flex-1 flex flex-col">
          {/* ── HUD ── */}
          <div className="flex items-center justify-between px-4 py-2 bg-card/60 border-b border-border/30">
            {/* Lives */}
            <div className="flex gap-1">
              {[1, 2, 3].map(n => (
                <Heart key={n} className={`w-5 h-5 ${n <= lives ? "text-rose-500 fill-rose-500" : "text-muted/30"}`} />
              ))}
            </div>
            {/* Score */}
            <div className="text-center">
              <span className="text-2xl font-black text-primary tabular-nums">{score.toLocaleString()}</span>
              {combo >= 3 && (
                <span className="ml-2 text-sm font-bold text-amber-500 animate-pulse">{multLabel(combo)} combo!</span>
              )}
            </div>
            {/* Timer */}
            <div className={`text-2xl font-black tabular-nums ${timerColor}`}>{timeLeft}s</div>
          </div>

          {/* ── Arena ── */}
          <div
            className="flex-1 relative overflow-hidden"
            style={{ background: "radial-gradient(ellipse at 50% 0%, oklch(0.92 0.08 300 / 0.4), transparent 70%)" }}
          >
            {phase === "idle" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6">
                <div className="text-7xl animate-bounce">🌸</div>
                <div className="text-center">
                  <h1 className="text-3xl font-black text-primary mb-1">Flower Pop!</h1>
                  <p className="text-muted-foreground text-sm max-w-xs">
                    Tap the flowers before they disappear! Build combos for bonus points. You have 3 lives — don't miss too many!
                  </p>
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>🌸 10pts</span>
                  <span>🦋 20pts</span>
                  <span>⭐ 30pts</span>
                  <span>🌈 40pts</span>
                  <span>💎 50pts</span>
                </div>
                <button
                  onClick={startGame}
                  className="px-10 py-4 rounded-full bg-primary text-primary-foreground font-black text-xl shadow-xl hover:scale-105 active:scale-95 transition-transform"
                >
                  Start! 🌸
                </button>
              </div>
            )}

            {phase === "over" && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                <div className="bg-background rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-border/50 flex flex-col items-center gap-4">
                  <div className="text-6xl">🎉</div>
                  <h2 className="text-2xl font-bold text-primary">Time's Up!</h2>
                  <div className="text-4xl font-black text-foreground">{score.toLocaleString()} pts</div>
                  <p className="text-sm text-muted-foreground">Best combo: {bestCombo}× in a row</p>

                  {submitState === "done" ? (
                    <div className="w-full bg-primary/10 rounded-2xl py-3 px-4 text-sm text-primary font-medium text-center">
                      ✅ Score saved to leaderboard!
                    </div>
                  ) : (
                    <div className="w-full flex flex-col gap-2">
                      <p className="text-sm font-medium">Save your score?</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={playerName}
                          onChange={e => setPlayerName(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && submitScore()}
                          placeholder="Your name"
                          maxLength={30}
                          disabled={submitState === "sending"}
                          className="flex-1 px-3 py-2 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                        />
                        <button
                          onClick={submitScore}
                          disabled={!playerName.trim() || submitState === "sending"}
                          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-50"
                        >
                          {submitState === "sending" ? "…" : <Send className="w-4 h-4" />}
                        </button>
                      </div>
                      {submitState === "error" && <p className="text-xs text-destructive text-center">Could not save — try again.</p>}
                    </div>
                  )}

                  <div className="flex gap-3 w-full">
                    <button onClick={startGame} className="flex-1 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 text-sm">
                      Play Again
                    </button>
                    <button onClick={() => setTab("board")} className="flex-1 flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-muted font-semibold hover:bg-primary/20 text-sm">
                      <Trophy className="w-4 h-4" />Scores
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Bubbles ── */}
            {bubbles.map(bubble => (
              <BubbleButton key={bubble.id} bubble={bubble} onPop={popBubble} />
            ))}

            {/* ── Pop effects ── */}
            {popFx.map(fx => (
              <div
                key={fx.id}
                className="absolute pointer-events-none flex flex-col items-center animate-pop-out"
                style={{ left: `${fx.x}%`, top: `${fx.y}%`, transform: "translate(-50%,-50%)" }}
              >
                <span className="text-3xl">{fx.emoji}</span>
                <span className="text-sm font-black text-primary">
                  +{Math.round(fx.pts * fx.mult)}{fx.mult > 1 ? ` (${fx.mult}×)` : ""}
                </span>
              </div>
            ))}
          </div>
        </main>
      ) : (
        /* ── Leaderboard tab ── */
        <main className="flex-1 flex flex-col items-center px-4 py-6">
          <div className="w-full max-w-md">
            <div className="bg-card rounded-3xl border-2 border-border/50 shadow-xl overflow-hidden">
              <div className="bg-primary/10 px-6 py-5 border-b border-border/30 flex items-center gap-3">
                <Medal className="w-6 h-6 text-primary" />
                <div>
                  <h2 className="font-bold text-foreground text-lg">Top Flower Poppers 🌸</h2>
                  <p className="text-xs text-muted-foreground">45 seconds · highest score wins</p>
                </div>
              </div>
              <div className="divide-y divide-border/30">
                {scoresLoading ? (
                  <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
                    <span>Loading</span>
                    {[0,1,2].map(i => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
                    ))}
                  </div>
                ) : scoresError ? (
                  <div className="py-12 text-center text-sm text-muted-foreground px-6">
                    <p className="text-3xl mb-3">🔌</p>
                    <p>{scoresError}</p>
                    <p className="text-xs mt-1 opacity-60">Make sure KV_REST_API_URL and KV_REST_API_TOKEN are set in Vercel.</p>
                  </div>
                ) : scores.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <p className="text-4xl mb-3">🌸</p>
                    <p className="font-medium">No scores yet!</p>
                    <p className="text-sm mt-1">Be the first to pop some flowers!</p>
                  </div>
                ) : (
                  scores.map((entry, i) => (
                    <div key={entry.id} className="flex items-center gap-4 px-6 py-4">
                      <span className="text-xl w-6 text-center flex-shrink-0">
                        {i < 3 ? MEDAL_LABELS[i] : <span className="text-sm text-muted-foreground font-bold">{i+1}</span>}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold truncate ${i === 0 ? "text-amber-500" : "text-foreground"}`}>{entry.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(entry.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-black text-primary text-lg">{entry.score.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">pts</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="flex justify-center mt-4">
              <button onClick={startGame} className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-bold hover:opacity-90 active:scale-95 transition-all">
                Play Now 🌸
              </button>
            </div>
          </div>
        </main>
      )}

      <style>{`
        @keyframes pop-out {
          0%   { opacity: 1; transform: translate(-50%,-50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%,-120%) scale(1.4); }
        }
        .animate-pop-out { animation: pop-out 0.7s ease-out forwards; }

        @keyframes bubble-in {
          0%   { transform: scale(0) rotate(-10deg); opacity: 0; }
          60%  { transform: scale(1.15) rotate(4deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        .animate-bubble-in { animation: bubble-in 0.25s ease-out forwards; }
      `}</style>
    </div>
  )
}

// ── Bubble button: shows a shrinking ring as TTL runs out ─────────────────────

function BubbleButton({
  bubble,
  onPop,
}: {
  bubble: Bubble
  onPop: (b: Bubble, e: React.MouseEvent | React.TouchEvent) => void
}) {
  const [progress, setProgress] = useState(1)   // 1 → 0

  useEffect(() => {
    const id = setInterval(() => {
      const elapsed = Date.now() - bubble.born
      setProgress(Math.max(0, 1 - elapsed / bubble.ttl))
    }, 50)
    return () => clearInterval(id)
  }, [bubble.born, bubble.ttl])

  const size = bubble.r * 2
  const stroke = 4
  const circ = Math.PI * 2 * (bubble.r - stroke)
  const dash = circ * progress
  const urgent = progress < 0.35

  return (
    <button
      onClick={e => onPop(bubble, e)}
      onTouchStart={e => onPop(bubble, e)}
      className="absolute animate-bubble-in hover:scale-110 active:scale-90 transition-transform"
      style={{
        left: `${bubble.x}%`,
        top: `${bubble.y}%`,
        width: size,
        height: size,
        transform: "translate(-50%, -50%)",
      }}
    >
      {/* Countdown ring */}
      <svg
        className="absolute inset-0"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Track */}
        <circle
          cx={bubble.r} cy={bubble.r} r={bubble.r - stroke}
          fill="none" stroke="oklch(0.9 0 0 / 0.3)" strokeWidth={stroke}
        />
        {/* Progress */}
        <circle
          cx={bubble.r} cy={bubble.r} r={bubble.r - stroke}
          fill="none"
          stroke={urgent ? "oklch(0.6 0.22 25)" : "oklch(0.7 0.18 300)"}
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${bubble.r} ${bubble.r})`}
        />
        {/* Fill */}
        <circle
          cx={bubble.r} cy={bubble.r} r={bubble.r - stroke - 2}
          fill={urgent ? "oklch(0.97 0.05 25)" : "oklch(0.97 0.05 300)"}
        />
      </svg>
      {/* Emoji */}
      <span
        className={`absolute inset-0 flex items-center justify-center ${urgent ? "animate-pulse" : ""}`}
        style={{ fontSize: bubble.r * 0.9 }}
      >
        {bubble.emoji}
      </span>
    </button>
  )
}
