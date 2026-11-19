# Product

## What

"Declara tu renta" helps natural persons in Colombia prepare their income tax return on DIAN's
**Formulario 210**, taxable year (año gravable, AG) **2025**, filed during 2026.
UVT 2025 = $ 49.799 (`src/domain/tax-year.ts`).

Flow: simple questions → prefill with the DIAN exogenous information (información exógena) →
calculation by schedules (cédulas) with exempt income, deductions and caps (the 40 % cap) →
an explanation of every figure → a draft 210 to file on the DIAN portal.

## Who

Employees (asalariados) and independent workers with no tax background.

## Voice

Expert and close ("experto cercano"): uses _tú_, explains simply, with tax rigor.
Spanish (Colombia). Amounts as `$ 1.234.567`.

## Platform

Desktop web, designed at 1440 px, minimum 1280 px. On mobile there is a single screen asking the
user to switch to a computer (Figma screen 10; not built yet).

## Sections of the flow

1. ¿Debo declarar? — checks the five filing thresholds.
2. Importar exógena — upload the DIAN report.
3. Ingresos — salaries, fees and other income.
4. Patrimonio — assets, accounts and debts at December 31.
5. Deducciones y exentas — housing, dependents, health and contributions (40 % cap meter).
6. Resultado — the calculation step by step.
7. Borrador 210 — the form box by box (plus the full 210 view and box detail panels).

## Sample data

Fictional taxpayer **Laura Gómez** (`src/mocks/sample-taxpayer.ts`), NIT ending in 47, deadline
September 15, 2026. Fictional entities: Empresa Andina S.A.S., Banco Cordillera, Medicina Sabana
S.A., Fondo Altiplano.

Reference figures from the design: income $ 180.000.000 · non-taxable $ 16.200.000 · net income
$ 163.800.000 · 40 % cap benefits $ 65.520.000 · taxable net income $ 98.280.000 · tax
$ 9.591.000 · withholdings $ 11.240.000 · refund (saldo a favor) $ 1.649.000 · gross assets
$ 328.500.000 · debts $ 120.000.000 · net assets $ 208.500.000.

## Not defined yet

Real exogenous import mechanism, direct filing vs. transcription, authentication, business model,
exact mobile threshold, and what "Compartir a mi computador" does.
