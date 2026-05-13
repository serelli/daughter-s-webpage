import { HeroSection } from "@/components/hero-section"
import { AboutSection } from "@/components/about-section"
import { ActivitiesSection } from "@/components/activities-section"
import { FavoritesSection } from "@/components/favorites-section"
import { GallerySection } from "@/components/gallery-section"
import { FunFactsSection } from "@/components/fun-facts-section"
import { FooterSection } from "@/components/footer-section"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <AboutSection />
      <ActivitiesSection />
      <FavoritesSection />
      <GallerySection />
      <FunFactsSection />
      <FooterSection />
    </main>
  )
}
