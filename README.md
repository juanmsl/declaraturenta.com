# Declara tu renta

Web platform that helps individuals in Colombia (employees and independent workers with no tax
background) prepare their income tax return on DIAN's **Formulario 210** for taxable year 2025
(filed in 2026).

The code is written in English. Everything the user sees is in Spanish (Colombia).

## Getting started

Requirements: Node 22 (`.nvmrc`) and pnpm 11.10.0 (`packageManager` in `package.json`).

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

| Script                              | What it does                                          |
| ----------------------------------- | ----------------------------------------------------- |
| `pnpm dev`                          | Vite dev server                                       |
| `pnpm build`                        | Type-check (`tsc -b`) and production build to `dist/` |
| `pnpm preview`                      | Serve the production build                            |
| `pnpm typecheck`                    | TypeScript only                                       |
| `pnpm lint` / `pnpm lint:fix`       | ESLint                                                |
| `pnpm format` / `pnpm format:check` | Prettier                                              |
| `pnpm test` / `pnpm test:watch`     | Vitest                                                |

Commits follow [Conventional Commits](https://www.conventionalcommits.org/). Husky runs
lint-staged on `pre-commit` and commitlint on `commit-msg`.

## Stack

React 19 · TypeScript 6 · Vite 8 · Tailwind CSS 4 · [Polpo](https://ui.juanmsl.com) (UI library) ·
React Router 8 · react-hook-form · react-icons (Lucide) · Vitest + Testing Library.

## Documentation

Start with [`AGENTS.md`](./AGENTS.md) if you are an agent or a new contributor.

- [`docs/product.md`](./docs/product.md) — what we are building and for whom
- [`docs/context.md`](./docs/context.md) — current status, what is built, open questions
- [`docs/design.md`](./docs/design.md) — Figma file, tokens, text styles and component mapping
- [`docs/architecture.md`](./docs/architecture.md) — folders, routing, conventions
- [`docs/adrs/`](./docs/adrs/) — architecture decision records
