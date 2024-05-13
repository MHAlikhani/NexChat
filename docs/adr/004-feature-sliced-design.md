# ADR 004: Adopting Feature-Sliced Design (FSD) Architecture

**Date**: September 4, 2026  
**Status**: Accepted  
**Author**: Mohammad Hossein Alikhani

## Context
The previous project structure was organized by file type (e.g., global `components/`, `hooks/`, `services/` directories). In growing applications, this "Group-by-Type" approach inevitably leads to tangled dependencies and "spaghetti code," as files related to a single feature are scattered across multiple unrelated directories.

## Decision
We will restructure the codebase using a **Feature-Based** architecture, heavily inspired by the principles of Feature-Sliced Design (FSD).

## Rationale
1. **High Cohesion**: All code related to a specific domain (e.g., `chat`, `auth`) is colocated within a single feature directory, making it easy to understand and modify.
2. **Low Coupling**: Features are strictly isolated. They cannot directly depend on each other; any shared logic must be explicitly elevated to the `shared` layer.
3. **Scalability**: Adding new features or removing deprecated ones becomes a matter of adding or deleting a single directory, without ripple effects across the codebase.
4. **Testability**: Features are self-contained, making it straightforward to write isolated unit and integration tests.

## Consequences
- **Positive**: Drastically simplified codebase maintenance, faster onboarding for new developers, and a more predictable project structure.
- **Negative**: Requires a mental shift for developers accustomed to Group-by-Type. There may be a slight, intentional duplication of utilities in the `shared` layer, which is an acceptable trade-off for strict modularity.