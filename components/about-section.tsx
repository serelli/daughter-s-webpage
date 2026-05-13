"use client"

import { Heart, Music, Palette, BookOpen, Cat, Flower2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const favorites = [
  {
    icon: Heart,
    title: "Favorite Color",
    description: "Purple and lavender - the prettiest colors ever!",
    color: "bg-primary/20 text-primary",
  },
  {
    icon: Music,
    title: "I Love to Dance",
    description: "Dancing makes me feel free and happy!",
    color: "bg-secondary/30 text-secondary-foreground",
  },
  {
    icon: Palette,
    title: "I Create",
    description: "Beautiful drawings and colorful crafts!",
    color: "bg-accent/30 text-accent-foreground",
  },
  {
    icon: BookOpen,
    title: "I Read",
    description: "Fairy tales and adventure stories!",
    color: "bg-primary/20 text-primary",
  },
  {
    icon: Cat,
    title: "Gymnastics",
    description: "Flips and cartwheels at Ascend Gymnastics!",
    color: "bg-secondary/30 text-secondary-foreground",
  },
  {
    icon: Flower2,
    title: "Swimming",
    description: "Splashing and swimming is so much fun!",
    color: "bg-accent/30 text-accent-foreground",
  },
]

export function AboutSection() {
  return (
    <section className="py-16 md:py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            All About <span className="text-primary">Drishya!</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
            {"Here are some of my favorite things that make me happy!"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((item, index) => (
            <Card
              key={index}
              className="group hover:scale-105 transition-all duration-300 cursor-pointer border-2 border-border/50 shadow-lg hover:shadow-xl"
            >
              <CardContent className="p-6 text-center">
                <div
                  className={`w-16 h-16 rounded-full ${item.color} flex items-center justify-center mx-auto mb-4 group-hover:animate-bounce`}
                >
                  <item.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
