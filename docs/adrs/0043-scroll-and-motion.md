# 0043. Scroll and motion

- Status: Accepted
- Date: 2026-11-20

## Context

When the route changed, the new page kept the scroll position of the previous one. The owner also
asked for entrance animations on the landing and transitions between pages.

## Decision

All choices below are the owner's.

- **Scroll:** a root route (`RootLayout`) renders React Router's `ScrollRestoration`. Each new
  navigation starts at the top; «Atrás» returns to the previous position. Polpo turns on
  `scroll-behavior: smooth` for the whole page, which made the jump to the top visible, so the page
  uses `auto` and only the landing section links (`SectionLink`, the hero button) scroll smoothly,
  instantly with «reduce motion».
- **Page transitions** (`PageTransition`), enter only:
  - Between pages (landing, Inicio, legal pages, Formulario 210, not found): fade in with 8 px
    upwards, 220 ms.
  - Between steps of the flow: the content slides 24 px from the side of the move (forward or
    back), 260 ms.
  - In the app, the side rail and the top bar keep still; only the content animates.
- **Landing entrance** (`RevealSection`, `revealItem`): each section, the first time it scrolls into
  view, fades in its marked children with 16 px upwards, 560 ms, 70 ms apart. Uses Polpo's
  `useIntersectionObserver`.
- **Technique:** CSS keyframes and transitions in `src/styles/motion.css`, no new dependency. Only
  opacity and transform animate. With `prefers-reduced-motion: reduce` nothing moves.
- The values are documented in Figma, page «Fundamentos», frame «Movimiento» (137:12738).

## Consequences

- A new landing section uses `RevealSection` and marks its children with `revealItem(index)`.
- End-to-end tests cover the scroll, the transition classes, the landing entrance and reduced
  motion (`e2e/navigation.spec.ts`).
