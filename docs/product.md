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
- SEO (ADR 0041): only the landing, Términos and Privacidad are indexed; each has its own HTML with
  Open Graph and X tags and an image designed in Figma.
- Data stays in the browser (localStorage), with a downloadable/uploadable local copy (.json) in «Mis datos» and
  «Reiniciar formulario» for the open year. No accounts for now.

## Taxable years

The platform is configurable by taxable year: UVT, tax tables, caps, filing calendar and rates
come from the selected year's configuration. The year is chosen in the side rail ("Año gravable");
each year keeps its own return in the browser. Only AG 2025 is configured for now (ADR 0034).

## Sections of the flow

Inicio is the summary before the flow: the steps, the filing deadline (asks the last two NIT
digits when there is no exogenous report) and a single action, «Subir mi exógena» (ADR 0035).

1. Importar exógena — upload the DIAN report (.xlsx), read in the browser, or fill in by hand.
   Once read, it shows the year's movements (credit card, purchases, deposits) below «Esto
   encontramos», as a list with the amount edited in the row (ADR 0049); whether the person was responsible for VAT is always asked at the end (ADR 0045).
   An optional card takes last year's return (PDF read in the browser, or typed): boxes 126, 133,
   137 and 31 fill the previous net tax, boxes 130 and 131 and the previous net assets (ADR 0048), shown as a list with the refund switch in box 137 (ADR 0050).
2. Patrimonio — assets, accounts and debts at December 31.
3. Ingresos — salaries, fees, financial yields, other income, pensions, dividends and occasional
   gains.
4. Deducciones y exentas — housing, dependents, prepaid health, severance pay, AFC/FVP/AVC, GMF,
   ICETEX, independent severance contributions, other exempt income (with and without the 40 %
   cap), the 25 % and donations.
5. Otros ajustes — uncommon boxes behind switches: ECE passive income, taxes paid abroad, Andean
   Community dividends and other discounts (ADR 0038). Loss compensations, presumptive excess and
   rentas gravables are filled in their 210 box (ADR 0055).
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

| Date       | Decision                                                                                                       |
| ---------- | -------------------------------------------------------------------------------------------------------------- |
| 2026-11-19 | Real exogenous import from the DIAN .xlsx (ADR 0024).                                                          |
| 2026-11-19 | The return is transcribed by hand on the DIAN portal.                                                          |
| 2026-11-19 | Data only in the browser plus a local copy (ADR 0027).                                                         |
| 2026-11-19 | Business model at the end, after the proof of concept works.                                                   |
| 2026-11-19 | Domain declaraturenta.com; app on Vercel at app.declaraturenta.com with the landing first.                     |
| 2026-11-19 | Proof of concept on AG 2025; platform configurable by year, chosen in the side rail.                           |
| 2026-11-19 | Legal texts accepted at first use, linked in the footer.                                                       |
| 2026-11-19 | Landing page designed in Figma first, then developed.                                                          |
| 2026-11-19 | Uncommon boxes in a new step "Otros ajustes"; new deductions as cards in Deducciones.                          |
| 2026-11-19 | Late filing penalty computed from the filing date the person enters in Resultado.                              |
| 2026-11-19 | Occasional gains count for the 1.400 UVT income test (ADR 0031).                                               |
| 2026-11-19 | Every decision is recorded in this document and in an ADR.                                                     |
| 2026-11-20 | The app starts empty; the sample taxpayer stays in Figma and tests (ADR 0035).                                 |
| 2026-11-20 | «¿Debo declarar?» moves to a landing calculator; the flow starts at the exogenous report.                      |
| 2026-11-20 | Resultado checks every filing test; movements and VAT are asked in Patrimonio.                                 |
| 2026-11-20 | Without an exogenous report, the last two NIT digits are typed in Inicio.                                      |
| 2026-11-20 | Inicio has a single action, «Subir mi exógena».                                                                |
| 2026-11-20 | The landing page has a mobile version (390 px); the app stays desktop only.                                    |
| 2026-11-20 | Vercel serves app.declaraturenta.com with security headers and a CSP (ADR 0039).                               |
| 2026-11-20 | No redirect from declaraturenta.com for now.                                                                   |
| 2026-11-20 | «Borrar mis datos» in «Copia» empties only the open taxable year (ADR 0040).                                   |
| 2026-11-20 | Only the landing and the legal pages are indexed; the app has noindex (ADR 0041).                              |
| 2026-11-20 | One OG image per public page plus one for the app, designed in Figma (ADR 0041).                               |
| 2026-11-20 | Per-route HTML at build time; robots, sitemap, JSON-LD, manifest and X card (ADR 0041).                        |
| 2026-11-20 | `main` is protected; lint, types, unit and e2e tests run on every pull request (ADR 0042).                     |
| 2026-11-20 | End-to-end tests with Playwright against the local production build (ADR 0042).                                |
| 2026-11-20 | The app is deployed on Vercel at app.declaraturenta.com.                                                       |
| 2026-11-20 | New pages start at the top; «Atrás» restores the previous position (ADR 0043).                                 |
| 2026-11-20 | Pages fade in; flow steps slide by direction; landing sections enter on scroll (ADR 0043).                     |
| 2026-11-20 | Formulario 210: calculated boxes with a violet border; box 136 to pay in coral (ADR 0044).                     |
| 2026-11-20 | Flow order follows the 210: Patrimonio before Ingresos (ADR 0045).                                             |
| 2026-11-21 | «Importar exógena»: movements on top with a report; VAT always, at the end (ADR 0045).                         |
| 2026-11-21 | Opening or closing a box in the 210 keeps the scroll where it is (ADR 0046).                                   |
| 2026-11-21 | Fix: Vercel rewrites private routes to `/app` (not `/app.html`) because of `cleanUrls`.                        |
| 2026-11-21 | The 210 panel edits every box filled in a step, with the step's section (ADR 0047).                            |
| 2026-11-21 | Boxes 60 and 75–77 get fields in Ingresos and in their panel (ADR 0047).                                       |
| 2026-11-21 | Last year's return: optional PDF card below the exogenous upload, or typed (ADR 0048).                         |
| 2026-11-21 | Box 137 goes to box 131 only if no refund or compensation was asked (ADR 0048).                                |
| 2026-11-21 | Year movements as a list like the report's sections; amount edited in the row (ADR 0049).                      |
| 2026-11-21 | Last year's return: list 31, 126, 133, 137; refund switch in row 137, starts at «No» (ADR 0050).               |
| 2026-11-21 | «Copia» is now «Mis datos»: «Descargar datos», «Cargar datos» and «Reiniciar formulario» (ADR 0051).           |
| 2026-11-21 | Boxes 60 and 75–77 are lists of concepts in their 210 panel; they leave Ingresos (ADR 0052).                   |
| 2026-11-21 | Every page shows the isotype and the braid lighting up while it first loads (ADR 0053).                        |
| 2026-11-21 | Every switch is Polpo's, color='primary', size='small', width='large', without restyling (ADR 0054).           |
| 2026-11-21 | Boxes 56, 72, 89, 94, 95 and 96 are lists of concepts in their 210 panel; they leave Otros ajustes (ADR 0055). |
| 2026-11-21 | «Pasos                                                                                                         | Formulario 210» switcher in the top bar of every step and of the 210 (ADR 0056). |
| 2026-11-21 | The 210 top bar has the logo, «Mis datos» and «Ayuda» too (ADR 0056).                                          |

## Not defined yet

Accessibility audit, analytics and the business model.
