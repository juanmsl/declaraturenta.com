# 0048. Last year's return is read from its PDF in «Importar exógena»

- Status: Accepted
- Date: 2026-11-21

## Context

Four values of this year's return come from last year's: the net tax (used for the advance), the
advance already paid, the balance in favor and the net assets (used for the late filing penalty
when there is no income or tax). The person typed them by hand in several places. The owner asked
to upload last year's return (task 1 of the checklist) and take them from there.

## Decision

Owner's choices:

- **Which values**: box 126 → net tax of the previous year (`previousYearNetTax`, and the filing
  count moves to «second» or later); box 133 → this year's box 130; box 137 → this year's box 131;
  box 31 → previous net assets. AG 2024 uses the same Formulario 210 as AG 2025 (Resolución 000044
  de 2024), so the box numbers are the same.
- **Where**: an optional card «Tu declaración del año pasado (opcional)» below the exogenous
  upload, before «¿Eras responsable de IVA en 2025?».
- **Input**: the PDF as the DIAN portal downloads it, read in the browser with `pdfjs-dist`
  (loaded only when a file is chosen; its worker is served from the app, allowed by the CSP). If the
  PDF can't be read, or the person has none, «No tengo el PDF: escribir los valores» shows the same
  fields to type.
- **Reading**: the DIAN PDF only has the values as text (the labels are drawings), so each box is
  found by its position on page 1 (`parsePreviousReturn`). The taxable year is read too; a return
  that is not from 2024 is rejected with its year.
- **Balance in favor**: it only goes to box 131 if the refund or compensation was not asked. The
  card asks «¿Pediste que la DIAN te devolviera o compensara ese saldo a favor?» and moves nothing
  until it is answered.
- **Origin**: a value equal to what was read shows «Desde tu declaración»; the person can still
  change it. «Quitar la declaración del año pasado» clears only the values it filled; box 131 goes
  back to what the exogenous report says.
- **Privacy**: the file stays in the browser; only its name and the four values are stored. The
  tests use a fictional PDF (`e2e/fixtures/declaracion-ficticia-2024.pdf`) with the same layout.

The state moves to version 13 (`previousReturn`), with a migration from 12.

Figma: screen 03b (card empty, 158:13685) and 03c (return read, 158:13709), with fictional values.

## Consequences

- If the DIAN changes the PDF layout, the reading fails with a clear message and the manual fields
  still work; the positions are in one place.
- A scanned PDF (an image) can't be read; it falls back to typing the values.
