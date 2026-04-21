# ADR 009: TanStack Query for Data Fetching

## Status

Accepted

## Context

NexChat needs to:

- Fetch data from Firestore
- Cache data to reduce reads
- Handle loading and error states
- Synchronize data across components
- Provide optimistic updates
- Refetch on focus or reconnection

Traditional approaches (useEffect + useState) require significant boilerplate and are error-prone.

## Decision

We chose **TanStack Query (React Query)** for server state management.

## Consequences

### Positive

- ✅ **Automatic caching**: Deduplicates requests, caches results
- ✅ **Background updates**: Refetches data in background, shows fresh data instantly
- ✅ **Loading/error states**: Built-in `isLoading`, `isError`, `data` states
- ✅ **Optimistic updates**: Update UI before server confirms
- ✅ **Pagination & infinite scroll**: Built-in support for paginated data
- ✅ **DevTools**: Visualize queries, mutations, cache state
- ✅ **Garbage collection**: Automatically removes unused queries from cache
- ✅ **Retry logic**: Automatic retries with exponential backoff

### Negative

- ⚠️ **Learning curve**: New concepts (queries, mutations, cache keys)
- ⚠️ **Bundle size**: Adds ~15KB to bundle
- ⚠️ **Overkill for simple apps**: Too much for static data

## Alternatives Considered

### SWR

- **Rejected**: Less feature-rich, smaller community
- **When it makes sense**: Simpler caching needs, smaller bundle requirements

### Apollo Client (GraphQL)

- **Rejected**: We use Firebase (not GraphQL), adds unnecessary complexity
- **When it makes sense**: GraphQL backends, complex query composition

### Custom useEffect hooks

- **Rejected**: Too much boilerplate, error-prone, missing features
- **When it makes sense**: Very simple apps with 1-2 API calls

### Redux + Redux Thunk

- **Rejected**: Too much boilerplate for server state, no built-in caching
- **When it makes sense**: Complex client state logic, time-travel debugging

## Implementation

### QueryClient Configuration (`src/main.tsx`)

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>;
```

### Example: useRooms Hook

```tsx
export const useRooms = () => {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: () => roomsService.getAllRooms(),
  });
};
```

### Example: useCreateRoom Mutation

```tsx
export const useCreateRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRoomData) => roomsService.createRoom(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
};
```

### Real-time Updates with Firestore

```tsx
export const useMessages = (roomId: string) => {
  return useQuery({
    queryKey: ['messages', roomId],
    queryFn: () => messagesService.getMessages(roomId),
    // Firestore onSnapshot handles real-time updates
  });
};
```

## Query Key Strategy

```tsx
// List queries
['rooms'][('messages', roomId)][
  // Detail queries
  ('room', roomId)
][('message', roomId, messageId)][
  // Filtered queries
  ('messages', roomId, { limit: 50, orderBy: 'timestamp' })
];
```

## Cache Invalidation Patterns

```tsx
// Invalidate all room queries
queryClient.invalidateQueries({ queryKey: ['rooms'] });

// Invalidate specific room
queryClient.invalidateQueries({ queryKey: ['room', roomId] });

// Invalidate all queries
queryClient.invalidateQueries();
```

## Performance Characteristics

- **Deduplication**: Multiple components requesting same data → one request
- **Caching**: Subsequent requests return cached data instantly
- **Background updates**: Stale data shown while fresh data fetches
- **Garbage collection**: Unused queries removed after `gcTime`
