# Architecture Overview

NexChat is built with a focus on **scalability**, **maintainability**, and **performance**. The architecture follows modern best practices and is designed to be easily understood by new team members.

## Design Philosophy

### 1. **Separation of Concerns**

Each layer and module has a single, well-defined responsibility. This makes the codebase predictable and easy to navigate.

### 2. **Feature-First Organization**

Code is organized by **features** (auth, chat, rooms) rather than by technical type (components, services, hooks). This keeps related code together and reduces the cognitive load when working on a specific feature.

### 3. **Explicit Dependencies**

Dependencies between modules are explicit and flow in one direction. There are no hidden dependencies or circular imports.

### 4. **Fail-Fast Validation**

The application validates its configuration at startup. If required environment variables are missing, the app fails immediately with a clear error message rather than crashing later at runtime.

### 5. **Progressive Enhancement**

The application gracefully degrades when optional features are unavailable. For example:

- Sentry is initialized silently — if no DSN is configured, errors are still caught but not reported
- Firebase config validation only warns in development mode

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Application                           │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Pages (Code-Split, Lazy-Loaded)                    │    │
│  │  - HomePage, LoginPage, ChatPage                    │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Features (Feature-Sliced Modules)                  │    │
│  │  - Auth, Chat, Rooms                                │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Shared (Cross-Cutting Concerns)                    │    │
│  │  - Utilities, Hooks, Types, Constants               │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Library Integrations                               │    │
│  │  - Firebase, i18next, Sentry, MUI Theme             │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     External Services                        │
│  - Firebase Authentication (Google Sign-In)                 │
│  - Firestore (Real-time Database)                           │
│  - Sentry (Error Tracking)                                  │
└─────────────────────────────────────────────────────────────┘
```

## Key Architectural Decisions

| Decision                  | Rationale                                         |
| ------------------------- | ------------------------------------------------- |
| **Vite over CRA**         | Faster builds, native ESM, better HMR             |
| **Zustand over Redux**    | Simpler API, less boilerplate, smaller bundle     |
| **MUI over Tailwind**     | Rich component library, consistent design system  |
| **Firebase Backend**      | Real-time by default, serverless, no backend code |
| **Feature-Sliced Design** | Better code organization, easier feature scaling  |
| **TanStack Query**        | Robust data fetching, caching, and sync           |
| **Zod Validation**        | Type-safe schema validation with great DX         |

For detailed rationale, see the [Architecture Decision Records](./adr/README.md).

## Performance Characteristics

- **Code Splitting**: Each page is lazy-loaded, reducing initial bundle size
- **Tree Shaking**: Unused code is eliminated during build
- **Manual Chunking**: Dependencies are split into logical chunks for optimal caching
- **Virtualization**: Long message lists use `@tanstack/react-virtual` for performance
- **Memoization**: Expensive computations are memoized with `useMemo` and `useCallback`
- **Debouncing**: Search and input operations are debounced to reduce unnecessary work

## Security Model

- **Authentication**: Google OAuth via Firebase Auth — no passwords stored
- **Authorization**: Firestore Security Rules enforce data access at the database level
- **Environment Variables**: Validated at startup to prevent runtime surprises
- **Error Handling**: Errors are caught and reported without exposing sensitive data
- **Console Stripping**: `console.log`, `console.debug`, and `console.trace` are stripped in production

## Observability

- **Error Tracking**: Sentry captures runtime errors with full context
- **Logging**: Production builds strip debug logs; only critical errors are reported
- **Performance Monitoring**: React Query and Vite provide insights into data fetching and build performance
