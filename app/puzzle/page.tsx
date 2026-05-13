"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, RotateCcw, Trophy, Timer, Star, Send, Medal } from "lucide-react"

const EMOJI_SETS = {
  easy: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊"],
  medium: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼"],
  hard: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯"],
}

type Difficulty = "easy" | "medium" | "hard"
type Tab = "game" | "leaderboard"

interface Card {
  id: number
  emoji: string
  flipped: boolean
  matched: boolean
}

interface ScoreEntry {
  id: string
  name: string
  moves: number
  seconds: number
  date: string
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function makeCards(difficulty: Difficulty): Card[] {
  const emojis = EMOJI_SETS[difficulty]
  const pairs = [...emojis, ...emojis]
  return shuffle(pairs).map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }))
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

const COLS: Record<Difficulty, string> = {
  easy: "grid-cols-4",
  medium: "grid-cols-4",
  hard: "grid-cols-5",
}

const GRID_SIZE: Record<Difficulty, string> = {
  easy: "max-w-xs",
  medium: "max-w-sm",
  hard: "max-w-md",
}

const MEDAL_COLORS = ["text-amber-400", "text-slate-400", "text-amber-600"]
const MEDAL_LABELS = ["🥇", "🥈", "🥉"]

export default function PuzzlePage() {
  const [tab, setTab] = useState<Tab>("game")
  const [difficulty, setDifficulty] = useState<Difficulty>("easy")
  const [cards, setCards] = useState<Card[]>(() => makeCards("easy"))
  const [selected, setSelected] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const [won, setWon] = useState(false)
  const [bestMoves, setBestMoves] = useState<Record<Difficulty, number | null>>({
    easy: null, medium: null, hard: null,
  })

  // Score submission
  const [playerName, setPlayerName] = useState("")
  const [submitState, setSubmitState] = useState<"idle" | "sending" | "done" | "error">("idle")

  // Leaderboard
  const [scores, setScores] = useState<ScoreEntry[]>([])
  const [scoresLoading, setScoresLoading] = useState(false)
  const [scoresError, setScoresError] = useState("")

  const fetchScores = useCallback(async (diff: Difficulty) => {
    setScoresLoading(true)
    setScoresError("")
    try {
      const res = await fetch(`/api/puzzle/scores?difficulty=${diff}`)
      const data = await res.json()
      if (data.error && !data.scores?.length) {
        setScoresError(data.error)
        setScores([])
      } else {
        setScores(data.scores ?? [])
      }
    } catch {
      setScoresError("Could not load leaderboard.")
      setScores([])
    } finally {
      setScoresLoading(false)
    }
  }, [])

  // Timer
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [running])

  // Win check
  useEffect(() => {
    if (cards.length > 0 && cards.every((c) => c.matched)) {
      setRunning(false)
      setWon(true)
      setBestMoves((prev) => ({
        ...prev,
        [difficulty]: prev[difficulty] === null ? moves : Math.min(prev[difficulty]!, moves),
      }))
    }
  }, [cards, difficulty, moves])

  // Fetch leaderboard when tab switches or difficulty changes
  useEffect(() => {
    if (tab === "leaderboard") fetchScores(difficulty)
  }, [tab, difficulty, fetchScores])

  const reset = useCallback((diff: Difficulty = difficulty) => {
    setCards(makeCards(diff))
    setSelected([])
    setMoves(0)
    setSeconds(0)
    setRunning(false)
    setWon(false)
    setSubmitState("idle")
    setPlayerName("")
  }, [difficulty])

  const changeDifficulty = (diff: Difficulty) => {
    setDifficulty(diff)
    reset(diff)
  }

  const handleFlip = (id: number) => {
    if (won) return
    if (selected.length === 2) return
    const card = cards.find((c) => c.id === id)
    if (!card || card.flipped || card.matched) return

    if (!running) setRunning(true)

    const next = selected.concat(id)
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, flipped: true } : c)))
    setSelected(next)

    if (next.length === 2) {
      setMoves((m) => m + 1)
      const [a, b] = next.map((idx) => cards.find((c) => c.id === idx)!)
      if (a.emoji === b.emoji) {
        setTimeout(() => {
          setCards((prev) => prev.map((c) => next.includes(c.id) ? { ...c, matched: true } : c))
          setSelected([])
        }, 400)
      } else {
        setTimeout(() => {
          setCards((prev) => prev.map((c) => next.includes(c.id) ? { ...c, flipped: false } : c))
          setSelected([])
        }, 900)
      }
    }
  }

  const submitScore = async () => {
    if (!playerName.trim()) return
    setSubmitState("sending")
    try {
      const res = await fetch("/api/puzzle/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: playerName.trim(), moves, seconds, difficulty }),
      })
      if (!res.ok) throw new Error()
      setSubmitState("done")
      // Refresh leaderboard if visible
      if (tab === "leaderboard") fetchScores(difficulty)
    } catch {
      setSubmitState("error")
    }
  }

  const stars =
    won
      ? moves <= EMOJI_SETS[difficulty].length + 2 ? 3
        : moves <= EMOJI_SETS[difficulty].length * 2 ? 2
        : 1
      : 0

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border/50 px-4 h-14 flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <div className="flex-1 flex justify-center gap-1 pr-16">
          <button
            onClick={() => setTab("game")}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              tab === "game"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-primary"
            }`}
          >
            🎮 Game
          </button>
          <button
            onClick={() => setTab("leaderboard")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              tab === "leaderboard"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-primary"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            Leaderboard
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 py-6 gap-6">
        {/* Difficulty (shared between tabs) */}
        <div className="flex gap-2">
          {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => changeDifficulty(d)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition-all ${
                difficulty === d
                  ? "bg-primary text-primary-foreground shadow-md scale-105"
                  : "bg-muted text-muted-foreground hover:bg-primary/20"
              }`}
            >
              {d === "easy" ? "🌟 Easy" : d === "medium" ? "🔥 Medium" : "⚡ Hard"}
            </button>
          ))}
        </div>

        {tab === "game" ? (
          <>
            {/* Stats */}
            <div className="flex gap-6 text-sm font-medium">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Timer className="w-4 h-4 text-primary" />
                {formatTime(seconds)}
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                🎯 {moves} move{moves !== 1 ? "s" : ""}
              </span>
              {bestMoves[difficulty] !== null && (
                <span className="flex items-center gap-1.5 text-amber-500">
                  <Trophy className="w-4 h-4" />
                  Best: {bestMoves[difficulty]}
                </span>
              )}
            </div>

            {/* Grid */}
            <div className={`w-full ${GRID_SIZE[difficulty]} mx-auto`}>
              <div className={`grid ${COLS[difficulty]} gap-2`}>
                {cards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => handleFlip(card.id)}
                    disabled={card.matched || card.flipped || selected.length === 2}
                    className="aspect-square rounded-xl text-2xl sm:text-3xl flex items-center justify-center
                      transition-all duration-300 select-none outline-none focus-visible:ring-2 focus-visible:ring-primary
                      hover:scale-105 active:scale-95 disabled:cursor-default"
                    style={{
                      background: card.matched
                        ? "oklch(0.85 0.15 145)"
                        : card.flipped
                        ? "oklch(0.75 0.18 280)"
                        : "oklch(0.65 0.18 280)",
                      boxShadow: card.matched
                        ? "0 0 0 2px oklch(0.65 0.2 145)"
                        : card.flipped
                        ? "0 4px 12px oklch(0.5 0.2 280 / 0.4)"
                        : "0 2px 8px oklch(0.3 0.1 280 / 0.3)",
                    }}
                    aria-label={card.flipped || card.matched ? card.emoji : "Hidden card"}
                  >
                    {card.flipped || card.matched ? card.emoji : "❓"}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => reset(difficulty)}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-muted hover:bg-primary/20 text-muted-foreground hover:text-primary text-sm font-medium transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              New Game
            </button>

            <div className="max-w-sm text-center text-xs text-muted-foreground bg-muted/40 rounded-2xl px-5 py-3 leading-relaxed">
              <p className="font-semibold text-foreground mb-1">How to Play 🎮</p>
              Flip two cards at a time. Find matching animal pairs to clear the board. Fewer moves = more stars! ⭐
            </div>
          </>
        ) : (
          /* Leaderboard tab */
          <div className="w-full max-w-md">
            <div className="bg-card rounded-3xl border-2 border-border/50 shadow-xl overflow-hidden">
              <div className="bg-primary/10 px-6 py-5 border-b border-border/30 flex items-center gap-3">
                <Medal className="w-6 h-6 text-primary" />
                <div>
                  <h2 className="font-bold text-foreground text-lg">Top Players</h2>
                  <p className="text-xs text-muted-foreground capitalize">{difficulty} mode · fewest moves wins</p>
                </div>
              </div>

              <div className="divide-y divide-border/30">
                {scoresLoading ? (
                  <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
                    <span>Loading</span>
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }} />
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
                    <p className="text-4xl mb-3">🏆</p>
                    <p className="font-medium">No scores yet!</p>
                    <p className="text-sm mt-1">Be the first to finish and submit your score.</p>
                  </div>
                ) : (
                  scores.map((entry, i) => (
                    <div key={entry.id} className="flex items-center gap-4 px-6 py-4">
                      <span className="text-xl w-6 text-center flex-shrink-0">
                        {i < 3 ? MEDAL_LABELS[i] : <span className="text-sm text-muted-foreground font-bold">{i + 1}</span>}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold truncate ${i === 0 ? "text-amber-500" : "text-foreground"}`}>
                          {entry.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(entry.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-primary">{entry.moves} moves</p>
                        <p className="text-xs text-muted-foreground">{formatTime(entry.seconds)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-4">
              Play the game and submit your score to appear here!
            </p>
          </div>
        )}
      </main>

      {/* Win overlay */}
      {won && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-background rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-border/50 flex flex-col items-center gap-4">
            <div className="text-6xl animate-bounce">🎉</div>
            <h2 className="text-2xl font-bold text-primary">You Won!</h2>
            <div className="flex gap-1">
              {[1, 2, 3].map((n) => (
                <Star key={n} className={`w-8 h-8 ${n <= stars ? "text-amber-400 fill-amber-400" : "text-muted"}`} />
              ))}
            </div>
            <p className="text-muted-foreground text-sm">
              {moves} moves &bull; {formatTime(seconds)}
            </p>

            {/* Score submission */}
            {submitState === "done" ? (
              <div className="w-full bg-primary/10 rounded-2xl py-3 px-4 text-sm text-primary font-medium text-center">
                ✅ Score saved to leaderboard!
              </div>
            ) : (
              <div className="w-full flex flex-col gap-2">
                <p className="text-sm font-medium text-foreground">Save your score to the leaderboard?</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submitScore()}
                    placeholder="Your name"
                    maxLength={30}
                    disabled={submitState === "sending"}
                    className="flex-1 px-3 py-2 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                  <button
                    onClick={submitScore}
                    disabled={!playerName.trim() || submitState === "sending"}
                    className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {submitState === "sending" ? "..." : <Send className="w-4 h-4" />}
                  </button>
                </div>
                {submitState === "error" && (
                  <p className="text-xs text-destructive text-center">Could not save — try again.</p>
                )}
              </div>
            )}

            <div className="flex gap-3 mt-1 w-full">
              <button
                onClick={() => reset(difficulty)}
                className="flex-1 px-5 py-2 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity text-sm"
              >
                Play Again
              </button>
              {difficulty !== "hard" ? (
                <button
                  onClick={() => changeDifficulty(difficulty === "easy" ? "medium" : "hard")}
                  className="flex-1 px-5 py-2 rounded-full bg-muted text-foreground font-semibold hover:bg-primary/20 transition-colors text-sm"
                >
                  Next Level →
                </button>
              ) : (
                <button
                  onClick={() => { setTab("leaderboard"); setWon(false) }}
                  className="flex-1 px-5 py-2 rounded-full bg-muted text-foreground font-semibold hover:bg-primary/20 transition-colors text-sm"
                >
                  <Trophy className="w-4 h-4 inline mr-1" />
                  Scores
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
