# 0016. Form and panel components on Polpo; income screen behavior

- Status: Accepted
- Date: 2026-11-19

## Context

Screen 04 introduces the Figma "Campo monetario", "Opción" and the live estimate panel, plus two
behaviors that Figma does not define: independent income and the link "¿De dónde sale cada
cifra?".

## Decision

- `MoneyField` wraps Polpo `InputNumber` (es-CO format, `,` as decimal separator). The `$` sign
  and the origin chip are passed as Polpo `leftIcon`/`rightIcon` components. Figma styles for
  label, box, focus ring and error live in `src/styles/polpo-overrides.css`, scoped to
  `.money-field`.
- The Figma error state ("Revisa si te faltó un cero") is shown when the value is about 10 times
  smaller or larger than what the exogenous report says (`shared/lib/zero-slip.ts`). It warns but
  does not block.
- `OptionCard` is a card `<label>` around a Polpo `Radio`, restyled in the same overrides file.
- `Drawer` wraps Polpo `AsideModal` (right, 560 px, dim backdrop) with the header of Figma 09b.
- `EstimatePanel` ("Así va tu declaración") shows the live estimate in coral (to pay) or mint
  (in favor). Its link opens `FiguresDrawer`, a side panel (not designed in Figma) with each
  figure, its 210 box and the art. 241 explanation — chosen by the owner.
- Independent income: choosing "Sí, honorarios o servicios" is saved and shows an info alert that
  it is not calculated yet; the flow continues to Patrimonio. Chosen by the owner.
- Polpo's base styles add `margin: 1em` to every `<label>`; label-based components reset it.

## Consequences

The overrides file is the only place that reaches into Polpo class names; if Polpo changes its
markup, update it there.
