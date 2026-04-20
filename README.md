# AEI Labs — Advanced Economic Intelligence

Public website for **AEI Labs** (Advanced Economic Intelligence), a startup building **global spatial economic intelligence**: linking global trade and transport network models to national computable general equilibrium (CGE) and quantitative regional models, with hyper-local extrapolation and AI-assisted interfaces. The hero experience is an interactive 3D globe; inner pages present platform solutions, architecture, and a placeholder company section.

Contact: [contact@aeilabs.xyz](mailto:contact@aeilabs.xyz). The production site is intended for the [aeilabs.xyz](https://aeilabs.xyz) domain (see `vite.config.ts`).

![React](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Vite](https://img.shields.io/badge/Vite-5-purple) ![Three.js](https://img.shields.io/badge/Three.js-r160-black)

## What’s on the site

| Route | Content |
|-------|---------|
| `/` | Landing page: 3D globe (countries, ports, cities, maritime routes, trade arcs), hero copy on reenvisioning economic planning, CTAs to Solutions and Technology |
| `/solutions` | Five solution areas: trade and supply chains, infrastructure, hyper-local analytics (AETHER), industrial policy, regional development |
| `/technology` | Narrative and interactive flowchart of the integrated model stack (global trade model, CGE, regional models, transport, AETHER, AI) |
| `/company` | “Under construction” placeholder with animated network background |

## Tech stack

| Layer | Technology |
|-------|------------|
| **Framework** | React 18 + TypeScript 5 |
| **Build** | Vite 5 (SWC) |
| **3D** | Three.js, React Three Fiber, Drei |
| **Styling** | Tailwind CSS 3, shadcn/ui (Radix primitives) |
| **Animation** | Framer Motion |
| **Routing** | React Router v6 |
| **Data fetching** | TanStack React Query (e.g. GeoJSON for the globe) |
| **Testing** | Vitest, Testing Library; Playwright available as a dev dependency |
| **Linting** | ESLint 9, TypeScript ESLint |

GeoJSON served from `public/geodata/` is produced by a Node script (see below). Solution imagery and wallpapers live under `public/`.

## Prerequisites

- **Node.js** ≥ 18
- **npm**, **bun**, or **pnpm** (the repo includes Bun lockfiles)

## Getting started

```bash
git clone <your-repo-url>
cd AEILabs

npm install
# or: bun install

npm run dev
# or: bun dev
```

`predev` and `prebuild` run **`convert-geodata`**, which can refresh `public/geodata/*.geojson` from optional sources under `map_data/` (gitignored). If those sources are absent, the script skips conversion and the committed GeoJSON in `public/geodata/` is used.

The dev server listens on **http://localhost:8080** by default (`PORT` overrides the port).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Converts geodata if applicable, then starts Vite with HMR |
| `npm run build` | Converts geodata if applicable, then production build |
| `npm run build:dev` | Development-mode build |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |
| `npm run test` | Vitest (single run) |
| `npm run test:watch` | Vitest watch mode |
| `npm run convert-geodata` | Run `scripts/convert-geodata.mjs` only |

## Project structure

```
scripts/
  convert-geodata.mjs    # Shapefile/GPKG → public/geodata (optional map_data/)
public/
  geodata/               # Countries, ports, cities, maritime routes (GeoJSON)
  …                      # Images referenced by Solutions / Technology pages
src/
  components/
    Globe.tsx            # 3D globe, routes, labels
    HeroContent.tsx      # Landing hero and CTAs
    Navbar.tsx           # Nav + contact mailto
    TechFlowchart.tsx    # Technology page architecture diagram
    NetworkCanvas.tsx    # Company placeholder background
    ui/                  # shadcn/ui
  data/
    continents.ts        # Continent outlines for the globe
  hooks/
    useGeoData.ts        # Fetches GeoJSON bundles via React Query
  pages/
    Index.tsx
    Solutions.tsx
    Technology.tsx
    ComingSoon.tsx       # Used for /company
    NotFound.tsx
  utils/
    generateGlobeTexture.ts
  types/
    geo.ts
  index.css              # Design tokens, fonts
  App.tsx                # Routes
  main.tsx
```

## Design system

Tailwind with HSL CSS variables in `src/index.css`. Primary accent aligns with the globe and UI (kings blue family, e.g. `#4A7FD4`). Typography uses **Inter** and display headings via the configured font stack.

## Static hosting and SPA routes

`index.html` includes a small script to restore client-side routes when the host serves `404.html` for unknown paths (typical GitHub Pages–style setups). `vite.config.ts` sets `base: '/'` for deployment at the site root.
