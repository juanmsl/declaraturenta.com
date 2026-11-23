# 0060. The steps work on phones and tablets

- Status: Accepted; the Formulario 210 part is superseded by [ADR 0061](./0061-form-210-on-phones-and-tablets.md)
- Date: 2026-11-22

## Context

The app was desktop only: below 1280 px it showed screen 10, which asked to switch to a computer
(ADR 0021). The owner asked for a mobile version of the steps, with the Formulario 210 screen left
out for now, designed first in Figma (frames M01–M08, 390 px) and approved there. The owner also
allowed intermediate breakpoints, such as a tablet layout.

## Decision

- **Breakpoint.** Below 1280 px (`useIsCompact`, the old screen 10 query) the steps use the
  compact layout; from 1280 px the desktop layout does not change. Phones and tablets share it:
  under 768 px the content fills the screen with 16 px margins; from 768 px it is a centered
  720 px column with 32 px margins and the option cards go side by side (Figma T04, 834 px).
- **Top bar** (Figma «Barra superior · Móvil», `199:13535`): isotype to Inicio, «Paso N de 7 ·
  Sección» (or «Inicio»), which opens the steps sheet (M04a), and the menu (M04b) with the tax
  year, «Mis datos», «Resumen de tu declaración», «Ayuda» and the legal pages. The view switcher
  «Pasos | Formulario 210» goes under the bar.
- **Sheets**: Polpo AsideModal from the bottom (`Sheet`), as tall as the content up to 90 %.
- **Formulario 210** stays desktop only: on phones and tablets «Formulario 210» opens a notice
  (M04d) with «Seguir por pasos» and «Copiar enlace para el computador». Opening
  `/formulario-210` directly shows screen 10, now with the same copy and «Seguir por pasos».
- **«Así va tu declaración»**: the person chooses where to see it (M04c), saved in this browser:
  a bar stuck to the bottom of the step that opens the whole estimate (default), a card at the end
  of each step, before the buttons, or only in Resultado. The choice is in the summary sheet and in
  the menu.
- **One column**: the side panel of a step goes before its actions as a card (the exogenous
  help ends up after the questions). Main action at full width, «Atrás» centered below it.
  `StepActions` holds both layouts.
- **Rows** with an origin chip (amounts, exogenous items, holdings, benefits, filing thresholds,
  draft): icon with the name, the second line, then the chip with the amount, and any question
  last (`RowContent`), as agreed in Figma.
- **Text**: titles use `title-l` instead of `display`, step descriptions `body-m`, the result
  `figure-xl`.
- **Borrador** on phones and tablets: no «Ver formato 210», and the rows do not open the 210.

## Consequences

- New screens must work from 390 px: use `StepLayout`, `StepActions` and `RowContent`, and check
  390, 834 and 1280 px.
- Unit tests render the desktop layout (jsdom has no `matchMedia`; the setup stubs it); the phone
  layout has its own end-to-end spec.
- Supersedes the small-screen part of ADR 0021: screen 10 only covers the full Formulario 210.
