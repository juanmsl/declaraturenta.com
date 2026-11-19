# 0032. Fees (honorarios) with both options

- Status: Accepted
- Date: 2026-11-19

## Context

An independent who receives fees or payments for services must choose (art. 206 par. 5 E.T.):
subtract the costs and expenses of the activity (boxes 43–57), or declare the fees as labor
income with the 25 % exempt income (box 32, the DIAN's hidden box 356 "Honorarios sin costos").
Never both. The owner decided that we calculate both options, suggest the one that leaves less
tax and let the person confirm it.

## Decision

- New `fees` data: concepts (fees received), mandatory pension and solidarity contributions as an
  independent, costs, and the confirmed `option` (`costs` | `exempt` | null).
- `computeDeclaration` runs the whole return with each option when there are fees and returns
  `feesComparison` (tax due with each and the suggested one). While `option` is null it applies the
  suggested option; once the person confirms, it applies theirs. On a tie we suggest `exempt`.
- **Costs**: 43 = fees, 44 = contributions, 45 = costs, 46 = 43 − 44 − 45, 55 = loss, 57 = 54.
  Box 140 is flagged when 45 ÷ 43 is above 60 % (art. 336-1 E.T.).
- **Exempt**: fees add to box 32 and contributions to box 33, so the 25 % exempt and its 790 UVT
  cap cover salary and fees together.
- **Limited benefits** (41, 53, 69, 86) are now distributed as the DIAN instructions say: first to
  labor up to box 34, then fees up to 46, capital up to 61 and non-labor up to 78. Box 139 is
  capped at 42 + 57.
- State version 9 adds `fees`; versions 7 and 8 are migrated.

## Consequences

- Simplifications: the deductions (housing interest, prepaid health, dependents) are computed as
  labor deductions and flow to the fees column only through the distribution of the cap; the
  dependents 10 % of the costs option (art. 336 num. 3) is not added for fees. Columns 47–52 stay
  at 0.
- Independent contributions found in the exogenous report will go to `fees` when there are fees
  (next step, with the screens).
