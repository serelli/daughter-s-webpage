"use client"

import { useState, useRef } from "react"
import { Sparkles, BookOpen, Lightbulb, RefreshCw, StopCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type Mode = "fun-fact" | "story"
type State = "idle" | "loading" | "streaming" | "done"

export function AiWidget() {
  const [state, setState] = useState<State>("idle")
  const [mode, setMode] = useState<Mode | null>(null)
  const [text, setText] = useState("")
  const abortRef = useRef<AbortController | null>(null)

  const generate = async (selectedMode: Mode) => {
    // Cancel any in-flight request
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setMode(selectedMode)
    setState("loading")
    setText("")

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: selectedMode }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? "Request failed")
      }

      if (!res.body) throw new Error("No response body")

      setState("streaming")
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        accumulated += chunk
        setText((prev) => prev + chunk)
      }

      if (!accumulated) throw new Error("Empty response — please try again.")

      setState("done")
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return
      const msg = err instanceof Error ? err.message : "Something went wrong."
      setState("done")
      setText(`✨ ${msg}`)
    }
  }

  const reset = () => {
    abortRef.current?.abort()
    setState("idle")
    setText("")
    setMode(null)
  }

  const isActive = state === "loading" || state === "streaming"

  return (
    <section className="py-16 md:py-24 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Ask <span className="text-primary">AI</span> About Drishya
            </h2>
            <Sparkles className="w-8 h-8 text-primary animate-pulse" style={{ animationDelay: "0.3s" }} />
          </div>
          <p className="text-lg text-muted-foreground">
            Let AI conjure a magical fun fact or story, just for you!
          </p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-3xl border-2 border-border/50 shadow-xl overflow-hidden">
          {/* Buttons */}
          <div className="grid grid-cols-2 gap-0 border-b-2 border-border/50">
            <button
              onClick={() => generate("fun-fact")}
              disabled={isActive}
              className={cn(
                "flex flex-col items-center gap-3 py-8 px-6 font-semibold text-lg transition-all border-r-2 border-border/50",
                "hover:bg-primary/10 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed",
                mode === "fun-fact" && (state === "streaming" || state === "done")
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground"
              )}
            >
              <Lightbulb className="w-8 h-8" />
              <span>Fun Fact</span>
            </button>

            <button
              onClick={() => generate("story")}
              disabled={isActive}
              className={cn(
                "flex flex-col items-center gap-3 py-8 px-6 font-semibold text-lg transition-all",
                "hover:bg-accent/20 hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed",
                mode === "story" && (state === "streaming" || state === "done")
                  ? "bg-accent/20 text-accent-foreground"
                  : "text-muted-foreground"
              )}
            >
              <BookOpen className="w-8 h-8" />
              <span>Story</span>
            </button>
          </div>

          {/* Output area */}
          <div className="p-8 min-h-[180px] flex flex-col justify-between">
            {state === "idle" && (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-4">
                <div className="text-5xl">✨</div>
                <p className="text-muted-foreground text-lg">
                  Pick <strong>Fun Fact</strong> or <strong>Story</strong> above to get started!
                </p>
              </div>
            )}

            {state === "loading" && (
              <div className="flex-1 flex items-center justify-center gap-2 py-4">
                <span className="text-muted-foreground text-lg">Conjuring magic</span>
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-2 h-2 rounded-full bg-primary animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            )}

            {(state === "streaming" || state === "done") && text && (
              <div className="flex-1">
                <p className="text-foreground text-lg leading-relaxed whitespace-pre-wrap">
                  {text}
                  {state === "streaming" && (
                    <span className="inline-block w-0.5 h-5 bg-primary ml-0.5 animate-pulse align-middle" />
                  )}
                </p>
              </div>
            )}

            {/* Footer actions */}
            {(state === "streaming" || state === "done") && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/30">
                <span className="text-xs text-muted-foreground">
                  {mode === "fun-fact" ? "🌟 Fun Fact" : "📖 Story"} · Powered by Claude AI
                </span>
                <div className="flex gap-2">
                  {state === "streaming" ? (
                    <button
                      onClick={reset}
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-full hover:bg-muted"
                    >
                      <StopCircle className="w-4 h-4" />
                      Stop
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => generate(mode!)}
                        className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors px-3 py-1.5 rounded-full hover:bg-primary/10"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                      </button>
                      <button
                        onClick={reset}
                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-full hover:bg-muted"
                      >
                        ← Back
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Each click generates a unique response ✨
        </p>
      </div>
    </section>
  )
}
