# 0059. The draft PDF also has the 210 in table format

- Status: Accepted
- Date: 2026-11-21

## Context

«Descargar PDF» produced the summary of the draft (screen 08) and then every box of the 210 as a
list (ADR 0019). The owner asked to keep both and add, after them, the 210 in table format.

## Decision

- A third part, «Formulario 210 · formato de tabla», starts on a new page after the list, with the
  same sections as the Formulario 210 screen (09):
  - the cédula general as a matrix: one row per concept (with the «Rentas exentas», «Deducciones
    imputables» and «Renta líquida ordinaria» groups) and one column per kind of income (rentas de
    trabajo, honorarios, capital and no laborales), each cell with its box number and value;
  - every other section as a two-column grid of boxes (number, label and value).
- Section titles never end a page alone.
- Boxes 140 (a mark: «X» or «—») and 141 (the voluntary contribution) are added to the «Saldo»
  section, in the list and in the table; before, the PDF stopped at box 139.
- Letter size, portrait, the same styles as the rest of the PDF.

## Consequences

- The PDF is longer (the table adds about three pages), but the boxes can be copied into the DIAN
  portal in the order of the form.
