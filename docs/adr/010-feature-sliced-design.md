# ADR 010: Feature-Sliced Design

## Status

Accepted

## Context

As NexChat grows, we need an architecture that:

- Scales with the number of features
- Keeps related code together
- Makes features easy to find and modify
- Enables parallel development
- Reduces merge conflicts

Traditional "by type" organization (`components/`, `services/`, `hooks/`) leads to scattered code and cognitive overhead.

## Decision

We adopted **Feature-Sliced Design** (FSD) principles, organizing code by feature rather than by type.

## Consequences

### Positive

- ✅ **Cohesion**: All code for a feature is in one place
- ✅ **Discoverability**: Easy to find where to add new feature code
- ✅ **Parallel development**: Teams can work on different features independently
- ✅ **Isolation**: Features are self-contained, reducing unintended side effects
- ✅ **Testing**: Feature modules can be tested in isolation
- ✅ **Deletion**: Removing a feature means deleting one directory

### Negative

- ⚠️ **Learning curve**: Developers used to "by type" organization need to adapt
- ⚠️ **Shared code challenges**: Cross-feature utilities need clear ownership
- ⚠️ **Over-engineering risk**: Small apps may not benefit as much

## Structure

```
src/
├── app/                    # Application layer (providers, routes, error boundaries)
│   ├── components/
│   ├── providers/
│   └── routes/
├── features/               # Feature modules
│   ├── auth/              # Authentication feature
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── types/
│   │   ├── utils/
│   │   └── index.ts       # Public API (barrel export)
│   ├── chat/              # Chat feature
│   └── rooms/             # Rooms feature
├── pages/                  # Page components (thin wrappers)
├── shared/                 # Shared utilities, hooks, types
│   ├── constants/
│   ├── hooks/
│   ├── types/
│   └── utils/
└── lib/                    # External library integrations
```

## Feature Module Structure

Each feature follows this structure:

```
features/{feature}/
├── components/      # UI components specific to this feature
├── hooks/           # Business logic hooks
├── services/        # Data access layer (API calls)
├── stores/          # State management (Zustand stores)
├── types/           # TypeScript type definitions
├── utils/           # Pure utility functions (mappers, validators)
└── index.ts         # Public API (barrel export)
```

### `index.ts` (Public API)

```tsx
// features/auth/index.ts
export { AuthGuard } from './components/AuthGuard';
export { useAuth } from './hooks/useAuth';
export { authStore } from './stores/authStore';
export type { User } from './types';
```

## Layer Dependencies

```
pages/          → Can import from features/, shared/, lib/
features/       → Can import from shared/, lib/
shared/         → Can import from lib/
lib/            → No internal imports (only external libraries)
```

### Forbidden Imports

```tsx
// ❌ Bad: Feature importing another feature
import { useAuth } from '@/features/auth';

// ✅ Good: Use shared layer or lift to app layer
import { useCurrentUser } from '@/shared/hooks';
```

## Alternatives Considered

### "By Type" Organization

- **Rejected**: Scattered code, hard to find related files
- **When it makes sense**: Very small apps (< 10 components)

### Atomic Design

- **Rejected**: Too granular, hard to define atoms/molecules/organisms
- **When it makes sense**: Design system projects, component libraries

### Domain-Driven Design (DDD)

- **Rejected**: Too complex for frontend, better suited for backends
- **When it makes sense**: Large enterprise applications with complex business logic

### Clean Architecture

- **Rejected**: Too much abstraction for a chat app
- **When it makes sense**: Large-scale applications with multiple data sources

## Feature Extraction Checklist

When adding a new feature:

1. Create `src/features/{feature}/` directory
2. Add `components/`, `hooks/`, `services/`, `stores/`, `types/`, `utils/` subdirectories
3. Create `index.ts` with public API
4. Import from `@/features/{feature}` in pages or other features (via shared)
5. Add feature-specific tests in respective subdirectories

## Example: Adding a "Notifications" Feature

```
src/features/notifications/
├── components/
│   ├── NotificationBell.tsx
│   └── NotificationList.tsx
├── hooks/
│   └── useNotifications.ts
├── services/
│   └── notifications.service.ts
├── stores/
│   └── notificationsStore.ts
├── types/
│   └── index.ts
├── utils/
│   └── mappers.ts
└── index.ts
```
