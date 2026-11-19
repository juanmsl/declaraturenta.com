# 0012. Tax calculation engine in `src/domain`

- Status: Accepted
- Date: 2026-11-19

## Context

The Figma figures for the sample taxpayer follow the real rules for taxable year 2025 (UVT
$ 49.799, art. 241 table, 25 % exempt labor income capped at 790 UVT, 40 % / 1.340 UVT cap). The
owner chose to calculate them instead of showing fixed values.

## Decision

Pure TypeScript functions in `src/domain`, without React, each with unit tests:

| Module                 | Rule                                                                                                                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `uvt.ts`               | UVT 2025, conversions, rounding to thousands (art. 577 E.T.)                                                                                                                   |
| `filing-obligation.ts` | Five filing tests (arts. 592, 593, 594-3 E.T.): assets above 4.500 UVT; gross income equal to or above 1.400 UVT; card purchases, total purchases and deposits above 1.400 UVT |
| `labor-income.ts`      | General schedule, labor income: deductions (housing interest 1.200 UVT, dependent 10 % up to 384 UVT, prepaid health 192 UVT), exempt 25 % up to 790 UVT, cap 40 % / 1.340 UVT |
| `income-tax-table.ts`  | Art. 241 table; tax rounded to thousands                                                                                                                                       |
| `advance-payment.ts`   | Next year's advance (art. 807 E.T.): 25 / 50 / 75 %, lower of the two procedures, minus withholdings                                                                           |
| `declaration.ts`       | Data model of the return and `computeDeclaration`, which produces every figure                                                                                                 |

The tests reproduce every figure in Figma: tax $ 9.591.000 and balance in favor $ 1.649.000
with deductions; tax $ 16.921.000 and $ 5.681.000 to pay before them.

The live estimate excludes deductions until the user reaches the deductions step, as in the
Figma screens 04 and 05.

## Consequences

- Not modeled yet (all zero for the sample taxpayer): limits on voluntary AFC/FVP/AVC
  contributions, independent workers, pensions, capital,
  non-labor income, dividends, occasional gains, tax discounts and penalties.
- Boxes 77–139 of the 210 are still unverified against the official DIAN PDF.
- Boxes 28 and 139 were added later (ADR 0019).
- Any new rule needs a source (article) in its doc comment and tests.
