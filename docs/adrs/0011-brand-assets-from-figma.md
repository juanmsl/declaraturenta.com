# 0011. Logo as SVG from Figma; progress pieces as local components

- Status: Accepted
- Date: 2026-11-19

## Context

Polpo has no logo, braid, side rail or step list. The Figma `Logo` component has Isotipo and
Horizontal versions in three colors.

## Decision

- The isotype is exported from Figma as SVG (`src/assets/brand/isotype-{color,ink,inverted}.svg`)
  and used by `shared/ui/Logo.tsx`; the wordmark is live text (`title-l`). The color isotype is
  also the favicon until the 16/32 px versions exist.
- The braid segment and the diamond are local SVG components (`BraidSegment`, `Diamond`) that
  reproduce the Figma geometry and switch colors by state with tokens.
- Side rail, top bar, journey list and cards are local components built with Tailwind and Polpo.

## Consequences

If the logo changes in Figma, re-export the SVGs. The diamond is only for progress, the rail and
the isotype.
