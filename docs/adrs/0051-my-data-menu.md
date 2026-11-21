# 0051. «Copia» becomes «Mis datos», with help texts

- Status: Accepted
- Date: 2026-11-21

## Context

The top bar menu «Copia» (ADR 0027 and 0040) had «Descargar copia», «Abrir copia» and «Borrar mis
datos». The owner found the names hard to understand for people without technical background.

## Decision

Owner's choices:

- The menu is called **«Mis datos»**: it covers downloading, loading and resetting, not only saving.
- **«Descargar datos»**, with the help line «Guarda un archivo para seguir después o en otro
  computador».
- **«Cargar datos»**, with the help line «Abre un archivo que descargaste antes y sigue donde ibas».
- **«Reiniciar formulario»** replaces «Borrar mis datos», without a help line (it already asks for
  confirmation). Its dialog is «¿Reiniciar el formulario?». It still empties only the open year.
- The dialogs, the error page («Descargar mis datos»), the help panel and the tests use the new
  names. The landing and the privacy policy keep talking about «una copia de tus datos», which is
  still true. The downloaded file name does not change.

The help lines go inside each Polpo `Menu.Option` label, in the «Nota» style.

Figma: the top bar component, screens 13 to 13d and 12.

## Consequences

- Anyone who learned «Copia» finds the same actions under «Mis datos».
