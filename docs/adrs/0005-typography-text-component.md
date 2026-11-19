# 0005. Typography: `Text` wrapper and `type-*` utilities

- Status: Accepted
- Date: 2026-11-19

## Context

Figma has 12 text styles; Polpo's `Typography` has 8 fluid variants (`hero`, `header1–4`, `body`,
`label`, `small`). Two findings during implementation:

- `tailwind-merge`, used by Polpo internally and by `cn`, treats unknown `text-*` classes as text
  colors. A custom size such as `text-body-m` is silently dropped when a color such as
  `text-fg-secondary` is on the same element.
- Figma's inspector reports Bricolage Grotesque with `opsz 14`, but it renders with automatic
  optical sizing (opsz = font size). Measured widths only match Figma with automatic sizing.

## Decision

- A local `Text` component (`src/shared/ui/Text.tsx`) wraps Polpo `Typography` and exposes the
  Figma styles as variants: `display`, `title-l`, `title-m`, `title-s`, `body-l`, `body-m`,
  `body-m-strong`, `caption`, `note`, `figure-xl`, `figure-l`, `figure-m`. Each variant picks the
  semantic Polpo variant (and so the default HTML element) and can change the element with `as`.
- The styles are CSS utilities named `type-*` (`@utility` in `src/styles/index.css`), built from
  `--text-*` theme tokens. Never use `text-<size>` classes for the custom sizes.
- Font sizes are fixed (not fluid) because the product is desktop only.
- Bricolage Grotesque keeps automatic optical sizing; no `font-variation-settings`.

## Consequences

Screens use `<Text variant>`; non-text components (e.g. `Button`) use a `type-*` utility. Class
names in the variant map must stay literal so Tailwind detects them.
