# Data Flow

Understanding how data moves through NexChat is essential for debugging, adding features, and maintaining the application. This document explains the data flow for common operations.

## 1. Authentication Flow

```
┌──────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────┐
│ User     │───▶│ SignInButton │───▶│ auth.service│───▶│ Firebase │
│ clicks   │    │              │    │             │    │ Auth     │
│ "Sign in"│    │              │    │             │    │          │
└──────────┘    └──────────────┘    └─────────────┘    └──────────┘
                                             │
                                             ▼
┌──────────┐    ┌──────────────┐    ┌─────────────┐
│ User     │◀───│ AuthProvider │◀───│ authStore   │
│ sees     │    │              │    │             │
│ ChatPage │    │              │    │             │
└──────────┘    └──────────────┘    └─────────────┘
```

### Step-by-Step

1. **User Action**: User clicks "Sign in with Google" button
2. **Service Call**: `auth.service.signInWithGoogle()` calls `signInWithPopup(auth, new GoogleAuthProvider())`
3. **Firebase Auth**: Firebase handles OAuth flow, returns `UserCredential`
4. **Mapper**: `mapFirebaseUser(credential.user)` converts to domain `User` object
5. **Store Update**: `authStore.setUser(user)` updates global auth state
6. **Listener**: `useAuthListener` detects auth state change via `onAuthStateChanged`
7. **Route Guard**: `AuthGuard` re-evaluates and redirects to `/chat`

### Key Files

- `features/auth/services/auth.service.ts`
- `features/auth/stores/authStore.ts`
- `features/auth/hooks/useAuthListener.ts`
- `features/auth/components/AuthGuard.tsx`
- `features/auth/utils/mappers.ts`

---

## 2. Message Sending Flow

```
┌──────────┐    ┌────────────┐    ┌──────────────┐    ┌──────────────┐
│ User     │───▶│ ChatInput  │───▶│ useSendMessage│───▶│ messages.    │
│ types    │    │            │    │              │    │ service      │
│ message  │    │            │    │              │    │              │
└──────────┘    └────────────┘    └──────────────┘    └──────────────┘
                                                           │
                                                           ▼
┌──────────┐    ┌────────────┐    ┌──────────────┐    ┌──────────────┐
│ Message  │◀───│ MessageList│◀───│ useMessages  │◀───│ Firestore    │
│ appears  │    │            │    │              │    │ onSnapshot   │
│ in chat  │    │            │    │              │    │              │
└──────────┘    └────────────┘    └──────────────┘    └──────────────┘
```

### Step-by-Step

1. **User Input**: User types message in `ChatInput` component
2. **Form Submit**: User presses Enter or clicks Send
3. **Hook Logic**: `useSendMessage` validates input and calls service
4. **Service Call**: `messagesService.sendMessage(roomId, text, userId)`
5. **Firestore Write**: `addDoc(collection(db, 'rooms', roomId, 'messages'), messageData)`
6. **Real-time Sync**: Firestore triggers `onSnapshot` listener
7. **Data Mapping**: `mapFirestoreMessage` converts each doc to domain `Message`
8. **State Update**: `useMessages` hook updates message list via React Query
9. **UI Update**: `MessageList` re-renders with new message

### Key Files

- `features/chat/components/ChatInput.tsx`
- `features/chat/hooks/useSendMessage.ts`
- `features/chat/services/messages.service.ts`
- `features/chat/hooks/useMessages.ts`
- `features/chat/utils/mappers.ts`

---

## 3. Room Creation Flow

```
┌──────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ User     │───▶│ CreateRoom   │───▶│ useCreateRoom│───▶│ rooms.       │
│ fills    │    │ Modal        │    │              │    │ service      │
│ form     │    │              │    │              │    │              │
└──────────┘    └──────────────┘    └──────────────┘    └──────────────┘
        │                                                       │
        ▼                                                       ▼
┌──────────────┐                                        ┌──────────────┐
│ Zod validates│                                        │ Firestore    │
│ form schema  │                                        │ writes room  │
└──────────────┘                                        └──────────────┘
```

### Step-by-Step

1. **User Action**: User opens "Create Room" modal
2. **Form Input**: User fills room name and description
3. **Validation**: `react-hook-form` + `zod` validates input
4. **Submit**: `useCreateRoom` mutation calls service
5. **Service Call**: `roomsService.createRoom(name, description, userId)`
6. **Firestore Write**: `addDoc(collection(db, 'rooms'), roomData)`
7. **Real-time Update**: `useRooms` hook receives update via `onSnapshot`
8. **UI Update**: New room appears in `RoomList`

### Key Files

- `features/rooms/components/CreateRoomModal.tsx`
- `features/rooms/hooks/useCreateRoom.ts`
- `features/rooms/services/rooms.service.ts`
- `features/rooms/utils/validators.ts`

---

## 4. Real-time Message Sync Flow

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│ Firestore    │ ───────▶ │ useMessages  │ ───────▶ │ MessageList  │
│ onSnapshot   │          │              │          │              │
│ (server)     │          │              │          │              │
└──────────────┘         └──────────────┘         └──────────────┘
       │                                               │
       │                                               ▼
       │                                        ┌──────────────┐
       └───────────────────────────────────────▶ │ Message      │
                                                 │ appears in   │
                                                 │ real-time    │
                                                 └──────────────┘
```

### Step-by-Step

1. **Subscription**: `useMessages` hook subscribes to Firestore collection
2. **Listener Registration**: `onSnapshot` registers real-time listener
3. **Server Push**: Firestore pushes updates whenever documents change
4. **Data Mapping**: Each document is mapped to domain `Message`
5. **State Update**: React Query cache is updated
6. **Component Re-render**: `MessageList` receives new messages prop
7. **Virtualization**: `@tanstack/react-virtual` renders only visible messages

### Performance Considerations

- **Virtualization**: Only renders ~20 messages at a time, regardless of total count
- **Memoization**: Message components use `React.memo` to prevent unnecessary re-renders
- **Debounced Scroll**: Scroll-to-bottom is debounced to prevent layout thrashing

---

## 5. Error Handling Flow

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│ Component    │ ───────▶ │ ErrorBoundary│ ───────▶ │ Sentry       │
│ throws       │          │              │          │              │
│ error        │          │              │          │              │
└──────────────┘         └──────────────┘         └──────────────┘
       │                                               │
       ▼                                               ▼
┌──────────────┐                                ┌──────────────┐
│ Fallback UI  │                                │ Error logged │
│ shown        │                                │ with context │
└──────────────┘                                └──────────────┘
```

### Step-by-Step

1. **Error Occurs**: Component throws during render or in effect
2. **Boundary Catches**: `ErrorBoundary` catches the error
3. **Error Reporting**: `captureError` sends error to Sentry with context
4. **Fallback UI**: User sees a friendly error message instead of blank screen
5. **Graceful Degradation**: Other routes continue functioning

### Error Types Handled

- **Rendering Errors**: Caught by `ErrorBoundary`
- **Async Errors**: Caught by `try/catch` in services
- **Network Errors**: Caught by React Query's `onError`
- **Validation Errors**: Caught by Zod and displayed inline

---

## 6. Internationalization Flow

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│ Component    │ ───────▶ │ useTranslation│ ───────▶ │ i18next      │
│ uses t()     │          │              │          │              │
└──────────────┘         └──────────────┘         └──────────────┘
                                                       │
                                                       ▼
                                               ┌──────────────┐
                                               │ translation. │
                                               │ json         │
                                               └──────────────┘
```

### Step-by-Step

1. **Translation Request**: Component calls `t('auth.signIn')`
2. **i18next Lookup**: i18next looks up key in current language's translation file
3. **Fallback**: If key missing, falls back to default language (English)
4. **Return**: Translated string returned to component
5. **Language Change**: When user changes language, all `t()` calls re-render with new translations

### Supported Languages

- 🇬🇧 English (default)
- 🇮🇷 Persian (RTL support)
- 🇩🇪 German

### Adding a New Language

1. Create `src/locales/{lang}/translation.json`
2. Add to `resources` in `src/lib/i18n.ts`
3. Language is automatically detected or can be selected via i18next API

---

## 7. Form Submission Flow (React Hook Form + Zod)

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ User fills   │───▶│ React Hook   │───▶│ Zod validates│───▶│ Service      │
│ form         │    │ Form         │    │ schema       │    │ called       │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
        │                                                           │
        ▼                                                           ▼
┌──────────────┐                                              ┌──────────────┐
│ Validation   │                                              │ Success/     │
│ errors shown │                                              │ Error shown  │
└──────────────┘                                              └──────────────┘
```

### Step-by-Step

1. **User Input**: User types into form fields
2. **Validation**: Zod schema validates on change (or on submit)
3. **Error Display**: `react-hook-form` displays validation errors
4. **Submit**: If valid, `onSubmit` handler is called
5. **Service Call**: Form data passed to service method
6. **Result**: Success message shown or error caught

### Example Schema

```tsx
const createRoomSchema = z.object({
  name: z
    .string()
    .min(3, i18n.t('validation.minLength', { min: 3 }))
    .max(50, i18n.t('validation.maxLength', { max: 50 })),
  description: z
    .string()
    .max(200, i18n.t('validation.maxLength', { max: 200 }))
    .optional(),
});
```

---

## Data Flow Best Practices

### ✅ Do

- **Use services** for all data access — never call Firebase directly in components
- **Map data** at service boundaries — components should never see Firestore documents
- **Use React Query** for server state — don't manually sync with Firebase in components
- **Use Zustand** for client state — UI state, modal visibility, form drafts
- **Keep data unidirectional** — actions flow down, state changes flow up

### ❌ Don't

- **Don't mutate state** directly — use immutable updates
- **Don't store derived data** in state — compute it with `useMemo`
- **Don't pass functions through many layers** — use context or stores
- **Don't fetch data in effects** — use React Query or custom hooks with proper cleanup
