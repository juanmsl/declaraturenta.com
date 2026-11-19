# 0004. Figma tokens on top of Polpo's theme

- Status: Accepted
- Date: 2026-11-19

## Context

Figma defines three variable collections: "Primitivos" (ink, violeta, sol, coral, menta),
"Color" (semantic tokens in Spanish) and "Espacio y radio". Polpo exposes a theme with base colors
that generate 50–900 scales.

## Decision

In `src/styles/index.css`, after the Tailwind and Polpo imports:

1. **Primitives** as `--color-ink-*`, `--color-violet-*`, `--color-sun-*`, `--color-coral-*`,
   `--color-mint-*`, with the Figma values. Tailwind's default `violet` scale is reset with
   `--color-violet-*: initial` so only ours exists.
2. **Semantic tokens in English**: backgrounds (`canvas`, `surface`, `subtle`, `rail`, `action`,
   `sun`, `coral`, `mint`, `ink` + `-hover`/`-soft`), text (`fg`, `fg-secondary`, `fg-muted`,
   `fg-action`, …) and borders (`line`, `line-strong`, …). The mapping to Figma names is in
   `docs/design.md`.
3. **Polpo overrides**: `primary` = violet `#5b47f0` (with a white foreground), `alert` = coral,
   `warning` = sun, `active` = mint; background, paper, foreground, border and fonts from Figma.
4. **Radius** `sm` 8, `md` 12, `lg` 20 px. Spacing uses Tailwind's 4 px scale (matches Figma).

## Consequences

Screens only use semantic utilities (`bg-canvas`, `text-fg-muted`, `border-line`). Adding a dark
mode later means redefining the semantic tokens only.
