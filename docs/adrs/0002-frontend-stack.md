# 0002. Frontend stack

- Status: Accepted
- Date: 2026-11-19

## Context

The product is a desktop web app. The owner chose the stack and the exact major versions.

## Decision

- React 19.3 (required by Polpo, which takes `ref` as a prop).
- TypeScript 6.0 (6.0.3), even though 7.0 is available. Strict mode plus
  `noUncheckedIndexedAccess`, `erasableSyntaxOnly` and `verbatimModuleSyntax`.
- Vite 8 with `@vitejs/plugin-react` and `@tailwindcss/vite`.
- Tailwind CSS 4.
- pnpm 11.10.0, pinned with the `packageManager` field; Node 22 (`.nvmrc`).
- Single-page app, no SSR.

## Consequences

- pnpm's supply-chain policy added `react-router@8.5.2` to `minimumReleaseAgeExclude` in
  `pnpm-workspace.yaml` because the version was newer than the minimum release age.
- Upgrading TypeScript to 7 needs a new ADR.
