# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Development server at localhost:8080 with HMR
npm run build        # Production build
npm run lint         # ESLint (flat config, v9)
npm run test         # Vitest unit tests
npm run test:watch   # Vitest watch mode
npm run preview      # Preview production build
```

## Architecture

This is a React + TypeScript SPA — a 3D globe visualization for "Global Spatial Economic Intelligence." Built with Vite + SWC.

**Entry point:** `src/main.tsx` → `src/App.tsx` (React Router v6) → `src/pages/Index.tsx`

### Core components

- **`src/components/Globe.tsx`** — The centerpiece. Uses React Three Fiber (r3f) + Three.js to render:
  - An animated Earth sphere with texture maps
  - Continent outlines from GeoJSON coordinates in `src/data/continents.ts`, rendered as `Line` components in 3D space
  - Trade arc splines (`CatmullRomCurve3` → `TubeGeometry`) between major economic cities
  - 400 flowing particles animated along trade routes each frame via `useFrame`
  - Economic node markers at major cities with amber highlights
  - Auto-rotation via clock delta; `OrbitControls` with restricted polar angles
  - `latLonToVec3(lat, lon, radius)` converts all geographic coordinates to 3D vectors

- **`src/components/HeroContent.tsx`** — Framer Motion animated headline/CTA overlaid on the globe canvas

- **`src/components/Navbar.tsx`** — Fixed top nav

- **`src/data/continents.ts`** — Static GeoJSON-derived lat/lon coordinate arrays for continent boundaries

### Styling

- Tailwind CSS v3 with a custom dark theme (`src/tailwind.config.ts`)
- CSS variables in `src/index.css` define the design tokens:
  - Background: very dark blue `hsl(228 50% 6%)`
  - Primary: `hsl(220 65% 55%)` (#4A7FD4)
  - Accent/amber: `hsl(38 70% 55%)` (#C8912E) — used for economic node highlights
- `src/lib/utils.ts` exports `cn()` (clsx + tailwind-merge)
- shadcn/ui components in `src/components/ui/` — Radix primitives, ~40 components available

### TypeScript config

`tsconfig.json` has lenient settings: `noImplicitAny: false`, `noUnusedLocals: false`, `skipLibCheck: true`. Path alias `@/` maps to `src/`.

### Key dependencies

| Purpose | Library |
|---|---|
| 3D rendering | Three.js 0.160, React Three Fiber 8, Drei 9 |
| Animation | Framer Motion 12 |
| State/data | TanStack Query 5 |
| Forms | React Hook Form 7 |
| Routing | React Router 6 |
