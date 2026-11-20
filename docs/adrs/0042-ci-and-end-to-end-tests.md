# 0042. Continuous integration and end-to-end tests

- Status: Accepted
- Date: 2026-11-20

## Context

The owner protects `main`: nothing is pushed to it directly, every change arrives through a pull
request. The checks that used to run only in the local hooks must run on GitHub for each pull
request, and the main flows need tests that drive the real app in a browser.

## Decision

All choices below are the owner's.

- **Two workflows, only on `pull_request`** (`.github/workflows`), each cancelling older runs of the
  same pull request:
  - `Checks` → job «Lint and types»: `pnpm lint` and `pnpm typecheck`.
  - `Tests` → two parallel jobs, «Unit tests» (`pnpm test`, Vitest) and «End-to-end tests»
    (`pnpm e2e`). The Playwright report and traces are uploaded as an artifact for 14 days.
  - Node 22 and the pnpm version of `packageManager`, with the pnpm cache.
- **End-to-end tests with Playwright** (`e2e/`, `playwright.config.ts`): Chromium at 1440 px against
  the production build served by `vite preview`, not against Vercel. The SEO plugin makes
  `vite preview` route like Vercel (`/terminos` → `terminos.html`, unknown paths → `app.html`).
- **What they cover**, always with fictional data (`e2e/fixtures/exogena-ficticia.xlsx`, built from
  `src/mocks/exogenous-sheet-fixture.ts`):
  - Landing: the «¿Debo declarar?» calculator, legal links, the start button and the phone view.
  - The whole flow: terms, exogenous upload, every step, Resultado ($ 6.148.000 to pay) and the
    PDF of the draft.
  - Local copy: download, «Borrar mis datos» (other years and the terms stay) and open the copy.
  - SEO: tags of the first response of each route, `robots.txt`, sitemap, images and the title
    while navigating.
- Vitest only runs `src/**/*.test.{ts,tsx}`; the e2e files have their own `tsconfig.e2e.json`.
- The checks to require in the branch protection of `main`: «Lint and types», «Unit tests» and
  «End-to-end tests».

## Consequences

- A change in a label or a flow can break an e2e test; update the test in the same pull request.
- The switches of `ToggleField` have no accessible name, so the tests find them by their row. The
  accessibility audit should fix it and the test should then use the role.
