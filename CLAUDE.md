# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Use `pnpm` as the package manager.

```bash
pnpm dev      # Start development server
pnpm build    # Production build
pnpm start    # Start production server
pnpm lint     # Lint with ESLint
```

## Architecture

This is a **Next.js 15 App Router** single-page portfolio website. The homepage (`app/page.tsx`) renders seven section components sequentially — no routing, no API routes.

**Component layout:**
- `components/` — Section components (`hero-section`, `about-section`, `activities-section`, `favorites-section`, `gallery-section`, `fun-facts-section`, `footer-section`) plus `theme-provider.tsx`
- `components/ui/` — Shadcn/ui components (pre-installed; most are unused by current design)
- `lib/utils.ts` — `cn()` helper for merging Tailwind class names
- `hooks/` — `use-mobile.ts` and `use-toast.ts`

**Styling:** Tailwind CSS 4 with OKLCH CSS variables for light/dark theming, defined in `app/globals.css`. Custom animations (bounce, float, stars) live in the section components as inline Tailwind utilities.

**Images:** Gallery photos are hosted on Vercel Blob (`hebbkx1anhila5yf.public.blob.vercel-storage.com`). Image optimization is disabled in `next.config.mjs` (`unoptimized: true`).

**TypeScript errors are suppressed** during builds (`ignoreBuildErrors: true` in `next.config.mjs`), so type errors won't block `pnpm build`.

**Path alias:** `@/*` maps to the project root (e.g., `@/components/ui/button`).
