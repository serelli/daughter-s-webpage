"use client"

import { Card, CardContent } from "@/components/ui/card"

const activities = [
  {
    title: "Dance",
    description: "I love dancing and expressing myself through movement!",
    icon: "💃",
    classes: "Dance Classes",
    bg: "bg-primary/20",
  },
  {
    title: "Swimming",
    description: "Splashing in the water is so much fun!",
    icon: "🏊‍♀️",
    classes: null,
    bg: "bg-secondary/30",
  },
  {
    title: "Gymnastics",
    description: "Flips, cartwheels, and tumbling are my favorites!",
    icon: "🤸‍♀️",
    classes: "Ascend Gymnastics",
    bg: "bg-accent/30",
  },
]

export function ActivitiesSection() {
  return (
    <section className="py-16 md:py-24 px-4 bg-card/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            My <span className="text-primary">Activities</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
            I love staying active and trying new things!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activities.map((activity, index) => (
            <Card
              key={index}
              className="group hover:scale-105 transition-all duration-300 border-2 border-border/50 shadow-lg hover:shadow-xl overflow-hidden"
            >
              <div className={`${activity.bg} py-8 flex items-center justify-center`}>
                <span className="text-7xl group-hover:animate-bounce">{activity.icon}</span>
              </div>
              <CardContent className="p-6 text-center">
                <h3 className="text-2xl font-bold text-foreground mb-2">{activity.title}</h3>
                <p className="text-muted-foreground mb-3">{activity.description}</p>
                {activity.classes && (
                  <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                    <span className="text-sm font-medium text-primary">{activity.classes}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
