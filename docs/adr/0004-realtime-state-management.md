# ADR 0004: Real-time State Management Strategy

## Status
Accepted

## Context
The application requires real-time synchronization of chat messages using Firebase Firestore `onSnapshot`. 
Initially, the architecture document suggested using TanStack Query for all server state. However, TanStack Query is primarily designed for request/response cycles (REST/GraphQL) and requires custom adaptations for true real-time push notifications.

## Decision
We will use a **Hybrid State Management** approach:
1. **Zustand** will be the single source of truth for real-time chat messages, typing indicators, and ephemeral UI state (like `isLoadingMore`).
2. **Firebase `onSnapshot`** will directly update the Zustand store via the `messagesService`.
3. **TanStack Query** will be reserved for non-real-time or infrequently changing data (e.g., user profiles, room metadata, initial app configuration).

## Consequences
### Positive
- Simplified real-time data flow without fighting TanStack Query's caching mechanisms.
- Lower memory footprint for active chat rooms.
- Immediate UI updates with optimistic UI patterns handled cleanly in Zustand.

### Negative
- Requires manual management of subscription lifecycles (handled in `useMessages` hook).
- Architecture documentation needed updating to reflect this deviation from the "TanStack Query for all server state" rule.

## References
- `src/features/chat/hooks/useMessages.ts`
- `src/features/chat/stores/chatStore.ts`
- `src/features/chat/services/messages.service.ts`