# 0050. Last year's return values are a list, with the refund question as a switch

- Status: Accepted
- Date: 2026-11-21

## Context

«Tu declaración del año pasado» (ADR 0048) showed its four values as large money fields with the
refund question below, as option cards. After «Tus movimientos» became a list (ADR 0049), the owner
asked for the same look here.

## Decision

Owner's choices, reviewed in Figma (03c and 03e):

- **Same list as «Tus movimientos»** (`AmountList` and `AmountRow`, now shared): icon, name with its
  box, what it is used for, the «Desde tu declaración» chip and the amount edited in the row. The
  same list is used when the values are typed without a PDF.
- **Order 31, 126, 133, 137**, as they appear in the 210. Icons: bank, scale, calendar and wallet.
- **The refund question goes inside the box 137 row** («¿Pediste que la DIAN te lo devolviera o
  compensara?»), with a Polpo `Switch` between «No» and «Sí», `size='small'` and `width='large'`.
  The row's second line says what happens with the answer.
- **The switch starts at «No»**: a switch has no unanswered state, so the balance in favor goes to
  box 131 as soon as the PDF is read, until the person switches to «Sí». This replaces the
  «unanswered until chosen» rule of ADR 0048.

`PreviousReturnRecord.refundRequested` is now a boolean. The state moves to version 14: an
unanswered question (null) becomes «No» and box 131 takes the balance.

## Consequences

- If the person asked for the refund and doesn't switch to «Sí», box 131 would include a balance
  already used; the row's second line says where the value goes to make that visible.
- The switch's accessible name is «No Sí» (Polpo labels); the question names its group.
