# 0034. Configurable taxable year

- Status: Accepted
- Date: 2026-11-20

## Context

The proof of concept runs on AG 2025, but the owner wants the platform ready for later years: UVT,
tax tables, caps, the filing calendar and rates change every year, and a person may prepare more
than one year.

## Decision

- `src/domain/tax-years/` holds one `TaxYearConfig` per year (`ag-2025.ts` for now): UVT and its
  source, the income tax table (and the one until 2016 for dividends), filing tests, labor caps,
  pensions, dividends, occasional gains, advance payment rates and the filing calendar.
- Every domain function receives the year (`computeDeclaration(data, { taxYear })`,
  `buildForm210(data, result, year)`, `applyExogenous(data, report, year)`, `uvtToPesos(uvt, year)`…).
  Nothing in the domain reads a global year.
- The UI reads the year with `useTaxYear()`. `DeclarationProvider` keeps the selected year and
  mounts the return of that year with its own key, so switching years swaps the whole state.
- Each year is saved apart in localStorage (`declaraturenta:declaration:<year>`); the selected year
  is saved too. The old single key is read once as AG 2025. The state is version 10 and migrates
  from 7, 8 and 9.
- The local copy names the year (`declaraturenta-ag2025-copia-<date>.json`) and a copy of another
  year is rejected with a message that asks to change the year first.
- The side rail chip "Año gravable" opens a menu with the configured years (Figma screen 17).

## Consequences

- Adding a year means adding its configuration and its calendar; the screens do not change.
- Tests pass `AG_2025` explicitly.
