# 0056. A switcher between the steps and the Formulario 210

- Status: Accepted
- Date: 2026-11-21

## Context

The Formulario 210 was reached from the draft step («Ver formato 210») and left with «Volver al
borrador». Since boxes 56, 60, 72, 75–77, 89 and 94–96 are only filled in the 210 (ADRs 0052 and
0055), the 210 is another way to fill the same return, and the owner asked to reach it from every
step.

## Decision

Owner's choices, reviewed in Figma first:

- **A view switcher «Pasos | Formulario 210»** at the start of the top bar, next to the step and
  the braid, on every step and on Inicio. In the 210 it replaces «Volver al borrador»; the rest of
  that bar stays as it was.
- **«Pasos» goes back to where the person was**: the steps remember their page for this browser tab
  (`sessionStorage`); without it, «Pasos» goes to the step to resume.
- **In code it is two Polpo `Button`s** (`color='primary'`, `size='small'`; the active one `flat`,
  the other `text`, with `aria-current='page'`). The active one only changes its background to
  bg/acento-suave (`bg-action-soft`), lighter than Polpo's flat background, as in Figma, inside a `nav` named «Cómo llenar tu
  declaración». Polpo `Tabs` was tried first, but in the top bar it kept the page from changing
  when the route changed.

Figma: component «Selector de vista», used in the «Barra superior» component and in screen 09.

## Consequences

- The 210 is one click away from every step, and back.
- The 210 bar also has the logo (isotype and «Declara tu renta», linking to Inicio), «Mis datos»
  and «Ayuda», as the owner asked; it still has no side rail. `BrandLink` and `HelpButton` are
  shared with the side rail and the steps' top bar.
