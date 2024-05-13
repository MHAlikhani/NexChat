# ADR 002: Choosing Zustand over Redux for Client State

**Date**: September 4, 2026  
**Status**: Accepted  
**Author**: Mohammad Hossein Alikhani

## Context
Managing complex state in React applications can quickly become cumbersome. While Redux has long been the industry standard, it introduces significant boilerplate (actions, reducers, providers) that is often overkill for modern, moderately complex applications.

## Decision
We will use **Zustand** for managing client-side state, paired with **TanStack Query** for server-state management.

## Rationale
1. **Minimal Boilerplate**: Zustand eliminates the need for wrapping the app in a Provider, writing action creators, or defining complex reducers. It is straightforward and hook-based.
2. **Performance**: It utilizes a selector-based subscription model, ensuring that only components explicitly subscribed to a specific slice of state will re-render.
3. **Developer Experience**: It offers seamless, native integration with Redux DevTools for debugging without the Redux overhead.
4. **Clear Separation of Concerns**: By delegating server-state caching to TanStack Query, Zustand is reserved strictly for ephemeral UI state (e.g., modal visibility, active chat room), keeping the global store incredibly lean.

## Consequences
- **Positive**: Cleaner codebase, faster feature development, and improved runtime performance due to reduced re-renders.
- **Negative**: The development team must adapt to the hook-based paradigm of Zustand, though its learning curve is notoriously shallow.