# Reenvision — Interactive Globe Platform

An interactive 3D globe visualization built with React and Three.js, featuring realistic continent outlines rendered from Natural Earth GeoJSON data. The hero landing page invites users to *"Reenvision How Places Connect."*

![React](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Vite](https://img.shields.io/badge/Vite-5-purple) ![Three.js](https://img.shields.io/badge/Three.js-r160-black)
 
## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 18 + TypeScript 5 |
| **Build Tool** | Vite 5 (SWC) |
| **3D Rendering** | Three.js, React Three Fiber, Drei |
| **Styling** | Tailwind CSS 3, shadcn/ui (Radix primitives) |
| **Animation** | Framer Motion |
| **Routing** | React Router v6 |
| **State/Data** | TanStack React Query |
| **Testing** | Vitest, Testing Library, Playwright |
| **Linting** | ESLint 9, TypeScript ESLint |

## Prerequisites

- **Node.js** ≥ 18
- **npm**, **bun**, or **pnpm** (the project includes a bun lockfile)

## Getting Started

```bash
# Clone the repository
git clone <your-repo-url>
cd <project-directory>

# Install dependencies
npm install
# or
bun install

# Start the development server
npm run dev
# or
bun dev
```

The app will be available at **http://localhost:8080**.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Production build |
| `npm run build:dev` | Development build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run test` | Run unit tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |

## Project Structure

```
src/
├── components/
│   ├── Globe.tsx          # 3D globe with continent outlines
│   ├── HeroContent.tsx    # Hero section text and CTA
│   ├── Navbar.tsx         # Navigation bar
│   ├── NavLink.tsx        # Navigation link component
│   └── ui/                # shadcn/ui components (Radix-based)
├── data/
│   └── continents.ts      # GeoJSON-derived continent coordinates
├── hooks/                 # Custom React hooks
├── pages/
│   ├── Index.tsx          # Landing page
│   └── NotFound.tsx       # 404 page
├── lib/
│   └── utils.ts           # Utility functions (cn, etc.)
├── index.css              # Global styles, CSS variables, fonts
├── App.tsx                # App root with routing
└── main.tsx               # Entry point
```

## Design System

The project uses a custom design system built on Tailwind CSS with HSL-based CSS custom properties defined in `src/index.css`. The primary palette is a refined "kings blue" (`#4A7FD4`) with a dark background theme. Typography uses **Inter** via Google Fonts.

## License

MIT
