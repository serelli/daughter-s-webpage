"use client"

import { useEffect, useState } from "react"
import { Heart, RefreshCw } from "lucide-react"

interface HelloEntry {
  name: string
  message: string
  date: string
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (mins > 0) return `${mins}m ago`
  return "just now"
}

const BG_COLORS = [
  "bg-primary/10",
  "bg-secondary/30",
  "bg-accent/20",
  "bg-primary/15",
]

export function MessagesWall() {
  const [messages, setMessages] = useState<HelloEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/hello")
      const data = await res.json()
      setMessages(Array.isArray(data) ? data : [])
    } catch {
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
    // Refresh when a new hello is submitted
    const handler = () => setTimeout(fetchMessages, 500)
    window.addEventListener("hello-submitted", handler)
    return () => window.removeEventListener("hello-submitted", handler)
  }, [])

  return (
    <section className="py-16 md:py-20 px-4 bg-card/50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Heart className="w-7 h-7 text-primary fill-primary" />
            <h2 className="text-3xl md:text-5xl font-bold text-foreground">
              Visitor Hellos
            </h2>
            <Heart className="w-7 h-7 text-primary fill-primary" />
          </div>
          <p className="text-muted-foreground text-lg">
            {messages.length > 0
              ? `${messages.length} wonderful ${messages.length === 1 ? "person has" : "people have"} said hello! 💜`
              : "Be the first to say hello! 💜"}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
            <span>Loading hellos</span>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🌸</div>
            <p className="text-muted-foreground text-lg">
              No hellos yet — be the first!
            </p>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("say-hello-open"))}
              className="mt-4 bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform"
            >
              Say Hello 👋
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`${BG_COLORS[i % BG_COLORS.length]} rounded-2xl p-5 border border-border/40 hover:scale-[1.02] transition-transform`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {["🌸", "💜", "⭐", "🦋", "🌈", "✨"][i % 6]}
                      </span>
                      <span className="font-bold text-foreground">{m.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {timeAgo(m.date)}
                    </span>
                  </div>
                  <p className="text-foreground/80 leading-relaxed text-sm">
                    {m.message}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("say-hello-open"))}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform shadow-md"
              >
                Add Your Hello 👋
              </button>
              <button
                onClick={fetchMessages}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground px-4 py-3 rounded-full hover:bg-muted transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
