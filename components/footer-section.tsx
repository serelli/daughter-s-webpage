"use client"

import { Heart, Star } from "lucide-react"

export function FooterSection() {
  return (
    <footer className="py-12 px-4 bg-primary/10">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Star className="w-6 h-6 text-accent fill-accent" />
          <Star className="w-8 h-8 text-primary fill-primary" />
          <Star className="w-6 h-6 text-accent fill-accent" />
        </div>

        <p className="text-xl md:text-2xl font-bold text-foreground mb-2">
          Thanks for visiting Drishya&apos;s page!
        </p>

        <p className="text-muted-foreground flex items-center justify-center gap-2">
          Made with <Heart className="w-5 h-5 text-primary fill-primary animate-pulse" /> and lots of sparkles
        </p>

        <div className="mt-6 flex justify-center gap-3">
          {["🦄", "💜", "🌸", "✨", "🎀"].map((emoji, index) => (
            <span
              key={index}
              className="text-2xl animate-bounce"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {emoji}
            </span>
          ))}
        </div>
      </div>
    </footer>
  )
}
