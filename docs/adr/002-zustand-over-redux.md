# ADR 002: Zustand over Redux

## Status

Accepted

## Context

NexChat needs client-side state management for:

- Authentication state (user, auth status)
- UI state (modals, sidebars)
- Temporary data (form drafts, search terms)

We evaluated several state management solutions:

- Redux (with Redux Toolkit)
- Zustand
- MobX
- Jotai
- Recoil
- React Context (built-in)

## Decision

We chose **Zustand** for state management.

## Consequences

### Positive

- ✅ **Minimal boilerplate**: Create stores with just a few lines of code
- ✅ **Small bundle size**: ~1KB gzipped vs Redux's ~10KB+ (with middleware)
- ✅ **Simple API**: No reducers, actions, or dispatch — just plain functions
- ✅ **TypeScript support**: Excellent type inference without manual type annotations
- ✅ **No provider wrappers**: Stores are just hooks, no `<Provider>` needed in component tree
- ✅ **Devtools**: Built-in support for Redux DevTools
- ✅ **Persistence**: Built-in middleware for localStorage persistence
- ✅ **Performance**: Fine-grained subscriptions prevent unnecessary re-renders

### Negative

- ⚠️ **Less ecosystem**: Fewer third-party middlewares compared to Redux
- ⚠️ **Learning curve for teams**: Teams familiar with Redux need to adapt
- ⚠️ **Less opinionated**: More flexibility means more ways to structure code

## Alternatives Considered

### Redux (with Redux Toolkit)

- **Rejected**: Too much boilerplate for our needs
- **When it makes sense**: Large enterprise apps with complex state logic, time-travel debugging needs

### MobX

- **Rejected**: Less predictable with implicit reactivity, harder to debug
- **When it makes sense**: Applications with lots of interdependent observable state

### Jotai

- **Rejected**: Atomic state model less intuitive for our use case
- **When it makes sense**: Applications that benefit from atomic state decomposition

### Recoil

- **Rejected**: Facebook-specific, less community adoption outside Meta
- **When it makes sense**: Apps within Meta ecosystem or with similar graph-state needs

### React Context

- **Rejected**: Performance issues with frequent updates, requires prop drilling for deeply nested consumers
- **When it makes sense**: Simple theme/language switching with infrequent updates

## Example Usage

```tsx
// Create a store
const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user: User) => set({ user, isAuthenticated: true }),
  clearUser: () => set({ user: null, isAuthenticated: false }),
}));

// Use in component
const { user, setUser } = useAuthStore();
```
