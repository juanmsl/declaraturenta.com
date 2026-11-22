# 0055. Boxes 56, 72, 89, 94, 95 and 96 add up their own concepts in their panel

- Status: Accepted (replaces the part of ADRs 0038 and 0047 about these boxes)
- Date: 2026-11-21

## Context

Losses of earlier years (56, 72, 89 and 94), the excess of renta presuntiva (95) and rentas
gravables (96) were filled in «Otros ajustes», each group behind a switch, and their panel in the
210 showed that section (ADR 0047). After boxes 60 and 75–77 (ADR 0052), the owner asked for these
to work the same way.

## Decision

Owner's choices:

- **Each box is a list of concepts** edited in its 210 panel with `ConceptsEditor`, on a draft with
  «Guardar cambios», like boxes 58 and 60. The list adds up what the person enters; the box keeps
  its limits (the losses up to each column's ordinary income, 94 away from labor income, 95 up to
  the ordinary income), which the panel description explains.
- **They leave «Otros ajustes»**: the switches «Tengo pérdidas fiscales de años anteriores», «Tuve
  excesos de renta presuntiva» and «Debo sumar rentas gravables» and their fields are removed. With
  no switch, a box counts as soon as it has concepts.
- The help panel says these boxes are filled in the Formulario 210.

Data: `adjustments.losses.*` become lists of concepts; `presumptiveExcess` and `taxableAdditions`
become `presumptiveExcessConcepts` and `taxableAdditionConcepts`; the ids `losses`,
`presumptive-excess` and `taxable-additions` leave `AdjustmentId`. The state moves to version 16:
each amount whose switch was on becomes one concept; amounts behind a switch that was off did not
count, so they are dropped, and the removed switches leave `enabled`.

Figma: the three switches were removed from screen 15; the panel is the one of screen 09b.

## Consequences

- One way to fill these boxes, with the detail of each year's loss or each addition.
- People who only use the steps no longer see these cases; they are rare and stay in the 210.
