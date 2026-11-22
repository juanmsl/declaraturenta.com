# 0057. Inicio: the title goes in the left column

- Status: Accepted
- Date: 2026-11-21

## Context

In Inicio the title and its description took the whole width, and the two columns («Tu camino» on
the left; «¿Primera vez aquí?», the deadline and «Ten a mano» on the right) started below them. The
owner changed screen 01 in Figma.

## Decision

- The title and its description go at the top of the left column, above «Tu camino»; the right
  column starts at the top of the page, next to the title.
- «Subir mi exógena» stays below both columns.
- The same layout is used with and without data (screen 01c was updated to match).

## Consequences

- The cards on the right are visible without scrolling, and the left column reads from the title to
  the action.
