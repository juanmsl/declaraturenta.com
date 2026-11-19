# Context and status

_Last updated: 2026-11-19._

## Phase

The design is done in Figma. Development started with the project base, the design tokens on top
of Polpo's theme, the app shell (side rail and top bar) and screen **01 · Inicio**.

## Built

- Tooling: pnpm 11.10.0, Vite 8, React 19, TypeScript 6, Tailwind 4, ESLint 9, Prettier, Vitest,
  husky + lint-staged + commitlint.
- Theme: Figma colors, radius and the 12 text styles (`src/styles/index.css`).
- Shared UI: `Text`, `Button`, `Icon`, `Diamond`, `BraidSegment`, `Braid`, `Logo`.
- Layout: `SideRail`, `SideRailItem`, `TopBar`, `AppLayout`.
- Screen 01 · Inicio, matched against Figma at 1440 px.
- Routes for the seven flow sections, rendering a placeholder.

## Behavior decided per screen

- 07 · Resultado: the hero is coral when there is an amount to pay, mint when there is a balance
  in favor; the refund options only appear with a balance in favor and are saved in
  `refundPreference`. "Revisar mis respuestas" goes back to the first step.

## Known gaps and open questions

Ask the owner before resolving these.

- **Progress state**: there is no persistence; only the current route is marked as `current`.
  The "Guardado hace 1 min" label in the top bar is static.
- **Top bar at 1280 px**: the seven braid segments (584 px) do not fit with the rest of the bar,
  so the braid is clipped on the right. Figma only has the 1440 px layout.
- **"Ayuda" button** has no behavior defined.
- **404 page** and an error boundary are not designed.
- **Mobile view** (screen 10) is not built; the app sets a minimum width of 1280 px.
- **Favicon** uses the color isotype SVG; the 16/32 px versions are still pending in Figma.
- **Tax rules**: boxes 77–139 of the 210 must be validated against the official DIAN PDF; the rate
  of box 127 and whether one dependent can count in boxes 39 and 139 are unconfirmed.
- Product decisions still open: real exogenous import, direct filing vs. transcription,
  authentication, business model, "Compartir a mi computador".
- ESLint 9 is deprecated upstream (the owner chose v9 on purpose).

## Next steps (proposed)

1. Screen 02 · ¿Debo declarar? and the components it needs (Opción, Alerta, Campo monetario).
2. A flow state store (progress, answers) and how it persists.
3. The mobile "use a computer" screen.
