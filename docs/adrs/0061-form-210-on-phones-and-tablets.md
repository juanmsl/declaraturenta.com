# 0061. The Formulario 210 works on phones and tablets

- Status: Accepted
- Date: 2026-11-22

## Context

ADR 0060 brought the steps to phones and tablets but left the full Formulario 210 (screen 09) on
computers. The owner chose to bring it too, by sections, and approved the Figma frames M09
(`214:14787`), M09a (`214:15010`) and M09b (`214:15308`).

## Decision

- Below 1280 px `/formulario-210` uses the compact shell of the steps: top bar with «Formulario
  210», the steps and the menu, and the view switcher under it. Screen 10 («Usa un computador»),
  the notice of M04d and `DesktopOnly` are removed.
- **Sections** are cards that open and close, with the section mark, the name and the boxes they
  cover. They start closed, except the section of a box opened from a link (`?casilla=N`).
  Several can be open at once. Inside, one box per line with the «Casilla 210» field.
- **Cédula general**: a selector «Trabajo | Honorarios | Capital | No laborales» shows one column
  of the matrix at a time, with its group labels; rows without a box in that column are hidden.
- **«Ir a la casilla»**: typing a number opens its section (and column) and scrolls to the box,
  marked as selected. A box of an inactive schedule (pensions, dividends, occasional gains) shows
  its section. Numbers that are not in the form show an error.
- **Detail of a box** and every other side panel (`Drawer`) rise from the bottom on phones and
  tablets, 90 % of the screen tall, with «Guardar cambios» and «Cerrar» stuck at the bottom.
  Concept rows stack like the step rows (ADR 0060).
- Other schedules keep the switch; the «Activar» link is hidden on phones and tablets, where the
  switch alone is enough.
- Desktop does not change.

## Consequences

- The whole app works from 390 px; only the PDF is the same everywhere.
- Supersedes the Formulario 210 part of ADR 0060 and what was left of ADR 0021.
