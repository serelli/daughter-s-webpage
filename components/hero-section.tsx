"use client"

import { useState, useEffect } from "react"
import { Star, Sparkles } from "lucide-react"
import Image from "next/image"

export function HeroSection() {
  const [stars, setStars] = useState<{ id: number; x: number; y: number; delay: number; size: number }[]>([])

  useEffect(() => {
    const newStars = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
      size: Math.random() * 16 + 8,
    }))
    setStars(newStars)
  }, [])

  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section className="relative min-h-[100vh] flex flex-col items-center justify-center overflow-hidden px-4 pt-16">
      {/* Floating stars */}
      {stars.map((star) => (
        <Star
          key={star.id}
          className="absolute text-accent animate-pulse"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            animationDelay: `${star.delay}s`,
          }}
          fill="currentColor"
        />
      ))}

      {/* Main content */}
      <div className="relative z-10 text-center">
        {/* Profile Picture */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-primary shadow-2xl">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/e2a22fd2-f400-4cfd-8afc-aae4b68748f7.JPG-6DiTFnCTWI3bBqByv1QkULoH3ZZOrP.jpeg"
              alt="Drishya Erelli"
              fill
              className="object-cover object-top"
              priority
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-8 h-8 md:w-12 md:h-12 text-primary animate-bounce" />
          <span className="text-sm md:text-lg font-medium text-muted-foreground tracking-wider uppercase">
            Welcome to
          </span>
          <Sparkles className="w-8 h-8 md:w-12 md:h-12 text-primary animate-bounce" style={{ animationDelay: "0.2s" }} />
        </div>

        <h1 className="text-5xl md:text-8xl lg:text-9xl font-bold text-foreground mb-6 tracking-tight text-balance">
          <span className="text-primary">Drishya&apos;s</span>
          <br />
          <span className="text-secondary-foreground">Magical</span>{" "}
          <span className="text-accent-foreground bg-accent px-4 py-2 rounded-2xl inline-block mt-2">World</span>
        </h1>

        <p className="text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {"Welcome to Drishya Erelli's special place full of purple dreams, adventures, and lots of sparkles!"}
        </p>

        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => scrollTo("#about")}
            className="bg-primary text-primary-foreground px-8 py-4 rounded-full text-lg font-semibold hover:scale-105 transition-transform shadow-lg"
          >
            {"Let's Explore!"}
          </button>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("say-hello-open"))}
            className="bg-secondary text-secondary-foreground px-8 py-4 rounded-full text-lg font-semibold hover:scale-105 transition-transform shadow-lg border-2 border-secondary-foreground/20"
          >
            Say Hello 👋
          </button>
          <button
            onClick={() => scrollTo("#ai-widget")}
            className="bg-accent text-accent-foreground px-8 py-4 rounded-full text-lg font-semibold hover:scale-105 transition-transform shadow-lg"
          >
            ✨ Try AI
          </button>
        </div>
      </div>
    </section>
  )
}
