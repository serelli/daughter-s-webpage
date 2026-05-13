"use client"

import { useState, useEffect } from "react"
import { Sparkles } from "lucide-react"

export function AiFloatButton() {
  const [show, setShow] = useState(false)
  const [tooltip, setTooltip] = useState(true)

  // Only show after scrolling past the hero
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 300)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Hide tooltip after 4 seconds
  useEffect(() => {
    if (!show) return
    const t = setTimeout(() => setTooltip(false), 4000)
    return () => clearTimeout(t)
  }, [show])

  const scrollToWidget = () => {
    document.querySelector("#ai-widget")?.scrollIntoView({ behavior: "smooth" })
  }

  if (!show) return null

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
      {/* Tooltip */}
      {tooltip && (
        <div className="bg-foreground text-background text-sm font-medium px-3 py-2 rounded-xl shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-right-2 duration-300">
          ✨ Ask AI about Drishya!
        </div>
      )}

      {/* Button */}
      <button
        onClick={scrollToWidget}
        onMouseEnter={() => setTooltip(true)}
        onMouseLeave={() => setTooltip(false)}
        className="w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform"
        aria-label="Ask AI about Drishya"
      >
        <Sparkles className="w-6 h-6 animate-pulse" />
      </button>
    </div>
  )
}
