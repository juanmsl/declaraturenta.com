# Architecture

## Folders

```
src/
  app/            App shell: router, layout (side rail, top bar), flow definition
    flow.ts       The seven flow sections: single source for rail, braid, journey and routes
    layout/
  features/       One folder per screen or flow section (home, …)
    <feature>/components/   Pieces used only by that feature
  shared/
    ui/           Project components built on Polpo + Tailwind (Text, Button, Braid, Logo, …)
    lib/          Framework-agnostic helpers (es-CO formatting)
  domain/         Tax domain types and rules (taxpayer, tax year, UVT). No React.
  mocks/          Fictional sample data (Laura Gómez)
  assets/brand/   Logo SVGs exported from Figma
  styles/         Global CSS: Tailwind + Polpo + fonts + design tokens
  test/           Test setup
docs/             Product, context, design, architecture and ADRs
```

Imports use the `@/` alias for `src/`. Features may import from `app/flow`, `shared`, `domain` and
`mocks`; `shared` and `domain` never import from features.

## Routing

React Router 8 in library mode (`createBrowserRouter` + `RouterProvider` from `react-router/dom`).
All screens render inside `AppLayout`. Paths are user-facing, so they are in Spanish and come from
`FLOW_STEPS` in `src/app/flow.ts`. The full Formulario 210 (`/formulario-210`, screen 09) lives outside `AppLayout` because it has
its own layout; `?casilla=N` opens the detail of box N (screen 09b).

## State

There is no persisted state yet. `useFlowProgress` marks the step of the current route as
`current` and the rest as `pending`. The sample taxpayer is read directly from `src/mocks`.

## Testing

Vitest + Testing Library + jsdom. Unit tests sit next to the file (`*.test.ts(x)`). Tax rules in
`src/domain` must always have tests.

## Conventions

- `type` over `interface`; `import type` for types (enforced by ESLint).
- Components are named exports in PascalCase files; one component per file.
- `cn` from `polpo/helpers` to merge classes. Never use `text-*` for font sizes (see ADR 0005).
- Conventional Commits in English.
