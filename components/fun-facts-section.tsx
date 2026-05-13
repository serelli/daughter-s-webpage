"use client"

import { Cake, GraduationCap, Smile, Sparkles, BookOpen, Calculator } from "lucide-react"

const facts = [
  {
    icon: Cake,
    label: "Age",
    value: "7 years old!",
    emoji: "🎂",
  },
  {
    icon: GraduationCap,
    label: "Grade",
    value: "1st Grade",
    emoji: "🎒",
  },
  {
    icon: Smile,
    label: "Best Friend",
    value: "Ava",
    emoji: "👯",
  },
  {
    icon: Sparkles,
    label: "Superpower",
    value: "Making people smile!",
    emoji: "💫",
  },
  {
    icon: BookOpen,
    label: "Loves",
    value: "Reading",
    emoji: "📚",
  },
  {
    icon: Calculator,
    label: "Also Loves",
    value: "Complex Math!",
    emoji: "🧮",
  },
]

export function FunFactsSection() {
  return (
    <section className="py-16 md:py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            Fun <span className="text-accent-foreground bg-accent px-4 py-1 rounded-xl">Facts!</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {facts.map((fact, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-6 text-center shadow-lg border-2 border-border/50 hover:border-primary/50 transition-colors"
            >
              <span className="text-4xl mb-3 block">{fact.emoji}</span>
              <div className="flex items-center justify-center gap-2 mb-2">
                <fact.icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{fact.label}</span>
              </div>
              <p className="text-lg font-bold text-foreground">{fact.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
