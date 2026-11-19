# 0017. Adding, editing and deleting assets and debts

- Status: Accepted
- Date: 2026-11-19

## Context

Screen 05 shows "Agregar un bien" and "Agregar una deuda" but Figma has no design for them, nor
for editing the listed items.

## Decision

- Both actions open `HoldingDrawer` (Polpo `AsideModal` through `Drawer`) with a form: asset type
  (`SelectField`, Polpo `Select`; assets only), name, entity or description (`TextField`, Polpo
  `Input`) and value (`MoneyField`), with a hint per asset type.
- Every row is a button that opens the same panel to edit or delete the item.
- Saving any item marks it as entered by the user ("Lo ingresaste tú"), also when it came from
  the exogenous report. Deleting removes it immediately.
- Validation: name required and value above zero, shown after the first save attempt.
- The "¿De dónde sale cada cifra?" link only appears where Figma shows it (screen 04).

## Consequences

Asset types are stored but do not change the calculation yet (assets only feed gross assets and
the filing test).
