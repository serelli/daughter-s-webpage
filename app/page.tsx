import { NavBar } from "@/components/nav-bar"
import { HeroSection } from "@/components/hero-section"
import { AboutSection } from "@/components/about-section"
import { ActivitiesSection } from "@/components/activities-section"
import { FavoritesSection } from "@/components/favorites-section"
import { GallerySection } from "@/components/gallery-section"
import { FunFactsSection } from "@/components/fun-facts-section"
import { FooterSection } from "@/components/footer-section"
import { ScrollReveal } from "@/components/scroll-reveal"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <NavBar />
      <div id="hero"><HeroSection /></div>
      <ScrollReveal><div id="about"><AboutSection /></div></ScrollReveal>
      <ScrollReveal><div id="activities"><ActivitiesSection /></div></ScrollReveal>
      <ScrollReveal><div id="favorites"><FavoritesSection /></div></ScrollReveal>
      <ScrollReveal><div id="gallery"><GallerySection /></div></ScrollReveal>
      <ScrollReveal><div id="fun-facts"><FunFactsSection /></div></ScrollReveal>
      <FooterSection />
    </main>
  )
}
