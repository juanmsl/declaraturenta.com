# 0058. The braid leaves the top bar

- Status: Accepted
- Date: 2026-11-21

## Context

The top bar showed the «trenza» (one diamond per step, ADR 0043 and earlier) next to «Paso X de 7».
The side rail already lists every step with its diamond and state, and the bar gained the
«Pasos | Formulario 210» switcher (ADR 0056). The owner asked to remove the braid from the bar.

## Decision

- The top bar keeps the switcher, «Paso X de 7 · …», the save status, «Mis datos» and «Ayuda»; the
  braid is removed. Progress is shown by the side rail (and the journey list in Inicio).
- The `Braid` component is deleted, as nothing else used it. The diamond stays the progress mark of
  the side rail, the journey list and the isotype.
- Figma: the «Trenza» layer is removed from the «Barra superior» component; the «Trenza/Paso»
  component stays (the initial loader uses it).

## Consequences

- A lighter top bar. The «caña flecha» detail of the visual direction lives in the side rail, the
  isotype and the initial loader.
