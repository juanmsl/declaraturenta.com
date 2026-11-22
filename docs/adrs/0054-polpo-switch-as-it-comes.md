# 0054. Every switch is the Polpo Switch as it comes

- Status: Accepted
- Date: 2026-11-21

## Context

The app had three switches: «Otras cédulas» in the Formulario 210, `ToggleField` (Otros ajustes,
Deducciones, the VAT question) and the refund question in box 137 (ADR 0050). The first two were
restyled in `polpo-overrides.css` to look like the old Figma «Interruptor» (40 × 24, white dot), and
the third had its colors overridden. The owner asked to use the Polpo Switch without overriding its
styles, with its colors coming from the Tailwind theme.

## Decision

Owner's choices:

- **Every switch is `<Switch color='primary' size='small' width='large' />`**, like the box 137
  one. Primary is the theme's violet. The style overrides of `.toggle-field` and `.refund-switch`
  are removed.
- **Only one theme token is set for the switch**: Polpo paints the off track with
  `--color-background-paper`, which is bg/superficie (white) in this theme, the same as the cards
  the switches sit on. Inside `.polpo-switch-container` that token is bg/sutil. The rest of the
  components keep the global token.
- **Figma**: the «Interruptor» component now matches the Polpo switch: 56 × 24, 4 px padding, 16 px
  dot; off, a bg/sutil track and a violet dot; on, a violet track and a light dot (violeta/100; in
  code it is Polpo's mix of the violet with its contrast color).

## Consequences

- Switches look the same everywhere and follow the theme if the primary color changes.
- They still have no accessible name of their own (Polpo's labels only); pending for the
  accessibility audit.
