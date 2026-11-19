# 0030. Form 210 validated against the DIAN instructions

- Status: Accepted
- Date: 2026-11-19

## Context

Boxes 77–139 were marked "en revisión" until we could check them against the official instructions
of the Formulario 210 (PDF "año gravable 2023 y siguientes", the one the DIAN publishes for the
2026 filing season). The owner provided the PDF.

## Decision

- Every box from 28 to 141 keeps its **official title**, copied verbatim from the PDF, in
  `src/domain/form-210-titles.ts` (`officialTitle` in each box). The screen keeps its short labels.
- Formulas follow the instructions: 54 = 43 − 44 − 45 − 53, 70 = 58 + 62 − 59 − 60 − 69,
  87 = 74 + 79 − 75 − 76 − 77 − 86, 91 = 41 + 42 + 53 + 57 + 69 + 73 + 86 + 90 (equal to
  34 + 46 + 61 + 78 without losses, compensations or ECE income), 116/117 by which of 97 and 98 is
  larger, 119 with the art. 241 table in force until 2016, 124 = 19 % of (107 + 108 − 118) above
  1.090 UVT.
- **Fix in the engine**: the 40 % / 1.340 UVT cap is computed on the gross income of the general
  schedule minus its non-taxable income (32 + 43 + 58 + 74 − 33 − 44 − 59 − 76). Costs (45, 60, 77)
  and returns (75) do not reduce it. Before, we used the net income (box 91), which lowered the cap
  when there were costs.
- Boxes 99–110, 112–115, 140 and 141 now have their specs (label, kind and formula). Their values
  stay at 0 until those schedules are calculated.
- `LAST_VERIFIED_BOX` is 141 and the draft PDF no longer says that boxes are under review.

## Consequences

- The sample taxpayer does not change (she has no costs). Returns with capital or non-labor costs
  get a higher cap, which is what the DIAN portal computes.
- The PDF is the "2023 y siguientes" version. If the DIAN publishes a new form for a later taxable
  year, the titles file and these formulas must be checked again.
