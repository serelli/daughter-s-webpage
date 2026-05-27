"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Shuffle, Download } from "lucide-react"

// ── Data ────────────────────────────────────────────────────────────────────

const HAIR = [
  { id: "pigtails",  label: "Pigtails",     emoji: "👧",   top: "🎀" },
  { id: "long",      label: "Long Dark",     emoji: "👩",   top: "🖤" },
  { id: "curly",     label: "Curly",         emoji: "👩‍🦱", top: "🌀" },
  { id: "silver",    label: "K-pop Silver",  emoji: "👩‍🦳", top: "⭐" },
  { id: "red",       label: "Fiery Red",     emoji: "👩‍🦰", top: "🔥" },
]

const OUTFITS = [
  { id: "dance",    label: "Dance Queen",   emoji: "💃",  color: "from-pink-400 to-pink-600",    badge: "💖" },
  { id: "softgirl", label: "Soft Girl",     emoji: "🌸",  color: "from-rose-300 to-purple-400",  badge: "🌸" },
  { id: "kpop",     label: "K-pop Star",    emoji: "🎤",  color: "from-violet-400 to-indigo-500",badge: "⭐" },
  { id: "butterfly",label: "Butterfly",     emoji: "🦋",  color: "from-cyan-300 to-blue-400",    badge: "🦋" },
  { id: "rainbow",  label: "Rainbow",       emoji: "🌈",  color: "from-yellow-300 to-pink-400",  badge: "🌈" },
  { id: "coolgirl", label: "Cool Girl",     emoji: "😎",  color: "from-gray-700 to-purple-700",  badge: "🖤" },
]

const SHOES = [
  { id: "sneakers",  label: "Sneakers",    emoji: "👟" },
  { id: "boots",     label: "Boots",       emoji: "👢" },
  { id: "heels",     label: "Heels",       emoji: "👠" },
  { id: "sandals",   label: "Sandals",     emoji: "🩴" },
  { id: "ballerina", label: "Ballerina",   emoji: "🩰" },
]

const ACCESSORIES = [
  { id: "none",    label: "None",       emoji: "" },
  { id: "crown",   label: "Crown",      emoji: "👑" },
  { id: "bow",     label: "Hair Bow",   emoji: "🎀" },
  { id: "shades",  label: "Sunglasses", emoji: "🕶️" },
  { id: "necklace",label: "Necklace",   emoji: "💎" },
  { id: "bag",     label: "Cute Bag",   emoji: "👜" },
]

const STAGES = [
  { id: "spring",   label: "Spring",     bg: "from-pink-200 via-rose-100 to-pink-300",    emoji: "🌸" },
  { id: "glitter",  label: "Glitter",    bg: "from-purple-300 via-violet-200 to-indigo-300", emoji: "✨" },
  { id: "night",    label: "Night Show", bg: "from-indigo-900 via-purple-900 to-blue-900",emoji: "🌙" },
  { id: "tropical", label: "Tropical",   bg: "from-green-300 via-teal-200 to-cyan-300",   emoji: "🌺" },
  { id: "rainbow",  label: "Rainbow",    bg: "from-yellow-200 via-pink-200 to-purple-200", emoji: "🌈" },
]

// ── Random helper ────────────────────────────────────────────────────────────

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ── Component ────────────────────────────────────────────────────────────────

export default function DressUpPage() {
  const [hair,      setHair]      = useState(HAIR[0])
  const [outfit,    setOutfit]    = useState(OUTFITS[0])
  const [shoes,     setShoes]     = useState(SHOES[4])        // ballerina default
  const [accessory, setAccessory] = useState(ACCESSORIES[1])  // crown default
  const [stage,     setStage]     = useState(STAGES[0])
  const [sparkle,   setSparkle]   = useState(false)

  const randomize = () => {
    setHair(randomPick(HAIR))
    setOutfit(randomPick(OUTFITS))
    setShoes(randomPick(SHOES))
    setAccessory(randomPick(ACCESSORIES))
    setStage(randomPick(STAGES))
    // flash sparkle effect
    setSparkle(true)
    setTimeout(() => setSparkle(false), 600)
  }

  const isNight = stage.id === "night"
  const textColor = isNight ? "text-white" : "text-foreground"
  const mutedColor = isNight ? "text-white/70" : "text-muted-foreground"

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border/50 px-4 h-14 flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <div className="flex-1 text-center">
          <span className="font-bold text-primary text-base">✨ K-pop Star Dress-Up</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row gap-6 px-4 py-6 max-w-5xl mx-auto w-full">

        {/* ── Character Stage ── */}
        <div className="flex flex-col items-center gap-4 lg:sticky lg:top-20 lg:h-fit">
          {/* Stage */}
          <div
            className={`relative w-56 h-72 rounded-3xl bg-gradient-to-b ${stage.bg} shadow-2xl flex flex-col items-center justify-center gap-1 overflow-hidden transition-all duration-500 ${sparkle ? "scale-105" : ""}`}
          >
            {/* Sparkle burst */}
            {sparkle && (
              <div className="absolute inset-0 flex items-center justify-center text-4xl animate-ping pointer-events-none">
                ✨
              </div>
            )}

            {/* Stage emoji deco */}
            <div className="absolute top-2 left-3 text-xl opacity-50">{stage.emoji}</div>
            <div className="absolute top-2 right-3 text-xl opacity-50">{stage.emoji}</div>
            <div className="absolute bottom-10 left-2 text-lg opacity-30">{stage.emoji}</div>
            <div className="absolute bottom-10 right-2 text-lg opacity-30">{stage.emoji}</div>

            {/* Character stack */}
            <div className="flex flex-col items-center select-none pointer-events-none">
              {/* Accessory above head */}
              <div className="text-3xl h-8 flex items-center justify-center">
                {accessory.emoji}
              </div>
              {/* Face */}
              <div className="text-7xl leading-none">{hair.emoji}</div>
              {/* Outfit */}
              <div className="text-5xl mt-1">{outfit.emoji}</div>
              {/* Shoes */}
              <div className="text-3xl mt-1">{shoes.emoji}</div>
            </div>

            {/* Outfit badge */}
            <div className="absolute bottom-3 right-3 text-lg bg-white/30 rounded-full w-8 h-8 flex items-center justify-center backdrop-blur-sm">
              {outfit.badge}
            </div>
          </div>

          {/* Look name */}
          <div className="text-center">
            <p className="font-bold text-lg text-primary">{outfit.label} {hair.id === "silver" ? "✨" : ""}</p>
            <p className="text-xs text-muted-foreground">{stage.label} Stage · {shoes.label}</p>
          </div>

          {/* Randomize button */}
          <button
            onClick={randomize}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 active:scale-95 transition-all shadow-lg"
          >
            <Shuffle className="w-4 h-4" />
            Surprise Me!
          </button>
        </div>

        {/* ── Selectors Panel ── */}
        <div className="flex-1 flex flex-col gap-5">

          {/* Hair */}
          <Section title="💇 Hair Style">
            {HAIR.map((h) => (
              <PickerChip
                key={h.id}
                active={hair.id === h.id}
                onClick={() => setHair(h)}
                emoji={h.emoji}
                label={h.label}
              />
            ))}
          </Section>

          {/* Outfit */}
          <Section title="👗 Outfit">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 w-full">
              {OUTFITS.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setOutfit(o)}
                  className={`flex flex-col items-center gap-1 py-3 rounded-2xl border-2 transition-all
                    ${outfit.id === o.id
                      ? "border-primary bg-primary/10 scale-105 shadow-md"
                      : "border-border/40 bg-muted/40 hover:border-primary/50 hover:bg-primary/5"
                    }`}
                >
                  <span className="text-3xl">{o.emoji}</span>
                  <span className="text-[10px] font-semibold text-muted-foreground leading-tight text-center px-1">{o.label}</span>
                </button>
              ))}
            </div>
          </Section>

          {/* Shoes */}
          <Section title="👟 Shoes">
            {SHOES.map((s) => (
              <PickerChip
                key={s.id}
                active={shoes.id === s.id}
                onClick={() => setShoes(s)}
                emoji={s.emoji}
                label={s.label}
              />
            ))}
          </Section>

          {/* Accessory */}
          <Section title="✨ Accessory">
            {ACCESSORIES.map((a) => (
              <PickerChip
                key={a.id}
                active={accessory.id === a.id}
                onClick={() => setAccessory(a)}
                emoji={a.emoji || "🚫"}
                label={a.label}
              />
            ))}
          </Section>

          {/* Stage */}
          <Section title="🎤 Stage Theme">
            {STAGES.map((s) => (
              <button
                key={s.id}
                onClick={() => setStage(s)}
                className={`flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-2xl border-2 transition-all
                  ${stage.id === s.id
                    ? "border-primary bg-primary/10 scale-105 shadow-md"
                    : "border-border/40 bg-muted/40 hover:border-primary/50"
                  }`}
              >
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${s.bg} shadow-inner flex items-center justify-center text-base`}>
                  {s.emoji}
                </div>
                <span className="text-[11px] font-semibold text-muted-foreground">{s.label}</span>
              </button>
            ))}
          </Section>

          {/* How to play */}
          <div className="text-center text-xs text-muted-foreground bg-muted/40 rounded-2xl px-5 py-3 leading-relaxed">
            <p className="font-semibold text-foreground mb-1">How to Play 👗</p>
            Pick your hair, outfit, shoes, accessory and stage to create your perfect K-pop star look! Hit <strong>Surprise Me!</strong> for a random outfit. ✨
          </div>
        </div>
      </main>
    </div>
  )
}

// ── Sub-components ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-bold text-foreground mb-2">{title}</h2>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function PickerChip({
  active, onClick, emoji, label,
}: {
  active: boolean
  onClick: () => void
  emoji: string
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-full border-2 text-sm font-medium transition-all
        ${active
          ? "border-primary bg-primary/10 text-primary scale-105 shadow-sm"
          : "border-border/40 bg-muted/40 text-muted-foreground hover:border-primary/50 hover:bg-primary/5"
        }`}
    >
      <span className="text-lg leading-none">{emoji}</span>
      <span>{label}</span>
    </button>
  )
}
