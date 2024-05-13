# ADR 005: Real-time State Management Strategy

**Date**: September 4, 2026  
**Status**: Accepted  
**Author**: Mohammad Hossein Alikhani

## Context
The application requires seamless, real-time synchronization of chat messages and typing indicators using Firebase Firestore's `onSnapshot`. 

Initially, the architectural guidelines suggested using TanStack Query for all server state. However, TanStack Query is primarily optimized for traditional request/response cycles (REST/GraphQL). Adapting it for true, push-based real-time subscriptions introduces unnecessary complexity and fights against its built-in caching mechanisms.

## Decision
We will implement a **Hybrid State Management** approach:
1. **Zustand** will serve as the single source of truth for real-time chat messages, typing indicators, and ephemeral UI states (e.g., `isLoadingMore`, scroll positions).
2. **Firebase `onSnapshot`** will directly feed updates into the Zustand store via dedicated service layers.
3. **TanStack Query** will be strictly reserved for non-real-time or infrequently changing data, such as user profiles, room metadata, and initial application configuration.

## Consequences
### Positive
- Simplified, predictable real-time data flow without battling TanStack Query's caching and refetching logic.
- Lower memory footprint for active chat rooms, as ephemeral data is managed efficiently.
- Immediate, snappy UI updates, with optimistic UI patterns handled cleanly within Zustand actions.

### Negative
- Requires careful, manual management of subscription lifecycles (e.g., unsubscribing on component unmount), which is now encapsulated within the `useMessages` custom hook.
- The primary architecture document required an update to reflect this deliberate deviation from the "TanStack Query for all server state" baseline.

## References
- `src/features/chat/hooks/useMessages.ts`
- `src/features/chat/stores/chatStore.ts`
- `src/features/chat/services/messages.service.ts`