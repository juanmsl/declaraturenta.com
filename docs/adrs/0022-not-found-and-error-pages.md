# 0022. Not-found and error pages

- Status: Accepted
- Date: 2026-11-19

## Context

Unknown routes rendered nothing and a render error showed React Router's default screen. The owner
asked to design both pages in Figma and build them (screens 11 `61:7844` and 12 `61:7890`).

## Decision

- Both pages share `features/status/StatusPage.tsx`: a white top bar with the logo (link to Inicio)
  and a centered 560 px message with a chip, a `display` title, a `body-l` description and actions.
  They have no side rail, like screen 09.
- **11 · Página no encontrada**: route `*`. Chip "Error 404" (violet). Actions: "Seguir mi
  declaración" goes to the first step not completed (`findResumeStep` in `app/flow.ts`, the draft
  when all are done) and "Ir al inicio".
- **12 · Error inesperado**: `errorElement` of every top-level route. Chip "Error inesperado"
  (coral). "Intentar de nuevo" reloads the page; "Ir al inicio" does a full navigation to `/`, so
  a broken state in the router is not reused. A 404 route response shows screen 11.
- Both remind the user that their answers are still saved in this browser. The Figma note about
  downloading a copy will be shown once the local copy feature exists.

## Consequences

- An error inside `DeclarationProvider` (outside the router) is not caught by these pages.
