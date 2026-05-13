"use client"

import { Utensils, Tv, Music, Gamepad2 } from "lucide-react"

const favorites = [
  {
    icon: Utensils,
    label: "Favorite Food",
    value: "Noodles & Chicken 65",
    emoji: "🍜",
    bg: "bg-primary/20",
  },
  {
    icon: Tv,
    label: "Favorite Show",
    value: "K-pop Demon Hunters",
    emoji: "📺",
    bg: "bg-secondary/30",
  },
  {
    icon: Music,
    label: "Favorite Music",
    value: "Golden K-pop",
    emoji: "🎵",
    bg: "bg-accent/30",
  },
  {
    icon: Gamepad2,
    label: "Favorite Toy",
    value: "Plush Axolotl",
    emoji: "🧸",
    bg: "bg-primary/20",
  },
]

export function FavoritesSection() {
  return (
    <section className="py-16 md:py-24 px-4 bg-card/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            My <span className="text-primary">Favorites</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
            Things that make Drishya super happy!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {favorites.map((item, index) => {
            const Icon = item.icon
            return (
              <div
                key={index}
                className={`${item.bg} rounded-3xl p-6 text-center hover:scale-105 transition-transform shadow-lg border-4 border-white/50`}
              >
                <div className="text-5xl mb-3">{item.emoji}</div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Icon className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    {item.label}
                  </span>
                </div>
                <p className="text-xl font-bold text-foreground">{item.value}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
