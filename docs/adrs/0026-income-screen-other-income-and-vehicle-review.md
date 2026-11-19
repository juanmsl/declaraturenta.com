# 0026. Income screen with other income, and review of imported vehicles

- Status: Accepted
- Date: 2026-11-19

## Context

Third delivery of the real exogenous import (ADRs 0024 and 0025): the screens had to show the
new schedules. The owner chose to keep them inside Ingresos (the flow stays at seven steps) and to
import vehicles with their appraisal marked for review.

## Decision

- **Ingresos** adds "Rendimientos financieros y otros ingresos" after the labor fields: one money
  field for box 58 (with the inflationary component explained in the hint) and one for box 74.
  Both show "Desde exógena" while every concept comes from the report. Writing a different total
  keeps the reported concepts and adds one "Ajuste que escribiste en Ingresos" concept with the
  difference, so the 210 detail still shows where each peso comes from.
- **Estimates and result**: "Ingresos brutos" is the gross income of every schedule, "No
  constitutivos" the difference with box 91, and "Renta líquida" is box 91. The figures panel
  lists boxes 32, 58 and 74 when they have values.
- **Draft and PDF**: sections for capital and non-labor income (58, 59, 61 and 74, 78) and the
  general schedule total (91) appear only when there is such income.
- **Patrimonio**: an asset imported with an informative value (the vehicle) shows the coral
  "Revisar" chip and a warning that the return uses the fiscal cost, not the appraisal. Saving
  the asset in its panel confirms it.
- Figma: 03 groups the findings like the code, 04 has the new section and 05d shows the vehicle
  to review.

## Consequences

- An adjustment can be negative when the user writes less than what was reported.
