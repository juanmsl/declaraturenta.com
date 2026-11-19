# 0001. Record architecture decisions

- Status: Accepted
- Date: 2026-11-19

## Context

The project is built by the owner together with AI agents across many sessions. Any session must
be able to understand why things are the way they are without the original conversation.

## Decision

Record decisions as ADRs in `docs/adrs/`, in English. Keep product, design and status docs in
`docs/`. Agents must confirm new decisions with the owner before acting and then record them.

## Consequences

Every non-trivial choice needs a short ADR. `AGENTS.md` and `docs/context.md` must stay current.
