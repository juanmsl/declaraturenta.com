# 0008. Feature-based structure; English code, Spanish UI

- Status: Accepted
- Date: 2026-11-19

## Context

The product is for people in Colombia, but the code should follow an international standard.

## Decision

- Feature-based folders: `src/app`, `src/features/<feature>`, `src/shared/{ui,lib}`,
  `src/domain`, `src/mocks` (see `docs/architecture.md`).
- Code, comments, docs, ADRs and commit messages in English.
- User-facing text in Spanish (Colombia), written inline in components. No i18n library while
  there is a single language.
- Money and dates are formatted with `Intl` for `es-CO` in `src/shared/lib/format.ts`
  (`$ 1.234.567`, `15 de septiembre de 2026`). `<html lang="es-CO">`.

## Consequences

Adding a second language later means extracting strings; inline copy keeps components readable
until then.
