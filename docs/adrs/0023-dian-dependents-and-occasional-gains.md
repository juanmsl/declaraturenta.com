# 0023. Dependents (boxes 138–139) and occasional gains rate (box 127) per DIAN

- Status: Accepted
- Date: 2026-11-19

## Context

Boxes 77–139 were taken from a user reference. The owner asked to define the open rules with the
official DIAN instructions for form 210 (2026, taxable year 2025):
https://www.dian.gov.co/atencionciudadano/formulariosinstructivos/Formularios/2026/Formulario_210_2026.pdf

## Decision

- **Dependents**: the return keeps one number, `deductions.dependents` (box 138), instead of a
  yes/no switch plus a separate count. State version 4.
  - With one or more, box 39 includes the art. 387 deduction (10 % of gross labor income, up to
    384 UVT a year).
  - Box 139 adds 72 UVT per dependent, up to 4 (art. 336 num. 3 E.T., Ley 2277 de 2022). It goes to
    box 92 **outside** the 40 % / 1.340 UVT cap and can never exceed boxes 42 + 57.
  - For income from an employment relationship the same dependent counts in both boxes 39 and 139
    (DIAN instructions). Independent workers get only one of the two per dependent; that case is
    not built yet.
  - The deductions panel and the box 39 detail ask "¿Cuántos dependientes económicos tienes?".
- **Occasional gains (box 127)**: 15 % of box 115, 20 % for lotteries, raffles and bets. The
  occasional gains schedule is still not calculated, so the box stays at $ 0 with that formula.
- Labels that said the benefits were all under the 40 % cap now read "Exentas y deducciones".
- Sample taxpayer: with one dependent box 139 is $ 3.585.528, box 92 $ 69.105.528, taxable
  income $ 94.694.472, tax $ 8.587.000 and balance in favor $ 2.653.000.

## Consequences

- A financing bill discussed in 2025 proposed removing the 72 UVT addition; if a law changes it
  for a later taxable year, the rule must be versioned by year.
