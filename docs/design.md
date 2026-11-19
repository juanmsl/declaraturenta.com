# Design

Figma file: <https://www.figma.com/design/6yCjrloMnOYF9nxj8pQqob> (fileKey `6yCjrloMnOYF9nxj8pQqob`).
Pages: "Flujo · AG 2025" (`0:1`), "Componentes" (`2:2`), "Fundamentos" (`2:3`).

Visual direction: boutique minimalism, light mode, friendly to non-experts. Retro accents only do
work: **violet** = action, **sun** = completed and warnings, **coral** = amount due and errors,
**mint** = success, exogenous data and refund. The Colombian detail is the caña flecha "trenza"
(braid of diamonds) used as the progress bar; the diamond appears **only** in progress, the side
rail and the isotype. No flags or stereotypes.

## Screens

| Screen                                | Figma node | Route             | Status |
| ------------------------------------- | ---------- | ----------------- | ------ |
| 01 · Inicio                           | `7:2`      | `/`               | Built  |
| 02 · ¿Debo declarar?                  | `7:350`    | `/debo-declarar`  | Built  |
| 03 · Importar exógena                 | `9:448`    | `/exogena`        | Built  |
| 04 · Ingresos                         | `9:783`    | `/ingresos`       | Built  |
| 05 · Patrimonio                       | `14:1386`  | `/patrimonio`     | Built  |
| 06 · Deducciones y exentas            | `10:871`   | `/deducciones`    | Built  |
| 07 · Resultado                        | `10:1188`  | `/resultado`      | Built  |
| 08 · Borrador 210                     | `11:1213`  | `/borrador-210`   | Built  |
| 09 · Formulario 210                   | `18:1572`  | `/formulario-210` | Built  |
| 09b · Detalle casilla 32              | `19:2267`  | `?casilla=N`      | Built  |
| 10 · Móvil · Usa un computador        | `23:3012`  | < 1280 px         | Built  |
| 11 · Página no encontrada             | `61:7844`  | `*`               | Built  |
| 12 · Error inesperado                 | `61:7890`  | error element     | Built  |
| 05d · Vehículo por revisar            | `71:8118`  | `/patrimonio`     | Built  |
| 13 · Copia local · Menú               | `73:8236`  | top bar           | Built  |
| 13b · Copia local · Reemplazar datos  | `73:8370`  | dialog            | Built  |
| 13c · Copia local · Archivo no válido | `73:8506`  | dialog            | Built  |
| 14 · Ayuda · Guía                     | `77:8942`  | help panel        | Built  |
| 14b · Ayuda · Preguntas frecuentes    | `77:9282`  | help panel        | Built  |

The board "Opciones por decidir" (`78:9346`) holds the favicon, compact braid and section
marker options waiting for the owner's choice.

## Tokens

Defined in `src/styles/index.css` ([ADR 0004](./adrs/0004-design-tokens-on-polpo-theme.md)).
Spacing uses Tailwind's 4 px scale, which matches Figma's `espacio/*` variables.

| Figma variable                        | Token                                                     | Tailwind                    |
| ------------------------------------- | --------------------------------------------------------- | --------------------------- |
| bg/lienzo                             | `--color-canvas`                                          | `bg-canvas`                 |
| bg/superficie                         | `--color-surface`                                         | `bg-surface`                |
| bg/sutil                              | `--color-subtle`                                          | `bg-subtle`                 |
| bg/riel                               | `--color-rail`                                            | `bg-rail`                   |
| bg/acento · hover · suave             | `--color-action` · `-hover` · `-soft`                     | `bg-action` …               |
| bg/sol · suave                        | `--color-sun` · `-soft`                                   | `bg-sun`, `bg-sun-soft`     |
| bg/coral · suave                      | `--color-coral` · `-soft`                                 | `bg-coral`, `bg-coral-soft` |
| bg/menta · suave                      | `--color-mint` · `-soft`                                  | `bg-mint`, `bg-mint-soft`   |
| bg/tinta                              | `--color-ink`                                             | `bg-ink`                    |
| texto/primario                        | `--color-fg`                                              | `text-fg`                   |
| texto/secundario                      | `--color-fg-secondary`                                    | `text-fg-secondary`         |
| texto/tenue                           | `--color-fg-muted`                                        | `text-fg-muted`             |
| texto/sobre-acento                    | `--color-fg-on-action`                                    | `text-fg-on-action`         |
| texto/acento                          | `--color-fg-action`                                       | `text-fg-action`            |
| texto/exito · aviso · error           | `--color-fg-success` · `-warning` · `-error`              | `text-fg-success` …         |
| borde/base                            | `--color-line`                                            | `border-line`               |
| borde/fuerte · acento · error · exito | `--color-line-strong` · `-action` · `-error` · `-success` | `border-line-strong` …      |
| radio/sm · md · lg · pill             | `--radius-sm` · `-md` · `-lg`                             | `rounded-sm/md/lg/full`     |

Primitives (`ink`, `violet`, `sun`, `coral`, `mint`) are also available (`bg-ink-150`, …) but
prefer the semantic tokens. Polpo's theme colors are mapped: `primary` = violet, `alert` = coral,
`warning` = sun, `active` = mint.

## Text styles

Use `<Text variant>` (`src/shared/ui/Text.tsx`) or the `type-*` utility
([ADR 0005](./adrs/0005-typography-text-component.md)).

| Figma style     | Variant         | Font                    | Size / line height |
| --------------- | --------------- | ----------------------- | ------------------ |
| Display         | `display`       | Bricolage Grotesque 600 | 44 / 48, −2 %      |
| Titulo/L        | `title-l`       | Bricolage Grotesque 600 | 30 / 36, −1.5 %    |
| Titulo/M        | `title-m`       | Bricolage Grotesque 600 | 21 / 28, −1 %      |
| Titulo/S        | `title-s`       | Figtree 700             | 16 / 22            |
| Cuerpo/L        | `body-l`        | Figtree 400             | 17 / 26            |
| Cuerpo/M        | `body-m`        | Figtree 400             | 15 / 22            |
| Cuerpo/M fuerte | `body-m-strong` | Figtree 600             | 15 / 22            |
| Etiqueta        | `caption`       | Figtree 500             | 13 / 18            |
| Nota            | `note`          | Figtree 400             | 12 / 16            |
| Cifra/XL        | `figure-xl`     | Figtree 700, tabular    | 40 / 44, −2 %      |
| Cifra/L         | `figure-l`      | Figtree 600, tabular    | 24 / 30, −1 %      |
| Cifra/M         | `figure-m`      | Figtree 600, tabular    | 15 / 22            |

## Components

| Figma component                                                                  | Node                                                              | Code                                                         |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------ |
| Botón (Primario/Secundario/Fantasma)                                             | `3:158`                                                           | `shared/ui/Button.tsx` (wraps Polpo `Button`)                |
| Trenza/Segmento (Completo/Actual/Pendiente)                                      | `3:248`                                                           | `shared/ui/BraidSegment.tsx`, `Braid.tsx`                    |
| Riel/Item                                                                        | `3:261`                                                           | `app/layout/SideRailItem.tsx` (uses `shared/ui/Diamond.tsx`) |
| Riel lateral                                                                     | `6:68`                                                            | `app/layout/SideRail.tsx`                                    |
| Barra superior                                                                   | `6:130`                                                           | `app/layout/TopBar.tsx`                                      |
| Logo (Horizontal/Isotipo × Color/Tinta/Invertido)                                | `33:3139`                                                         | `shared/ui/Logo.tsx`, SVGs in `src/assets/brand/`            |
| Iconos (Lucide style)                                                            | `3:2`                                                             | `react-icons/lu` through `shared/ui/Icon.tsx`                |
| Chip, Alerta, Campo monetario, Opción, Fila de cálculo, Casilla 210, Interruptor | `3:187`, `3:223`, `4:113`, `4:125`, `4:138`, `17:1658`, `17:1663` | Not built yet                                                |

When a Figma component has a Polpo equivalent, wrap or style the Polpo component. Otherwise build
it in `src/shared/ui` (ask first, see [ADR 0003](./adrs/0003-polpo-ui-library.md)).
