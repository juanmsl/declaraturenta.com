# Architecture Decision Records

We record every significant decision as an ADR ([format by Michael Nygard](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)).
Copy `template.md`, use the next number, and add it to this index. ADRs are immutable once
accepted: to change a decision, write a new ADR that supersedes the old one.

| #                                                               | Decision                                                         | Status   |
| --------------------------------------------------------------- | ---------------------------------------------------------------- | -------- |
| [0001](./0001-record-architecture-decisions.md)                 | Record architecture decisions                                    | Accepted |
| [0002](./0002-frontend-stack.md)                                | Frontend stack: React 19, TypeScript 6, Vite, Tailwind 4, pnpm   | Accepted |
| [0003](./0003-polpo-ui-library.md)                              | Polpo as the UI library; local components when missing           | Accepted |
| [0004](./0004-design-tokens-on-polpo-theme.md)                  | Figma tokens on top of Polpo's theme                             | Accepted |
| [0005](./0005-typography-text-component.md)                     | Typography: `Text` wrapper and `type-*` utilities                | Accepted |
| [0006](./0006-icons-react-icons-lucide.md)                      | Icons from `react-icons/lu`                                      | Accepted |
| [0007](./0007-routing-react-router.md)                          | Routing with React Router 8 (library mode)                       | Accepted |
| [0008](./0008-project-structure-and-language.md)                | Feature-based structure; English code, Spanish UI                | Accepted |
| [0009](./0009-code-quality-tooling.md)                          | Code quality: ESLint 10, Prettier, Vitest, husky, commitlint     | Accepted |
| [0010](./0010-self-hosted-fonts.md)                             | Self-hosted fonts with Fontsource                                | Accepted |
| [0011](./0011-brand-assets-from-figma.md)                       | Logo as SVG exported from Figma; local progress components       | Accepted |
| [0012](./0012-tax-engine-in-domain.md)                          | Tax calculation engine in `src/domain`                           | Accepted |
| [0013](./0013-declaration-state.md)                             | Declaration state: Context persisted in localStorage             | Accepted |
| [0014](./0014-neutral-copy.md)                                  | Gender-neutral copy                                              | Accepted |
| [0015](./0015-simulated-exogenous-import.md)                    | Simulated exogenous import with a local dropzone                 | Accepted |
| [0016](./0016-form-components-on-polpo.md)                      | Form and panel components on Polpo; income behavior              | Accepted |
| [0017](./0017-assets-and-debts-editing.md)                      | Adding, editing and deleting assets and debts                    | Accepted |
| [0018](./0018-deductions-screen.md)                             | Deductions screen: editable rows and cap meter                   | Accepted |
| [0019](./0019-draft-pdf-and-filing-guide.md)                    | Draft screen: PDF, filing guide and the 210 model                | Accepted |
| [0020](./0020-form-210-screen-and-box-detail.md)                | Formulario 210 screen and box detail with editable concepts      | Accepted |
| [0021](./0021-small-screen-view.md)                             | Small-screen view: "Usa un computador" below 1280 px             | Accepted |
| [0022](./0022-not-found-and-error-pages.md)                     | Not-found and error pages                                        | Accepted |
| [0023](./0023-dian-dependents-and-occasional-gains.md)          | Dependents (138–139) and occasional gains rate (127) per DIAN    | Accepted |
| [0024](./0024-exogenous-xlsx-import.md)                         | Reading the DIAN exogenous report (.xlsx)                        | Accepted |
| [0025](./0025-capital-and-non-labor-income.md)                  | Capital and non-labor income in the general schedule             | Accepted |
| [0026](./0026-income-screen-other-income-and-vehicle-review.md) | Income screen with other income, and review of imported vehicles | Accepted |
| [0027](./0027-local-copy.md)                                    | Local copy of the declaration (.json)                            | Accepted |
| [0028](./0028-help-guide-and-faq.md)                            | Help: guide and searchable frequent questions                    | Accepted |
| [0029](./0029-compact-braid-favicon-and-section-marker.md)      | Compact braid, favicon and section marker                        | Accepted |
| [0030](./0030-form-210-validated-against-dian-instructions.md)  | Form 210 validated against the DIAN instructions                 | Accepted |
| [0031](./0031-pensions-dividends-and-occasional-gains.md)       | Pensions, dividends and occasional gains                         | Accepted |
| [0032](./0032-fees-with-both-options.md)                        | Fees (honorarios) with both options                              | Accepted |
| [0033](./0033-other-schedules-in-the-income-screen.md)          | Fees and other schedules in the income screen                    | Accepted |
| [0034](./0034-configurable-tax-year.md)                         | Configurable taxable year                                        | Accepted |
| [0035](./0035-empty-start-and-filing-test-on-the-landing.md)    | Empty start, and «¿Debo declarar?» on the landing                | Accepted |
| [0036](./0036-landing-page-and-routes.md)                       | Landing page and routes                                          | Accepted |
| [0037](./0037-legal-pages-and-terms-acceptance.md)              | Legal pages and acceptance of the terms                          | Accepted |
| [0038](./0038-every-box-of-the-210.md)                          | Every box of the Formulario 210                                  | Accepted |
| [0039](./0039-vercel-configuration.md)                          | Vercel configuration                                             | Accepted |
| [0040](./0040-delete-my-data.md)                                | «Borrar mis datos»                                               | Accepted |
| [0041](./0041-seo-and-link-previews.md)                         | SEO and link previews                                            | Accepted |
| [0042](./0042-ci-and-end-to-end-tests.md)                       | Continuous integration and end-to-end tests                      | Accepted |
| [0043](./0043-scroll-and-motion.md)                             | Scroll and motion                                                | Accepted |
| [0044](./0044-form-210-box-colors.md)                           | Colors of the boxes in the Formulario 210 screen                 | Accepted |
