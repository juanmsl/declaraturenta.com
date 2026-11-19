# 0025. Capital and non-labor income in the general schedule

- Status: Accepted
- Date: 2026-11-19

## Context

Real exogenous reports bring financial yields (CDT, funds, interest → box 58) and other income
(→ box 74). The owner chose to calculate both schedules, use the official inflationary component
for box 59 and deliver in three commits (reader, engine, screens).

## Decision

- **Data**: `capital` (concepts, independent pension contributions, costs) and `nonLabor`
  (concepts, returns, independent contributions, costs). Concepts share `IncomeConcept` with
  labor; a `financial` flag marks yields that lose the inflationary component. State version 6.
- **Rentas de capital**: 58 = concepts; 59 = 55,43 % of financial yields (art. 40-1 E.T.,
  Decreto 0898 de 2026) + independent contributions; 61 = 58 − 59 − 60; 70 and 73 equal 61
  (no exemptions, deductions, ECE income or losses modeled yet).
- **Rentas no laborales**: 74 = concepts; 78 = 74 − 75 − 76 − 77; 87 and 90 equal 78.
- **Independent pension contributions** (the DIAN suggests 44, 59 or 76) go to capital when there
  is capital income, otherwise to non-labor income. Fees income (43–57) is still not modeled.
- **General schedule**: box 91 = 34 + 46 + 61 + 78. The 40 % / 1.340 UVT cap of art. 336 E.T. is
  computed on box 91, and the taxable income is 91 − 92. Labor benefits are still the only ones
  under the cap; boxes 28 and 139 stay outside it.
- The filing test of gross income adds every schedule.
- Boxes 58 and 74 are editable in the 210 detail; every editable box shows "N conceptos" from its
  current concepts (owner's request: the count must follow the user's data).

## Consequences

- With only labor income, every figure stays as before.
- Exempt income and deductions of capital and non-labor income (63–68, 80–85), passive ECE income
  (62, 79) and loss compensations are not modeled; they stay at $ 0.
