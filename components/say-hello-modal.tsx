"use client"

import { useState, useEffect } from "react"
import { X, Send } from "lucide-react"

type Status = "idle" | "sending" | "success" | "error"

export function SayHelloModal() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<Status>("idle")

  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener("say-hello-open", handler)
    return () => window.removeEventListener("say-hello-open", handler)
  }, [])

  const close = () => {
    setOpen(false)
    setTimeout(() => {
      setStatus("idle")
      setName("")
      setMessage("")
    }, 300)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !message.trim()) return
    setStatus("sending")
    try {
      const res = await fetch("/api/hello", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message }),
      })
      if (!res.ok) throw new Error()
      setStatus("success")
      window.dispatchEvent(new CustomEvent("hello-submitted"))
    } catch {
      setStatus("error")
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />

      {/* Card */}
      <div className="relative bg-card rounded-3xl shadow-2xl w-full max-w-md border-2 border-border/50 overflow-hidden">
        {/* Top banner */}
        <div className="bg-primary/10 px-8 pt-8 pb-6 text-center border-b border-border/30">
          <button
            onClick={close}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="text-5xl mb-3">{status === "success" ? "🎉" : "👋"}</div>
          <h3 className="text-2xl font-bold text-foreground">
            {status === "success" ? "Hello sent!" : "Say Hello to Drishya!"}
          </h3>
          <p className="text-muted-foreground text-sm mt-1">
            {status === "success"
              ? "Thank you for visiting Drishya's magical world! ✨"
              : "Leave a little note — it'll make her smile 💜"}
          </p>
        </div>

        <div className="px-8 py-6">
          {status === "success" ? (
            <button
              onClick={close}
              className="w-full bg-primary text-primary-foreground py-3 rounded-full font-semibold hover:scale-105 transition-transform"
            >
              Close ✨
            </button>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="What's your name?"
                  maxLength={50}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Your Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write something nice for Drishya! 💜"
                  maxLength={300}
                  rows={4}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                />
                <p className="text-xs text-muted-foreground text-right mt-1">
                  {message.length}/300
                </p>
              </div>

              {status === "error" && (
                <p className="text-sm text-destructive text-center">
                  Something went wrong — please try again.
                </p>
              )}

              <button
                type="submit"
                disabled={status === "sending" || !name.trim() || !message.trim()}
                className="w-full bg-primary text-primary-foreground py-3 rounded-full font-semibold flex items-center justify-center gap-2 hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {status === "sending" ? (
                  <>
                    <span>Sending</span>
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-primary-foreground animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Hello!
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
