"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, Shuffle } from "lucide-react"

// ── Data ────────────────────────────────────────────────────────────────────

const HAIR = [
  { id: "pigtails", label: "Pigtails",    emoji: "👧",   accent: "#f9a8d4" },
  { id: "long",     label: "Long Dark",   emoji: "👩",   accent: "#a78bfa" },
  { id: "curly",    label: "Curly",       emoji: "👩‍🦱", accent: "#fb923c" },
  { id: "silver",   label: "K-pop Silver",emoji: "👩‍🦳", accent: "#c4b5fd" },
  { id: "red",      label: "Fiery Red",   emoji: "👩‍🦰", accent: "#f87171" },
]

const OUTFITS = [
  { id: "dance",     label: "Dance Queen",  emoji: "💃",  bg: "linear-gradient(135deg,#f9a8d4,#ec4899)",   badge: "💖" },
  { id: "softgirl",  label: "Soft Girl",    emoji: "🌸",  bg: "linear-gradient(135deg,#fda4af,#c084fc)",   badge: "🌸" },
  { id: "kpop",      label: "K-pop Star",   emoji: "🎤",  bg: "linear-gradient(135deg,#a78bfa,#6366f1)",   badge: "⭐" },
  { id: "butterfly", label: "Butterfly",    emoji: "🦋",  bg: "linear-gradient(135deg,#67e8f9,#60a5fa)",   badge: "🦋" },
  { id: "rainbow",   label: "Rainbow",      emoji: "🌈",  bg: "linear-gradient(135deg,#fde68a,#f9a8d4)",   badge: "🌈" },
  { id: "coolgirl",  label: "Cool Girl",    emoji: "😎",  bg: "linear-gradient(135deg,#4b5563,#7c3aed)",   badge: "🖤" },
]

const SHOES = [
  { id: "sneakers",  label: "Sneakers",   emoji: "👟" },
  { id: "boots",     label: "Boots",      emoji: "👢" },
  { id: "heels",     label: "Heels",      emoji: "👠" },
  { id: "sandals",   label: "Sandals",    emoji: "🩴" },
  { id: "ballerina", label: "Ballerina",  emoji: "🩰" },
]

const ACCESSORIES = [
  { id: "none",     label: "None",       emoji: "" },
  { id: "crown",    label: "Crown",      emoji: "👑" },
  { id: "bow",      label: "Hair Bow",   emoji: "🎀" },
  { id: "shades",   label: "Sunglasses", emoji: "🕶️" },
  { id: "necklace", label: "Necklace",   emoji: "💎" },
  { id: "bag",      label: "Cute Bag",   emoji: "👜" },
]

const STAGES = [
  { id: "spring",   label: "Spring",     bg: "linear-gradient(180deg,#fce7f3,#fbcfe8,#f9a8d4)", emoji: "🌸" },
  { id: "glitter",  label: "Glitter",    bg: "linear-gradient(180deg,#ede9fe,#ddd6fe,#a78bfa)", emoji: "✨" },
  { id: "night",    label: "Night Show", bg: "linear-gradient(180deg,#1e1b4b,#312e81,#1e3a8a)", emoji: "🌙" },
  { id: "tropical", label: "Tropical",   bg: "linear-gradient(180deg,#a7f3d0,#6ee7b7,#34d399)", emoji: "🌺" },
  { id: "rainbow",  label: "Rainbow",    bg: "linear-gradient(180deg,#fef9c3,#fce7f3,#ede9fe)", emoji: "🌈" },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function randIdx(len: number) { return Math.floor(Math.random() * len) }

// ── Component ────────────────────────────────────────────────────────────────

export default function DressUpPage() {
  // Store indices — guarantees React sees a change even when same item picked
  const [hairIdx,  setHairIdx]  = useState(0)
  const [outfitIdx,setOutfitIdx]= useState(0)
  const [shoesIdx, setShoesIdx] = useState(4)  // ballerina
  const [accIdx,   setAccIdx]   = useState(1)  // crown
  const [stageIdx, setStageIdx] = useState(0)
  const [flash,    setFlash]    = useState(false)

  const hair      = HAIR[hairIdx]
  const outfit    = OUTFITS[outfitIdx]
  const shoes     = SHOES[shoesIdx]
  const accessory = ACCESSORIES[accIdx]
  const stage     = STAGES[stageIdx]

  const randomize = useCallback(() => {
    // Pick indices guaranteed to differ from current where possible
    const newHair  = (hairIdx  + 1 + randIdx(HAIR.length  - 1)) % HAIR.length
    const newOut   = (outfitIdx+ 1 + randIdx(OUTFITS.length-1)) % OUTFITS.length
    const newShoes = (shoesIdx + 1 + randIdx(SHOES.length - 1)) % SHOES.length
    const newAcc   = (accIdx   + 1 + randIdx(ACCESSORIES.length-1)) % ACCESSORIES.length
    const newStage = (stageIdx + 1 + randIdx(STAGES.length - 1)) % STAGES.length

    setHairIdx(newHair)
    setOutfitIdx(newOut)
    setShoesIdx(newShoes)
    setAccIdx(newAcc)
    setStageIdx(newStage)

    setFlash(true)
    setTimeout(() => setFlash(false), 500)
  }, [hairIdx, outfitIdx, shoesIdx, accIdx, stageIdx])

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border/50 px-4 h-14 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />Back
        </Link>
        <div className="flex-1 text-center">
          <span className="font-bold text-primary text-base">✨ K-pop Star Dress-Up</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row gap-6 px-4 py-6 max-w-5xl mx-auto w-full">

        {/* ── Character Stage ── */}
        <div className="flex flex-col items-center gap-4 lg:sticky lg:top-20 lg:h-fit">
          {/* Stage card */}
          <div
            className="relative w-56 h-72 rounded-3xl shadow-2xl flex flex-col items-center justify-center gap-1 overflow-hidden"
            style={{
              background: stage.bg,
              transition: "background 0.4s ease",
              outline: flash ? "4px solid oklch(0.7 0.18 300)" : "none",
            }}
          >
            {/* Stage deco */}
            <div className="absolute top-2 left-3 text-xl opacity-40">{stage.emoji}</div>
            <div className="absolute top-2 right-3 text-xl opacity-40">{stage.emoji}</div>
            <div className="absolute bottom-10 left-2 text-lg opacity-25">{stage.emoji}</div>
            <div className="absolute bottom-10 right-2 text-lg opacity-25">{stage.emoji}</div>

            {/* Flash ring */}
            {flash && (
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{ boxShadow: "0 0 0 6px oklch(0.7 0.18 300 / 0.5)", animation: "none" }}
              />
            )}

            {/* Character */}
            <div
              className="flex flex-col items-center pointer-events-none"
              style={{ transition: "all 0.2s ease" }}
            >
              <div className="text-3xl h-9 flex items-center justify-center">
                {accessory.emoji}
              </div>
              <div className="text-7xl leading-none">{hair.emoji}</div>
              <div className="text-5xl mt-1">{outfit.emoji}</div>
              <div className="text-3xl mt-1">{shoes.emoji}</div>
            </div>

            {/* Outfit badge */}
            <div
              className="absolute bottom-3 right-3 text-lg rounded-full w-8 h-8 flex items-center justify-center backdrop-blur-sm"
              style={{ background: "rgba(255,255,255,0.35)" }}
            >
              {outfit.badge}
            </div>
          </div>

          {/* Look label */}
          <div className="text-center">
            <p className="font-bold text-lg text-primary">{outfit.label}</p>
            <p className="text-xs text-muted-foreground">{stage.label} Stage · {shoes.label}</p>
          </div>

          {/* Surprise Me button */}
          <button
            onClick={randomize}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm shadow-lg hover:opacity-90 active:scale-95 transition-all"
          >
            <Shuffle className="w-4 h-4" />
            Surprise Me!
          </button>
        </div>

        {/* ── Selectors ── */}
        <div className="flex-1 flex flex-col gap-5">

          <Section title="💇 Hair Style">
            {HAIR.map((h, i) => (
              <PickerChip key={h.id} active={hairIdx === i} onClick={() => setHairIdx(i)} emoji={h.emoji} label={h.label} />
            ))}
          </Section>

          <Section title="👗 Outfit">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 w-full">
              {OUTFITS.map((o, i) => (
                <button
                  key={o.id}
                  onClick={() => setOutfitIdx(i)}
                  className={`flex flex-col items-center gap-1 py-3 rounded-2xl border-2 transition-all
                    ${outfitIdx === i
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

          <Section title="👟 Shoes">
            {SHOES.map((s, i) => (
              <PickerChip key={s.id} active={shoesIdx === i} onClick={() => setShoesIdx(i)} emoji={s.emoji} label={s.label} />
            ))}
          </Section>

          <Section title="✨ Accessory">
            {ACCESSORIES.map((a, i) => (
              <PickerChip key={a.id} active={accIdx === i} onClick={() => setAccIdx(i)} emoji={a.emoji || "🚫"} label={a.label} />
            ))}
          </Section>

          <Section title="🎤 Stage Theme">
            {STAGES.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setStageIdx(i)}
                className={`flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-2xl border-2 transition-all
                  ${stageIdx === i
                    ? "border-primary bg-primary/10 scale-105 shadow-md"
                    : "border-border/40 bg-muted/40 hover:border-primary/50"
                  }`}
              >
                <div
                  className="w-8 h-8 rounded-full shadow-inner flex items-center justify-center text-base"
                  style={{ background: s.bg }}
                >
                  {s.emoji}
                </div>
                <span className="text-[11px] font-semibold text-muted-foreground">{s.label}</span>
              </button>
            ))}
          </Section>

          <div className="text-center text-xs text-muted-foreground bg-muted/40 rounded-2xl px-5 py-3 leading-relaxed">
            <p className="font-semibold text-foreground mb-1">How to Play 👗</p>
            Pick your hair, outfit, shoes, accessory and stage. Hit <strong>Surprise Me!</strong> for a random look! ✨
          </div>
        </div>
      </main>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-bold text-foreground mb-2">{title}</h2>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function PickerChip({ active, onClick, emoji, label }: {
  active: boolean; onClick: () => void; emoji: string; label: string
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
