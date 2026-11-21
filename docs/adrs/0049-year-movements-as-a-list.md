# 0049. The year movements are a list, with the amount edited in the row

- Status: Accepted
- Date: 2026-11-21

## Context

In «Importar exógena», «Tus movimientos en 2025» (credit card purchases, total purchases and
deposits, ADR 0045) used three large money fields, each with its own help text and the same cap.
Right below, the report's sections («Ingresos», «Aportes y retenciones»…) are compact lists. The
owner asked for the movements to look like those lists.

## Decision

Owner's choices, reviewed in Figma first (03c and 03d):

- **A list like the report's sections**: icon, name, a second line, the «Desde exógena» chip and the
  amount on the right. Icons: credit card, receipt and bank (`Icono/tarjeta` was added to Figma).
- **Second line**: what the value is plus who reported it, e.g. «La suma de todo el año · Reportado
  por tus bancos».
- **The cap once**, in the section description: «…si alguno pasa de $ 69.718.600 (1.400 UVT),
  declaras.» It is the same 1.400 UVT for the three tests.
- **The amount is edited in the row** (`InlineMoneyField`, Polpo `InputNumber` with its label
  visually hidden): no border at rest, subtle background and border on hover, violet border while
  typing. The chip shows only while the value equals the report, as before.
- The editable amount has 10 px of inner padding, so these amounts sit 10 px left of the report's.

## Consequences

- The section takes much less space and reads like the rest of «Esto encontramos».
- `MoneyField` stays for forms; `InlineMoneyField` is for amounts inside list rows.
