# 0007. Routing with React Router 8 (library mode)

- Status: Accepted
- Date: 2026-11-19

## Context

The flow has seven sections plus the home and form views. Users should be able to use the
browser's back button and link to a section.

## Decision

- React Router 8 in library mode: `createBrowserRouter` from `react-router` and `RouterProvider`
  from `react-router/dom`. No framework mode, no file-based routing.
- One URL per screen. Paths are user-facing, so they are in Spanish (`/debo-declarar`,
  `/exogena`, `/ingresos`, `/patrimonio`, `/deducciones`, `/resultado`, `/borrador-210`) and
  defined once in `src/app/flow.ts`.
- Sections not built yet render `StepPlaceholderPage` so navigation works end to end.

## Consequences

The flow definition drives the side rail, the braid, the home journey list and the routes. A 404
page and error boundary are still to be designed.
