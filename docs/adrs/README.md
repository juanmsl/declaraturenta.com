# Architecture Decision Records

We record every significant decision as an ADR ([format by Michael Nygard](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)).
Copy `template.md`, use the next number, and add it to this index. ADRs are immutable once
accepted: to change a decision, write a new ADR that supersedes the old one.

| #                                                | Decision                                                       | Status   |
| ------------------------------------------------ | -------------------------------------------------------------- | -------- |
| [0001](./0001-record-architecture-decisions.md)  | Record architecture decisions                                  | Accepted |
| [0002](./0002-frontend-stack.md)                 | Frontend stack: React 19, TypeScript 6, Vite, Tailwind 4, pnpm | Accepted |
| [0003](./0003-polpo-ui-library.md)               | Polpo as the UI library; local components when missing         | Accepted |
| [0004](./0004-design-tokens-on-polpo-theme.md)   | Figma tokens on top of Polpo's theme                           | Accepted |
| [0005](./0005-typography-text-component.md)      | Typography: `Text` wrapper and `type-*` utilities              | Accepted |
| [0006](./0006-icons-react-icons-lucide.md)       | Icons from `react-icons/lu`                                    | Accepted |
| [0007](./0007-routing-react-router.md)           | Routing with React Router 8 (library mode)                     | Accepted |
| [0008](./0008-project-structure-and-language.md) | Feature-based structure; English code, Spanish UI              | Accepted |
| [0009](./0009-code-quality-tooling.md)           | Code quality: ESLint 9, Prettier, Vitest, husky, commitlint    | Accepted |
| [0010](./0010-self-hosted-fonts.md)              | Self-hosted fonts with Fontsource                              | Accepted |
| [0011](./0011-brand-assets-from-figma.md)        | Logo as SVG exported from Figma; local progress components     | Accepted |
| [0012](./0012-tax-engine-in-domain.md)           | Tax calculation engine in `src/domain`                         | Accepted |
| [0013](./0013-declaration-state.md)              | Declaration state: Context persisted in localStorage           | Accepted |
| [0014](./0014-neutral-copy.md)                   | Gender-neutral copy                                            | Accepted |
| [0015](./0015-simulated-exogenous-import.md)     | Simulated exogenous import with a local dropzone               | Accepted |
| [0016](./0016-form-components-on-polpo.md)       | Form and panel components on Polpo; income behavior            | Accepted |
