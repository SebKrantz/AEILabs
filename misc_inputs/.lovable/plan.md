

## Plan: Refined Typography, Color Palette, and Globe with Continents

### 1. Typography -- Modern Corporate Fonts

Replace Space Grotesk + Inter with **Inter** for everything (Google's and many top companies' go-to) -- clean, neutral, modern. Use font weights to differentiate headings (600-700) from body (400).

**Files:** `src/index.css` (Google Fonts import), `tailwind.config.ts` (fontFamily)

- Import: `Inter:wght@300;400;500;600;700`
- Set both `display` and `body` to Inter (or use `display: ["Inter", ...]` with heavier weights for headings)

### 2. Color Palette -- Darker, More Formal Blue

Shift primary from bright cyan (`190 100% 50%` = `#00d4ff`) to a sophisticated steel/navy blue, something like `215 80% 55%` (~`#2E6FD1`) or even darker `220 70% 45%` (~`#2255A8`). This reads more McKinsey/Goldman than gaming.

**Files:** `src/index.css`

- `--primary`: `220 70% 50%` (refined blue, ~`#2666CC`)
- `--accent`: `220 60% 40%`
- `--glow-primary`: match primary
- `--ring`, sidebar primary: match
- Update gold secondary to a subtler warm tone: `38 70% 55%` (muted amber)

Also update hardcoded `#00d4ff` references in `Globe.tsx` and `Navbar.tsx` to the new blue (`#2666CC` or similar).

### 3. Globe -- Add Continent Outlines via GeoJSON

This is the biggest change. The current globe is a featureless dark sphere with a faint wireframe. To show continents:

- Fetch a simplified world GeoJSON (Natural Earth 110m land boundaries) -- embed the coordinate data as a static JSON import or inline a simplified version
- Create a `ContinentOutlines` component that converts GeoJSON polygon coordinates to `THREE.Line` segments on the globe surface using `latLonToVec3`
- Render continent boundaries as thin, subtle lines (the new blue at ~20-30% opacity) so the globe clearly shows landmasses without overwhelming the trade arcs
- Remove or reduce the wireframe grid overlay since continents provide geographic context

**Files:** `src/components/Globe.tsx`, new file `src/data/continents.ts` (simplified coordinate data)

### 4. Update Hardcoded Colors in Components

**Globe.tsx:**
- Trade arcs: change `#00d4ff` to new blue `#2666CC`
- Particles: same
- Atmosphere glow: same
- Wireframe: remove or make very subtle
- Point light color: match

**Navbar.tsx:**
- Background color inline style already uses CSS var, fine

**HeroContent.tsx:**
- Already uses Tailwind theme classes, will automatically pick up new palette

### Summary of Files Changed

| File | Change |
|------|--------|
| `src/index.css` | New font import, updated CSS vars for colors |
| `tailwind.config.ts` | Font family to Inter |
| `src/components/Globe.tsx` | Add continent outlines, update hardcoded colors, reduce wireframe |
| `src/data/continents.ts` | New file -- simplified world land boundary coordinates |

