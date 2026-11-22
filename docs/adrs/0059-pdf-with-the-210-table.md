# 0059. The draft PDF also has the 210 in table format

- Status: Accepted
- Date: 2026-11-21

## Context

«Descargar PDF» produced the summary of the draft (screen 08) and then every box of the 210 as a
list (ADR 0019). The owner asked to keep both and add, after them, the 210 in table format.

## Decision

- A third part, «Formulario 210 · formato de tabla», goes after the list, with the same sections as
  the Formulario 210 screen (09):
  - the cédula general as a matrix: one row per concept (with the «Rentas exentas», «Deducciones
    imputables» and «Renta líquida ordinaria» groups) and one column per kind of income (rentas de
    trabajo, honorarios, capital and no laborales), each cell with its box number and value;
  - every other section as a two-column grid of boxes (number, label and value).
- **One page per part** (the owner's follow-up): the PDF has three pages, the summary, every box
  and the table. The content and its styles do not change; each page is letter width (612 pt) and
  as tall as its content (about 813, 3.900 and 1.700 pt with the fictional data).
- Boxes 140 (a mark: «X» or «—») and 141 (the voluntary contribution) are added to the «Saldo»
  section, in the list and in the table; before, the PDF stopped at box 139.
- The same styles as the rest of the PDF.

## Consequences

- Three pages that read as one continuous part each on screen; printing on letter paper splits
  or shrinks the long ones. The boxes can be copied into the DIAN portal in the order of the form.
