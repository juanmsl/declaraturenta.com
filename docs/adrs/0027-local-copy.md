# 0027. Local copy of the declaration (.json)

- Status: Accepted
- Date: 2026-11-19

## Context

There are no user accounts: the declaration lives in the browser (ADR 0013). The owner asked for
a way to download the information to the computer and load it again later, and chose a "Copia"
menu in the top bar with a readable `.json` file.

## Decision

- **Top bar**: a ghost "Copia" button with a chevron opens a Polpo `Menu` with "Descargar copia"
  and "Abrir copia" (Figma 13 `73:8236`).
- **File**: `declaraturenta-copia-AAAA-MM-DD.json` with `{ app: "declaraturenta", version,
createdAt, state }`, pretty-printed. It holds the whole state, including the taxpayer, the
  classified exogenous report and the progress. It contains personal data and never leaves the
  device.
- **Opening**: the file is validated (`app/declaration/backup.ts`). A valid copy asks for
  confirmation before replacing the current data ("¿Reemplazar tus datos con la copia?", Figma
  13b); a file that is not a copy, or a copy from another state version, shows "No pudimos abrir
  esa copia" (13c). Restoring dispatches `restore`, which replaces the state.
- **Dialog**: a local `Dialog` on Polpo's `Modal` with the project's buttons, because Polpo's
  `ConfirmationModal` brings its own button styles. Figma component "Diálogo" (`73:8123`).
- **Error page**: screen 12 offers "Descargar copia de mis datos".

## Consequences

- Copies from older state versions cannot be opened. If that becomes a problem, add migrations
  between versions.
- In Figma the braid of the top bar now shrinks to make room for "Copia"; the compact braid is
  still pending.
