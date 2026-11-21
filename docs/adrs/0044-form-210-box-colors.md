# 0044. Colors of the boxes in the Formulario 210 screen

- Status: Accepted
- Date: 2026-11-20

## Context

In the Formulario 210 screen, calculated boxes (violet background) blended with the page, and the
final result was mint both for the balance in favor (137) and for the amount to pay (136), which
was confusing.

## Decision

Owner's choices:

- Calculated boxes get a 1 px border in `borde/acento` (`border-line-action`), the violet of their
  number, like the border of the entered boxes.
- The final result keeps mint for the balance in favor (box 137) and uses coral, the color of the
  amount to pay, for box 136: `bg/coral-suave` with `borde/error` and a `bg/coral` number. The
  domain still marks it `highlighted`; `BoxField` picks the color by the box number.
- The legend lists «Saldo a favor» and «Saldo a pagar» instead of «Resultado final».
- Figma: «Casilla 210» (17:1658) has the border on «Calculada», «Destacada» renamed to «Saldo a
  favor», and a new «Saldo a pagar» variant; the legend of screen 09 is updated.
