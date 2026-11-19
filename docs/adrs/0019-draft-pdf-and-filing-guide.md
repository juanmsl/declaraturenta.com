# 0019. Draft screen: PDF with @react-pdf/renderer, filing guide and the 210 model

- Status: Accepted
- Date: 2026-11-19

## Context

Screen 08 shows the draft summary and three actions: "Ver formato 210", "Descargar PDF" and
"Cómo presentarlo en la DIAN". Figma does not design the PDF nor the filing guide. The PDF has to
list every box of the 210, so the full box model is needed now.

## Decision

- **Form model**: `src/domain/form-210.ts` builds every box (28–139) with its label, value, kind
  (`entered`, `calculated`, `not-applicable`, `highlighted`), formula and note, following Figma
  screen 09. It also finds which boxes a box feeds and the concepts behind entered boxes.
  Boxes 77+ carry `verified: false`.
- **Engine**: box 28 (1 % of purchases with electronic invoice, capped at 240 UVT) and box 139
  (72 UVT per additional dependent, up to 4, from box 138) are now applied through box 92, as in
  the official formula. Both are 0 for the sample taxpayer. Whether the same dependent can count
  in box 39 and box 139 is still an open question.
- **PDF**: `@react-pdf/renderer` 4.9, loaded with a dynamic import only when the user clicks
  "Descargar PDF". Figtree and Bricolage Grotesque static `.woff` files come from `@fontsource`.
  Content: header with taxpayer and deadline, the "Esto es un borrador" notice, the summary of
  screen 08 and every box grouped by section with its formula. The footer says boxes 77–139 are
  under review. Downloading marks the draft step as done.
- **Filing guide**: "Cómo presentarlo en la DIAN" opens a side panel with general steps (no links
  or procedures we cannot verify), the deadline, the payment or refund step when it applies, and
  a reminder about the electronic signature.
- **Rows**: each row of the draft opens `/formulario-210?casilla=N` (screen 09/09b).

## Consequences

- The summary rows are shared by the screen and the PDF (`features/draft/draft-rows.ts`).
- If the official form changes box numbers, update `form-210.ts` and its tests.
