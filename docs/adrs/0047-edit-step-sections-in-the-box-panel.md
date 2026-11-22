# 0047. Boxes filled in a step are edited in their panel too

- Status: Accepted; boxes 60 and 75–77 changed by [ADR 0052](./0052-concepts-in-boxes-60-and-75-77.md); boxes 56, 72, 89 and 94–96 by [ADR 0055](./0055-concepts-in-loss-and-adjustment-boxes.md)
- Date: 2026-11-21

## Context

In the Formulario 210 screen, 13 boxes could be edited in their panel, but 27 others only had a
button to go to the step where they are filled (Ingresos, Otros ajustes, Resultado). The owner
asked to edit them in the panel as well, without leaving the 210, keeping their step as the other
place to edit them.

## Decision

Owner's choices:

- **All 27 boxes** are edited in their panel: fees (43–45), rentas de capital and no laborales
  (60, 75–77), pensions (99–100), dividends (104–109), occasional gains (112–114), Otros ajustes
  (56, 62, 72, 79, 89, 94–96, 110) and the voluntary contribution (141).
- **The panel shows the whole section of the step**, the same components: for example box 112 shows
  every occasional gain with its kind, value and cost. Boxes 43–45 also show «¿Tuviste también
  ingresos como independiente?».
- **Draft and «Guardar cambios»**, like the 13 boxes edited in the panel before: the section works on
  a copy of the return (`DraftDeclaration`, which gives the same `useDeclaration` context), the box
  total updates as you type, «Guardar cambios» applies the copy and «Cerrar» discards it.
- **Boxes 60, 75, 76 and 77** had no field anywhere. They get one in Ingresos, below «Rendimientos
  financieros y otros ingresos», behind the link «Tengo costos, devoluciones o aportes en estas
  rentas» (open when any of them has a value), and the same fields in their panel.

To reuse the sections, they were split out of their pages: `IndependentIncomeQuestion`,
`ScheduleSection` (pensions, dividends, occasional gains), `CapitalNonLaborExtras`,
`AdjustmentsSections` (with `only`) and `VoluntaryContributionField`. The context value is built by
`buildContextValue`, shared by the real provider and the draft.

Figma: screen 09f (150:12940), the panel of box 112; the link in screen 04 Ingresos.

## Consequences

- A section changed in a step also changes in the panel; there is one component for both.
- Boxes 36 and 39 (calculated from several concepts) keep their current panel; task 3 of the
  owner's checklist covers them.
