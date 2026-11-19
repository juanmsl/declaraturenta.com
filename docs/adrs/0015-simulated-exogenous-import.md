# 0015. Simulated exogenous import with a local file dropzone

- Status: Superseded by [0024](./0024-exogenous-xlsx-import.md)
- Date: 2026-11-19

## Context

Screen 03 imports the DIAN exogenous report. The real file format and import mechanism are not
defined. Figma only shows the screen after the file was read. Polpo 0.2.0 `InputFile` has fixed
English copy ("Max size", size errors) and its own file list, which cannot be changed by props.

## Decision

- **Simulation**: choosing any `.xlsx`, `.xls` or `.pdf` file stores its name and applies the
  sample report (`src/mocks/sample-exogenous.ts`) with `applyExogenous`. The file is not read.
- **Empty state**: a dashed drop area ("Arrastra tu archivo aquí o haz clic para elegirlo") with
  the same card as the loaded state. "Cambiar archivo" reopens the file picker.
- **Local component** `shared/ui/FileDropzone.tsx` with a native input, drag and drop and Spanish
  errors, instead of Polpo `InputFile`. Polpo should get text props for `InputFile` upstream.
- **"Usar estos datos"** confirms every item that needs confirmation (housing interest) and
  continues to Ingresos. It is disabled until a file is chosen.
- **"Llenar sin exógena"** clears every value that comes from the report (`clearExogenous`:
  labor payments, contributions, withholdings, bank accounts, debts, housing interest, prepaid
  health and the filing-test values) and continues to Ingresos. Uploading later refills them;
  concepts the user changed are kept.
- The found items show the current values of the return, so user edits are reflected.

## Consequences

- The file summary counts entities from the data: 4 entities report 6 items (Figma says 5).
- Replacing the simulation with a real parser only changes how the `ExogenousReport` is built.
