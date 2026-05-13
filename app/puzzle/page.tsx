"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, RotateCcw, Trophy, Timer, Star } from "lucide-react"

const EMOJI_SETS = {
  easy: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊"],
  medium: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼"],
  hard: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯"],
}

type Difficulty = "easy" | "medium" | "hard"

interface Card {
  id: number
  emoji: string
  flipped: boolean
  matched: boolean
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

export default function PuzzlePage() {
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

  const reset = useCallback((diff: Difficulty = difficulty) => {
    setCards(makeCards(diff))
    setSelected([])
    setMoves(0)
    setSeconds(0)
    setRunning(false)
    setWon(false)
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
        // match
        setTimeout(() => {
          setCards((prev) => prev.map((c) => next.includes(c.id) ? { ...c, matched: true } : c))
          setSelected([])
        }, 400)
      } else {
        // no match — flip back
        setTimeout(() => {
          setCards((prev) => prev.map((c) => next.includes(c.id) ? { ...c, flipped: false } : c))
          setSelected([])
        }, 900)
      }
    }
  }

  const stars =
    won
      ? moves <= EMOJI_SETS[difficulty].length + 2
        ? 3
        : moves <= EMOJI_SETS[difficulty].length * 2
        ? 2
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
        <span className="text-primary font-bold text-base flex-1 text-center pr-16">
          🧩 Memory Match
        </span>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 py-6 gap-6">
        {/* Difficulty */}
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
                  transform: card.flipped || card.matched ? "rotateY(0deg)" : "rotateY(180deg)",
                }}
                aria-label={card.flipped || card.matched ? card.emoji : "Hidden card"}
              >
                {card.flipped || card.matched ? card.emoji : "❓"}
              </button>
            ))}
          </div>
        </div>

        {/* Reset */}
        <button
          onClick={() => reset(difficulty)}
          className="flex items-center gap-2 px-5 py-2 rounded-full bg-muted hover:bg-primary/20 text-muted-foreground hover:text-primary text-sm font-medium transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          New Game
        </button>

        {/* How to play */}
        <div className="max-w-sm text-center text-xs text-muted-foreground bg-muted/40 rounded-2xl px-5 py-3 leading-relaxed">
          <p className="font-semibold text-foreground mb-1">How to Play 🎮</p>
          Flip two cards at a time. Find matching animal pairs to clear the board. Fewer moves = more stars! ⭐
        </div>
      </main>

      {/* Win overlay */}
      {won && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-background rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-border/50 flex flex-col items-center gap-4">
            <div className="text-6xl animate-bounce">🎉</div>
            <h2 className="text-2xl font-bold text-primary">You Won!</h2>
            <div className="flex gap-1">
              {[1, 2, 3].map((n) => (
                <Star
                  key={n}
                  className={`w-8 h-8 ${n <= stars ? "text-amber-400 fill-amber-400" : "text-muted"}`}
                />
              ))}
            </div>
            <p className="text-muted-foreground text-sm">
              {moves} moves &bull; {formatTime(seconds)}
            </p>
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => reset(difficulty)}
                className="px-5 py-2 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
              >
                Play Again
              </button>
              {difficulty !== "hard" && (
                <button
                  onClick={() => changeDifficulty(difficulty === "easy" ? "medium" : "hard")}
                  className="px-5 py-2 rounded-full bg-muted text-foreground font-semibold hover:bg-primary/20 transition-colors"
                >
                  Next Level →
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
