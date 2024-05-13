# System Architecture Document

## Introduction
This document outlines the technical architecture of the **NexChat** project. Its purpose is to provide a comprehensive, high-level view of the system's structure, technical decisions, and design patterns, serving as a single source of truth for current and future development.

## Architectural Overview
NexChat is built upon the principles of **Feature-Sliced Design (FSD)**, emphasizing strict separation of concerns, high cohesion, and modularity.

### Architectural Layers
```text
┌─────────────────────────────────────────────────────────┐
│                     App Layer (app/)                    │
│  (Routing, Global Providers, Error Boundaries, Layout)  │
├─────────────────────────────────────────────────────────┤
│                   Features Layer (features/)            │
│  (Business Logic, Domain Models, Feature-specific UI)   │
├─────────────────────────────────────────────────────────┤
│                   Shared Layer (shared/)                │
│  (Reusable Components, Hooks, Utils, Types, Constants)  │
└─────────────────────────────────────────────────────────┘
```

### Dependency Rules
1. **App Layer** can depend on **Features** and **Shared**.
2. **Features Layer** can *only* depend on **Shared** (cross-feature dependencies are strictly prohibited).
3. **Shared Layer** must remain completely independent and cannot depend on App or Features.

## Technology Stack

### Frontend
| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Build Tool** | Vite 5.x | Blazing fast HMR and optimized production builds. |
| **Framework** | React 18.x | Leverages Concurrent Features and Suspense for smooth UX. |
| **Language** | TypeScript 5.x | Ensures type safety and enables confident, large-scale refactoring. |
| **Client State** | Zustand | Minimal boilerplate, highly performant selector-based updates. |
| **Server State** | TanStack Query | Robust caching, background syncing, and optimistic updates. |
| **UI Library** | MUI v6 | Excellent accessibility, comprehensive theming, and production-ready components. |
| **Forms & Validation** | React Hook Form + Zod | High-performance form handling with strict, schema-based validation. |

### Backend & Infrastructure
| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Backend / DB** | Firebase v9+ (Modular) | Native real-time capabilities and excellent tree-shaking support. |
| **Hosting** | Firebase Hosting | Global CDN, seamless CI/CD integration, and instant deployments. |
| **CI/CD** | GitHub Actions | Native GitHub integration for automated testing and deployment. |

## Design Patterns
- **Container/Presentational Pattern**: Presentational components handle pure UI rendering, while custom hooks/containers manage data fetching and state logic.
- **Compound Components**: Utilized for complex, flexible UI elements (e.g., Modals, custom Selects) to provide a clean and expressive API.
- **Optimistic Updates**: State is updated immediately on the client to ensure a snappy UX, with background synchronization and rollback mechanisms for failed server requests.

## State Management Strategy
- **Server State (TanStack Query)**: Manages data fetched from external sources (e.g., user profiles, room metadata), handling caching, stale times, and retries automatically.
- **Client State (Zustand)**: Reserved for ephemeral, local UI state (e.g., sidebar toggle, active room ID) and real-time data streams that don't fit the traditional request/response cycle.

## Error Handling
- **Error Boundaries**: Implemented at the application root and feature levels to gracefully catch rendering errors and prevent full app crashes.
- **Custom Error Classes**: Standardized error handling using custom classes (e.g., `AppError`) to ensure consistent error propagation and logging across the codebase.

## Security
- **Firebase Security Rules**: Strict rules enforce that only authenticated users can access data, and users can only modify or delete their own messages.
- **Environment Variables**: All sensitive keys and secrets are strictly managed via `.env` files, utilizing the `VITE_` prefix for client-side exposure.

## Performance Optimization
- **Code Splitting**: Route-based and component-based lazy loading using `React.lazy` and `Suspense` to minimize initial bundle size.
- **Memoization**: Strategic use of `React.memo`, `useMemo`, and `useCallback` to prevent unnecessary re-renders in heavily interactive components.
- **Virtualization**: Implementation of `@tanstack/react-virtual` for efficiently rendering large lists of chat messages without DOM bloat.

## Testing Strategy
| Test Type | Tools | Target Coverage |
|-----------|-------|-----------------|
| **Unit** | Vitest + React Testing Library | 80%+ for hooks, utilities, and pure functions. |
| **Integration** | Vitest + React Testing Library | 60%+ for critical feature components and user flows. |
| **E2E** | Playwright | Core critical paths (e.g., authentication, sending messages). |

## Coding Standards
- **Linting & Formatting**: Strict ESLint configuration paired with Prettier for consistent code style.
- **Pre-commit Hooks**: Husky and `lint-staged` enforce linting and formatting automatically before every commit.
- **Commit Convention**: Adherence to Conventional Commits for a clean, automated, and readable Git history.

---
**Last Updated**: September 5, 2026  
**Author**: Mohammad Hossein Alikhani  
**Status**: Approved  