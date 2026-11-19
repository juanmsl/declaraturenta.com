# 0003. Polpo as the UI library

- Status: Accepted
- Date: 2026-11-19

## Context

The owner maintains [Polpo](https://ui.juanmsl.com) (`polpo` 0.2.0 + `polpo-tailwind-config`
0.1.5), a React + Tailwind 4 component library, and wants the site built with it. The Figma design
has components Polpo does not ship (braid, side rail, logo, form 210 boxes…).

## Decision

- Use Polpo components, layouts, hooks and helpers, imported from their subpaths. No other UI kit.
- Polpo components are styled with the project tokens. When a Figma component maps to a Polpo
  one, we wrap it in `src/shared/ui` (e.g. `Button` wraps Polpo `Button`, `Text` wraps
  `Typography`) so screens use the Figma vocabulary.
- When Polpo has no equivalent, build a local component in `src/shared/ui` with Tailwind and
  project tokens, reusing Polpo pieces where possible. Agents ask the owner before each new one.
- Polpo's component CSS lives in `@layer components`, so Tailwind utilities override it.

## Consequences

- Button wrapper uses Polpo's `default` color and sets colors with utilities, because Polpo's
  `color` prop writes inline CSS variables (solid buttons use the `-400` shade) that cannot be
  overridden from outside. Polpo's hover scale and ripple are kept; its hover shadow is removed
  to match Figma.
- Missing pieces may later move upstream into Polpo.
