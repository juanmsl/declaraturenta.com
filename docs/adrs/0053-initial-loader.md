# 0053. A loader while the page loads for the first time

- Status: Accepted
- Date: 2026-11-21

## Context

On the first visit, the page stayed blank while the JavaScript loaded. The owner asked for a loader
during that initial load.

## Decision

Owner's choices:

- **Isotype and the braid lighting up**: the color isotype and, below, the seven diamonds of the
  braid filling in violet one after another (1,4 s loop), on bg/lienzo. The diamond stays a
  progress mark, as the visual direction requires.
- **On every page**: it lives in `index.html`, which every page uses (landing, legal pages and the
  app). It sits inside `#root`, so React replaces it on its first render; no extra code removes it.
- It is plain HTML with inline CSS (the app's CSS is not loaded yet; the CSP allows inline styles),
  with the theme colors written as hex values. It fades in after 150 ms, so a fast load shows
  nothing, and it stays still with «reducir movimiento». Screen readers get «Cargando Declara tu
  renta» (`role="status"`).

Figma: «00 · Carga inicial (loader, todas las páginas)», made after the code as the owner asked.

## Consequences

- If the theme colors change, the loader's hex values in `index.html` must change too.
