# Layered Architecture

NexChat follows a layered architecture that separates concerns into distinct layers. Each layer has a specific responsibility and communicates with adjacent layers through well-defined interfaces.

## Layer Overview

```
┌─────────────────────────────────────────────────────────┐
│                   Presentation Layer                     │
│  Pages → Components → Hooks → Stores → Services          │
├─────────────────────────────────────────────────────────┤
│                    Application Layer                     │
│  AuthProvider, ErrorBoundary, Route Guards               │
├─────────────────────────────────────────────────────────┤
│                     Domain Layer                         │
│  Feature Modules (Auth, Chat, Rooms)                     │
│  - Types, Validators, Mappers, Business Logic            │
├─────────────────────────────────────────────────────────┤
│                  Infrastructure Layer                    │
│  Firebase, i18next, Sentry, MUI Theme                    │
└─────────────────────────────────────────────────────────┘
```

## 1. Presentation Layer

The presentation layer handles UI rendering and user interaction.

### Pages (`src/pages/`)

- Top-level route components
- Lazy-loaded for code splitting
- Minimal logic — delegate to feature components

```tsx
// Example: ChatPage.tsx
const ChatPage = () => {
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <RoomList />
      <ChatWindow />
    </Box>
  );
};
```

### Components (`features/{feature}/components/`)

- Reusable UI components
- Feature-specific and shared components
- Receive data via props, emit events via callbacks

### Hooks (`features/{feature}/hooks/`)

- Encapsulate component logic
- Interact with stores and services
- Return data and handlers to components

```tsx
// Example: useRooms.ts
export const useRooms = () => {
  const rooms = roomsStore((state) => state.rooms);
  const fetchRooms = roomsStore((state) => state.fetchRooms);
  return { rooms, fetchRooms };
};
```

### Stores (`features/{feature}/stores/`)

- Zustand state containers
- Single source of truth for feature state
- Handle state updates and side effects

```tsx
// Example: chatStore.ts
interface ChatStore {
  messages: Message[];
  addMessage: (message: Message) => void;
  clearMessages: () => void;
}
```

### Services (`features/{feature}/services/`)

- Data access layer
- Abstract Firebase API calls
- Return domain objects (not Firestore documents)

```tsx
// Example: messages.service.ts
export const messagesService = {
  async sendMessage(roomId: string, text: string, userId: string) {
    const message: Message = { id: generateId(), text, userId, timestamp: Date.now() };
    await addDoc(collection(db, 'rooms', roomId, 'messages'), message);
    return message;
  },
};
```

## 2. Application Layer

The application layer coordinates features and provides cross-cutting concerns.

### AuthProvider (`src/app/providers/`)

- Initializes authentication state listener
- Provides auth state to the entire app

### ErrorBoundary (`src/app/components/`)

- Catches rendering errors at route level
- Reports errors to Sentry
- Shows fallback UI instead of crashing

### Route Guards (`features/auth/components/AuthGuard.tsx`)

- Protect routes based on authentication status
- Redirect unauthorized users

## 3. Domain Layer

The domain layer contains business logic organized by feature.

### Feature Modules (`src/features/`)

Each feature is a self-contained module with:

```
features/auth/
├── components/      # UI components
├── hooks/           # Business logic hooks
├── services/        # Data access
├── stores/          # State management
├── types/           # Type definitions
├── utils/           # Pure functions
└── index.ts         # Public API
```

### Types (`features/{feature}/types/`)

- Domain model interfaces
- Strict type definitions
- Shared across the feature

```tsx
// Example: Message type
export interface Message {
  id: string;
  text: string;
  userId: string;
  userName: string;
  timestamp: number;
  replyTo?: string;
}
```

### Validators (`features/{feature}/utils/validators.ts`)

- Zod schemas for data validation
- Type-safe validation with error messages
- Used in forms and API calls

### Mappers (`features/{feature}/utils/mappers.ts`)

- Convert between data formats
- Firestore document → Domain object
- API response → UI model

## 4. Infrastructure Layer

The infrastructure layer provides integrations with external services.

### Firebase (`src/lib/firebase.ts`)

- Firebase app initialization
- Auth and Firestore instances
- Configuration validation

### i18next (`src/lib/i18n.ts`)

- Translation system
- Language detection
- RTL/LTR support

### Sentry (`src/lib/sentry.ts`)

- Error tracking and reporting
- Performance monitoring
- Context enrichment

### Theme (`src/styles/theme.ts`)

- MUI theme configuration
- Design tokens
- Component overrides

## Layer Communication Rules

### Allowed Communication

```
Pages → Components → Hooks → Stores → Services → Firebase
  ↓         ↓          ↓        ↓         ↓
Shared ← Shared ← Shared ← Shared ← Shared
```

### Forbidden Communication

```
Components → Components (from different features)
Services → Components (data flow must go through hooks)
Stores → Pages (stores are consumed by hooks)
```

### Dependency Direction

Dependencies flow **downward** only. A layer can depend on layers below it, but never on layers above it.

```
Presentation  →  Application  →  Domain  →  Infrastructure
    (depends on)    (depends on)   (depends on)
```

## Code Organization by Layer

| Layer              | Location                                                    | Responsibility                             |
| ------------------ | ----------------------------------------------------------- | ------------------------------------------ |
| **Presentation**   | `src/pages/`, `features/*/components/`, `features/*/hooks/` | UI rendering, user interaction             |
| **Application**    | `src/app/`                                                  | Cross-cutting concerns, route coordination |
| **Domain**         | `src/features/`                                             | Business logic, feature-specific code      |
| **Infrastructure** | `src/lib/`, `src/styles/`, `src/locales/`                   | External integrations, theming             |
| **Shared**         | `src/shared/`                                               | Cross-feature utilities, types, hooks      |

## Benefits of This Architecture

1. **Predictability**: New team members can quickly find where to add code
2. **Testability**: Each layer can be tested in isolation
3. **Maintainability**: Changes are localized to specific layers
4. **Scalability**: New features can be added without modifying existing code
5. **Collaboration**: Multiple developers can work on different features simultaneously
