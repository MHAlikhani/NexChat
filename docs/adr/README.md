# Architecture Decision Records (ADR)

Architecture Decision Records (ADR) document the significant architectural decisions made for this project. Each ADR explains the context, the decision, and the consequences.

## What is an ADR?

An Architecture Decision Record is a short document that captures:

- **Context**: The situation and problem that prompted the decision
- **Decision**: The chosen solution
- **Consequences**: The trade-offs and outcomes (both positive and negative)

## Why Use ADRs?

- **Transparency**: Anyone can understand why the codebase is structured the way it is
- **Onboarding**: New team members can quickly get up to speed
- **Future Reference**: When revisiting decisions, the rationale is preserved
- **Accountability**: Decisions are made deliberately, not accidentally

## ADR Format

Each ADR follows this template:

```markdown
# ADR [Number]: [Title]

## Status

[Accepted | Superseded by ADR-XXX | Deprecated]

## Context

[What is the issue that we're seeing that is motivating this decision?]

## Decision

[What is the change that we're proposing and/or doing?]

## Consequences

[What becomes easier or more difficult to do and any risks introduced?]

## Alternatives Considered

[What other approaches were evaluated and why were they rejected?]
```

## ADR Index

| #   | Decision                                                                  | Status   | Date |
| --- | ------------------------------------------------------------------------- | -------- | ---- |
| 001 | [Vite over Create React App](./001-vite-over-cra.md)                      | Accepted | 2023 |
| 002 | [Zustand over Redux](./002-zustand-over-redux.md)                         | Accepted | 2023 |
| 003 | [MUI over Tailwind CSS](./003-mui-over-tailwind.md)                       | Accepted | 2023 |
| 004 | [Firebase as Backend](./004-firebase-backend.md)                          | Accepted | 2023 |
| 005 | [i18next for Internationalization](./005-i18next-internationalization.md) | Accepted | 2023 |
| 006 | [Sentry for Error Tracking](./006-sentry-error-tracking.md)               | Accepted | 2023 |
| 007 | [Vitest for Testing](./007-vitest-testing.md)                             | Accepted | 2023 |
| 008 | [TypeScript Strict Mode](./008-typescript-strict-mode.md)                 | Accepted | 2023 |
| 009 | [TanStack Query for Data Fetching](./009-tanstack-query-data-fetching.md) | Accepted | 2023 |
| 010 | [Feature-Sliced Design](./010-feature-sliced-design.md)                   | Accepted | 2023 |
| 011 | [Zod for Validation](./011-zod-validation.md)                             | Accepted | 2023 |
| 012 | [React Hook Form for Forms](./012-react-hook-form.md)                     | Accepted | 2023 |

## Contributing New ADRs

When making a significant architectural decision, create a new ADR:

1. Copy the template above into a new file: `docs/adr/XXX-title.md`
2. Fill in all sections thoroughly
3. Add an entry to the index table above
4. Submit a pull request for review

## When to Create an ADR

Create an ADR when you:

- Choose a new library or framework
- Change the project structure significantly
- Adopt a new architectural pattern
- Make a decision that will be hard to reverse
- Encounter a trade-off that requires explicit choice

You typically do **not** need an ADR for:

- Bug fixes
- Minor refactoring
- Style changes
- Dependency updates
