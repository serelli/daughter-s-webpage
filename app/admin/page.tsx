"use client"

import { useState, useEffect, useCallback } from "react"
import { Check, X, RefreshCw, LogOut, Lock } from "lucide-react"

interface HelloEntry {
  id: string
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

export default function AdminPage() {
  const [password, setPassword] = useState("")
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState(false)
  const [messages, setMessages] = useState<HelloEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [acting, setActing] = useState<string | null>(null)

  const fetchPending = useCallback(async (pw: string) => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/hellos", {
        headers: { "x-admin-password": pw },
      })
      if (res.status === 401) { setAuthed(false); return }
      const data = await res.json()
      setMessages(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }, [])

  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(false)
    const res = await fetch("/api/admin/hellos", {
      headers: { "x-admin-password": password },
    })
    if (res.status === 401) {
      setAuthError(true)
      return
    }
    setAuthed(true)
    const data = await res.json()
    setMessages(Array.isArray(data) ? data : [])
  }

  const act = async (id: string, action: "approve" | "reject") => {
    setActing(id)
    try {
      await fetch("/api/admin/hellos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ id, action }),
      })
      setMessages((prev) => prev.filter((m) => m.id !== id))
    } finally {
      setActing(null)
    }
  }

  useEffect(() => {
    if (authed) {
      const interval = setInterval(() => fetchPending(password), 30000)
      return () => clearInterval(interval)
    }
  }, [authed, password, fetchPending])

  if (!authed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-3xl border-2 border-border/50 shadow-xl w-full max-w-sm p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Admin</h1>
            <p className="text-muted-foreground text-sm mt-1">Drishya's Hello Wall</p>
          </div>

          <form onSubmit={login} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoFocus
              className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
            {authError && (
              <p className="text-sm text-destructive text-center">Incorrect password</p>
            )}
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-3 rounded-full font-semibold hover:scale-105 transition-transform"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pending Hellos</h1>
            <p className="text-muted-foreground text-sm">
              {messages.length} message{messages.length !== 1 ? "s" : ""} waiting for approval
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fetchPending(password)}
              className="p-2.5 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => { setAuthed(false); setPassword("") }}
              className="p-2.5 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <span>Loading</span>
            {[0, 1, 2].map((i) => (
              <span key={i} className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">✨</div>
            <p className="text-muted-foreground text-lg">All caught up — no pending messages!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className="bg-card rounded-2xl border-2 border-border/50 p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-foreground">{m.name}</span>
                      <span className="text-xs text-muted-foreground">{timeAgo(m.date)}</span>
                    </div>
                    <p className="text-foreground/80 text-sm leading-relaxed">{m.message}</p>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => act(m.id, "approve")}
                      disabled={acting === m.id}
                      className="flex items-center gap-1.5 bg-green-500/10 text-green-600 hover:bg-green-500/20 px-3 py-2 rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => act(m.id, "reject")}
                      disabled={acting === m.id}
                      className="flex items-center gap-1.5 bg-destructive/10 text-destructive hover:bg-destructive/20 px-3 py-2 rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
