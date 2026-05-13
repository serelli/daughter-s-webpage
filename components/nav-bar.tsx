"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Sparkles, Moon, Sun, Menu, X, Puzzle } from "lucide-react"
import { useTheme } from "next-themes"

const navLinks = [
  { label: "Home", href: "#hero" },
  { label: "About", href: "#about" },
  { label: "Activities", href: "#activities" },
  { label: "Favorites", href: "#favorites" },
  { label: "Gallery", href: "#gallery" },
  { label: "Fun Facts", href: "#fun-facts" },
]

export function NavBar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (href: string) => {
    setMenuOpen(false)
    const el = document.querySelector(href)
    el?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/90 backdrop-blur-md shadow-md border-b border-border/50"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => scrollToSection("#hero")}
          className="flex items-center gap-2 font-bold text-primary text-lg hover:opacity-80 transition-opacity"
        >
          <Sparkles className="w-5 h-5" />
          Drishya
        </button>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollToSection(link.href)}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => scrollToSection("#ai-widget")}
            className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            ✨ Try AI
          </button>
          <Link
            href="/puzzle"
            className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <Puzzle className="w-4 h-4" />
            Play Game
          </Link>
        </div>

        {/* Dark mode toggle + hamburger */}
        <div className="flex items-center gap-2">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          )}
          <button
            className="md:hidden p-2 rounded-full hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-md border-b border-border/50 px-4 py-4 flex flex-col gap-2">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollToSection(link.href)}
              className="text-left text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2 border-b border-border/30"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => scrollToSection("#ai-widget")}
            className="flex items-center gap-2 text-sm font-semibold text-primary py-2"
          >
            ✨ Try AI
          </button>
          <Link
            href="/puzzle"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 text-sm font-semibold text-primary py-2"
          >
            <Puzzle className="w-4 h-4" />
            Play Game 🧩
          </Link>
        </div>
      )}
    </nav>
  )
}
