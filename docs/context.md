# Context and status

_Last updated: 2026-11-19._

## Phase

The design is done in Figma. Every Figma screen (01–10) is built on the app shell, the tax engine
in `src/domain` and the declaration state persisted in localStorage.

## Built

- Tooling: pnpm 11.10.0, Vite 8, React 19, TypeScript 6, Tailwind 4, ESLint 9, Prettier, Vitest,
  husky + lint-staged + commitlint.
- Theme: Figma colors, radius and the 12 text styles (`src/styles/index.css`).
- Shared UI: `Text`, `Button`, `Icon`, `Diamond`, `BraidSegment`, `Braid`, `Logo`.
- Layout: `SideRail`, `SideRailItem`, `TopBar`, `AppLayout`.
- Screens 01–08 of the flow and 09 · Formulario 210 with 09b · box detail, matched against Figma
  at 1440 px (ADRs 0012–0020), and 10 · the small-screen view below 1280 px (ADR 0021).
- Domain: filing tests, labor income caps, art. 241 table, advance payment, the 210 box model
  (`form-210.ts`) and editable box concepts (`box-concepts.ts`), all with tests.

## Behavior decided per screen

- 07 · Resultado: the hero is coral when there is an amount to pay, mint when there is a balance
  in favor; the refund options only appear with a balance in favor and are saved in
  `refundPreference`. "Revisar mis respuestas" goes back to the first step.

## Known gaps and open questions

Ask the owner before resolving these.

- **Top bar at 1280 px**: the seven braid segments (584 px) do not fit with the rest of the bar,
  so the braid is clipped on the right. Figma only has the 1440 px layout.
- **Figma vs sample data on screen 09**: Figma shows "3 conceptos" under boxes 29 and 33; our data
  has 2 assets and box 33 is a single total. The section diamond on screen 09 is outside the
  "rombo only in progress" rule; we follow Figma.
- **Screen 10**: the header uses the system logo instead of Figma's three-diamond mark (owner's
  choice); "Compartir a mi computador" is hidden where the Web Share API is missing.
- **Favicon** uses the color isotype SVG; the 16/32 px versions are still pending in Figma.
- **Tax rules**: boxes 77–141 were reviewed against the DIAN instructions (ADR 0023); the
  occasional gains, pensions and dividends schedules are still not calculated.
- Product decisions still open: real exogenous import, direct filing vs. transcription,
  authentication, business model, "Compartir a mi computador".
- ESLint 9 is deprecated upstream (the owner chose v9 on purpose).

## Next steps (proposed)

1. Validate boxes 77–139 against the official DIAN PDF.
2. Resolve the open questions above (progress state, box 138, 404 page, "Ayuda").
