# 0009. Code quality tooling

- Status: Accepted
- Date: 2026-11-19

## Context

The owner wants a development standard from day one.

## Decision

- ESLint 9 (flat config) with `typescript-eslint` strict + stylistic type-checked rules,
  `react-hooks`, `react-refresh` and `eslint-config-prettier`. ESLint 10 exists, but the owner
  chose v9; npm marks 9.x as deprecated.
- Prettier with `prettier-plugin-tailwindcss` (single quotes, JSX single quotes, width 110).
- Vitest + Testing Library + jsdom, tests next to the code.
- Git with Conventional Commits: husky runs lint-staged (ESLint + Prettier on staged files) on
  `pre-commit` and commitlint on `commit-msg`.

## Consequences

`pnpm typecheck && pnpm lint && pnpm test && pnpm build` must pass before finishing any change.
