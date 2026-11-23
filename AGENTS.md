# Agent guide

Read this before changing anything. Keep it short and current.

## Ground rules

1. **Confirm decisions with the project owner.** Do not assume: when a choice is not covered by
   an ADR or these docs, ask first. Record every agreed decision as an ADR in `docs/adrs/`
   (English) and update `docs/context.md`.
2. **Code in English, UI in Spanish (Colombia).** Identifiers, comments, docs and commit messages
   in English. Every user-facing string in Spanish, written inline in the component
   ([ADR 0008](./docs/adrs/0008-project-structure-and-language.md)). Use the "experto cercano"
   voice: tutea, explica simple, con rigor tributario. Copy is gender-neutral
   ([ADR 0014](./docs/adrs/0014-neutral-copy.md)).
3. **Follow Figma.** File `6yCjrloMnOYF9nxj8pQqob`. Every screen and component has a node ID in
   [`docs/design.md`](./docs/design.md). Match it before inventing anything.
4. **Polpo first** ([ADR 0003](./docs/adrs/0003-polpo-ui-library.md)). Use Polpo components,
   layouts and hooks (`polpo/components`, `polpo/layouts`, `polpo/hooks`, `polpo/helpers`).
   If Polpo lacks a piece, ask, then build it in `src/shared/ui` with Tailwind and project tokens.
5. **Tokens only.** Use the semantic Tailwind tokens (`bg-canvas`, `text-fg-muted`,
   `border-line`, …) and `<Text variant>` / `type-*` utilities. No hex values, no `text-[15px]`,
   no `text-*` font sizes ([ADR 0004](./docs/adrs/0004-design-tokens-on-polpo-theme.md),
   [ADR 0005](./docs/adrs/0005-typography-text-component.md)).
6. **Money and dates** go through `src/shared/lib/format.ts` (`$ 1.234.567`,
   `15 de septiembre de 2026`).
7. **Tax data is sensitive.** No third-party requests at runtime (fonts are self-hosted). Use only
   the fictional sample taxpayer (Laura Gómez) and fictional entities. Never invent DIAN
   endorsements, testimonials or real user numbers.
8. **Tax rules need a source.** Formulario 210 boxes 28–76 are verified against the DIAN 2026
   instructions; boxes 77–139 still need validation against the official PDF.

## Before you finish

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm e2e
```

`main` is protected: work on a branch and open a pull request; GitHub runs the same checks
([ADR 0042](./docs/adrs/0042-ci-and-end-to-end-tests.md)). Compare any new screen with its Figma node at 1440 px wide, and check 1280 px (minimum desktop width), 834 px (tablet) and 390 px (phone) ([ADR 0060](./docs/adrs/0060-steps-on-phones-and-tablets.md)).
