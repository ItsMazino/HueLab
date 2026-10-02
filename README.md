# HueLab

A browser-only color studio for building five-color palettes, testing text contrast, and exporting reusable CSS variables. HueLab combines a warm editorial interface with real color calculations, a live composition preview, and a locally saved palette collection.

**Live demo:** [Try HueLab](https://hue-lab-theta.vercel.app)

**Repository:** [ItsMazino/HueLab](https://github.com/ItsMazino/HueLab)

## Table of Contents

1. [Product Overview](#product-overview)
2. [Core Features](#core-features)
3. [Technology Stack](#technology-stack)
4. [Architecture](#architecture)
5. [Color Generation](#color-generation)
6. [Contrast Calculations](#contrast-calculations)
7. [State and Persistence](#state-and-persistence)
8. [CSS Export](#css-export)
9. [Project Structure](#project-structure)
10. [Local Development](#local-development)
11. [Scripts and Verification](#scripts-and-verification)
12. [Deployment](#deployment)
13. [Accessibility and Responsive Design](#accessibility-and-responsive-design)
14. [Performance and Privacy](#performance-and-privacy)
15. [Limitations and Troubleshooting](#limitations-and-troubleshooting)

## Product Overview

HueLab is a compact creative tool for exploring color combinations before using them in a website, identity, or interface. The working screen includes a palette editor, a live design preview, contrast controls, preset palettes, and a saved collection.

A typical workflow:

1. Start with a curated palette or generate a new combination.
2. Lock colors you want to preserve while regenerating the others.
3. Edit individual colors through the hex fields or native color picker.
4. Compare text/background pairs in the contrast panel.
5. Save a favorite or export its five CSS variables.

Everything runs in the browser. There are no accounts, server routes, databases, API keys, or color-service requests.

## Core Features

| Feature | Behavior |
| --- | --- |
| Five-color editor | Each swatch supports a six-digit hex field and a native color picker. |
| Palette generation | Builds a coordinated palette from related hue offsets and varied lightness. |
| Color locks | Locked swatches survive generation; an all-locked palette displays a helpful notice. |
| Undo | Restores up to 40 previous palette/name snapshots. |
| Curated presets | Terracotta afternoon, Sunday by the sea, After hours, and Market flowers. |
| Live preview | Applies the palette to an editorial composition using CSS custom properties. |
| Contrast checker | Reports the ratio and AA/AAA pass status for normal text. |
| Saved collection | Stores up to 30 unique palettes; saved entries can be loaded or removed. |
| CSS download | Exports the current palette as `huelab-palette.css`. |
| Responsive layout | Adapts the editor, preview, and collection for desktop, tablet, and mobile. |

## Technology Stack

| Layer | Technology |
| --- | --- |
| Markup | Semantic HTML5 |
| Application logic | Vanilla JavaScript with ES modules |
| Styling | CSS Grid, Flexbox, media queries, custom properties |
| Development and bundling | Vite 7; exact resolved version in `package-lock.json` |
| Persistence | Browser localStorage |
| Downloads | Blob, object URLs, and a temporary download link |
| Tests | Built-in Node.js test runner and strict assertions |
| Typography | DM Sans and Libre Caslon Display, with fallback fonts |
| Hosting | Static deployment on Vercel |

There are no runtime package dependencies. Vite is the only direct development dependency. The npm `private` flag prevents accidental package publication; it does not control GitHub repository visibility.

## Architecture

```text
index.html
  -> src/main.js      DOM events, state, rendering, storage, downloads
       -> color.js   Pure generation, luminance, contrast, export helpers
  -> src/style.css   Layout, design tokens, typography, responsive states
```

The application has one page at `/`. Interaction updates the existing page rather than navigating to server-backed routes. Color logic is separated from DOM code so it can be tested without a browser.

## Color Generation

`generateColors()` selects a base hue and uses hue offsets of 0, 20, 35, 165, and 180 degrees. Each position has its own target lightness, while saturation varies within a bounded range. `hslToHex()` converts the resulting HSL values to uppercase six-digit hex colors.

Generation checks the lock array before changing a swatch. Loading a preset or saved palette clears the locks. Manual edits accept `#RRGGBB` values, and invalid edits are rejected with a message.

This is a lightweight generative heuristic, not a guarantee that every generated pair has sufficient contrast. The contrast panel is there to evaluate the pairs you intend to use.

## Contrast Calculations

The calculator linearizes each sRGB channel and computes relative luminance:

```text
linear channel = channel / 12.92                         if channel <= 0.04045
linear channel = ((channel + 0.055) / 1.055) ^ 2.4       otherwise
luminance = 0.2126 R + 0.7152 G + 0.0722 B
contrast = (lighter luminance + 0.05) / (darker luminance + 0.05)
```

Channels are normalized to 0–1 before linearization. Ratios range from 1:1 for identical colors to 21:1 for black against white.

| Check | Minimum ratio |
| --- | --- |
| AA, normal text | 4.5:1 |
| AAA, normal text | 7:1 |
| AA, large text | 3:1; mentioned in the interface as a reference |

The displayed pass/fail badges evaluate normal text using the unrounded ratio. The visible ratio is rounded to two decimal places. These checks cover color contrast only, not the full accessibility of a page.

## State and Persistence

| State | Persisted? |
| --- | --- |
| Current palette and its name | No |
| Lock selections | No |
| Undo history | No |
| Saved palette collection | Yes |
| Selected contrast pair | No |

The collection uses the `huelab-v1` localStorage key:

```json
[
  {
    "name": "Terracotta afternoon",
    "colors": ["#34483E", "#A4B494", "#F2E8CF", "#DE9E73", "#C45C3D"]
  }
]
```

Stored entries are checked for a string name and exactly five valid hex colors. Invalid entries are skipped, and the restored collection is limited to 30 palettes. Identical color sequences cannot be saved twice. If storage is blocked or full, the collection remains available in memory for the current session and the app displays a notice.

Data stays in the current browser and origin. Localhost, preview deployments, and the production domain each have separate collections. Clearing browser data removes saved palettes.

## CSS Export

The download reflects the current palette:

```css
:root {
  --color-1: #34483E;
  --color-2: #A4B494;
  --color-3: #F2E8CF;
  --color-4: #DE9E73;
  --color-5: #C45C3D;
}
```

Export creates a CSS Blob, triggers a browser download, and revokes the temporary object URL afterward. There is no upload or export service.

## Project Structure

```text
.github/workflows/ci.yml   GitHub Actions: install, test, build
src/
  color.js                Pure color and export helpers
  main.js                 UI state and interactions
  style.css               Visual system and responsive layout
tests/
  color.test.js           Contrast, generation-lock, and export tests
.gitignore                Excludes dependencies, builds, local configuration
.vercelignore             Omits development-only deployment files
index.html                Application shell
package.json              Scripts and dependencies
package-lock.json         Reproducible dependency versions
vercel.json               Static Vite deployment configuration
README.md                 Project documentation
```

## Local Development

Use Node.js 22.12+ and npm. No environment file is required.

```bash
git clone https://github.com/ItsMazino/HueLab.git
cd HueLab
npm ci
npm run dev
```

Open the local URL printed by Vite. To choose a port:

```bash
npm run dev -- --port 5173
```

## Scripts and Verification

| Command | Purpose |
| --- | --- |
| `npm run dev` | Starts the Vite development server. |
| `npm test` | Runs the pure-function tests with Node.js. |
| `npm run build` | Generates the static production site in `dist/`. |
| `npm run preview` | Serves the generated build for local review. |

The test suite checks reference contrast values, contrast symmetry, locked-color preservation, generated hex validity, and CSS export formatting. GitHub Actions runs installation, tests, and the production build on pushes to `main` and pull requests.

Browser review checklist:

- Generate a palette, lock a color, regenerate, and undo.
- Edit valid and invalid hex values.
- Select equal colors in the contrast panel and confirm a 1:1 failure.
- Save a palette, reload the page, and load it from the collection.
- Check duplicate-save feedback and removal.
- Download CSS and inspect its variables.
- Check layouts at approximately 1440, 768, and 390px.

## Deployment

The repository contains a `vercel.json` with these settings:

| Setting | Value |
| --- | --- |
| Framework | Vite |
| Root directory | Repository root |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Environment variables | None |

Import this repository into Vercel and use `main` as the production branch. With Git integration enabled, later pushes create deployments automatically. Keep `.vercel/`, `node_modules/`, and local environment files out of Git.

The build uses relative asset paths, so the generated site can also be hosted in a subdirectory on another static host.

## Accessibility and Responsive Design

Controls use labels, buttons, selects, visible keyboard focus, and a skip link. Lock buttons expose their pressed state. Status messages use a polite live region. The preview changes through CSS variables, and reduced-motion preferences disable nonessential transitions.

The desktop layout places the composition preview beside contrast controls. Smaller layouts stack these sections and reduce the saved-palette grid. The native color picker follows the browser and operating system's behavior.

## Performance and Privacy

The production app consists of static HTML, CSS, and JavaScript. There are no analytics, trackers, user accounts, or backend calls in the application. Google Fonts is the only external runtime dependency; local fallback fonts are provided if it cannot load. No service worker or offline-installation flow is included.

## Limitations and Troubleshooting

- Palettes always contain five colors.
- Undo restores palette colors and names, not lock state or deleted collection entries.
- Unsaved edits disappear on reload; use **Save palette** to keep a combination.
- Saved collections do not synchronize between devices or domains.
- Generation does not guarantee accessible color combinations.
- If `npm ci` fails, check the Node.js version and that the lockfile is present.
- If saved palettes do not survive reload, check browser storage permissions and whether the domain changed.
- If fonts are unavailable, the interface uses its fallback font stack.
