"use client"

import { useState, useEffect } from "react"
import { Camera, ImageIcon, X, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

interface GalleryItem {
  type: "image" | "placeholder"
  src?: string
  label: string
  bg: string
  emoji?: string
}

const galleryItems: GalleryItem[] = [
  { type: "image", label: "Dance Champion", bg: "bg-primary/20", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_2464-jYb43WYIBJBRUI20y1O2cQoZef8Z4i.jpeg" },
  { type: "image", label: "Dance Portrait", bg: "bg-secondary/30", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/e2a22fd2-f400-4cfd-8afc-aae4b68748f7.JPG-6DiTFnCTWI3bBqByv1QkULoH3ZZOrP.jpeg" },
  { type: "image", label: "Strike a Pose", bg: "bg-accent/30", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ffe2a7b8-b9ff-4ba9-9f15-8bed020410c8.JPG-jwTs7yXbdlHFa4UY7BGxeW099ZxSq8.jpeg" },
  { type: "image", label: "Pool Fun", bg: "bg-primary/20", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_7692-NRS8yVxdBPG6LaxkImzVHtCpNAPy1j.jpeg" },
  { type: "image", label: "Mountain Adventure", bg: "bg-secondary/30", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_0543-1uhFEsrt1G4fH3r8nEKbFxzCOxoUy9.jpg" },
  { type: "image", label: "Forest Fun", bg: "bg-accent/30", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_7680-kEqz1Bhbw0uyIQJm1EtsKSfkaLy5v6.jpeg" },
  { type: "image", label: "Slime Time", bg: "bg-primary/20", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_5739-hvXQfzjgBlUPu2HqrQxmNDGOBO82kK.jpeg" },
  { type: "image", label: "Crafty Sisters", bg: "bg-secondary/30", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_5742-HL0eQvV8jvbcyZ4SGJBAbMX4Bcimqf.jpeg" },
]

const imageItems = galleryItems.filter((i) => i.type === "image" && i.src)

export function GallerySection() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return
      if (e.key === "Escape") setLightboxIndex(null)
      if (e.key === "ArrowRight") setLightboxIndex((i) => (i! + 1) % imageItems.length)
      if (e.key === "ArrowLeft") setLightboxIndex((i) => (i! - 1 + imageItems.length) % imageItems.length)
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [lightboxIndex])

  useEffect(() => {
    document.body.style.overflow = lightboxIndex !== null ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [lightboxIndex])

  return (
    <section className="py-16 md:py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Camera className="w-8 h-8 text-primary" />
            <h2 className="text-4xl md:text-6xl font-bold text-foreground">
              My <span className="text-secondary-foreground">Photo Gallery</span>
            </h2>
            <ImageIcon className="w-8 h-8 text-primary" />
          </div>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
            Memories of my favorite moments! Click a photo to zoom in ✨
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {galleryItems.map((item, index) => (
            <div
              key={index}
              onClick={() => item.type === "image" && item.src ? setLightboxIndex(imageItems.indexOf(item)) : null}
              className={`${item.bg} rounded-3xl aspect-square flex flex-col items-center justify-center hover:scale-105 transition-transform cursor-pointer shadow-lg border-4 border-white/50 overflow-hidden relative group`}
            >
              {item.type === "image" && item.src ? (
                <>
                  <Image
                    src={item.src}
                    alt={item.label}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                    <span className="text-white font-semibold text-lg">{item.label}</span>
                  </div>
                </>
              ) : (
                <>
                  <span className="text-6xl md:text-8xl mb-2">{item.emoji}</span>
                  <span className="text-lg md:text-xl font-semibold text-foreground">{item.label}</span>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-6 py-3 rounded-full">
            <span className="text-lg font-medium text-foreground">So many wonderful memories!</span>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + imageItems.length) % imageItems.length) }}
            className="absolute left-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div
            className="relative max-w-4xl w-full max-h-[85vh] rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={imageItems[lightboxIndex].src!}
              alt={imageItems[lightboxIndex].label}
              width={1200}
              height={900}
              className="object-contain w-full h-full max-h-[85vh]"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent py-4 px-6">
              <p className="text-white font-semibold text-lg text-center">{imageItems[lightboxIndex].label}</p>
              <p className="text-white/60 text-sm text-center">{lightboxIndex + 1} / {imageItems.length}</p>
            </div>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % imageItems.length) }}
            className="absolute right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </section>
  )
}
