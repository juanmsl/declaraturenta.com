# 0021. Small-screen view: "Usa un computador" below 1280 px

- Status: Accepted; the small-screen part is superseded by [ADR 0060](./0060-steps-on-phones-and-tablets.md)
- Date: 2026-11-19

## Context

The product is desktop only (1280 px minimum). Figma screen 10 (`23:3012`) is the only mobile
view: it asks the user to continue on a computer. Its link box shows a placeholder domain
("declaratu.renta/continuar · Ejemplo"), "Compartir a mi computador" had no defined behavior and
its header uses a three-diamond mark that is not the system logo.

## Decision

- `App` renders `UseComputerPage` instead of the router when `(max-width: 1279.98px)` matches,
  using Polpo's `useMediaQuery`. The query starts as "not small", so desktops never flash the
  small view. The declaration state is not mounted on small screens.
- **Link**: show `window.location.host` and copy `window.location.origin`, without the "Ejemplo"
  label. After copying, the button reads "Enlace copiado" for 2 s.
- **Compartir a mi computador**: opens the system share sheet (`navigator.share`) with the link.
  When the browser has no Web Share API the button is hidden.
- **Header**: the system `Logo` (color isotype, 24 px) with a `title-s` wordmark; `Logo` gained a
  `wordmarkVariant` prop for this.
- The illustration is the Figma vector exported to `src/assets/illustrations/`.
- Between 480 px and 1280 px the content stays in a centered 480 px column (Figma only has the
  phone layout).

## Consequences

- Any new route is desktop only by default; nothing else needs to handle small screens.
- When the real domain exists, the link box keeps working without changes.
