# 0029. Compact braid, favicon and section marker

- Status: Accepted
- Date: 2026-11-19

## Context

The braid in the top bar had seven woven segments of 80 px (about 584 px). At 1280 px it did not
fit next to "Copia" and "Ayuda" and was clipped on the right. The favicon was the full 4 × 4
isotype, whose diamonds measure less than 2 px at 16 px. The owner also asked which marker the
side rail should use. Four options for each were drawn in the Figma board "Opciones por decidir"
(`78:9346`) and the owner chose one of each.

## Decision

- **Braid**: option B, one diamond per step joined by a thread (Figma "Trenza/Paso"). The diamond
  reuses the side rail states: ink when done, violet when current, grey outline when pending. The
  thread after a done step is sun, the rest is the base line. It takes 180 px for seven steps.
  `BraidSegment` is removed.
- **Favicon**: option D, a violet plate (radius 8) with four white diamonds (Figma "Favicon").
  `public/favicon.svg` for modern browsers and `public/favicon.ico` with 16, 32 and 48 px for the
  rest.
- **Section marker**: option A, the diamond already used in the side rail and "Tu camino". No
  change.

## Consequences

- The top bar fits at 1280 px without clipping, and the braid reads the same as the side rail.
- The braid no longer shows partial progress inside a step; progress is per step only.
- The favicon is the only place where the diamonds are white on violet; it follows the rule that
  the diamond is only progress, the side rail and the brand mark.
