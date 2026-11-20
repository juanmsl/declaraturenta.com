# 0036. Landing page and routes

- Status: Accepted
- Date: 2026-11-20

## Context

The app will be hosted on Vercel at app.declaraturenta.com, with the landing page as its first
route ("todo en app."). The landing was designed in Figma first (screen 18 and its 390 px mobile
version 18b) and now includes the quick «¿Debo declarar?» calculator (ADR 0035).

## Decision

- Routes: `/` landing, `/inicio` Inicio, the steps keep their paths (`/exogena`, `/ingresos`…),
  `/formulario-210`, and the legal pages `/terminos` and `/privacidad`.
- The landing and legal pages are responsive (mobile first, desktop from `lg`). The declaration
  flow keeps the desktop-only rule: `DesktopOnly` wraps the app routes and shows screen 10 below
  1280 px (ADR 0021), instead of gating the whole app.
- `src/features/landing/`: `SiteHeader` and `SiteFooter` (shared with the legal pages), the hero
  with a small coded picture of the Resultado screen (`ProductPreview`, decorative, sample figures),
  `FilingCalculator` (uses `quickFilingCheck`: monthly salary × 12 against 1.400 UVT plus yes/no
  answers; nothing is saved), «Cómo funciona», «Qué cubre», «Cada cifra con su porqué», «Tus
  datos», FAQ and the final call to action.
- New text style `display-xl` (Figma Display/XL, 60/64) for the hero on desktop; mobile uses
  `display`.
- In the app, the logo and «Ir al inicio» go to `/inicio`.

## Consequences

- The Vercel config needs SPA rewrites to `index.html` and a redirect from declaraturenta.com to
  app.declaraturenta.com.
