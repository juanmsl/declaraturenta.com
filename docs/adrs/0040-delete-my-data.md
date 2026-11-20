# 0040. «Borrar mis datos»

- Status: Accepted
- Date: 2026-11-20

## Context

Data lives only in the browser (ADR 0027). A person who shares the computer, or who wants to start
over, needs a way to remove what they entered. Figma 13 and 13d already showed the action in the
«Copia» menu.

## Decision

- «Copia» menu gets a third option, «Borrar mis datos», after a divider, with a trash icon and the
  error color (Figma 13).
- It opens a confirmation dialog (Figma 13d): «¿Borrar tus datos de este navegador?», with
  «Cancelar» and «Borrar mis datos». The text says it cannot be undone and suggests downloading a
  copy first.
- On confirm, only the open taxable year goes back to the empty state (owner's choice). Other years
  saved in the browser and the acceptance of the terms stay. The person is taken to Inicio.
- The app starts empty (ADR 0035), so the dialog says «vuelves a empezar desde cero»; the Figma text
  that mentioned sample data was updated.

## Consequences

- Deleting every year means doing it once per year.
- Nothing is kept for an undo; the local copy (.json) is the only way back.
