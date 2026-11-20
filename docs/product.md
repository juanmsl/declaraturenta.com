# Product

## What

"Declara tu renta" helps natural persons in Colombia prepare their income tax return on DIAN's
**Formulario 210**. The proof of concept covers taxable year (año gravable, AG) **2025**, filed
during 2026, so the owner can test it against returns already filed this year. It is not public
yet. When the platform is complete and the business model is defined, it will be updated for
AG 2026 (filed in 2027).

Flow: simple questions → prefill with the DIAN exogenous information (información exógena) →
calculation by schedules (cédulas) with exempt income, deductions and caps → an explanation of
every figure → a draft 210 that the person **transcribes by hand** on the DIAN portal (no direct
filing).

## Who

Employees (asalariados) and independent workers with no tax background.

## Voice

Expert and close ("experto cercano"): uses _tú_, explains simply, with tax rigor. Spanish
(Colombia), gender-neutral for the person who files. Amounts as `$ 1.234.567`. Every tax rule,
cap and simplification that affects a figure is explained on the screen where it applies.

## Platform

- Desktop web, designed at 1440 px, minimum 1280 px. Below 1280 px there is a single screen asking
  to switch to a computer, as a 480 px column (screen 10).
- Hosting: **Vercel**, at **app.declaraturenta.com** (the owner owns declaraturenta.com). The
  landing page is the first route of the app. Security headers and a Content Security Policy are
  set in `vercel.json` (ADR 0039). The root domain does not redirect to the app yet.
- Data stays in the browser (localStorage), with a downloadable/uploadable local copy (.json) and
  «Borrar mis datos» for the open year. No accounts for now.

## Taxable years

The platform is configurable by taxable year: UVT, tax tables, caps, filing calendar and rates
come from the selected year's configuration. The year is chosen in the side rail ("Año gravable");
each year keeps its own return in the browser. Only AG 2025 is configured for now (ADR 0034).

## Sections of the flow

Inicio is the summary before the flow: the steps, the filing deadline (asks the last two NIT
digits when there is no exogenous report) and a single action, «Subir mi exógena» (ADR 0035).

1. Importar exógena — upload the DIAN report (.xlsx), read in the browser, or fill in by hand.
2. Ingresos — salaries, fees, financial yields, other income, pensions, dividends and occasional
   gains.
3. Patrimonio — assets, accounts and debts at December 31, plus the year's movements (credit card,
   purchases, deposits) and whether the person was responsible for VAT.
4. Deducciones y exentas — housing, dependents, prepaid health, severance pay, AFC/FVP/AVC, GMF,
   ICETEX, independent severance contributions, other exempt income (with and without the 40 %
   cap), the 25 % and donations.
5. Otros ajustes — uncommon boxes behind switches: loss compensations, presumptive excess,
   rentas gravables, ECE passive income, taxes paid abroad, Andean Community dividends and other
   discounts (ADR 0038).
6. Resultado — the calculation step by step, filing date with the late filing penalty and the
   voluntary contribution, and «¿Tenías que declarar?» with every filing test.
7. Borrador 210 — the form box by box (plus the full 210 view and box detail panels).

Outside the flow: landing page (with the quick «¿Debo declarar?» calculator: monthly salary and
yes/no questions; desktop and 390 px mobile), legal texts (accepted the first time the app is used,
and linked in the footer), 404 and error pages, help panel.

## Legal

Terms of use, privacy policy (Ley 1581 de 2012) and a notice that the platform is not tax advice
and has no relation with the DIAN. Responsible party: Juan Sánchez, juanmsl.pk@gmail.com.

## Sample data

The app starts empty (ADR 0035). The sample data lives only in Figma and in the tests
(`src/mocks/sample-state.ts`).

Fictional taxpayer **Laura Gómez** (`src/mocks/sample-taxpayer.ts`), NIT ending in 47, deadline
September 15, 2026. Fictional entities: Empresa Andina S.A.S., Banco Cordillera, Medicina Sabana
S.A., Fondo Altiplano, Sociedad Andina S.A. A real exogenous report is never committed or put in
Figma.

Current reference figures: income $ 180.000.000 · non-taxable $ 16.200.000 · net income
$ 163.800.000 · box 92 $ 69.105.528 · taxable net income $ 94.694.472 · tax $ 8.587.000 ·
withholdings $ 11.240.000 · balance in favor $ 2.653.000 · gross assets $ 328.500.000 · debts
$ 120.000.000 · net assets $ 208.500.000.

## Decided by the owner

| Date       | Decision                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------ |
| 2026-11-19 | Real exogenous import from the DIAN .xlsx (ADR 0024).                                      |
| 2026-11-19 | The return is transcribed by hand on the DIAN portal.                                      |
| 2026-11-19 | Data only in the browser plus a local copy (ADR 0027).                                     |
| 2026-11-19 | Business model at the end, after the proof of concept works.                               |
| 2026-11-19 | Domain declaraturenta.com; app on Vercel at app.declaraturenta.com with the landing first. |
| 2026-11-19 | Proof of concept on AG 2025; platform configurable by year, chosen in the side rail.       |
| 2026-11-19 | Legal texts accepted at first use, linked in the footer.                                   |
| 2026-11-19 | Landing page designed in Figma first, then developed.                                      |
| 2026-11-19 | Uncommon boxes in a new step "Otros ajustes"; new deductions as cards in Deducciones.      |
| 2026-11-19 | Late filing penalty computed from the filing date the person enters in Resultado.          |
| 2026-11-19 | Occasional gains count for the 1.400 UVT income test (ADR 0031).                           |
| 2026-11-19 | Every decision is recorded in this document and in an ADR.                                 |
| 2026-11-20 | The app starts empty; the sample taxpayer stays in Figma and tests (ADR 0035).             |
| 2026-11-20 | «¿Debo declarar?» moves to a landing calculator; the flow starts at the exogenous report.  |
| 2026-11-20 | Resultado checks every filing test; movements and VAT are asked in Patrimonio.             |
| 2026-11-20 | Without an exogenous report, the last two NIT digits are typed in Inicio.                  |
| 2026-11-20 | Inicio has a single action, «Subir mi exógena».                                            |
| 2026-11-20 | The landing page has a mobile version (390 px); the app stays desktop only.                |
| 2026-11-20 | Vercel serves app.declaraturenta.com with security headers and a CSP (ADR 0039).           |
| 2026-11-20 | No redirect from declaraturenta.com for now.                                               |
| 2026-11-20 | «Borrar mis datos» in «Copia» empties only the open taxable year (ADR 0040).               |

## Not defined yet

Continuous integration and deployment details, end-to-end tests, accessibility audit, analytics,
and the business model.
