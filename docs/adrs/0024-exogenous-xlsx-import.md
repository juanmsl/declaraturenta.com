# 0024. Reading the DIAN exogenous report (.xlsx)

- Status: Accepted
- Date: 2026-11-19

## Context

The import of the exogenous report was simulated (ADR 0015). The owner shared a real report as
the DIAN portal exports it ("Consulta de Información reportada por terceros", one sheet) and asked
to read it and fill each concept where it belongs. The owner chose, for this delivery:

- `read-excel-file` to read the file in the browser.
- Values reported twice (the same voluntary contribution from the employer and from the fund) are
  taken once and marked for review.
- Rentas de capital and no laborales will be calculated (next commit); vehicles are imported with
  their appraisal and marked for review; the holder's name and filing deadline come from the file;
  the inflationary component of financial yields will use the official percentage.

## Decision

- **Reading**: `read-excel-file/browser` (`readSheet`, loaded with a dynamic import) turns the
  first sheet into rows. Only `.xlsx` is accepted. The file never leaves the browser.
- **Parsing** (`domain/exogenous-file.ts`, pure): finds the header row (Detalle, Valor, Uso
  declaración Sugerida), reads the year, document and name above it, the DIAN's "Tope 1–5" sums
  and every line with its reporter.
- **Classification** (`domain/exogenous.ts`): each line goes to a kind by the box the DIAN
  suggests (R32, R33, R35, R58, R74, R131, R132…) and, when there is none, by its detail:
  labor income, labor non-taxable, independent pension, voluntary pension, withholding, capital
  income, non-labor income, asset (bank account, CDT, fund, voluntary savings, receivable,
  vehicle), debt, housing interest, prepaid health, previous balance in favor, electronic
  invoices (base of box 28: 1 %) or informative (movements, card spending, investments made;
  they only matter for the filing tests).
- **Applying**: labor concepts (box 32), mandatory contributions (33), voluntary contributions
  (35), withholdings (132), assets and debts (29–30), housing interest and prepaid health,
  box 28, box 131 and the filing-test values (DIAN Topes 3–5). Capital income, non-labor income and
  independent pension contributions are listed with a "Pronto" chip until the engine computes
  them.
- **Identity**: the state now holds the taxpayer (state version 5). The first real report
  replaces the sample taxpayer and data: name from the file (DIAN order "surnames names" turned
  into "names surnames") and the filing deadline from the 2026 calendar by the last two digits
  of the document (`domain/filing-calendar.ts`). Only those two digits are stored.
- **Privacy**: account numbers show only their last four digits. Tests use an invented fixture
  with the same layout (`mocks/exogenous-sheet-fixture.ts`); real reports are never committed.

## Consequences

- The screen groups what was found by Ingresos, Aportes y retenciones, Patrimonio and
  Deducciones y otros, sums repeated lines of the same concept and entity, hides zero values and
  counts the informative lines.
- The 2026 calendar does not include the special dates of Decreto 1226 de 2026 (earthquake);
  people under it must check their own date.
