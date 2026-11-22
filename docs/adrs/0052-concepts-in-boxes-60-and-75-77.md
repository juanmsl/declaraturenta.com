# 0052. Boxes 60, 75, 76 and 77 add up their own concepts in their panel

- Status: Accepted (replaces the part of ADR 0047 about these boxes)
- Date: 2026-11-21

## Context

ADR 0047 gave boxes 60 (costs of rentas de capital), 75 (returns and discounts of rentas no
laborales), 76 (independent pension contributions on them) and 77 (their costs) one field each in
Ingresos, behind the link «Tengo costos, devoluciones o aportes en estas rentas», and showed that
whole section in each box panel. The owner asked for them to work like boxes 32, 58 and 74: the
panel lists the concepts that add up to that box only, and more can be added.

## Decision

Owner's choices:

- **Each box is a list of concepts** (label, entity or description, amount) edited in its panel
  with the same `ConceptsEditor` as box 58, on a draft with «Guardar cambios». Its total is the sum.
- **They leave Ingresos**: the link and its four fields are removed; these boxes are filled only in
  the Formulario 210.
- **Box 76 keeps the exogenous report**: when the independent pension contributions go to rentas no
  laborales, each reported contribution comes in as a concept with the «Exógena» chip; the
  person's own concepts stay when the report is imported again or removed.

Data: `capital.costs`, `nonLabor.returns`, `nonLabor.independentContributions` and `nonLabor.costs`
become `capital.costConcepts`, `nonLabor.returnConcepts`, `nonLabor.contributionConcepts` and
`nonLabor.costConcepts`. The state moves to version 15: each old amount becomes one concept (box 76
keeps the exogenous origin when it still matches the report). Box 59 does not change.

Figma: the link was removed from screen 04; the panel is the one of screen 09b.

## Consequences

- One way to fill these boxes, the same as the other boxes with concepts, and with the detail of
  each cost or discount.
- People who only use the steps no longer see these boxes; they are uncommon and stay in the 210.
