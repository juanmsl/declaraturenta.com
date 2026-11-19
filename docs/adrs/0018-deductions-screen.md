# 0018. Deductions screen: editable rows and cap meter

- Status: Accepted
- Date: 2026-11-19

## Context

Figma screen 06 shows deductions as read-only rows and a meter of benefits against the 40 % /
1.340 UVT cap. There is no design to correct a value or to say whether the user has an economic
dependent.

## Decision

- Every row opens `DeductionDrawer`: housing interest and prepaid health with `MoneyField`;
  the dependent with `ToggleField` (Polpo `Switch` styled as the Figma "Interruptor"); the 25 %
  exempt income shows how it is calculated and cannot be edited.
- Row chips: "Desde exógena" when the value matches the report, "Lo ingresaste tú" after a
  change, "Calculado" for the dependent and the 25 % exempt income.
- `CapMeter` scales the bar to the larger of the total benefits and the cap; the part above the
  cap is hatched in coral and the cap is a coral line. The warning alert only appears when the
  cap is exceeded, naming the cap that applies (40 % or 1.340 UVT).
- The estimate note compares the balance before and after deductions.

## Consequences

The dependent's legal conditions are summarized with a pointer to art. 387 E.T.; a detailed
eligibility check is not modeled.
