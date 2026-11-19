# 0013. Declaration state: React Context persisted in localStorage

- Status: Accepted
- Date: 2026-11-19

## Context

The user's answers must survive between screens. The owner chose React Context with persistence
in localStorage (a mix of in-memory and storage).

## Decision

- `src/app/declaration/`: `DeclarationProvider` holds a `useReducer` state
  (`declaration-state.ts`) and exposes `useDeclaration()` with the state, `dispatch`, the full
  `result` and the live `estimate` (both from `computeDeclaration`).
- Every state change is saved to localStorage under `declaraturenta:declaration` (versioned; an
  unreadable or outdated value falls back to the initial state).
- Actions are stamped with their time in the provider so the reducer stays pure; `savedAt`
  drives "Guardado hace …" in the top bar. Opening a step is saved but does not change `savedAt`.
- The initial state is the fictional sample return (`src/mocks/sample-declaration.ts`), as if
  prefilled from the exogenous report.
- Progress: a step is `done` after its primary action, `current` when it is the open route.

## Consequences

Tax data stays in the user's browser until authentication and a backend exist. A reset action
exists in the reducer but has no UI yet.
