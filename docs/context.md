# Context and status

_Last updated: 2026-11-19._

## Phase

Every Figma screen (01–14b) is built on the app shell, the tax engine in `src/domain` and the
declaration state persisted in localStorage. Product work continues on the pending list below;
the business model comes last, after the platform is fully functional.

## Built

- Tooling: pnpm 11.10.0, Vite 8, React 19, TypeScript 6, Tailwind 4, ESLint 9, Prettier, Vitest,
  husky + lint-staged + commitlint.
- Theme: Figma colors, radius and the 12 text styles (`src/styles/index.css`).
- Screens 01–10 of the flow, 11 · 404 and 12 · error (ADR 0022), local copy 13–13c (ADR 0027) and
  the help panel 14–14b with the "¿Primera vez aquí?" card on Inicio (ADR 0028).
- Domain: filing tests, labor, capital and non-labor income (ADR 0025), DIAN dependents rule
  (ADR 0023), art. 241 table, advance payment, the 210 box model and the 2026 filing calendar.
- Exogenous import from the DIAN .xlsx, read in the browser (ADR 0024, 0026).

## Behavior decided per screen

- 07 · Resultado: the hero is coral when there is an amount to pay, mint when there is a balance
  in favor; the refund options only appear with a balance in favor and are saved in
  `refundPreference`. "Revisar mis respuestas" goes back to the first step.

## Decided by the owner

- The declaration is transcribed by hand in the DIAN portal; no direct filing.
- Data stays in the browser, with a downloadable/uploadable local copy (.json).
- Brand: compact braid with one diamond per step, violet plate favicon and the diamond as
  section marker (ADR 0029).
- Domain: declaraturenta.com. Screens between 480 and 1280 px keep the 480 px column.

## Known gaps and open questions

Ask the owner before resolving these.

- **Tax rules**: boxes 77–139 still need a pass against the official DIAN PDF; the occasional
  gains, pensions and dividends schedules are not calculated.
- **Figma vs sample data on screen 09**: the section diamond on screen 09 is outside the "rombo
  only in progress" rule; we follow Figma.
- Business model (last).
- ESLint 9 is deprecated upstream (the owner chose v9 on purpose).

## Next steps (proposed)

1. Validate boxes 77–139 against the official DIAN PDF (box 127 and 138/139 rules included).
2. Calculate the pending schedules (pensions, dividends, occasional gains).
