# 0035. Empty start, and «¿Debo declarar?» on the landing

- Status: Accepted
- Date: 2026-11-20

## Context

The app opened with the fictional sample taxpayer (Laura Gómez): a salary already typed and her
name in the side rail and in «¿Debo declarar?». The owner found it strange for a real person, and
asked that the quick filing check live on the landing page, so the app starts at the exogenous
report.

## Decision

- **The app starts empty**: no sample data, no name, `$ 0` everywhere. The sample taxpayer stays
  only in Figma and in the tests (`src/mocks/sample-state.ts`). `Taxpayer` loses `isSample`;
  `nitLastDigits` and `filingDeadline` are null until known.
- **The NIT digits come from the exogenous report or are typed in Inicio** («Tu fecha límite»,
  Figma 01c). Without them the rail and Inicio say «Aún sin calcular».
- **«¿Debo declarar?» leaves the flow.** The flow starts at «Importar exógena»; Inicio stays as the
  summary before it, with a single action, «Subir mi exógena» («Llenar sin exógena» is in that step).
- **The landing will have a quick calculator** (Figma 18 and 18b): monthly salary × 12 against the
  income test, plus yes/no for assets, credit card, purchases, deposits and VAT. Nothing is saved.
- **Inside the app the full check moves to Resultado** («¿Tenías que declarar?», Figma 07c): the
  five tests with all the data plus the VAT answer. The amounts of purchases, credit card and
  deposits, and the VAT question, are asked in Patrimonio («Tus movimientos en el año», Figma 05e).
- `obligation.vatResponsible` is new: a VAT-responsible person must file whatever the tests say
  (art. 592 num. 3 E.T.).
- State version 11. A saved state that still shows the sample taxpayer is dropped (the person starts
  empty); others lose `isSample`, get `vatResponsible: false` and forget the old step.
- Screens find steps by id (`getStep`) instead of by position in `FLOW_STEPS`.

## Consequences

- Someone who opened the app before sees it empty, unless they had imported their own report.
- The landing calculator is built with the landing page.
