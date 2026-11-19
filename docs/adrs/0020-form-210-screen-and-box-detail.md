# 0020. Formulario 210 screen and box detail with editable concepts

- Status: Accepted
- Date: 2026-11-19

## Context

Screen 09 shows the whole 210 with the official structure; screen 09b shows the detail of an
entered box (box 32 in Figma). The owner decided:

- "Otras cédulas" can be turned on, and then show the alert "Aún no calculamos esta cédula".
- Concepts can be edited in **every** entered box, not only in box 32.
- Boxes the engine does not model open the detail with "Por ahora no calculamos esta casilla".

## Decision

- **Route and layout**: `/formulario-210` has its own layout (no side rail), as in Figma: a sticky
  bar with "Volver al borrador", the taxpayer note and "Descargar PDF" (same PDF as screen 08).
- **Selection in the URL**: `?casilla=N` opens the detail of an entered box and scrolls to
  `#casilla-N`. A calculated box is only highlighted. The draft rows (screen 08) link here.
- **Datos generales** edits `filingCount` and `previousYearNetTax` inline (they drive the
  advance payment); box 28 is a regular box.
- **Otras cédulas**: the switches are stored in `activeSchedules` (state version 3). Turning one on
  only shows the info alert; its boxes stay at $ 0.
- **Box detail** (`features/form-210/BoxDetailDrawer.tsx`):
  - Title is the box label ("Ingresos brutos por rentas de trabajo"); subtitle is the section and,
    in the general schedule, its income column.
  - The total card names the box it feeds and its formula; when there is a single direct
    dependent it also names the furthest box that one feeds ("… 34 (= 32 − 33) y la 91").
  - Editable boxes (`EDITABLE_BOXES` in `domain/box-concepts.ts`: 28, 29, 30, 32, 33, 35, 38,
    130, 131, 132, 138) list their concepts. A row opens inline fields (concept, entity, value)
    with "Quitar" and "Listo"; "Agregar concepto" adds one. Editing an exogenous concept marks it
    "Por ti" and keeps "La exógena decía …".
  - Box 39 edits the dependent toggle and prepaid health; box 36 shows the 25 % exempt
    calculation read-only.
  - Changes are kept in the panel and written with "Guardar cambios" (disabled until something
    changes); "Cerrar" discards them.
- Matrix labels changed from "Fila · Columna" to "Fila por columna", which also changes the PDF.

## Consequences

- `applyBoxConcepts` writes concepts back to the declaration data, so every edit flows through the
  engine and updates screens 04–08.
- Entered boxes outside `EDITABLE_BOXES` (other than 36 and 39) open the detail with the
  "Por ahora no calculamos esta casilla" alert until the engine supports them.
