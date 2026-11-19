# 0006. Icons from `react-icons/lu`

- Status: Accepted
- Date: 2026-11-19

## Context

Figma icons are Lucide style. Polpo uses `react-icons` and its icon props take an `IconType`.

## Decision

Use the Lucide set from `react-icons/lu`, rendered through `shared/ui/Icon.tsx`. `Icon` sets the
stroke width to `2 × 24 / size` so the stroke stays 2 px at every size, as in Figma (14, 16 and
18 px). Icons are decorative (`aria-hidden`) unless a `label` is given.

## Consequences

No extra icon package. Pass the component itself to Polpo props (`leftIcon={LuCalendar}`).
