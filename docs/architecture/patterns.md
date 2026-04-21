# Design Patterns

NexChat uses a variety of design patterns to solve common problems in a consistent, maintainable way.

## Creational Patterns

### Singleton Pattern — Library Instances

Firebase, i18next, and Sentry are initialized once and exported as singletons.

```tsx
// src/lib/firebase.ts
const app: FirebaseApp = initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
```

**Rationale**: These services should have exactly one instance per application to avoid duplicate connections and state inconsistencies.

---

### Factory Pattern — Theme Creation

The MUI theme is created via a factory function (`createTheme`) that encapsulates complex configuration.

```tsx
// src/styles/theme.ts
export const theme = createTheme({
  palette: { ... },
  typography: { ... },
  components: { ... },
});
```

**Rationale**: Centralizes theme configuration, making it easy to modify and test.

---

## Structural Patterns

### Facade Pattern — Service Layer

Services provide a simplified interface over complex Firebase APIs.

```tsx
// Before (complex):
await addDoc(collection(db, 'rooms', roomId, 'messages'), {
  text: 'Hello',
  userId: user.uid,
  userName: user.displayName,
  timestamp: serverTimestamp(),
});

// After (facade):
await messagesService.sendMessage(roomId, 'Hello', user.uid);
```

**Rationale**: Reduces coupling between domain logic and Firebase SDK. Makes the codebase easier to test and migrate.

---

### Adapter Pattern — Data Mappers

Mappers adapt Firestore documents to domain objects.

```tsx
// src/features/chat/utils/mappers.ts
export function mapFirestoreMessage(doc: DocumentData): Message {
  return {
    id: doc.id,
    text: doc.text,
    userId: doc.userId,
    userName: doc.userName || 'User',
    timestamp: doc.timestamp?.toMillis() ?? Date.now(),
    replyTo: doc.replyTo,
  };
}
```

**Rationale**: Decouples domain logic from Firestore data format. If Firestore schema changes, only mappers need to be updated.

---

### Composite Pattern — Component Trees

React's component model is inherently composite. NexChat uses it extensively for UI composition.

```tsx
<ThemeProvider theme={theme}>
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </QueryClientProvider>
</ThemeProvider>
```

---

## Behavioral Patterns

### Observer Pattern — State Management

Zustand stores and React Query use the observer pattern to notify components of state changes.

```tsx
// Components subscribe to store changes
const rooms = useRoomsStore((state) => state.rooms);
// When rooms change, the component re-renders
```

Firebase Firestore uses `onSnapshot` to observe real-time updates:

```tsx
const unsubscribe = onSnapshot(collection(db, 'rooms', roomId, 'messages'), (snapshot) => {
  const messages = snapshot.docs.map(mapFirestoreMessage);
  setMessages(messages);
});
```

**Rationale**: Enables real-time updates without polling. Components automatically reflect the latest state.

---

### Strategy Pattern — Validation

Zod schemas allow swapping validation strategies without changing consumer code.

```tsx
// Different validation strategies for different contexts
const createRoomSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().max(200).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
```

---

### Command Pattern — Actions

Actions encapsulate operations as objects. In NexChat, this appears in the form of action dispatchers.

```tsx
// Instead of calling services directly in some cases
const actions = {
  sendMessage: () => messagesService.sendMessage(roomId, text, userId),
  deleteRoom: () => roomsService.deleteRoom(roomId),
};
```

---

### Guard Pattern — Route Protection

`AuthGuard` component controls access to routes based on authentication state.

```tsx
// Protected route
<Route path="/chat" element={
  <AuthGuard>
    <ChatPage />
  </AuthGuard>
} />

// Guest-only route
<Route path="/login" element={
  <AuthGuard guestOnly>
    <LoginPage />
  </AuthGuard>
} />
```

**Rationale**: Centralizes access control logic, making it reusable across routes.

---

## Architectural Patterns

### Repository Pattern — Services

Services act as repositories, abstracting data access from business logic.

```tsx
export const messagesService = {
  getAll: (roomId: string) => ...,
  getById: (roomId: string, id: string) => ...,
  create: (roomId: string, message: Message) => ...,
  update: (roomId: string, id: string, data: Partial<Message>) => ...,
  delete: (roomId: string, id: string) => ...,
};
```

**Rationale**: Makes it easy to swap data sources (e.g., Firebase → REST API) without changing business logic.

---

### Provider Pattern — Global State

React Context and custom providers distribute global state and services.

```tsx
<ThemeProvider theme={theme}>        {/* MUI theme */}
  <QueryClientProvider client={...}>  {/* React Query */}
    <AuthProvider>                    {/* Authentication */}
      <App />
    </AuthProvider>
  </QueryClientProvider>
</ThemeProvider>
```

---

### Hook Pattern — Logic Encapsulation

Custom hooks encapsulate stateful logic and side effects.

```tsx
export const useRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToRooms(setRooms);
    return () => unsubscribe();
  }, []);

  return { rooms, loading };
};
```

**Rationale**: Promotes code reuse across components, separates concerns between UI and logic.

---

### Error Boundary Pattern — Fault Tolerance

`ErrorBoundary` components catch rendering errors and prevent app-wide crashes.

```tsx
<ErrorBoundary onError={handlePageError('ChatPage')}>
  <AuthGuard>
    <ChatPage />
  </AuthGuard>
</ErrorBoundary>
```

**Rationale**: Isolates errors to specific routes, allowing the rest of the app to continue functioning.

---

## Performance Patterns

### Virtualization Pattern — Long Lists

`@tanstack/react-virtual` renders only visible items in long lists.

```tsx
const virtualizer = useVirtualizer({
  count: messages.length,
  getScrollElement: () => scrollRef.current,
  estimateSize: () => 80,
});
```

**Rationale**: Reduces DOM node count from thousands to hundreds, enabling smooth scrolling with large datasets.

---

### Memoization Pattern — Expensive Computations

`useMemo` and `useCallback` prevent unnecessary recalculations and re-renders.

```tsx
const sortedMessages = useMemo(
  () => messages.sort((a, b) => a.timestamp - b.timestamp),
  [messages]
);

const handleSend = useCallback(() => {
  sendMessage(text);
}, [text, sendMessage]);
```

---

### Debouncing Pattern — Input Optimization

`useDebounce` hook delays processing until input stabilizes.

```tsx
const debouncedSearch = useDebounce(searchTerm, 300);

useEffect(() => {
  if (debouncedSearch) {
    performSearch(debouncedSearch);
  }
}, [debouncedSearch]);
```

**Rationale**: Reduces API calls and re-renders during rapid typing.

---

### Code Splitting Pattern — Lazy Loading

`React.lazy` with `Suspense` splits the bundle by route.

```tsx
const ChatPage = lazy(() => import('@/pages/ChatPage'));

<Suspense fallback={<PageLoadingFallback />}>
  <Routes>
    <Route path="/chat" element={<ChatPage />} />
  </Routes>
</Suspense>;
```

**Rationale**: Reduces initial load time by loading only the code needed for the current route.

---

## Anti-Patterns Avoided

| Anti-Pattern             | Why Avoided                      | Alternative Used                       |
| ------------------------ | -------------------------------- | -------------------------------------- |
| **Prop Drilling**        | Makes components tightly coupled | Zustand stores, React Query            |
| **God Components**       | Hard to test and maintain        | Feature-based decomposition            |
| **Magic Numbers**        | Unclear intent                   | Named constants in `shared/constants/` |
| **Callback Hell**        | Hard to read and debug           | Async/await, React Query mutations     |
| **Mutating State**       | Unpredictable updates            | Immutable state updates                |
| **String-based Routing** | Error-prone, hard to refactor    | Route constants, type-safe params      |
