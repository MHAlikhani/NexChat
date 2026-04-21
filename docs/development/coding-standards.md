# Coding Standards

NexChat follows strict coding standards to ensure consistency, readability, and maintainability across the codebase.

## TypeScript

### Strict Mode Enabled

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### Type Annotations

```tsx
// ✅ Good: Explicit return types for functions
function greet(name: string): string {
  return `Hello, ${name}`;
}

// ✅ Good: Type inference for variables
const user = { name: 'John', age: 30 }; // TypeScript infers type

// ❌ Bad: Implicit any
function parse(data) {
  // ❌ data is implicitly any
  return data.value;
}

// ✅ Good: Use unknown instead of any
function parse(data: unknown) {
  if (typeof data === 'object' && data !== null) {
    return data.value;
  }
}
```

### Interfaces vs Types

```tsx
// Use interfaces for object shapes
interface User {
  id: string;
  name: string;
  email: string;
}

// Use types for unions, intersections, primitives
type UserRole = 'admin' | 'user' | 'guest';
type UserWithRole = User & { role: UserRole };
```

### Null Checks

```tsx
// ✅ Good: Use optional chaining and nullish coalescing
const userName = user?.name ?? 'Anonymous';

// ❌ Bad: Non-null assertion without validation
const userName = user!.name; // ❌ Crashes if user is null
```

## React

### Functional Components Only

```tsx
// ✅ Good: Functional component
const UserCard = ({ user }: UserCardProps) => {
  return <div>{user.name}</div>;
};

// ❌ Bad: Class component (avoid)
class UserCard extends React.Component<UserCardProps> {
  render() {
    return <div>{this.props.user.name}</div>;
  }
}
```

### Props Interface Naming

```tsx
// ✅ Good: ComponentName + Props
interface UserCardProps {
  user: User;
  onClick?: () => void;
}

const UserCard = ({ user, onClick }: UserCardProps) => {
  /* ... */
};
```

### Hooks Rules

```tsx
// ✅ Good: Custom hook starts with "use"
const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  return { user, setUser };
};

// ❌ Bad: Doesn't start with "use"
const getAuth = () => {
  /* ... */
};
```

### useEffect Dependencies

```tsx
// ✅ Good: Include all dependencies
useEffect(() => {
  fetchUser(userId);
}, [userId]);

// ❌ Bad: Missing dependencies
useEffect(() => {
  fetchUser(userId);
}, []); // ❌ userId is missing
```

### Memoization

```tsx
// ✅ Good: Memoize expensive computations
const sortedMessages = useMemo(
  () => messages.sort((a, b) => a.timestamp - b.timestamp),
  [messages]
);

// ✅ Good: Memoize callbacks passed to children
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// ❌ Bad: Unnecessary memoization
const name = useMemo(() => user.name, [user]); // ❌ No computation to memoize
```

## Naming Conventions

### Files

| Type       | Convention                       | Example               |
| ---------- | -------------------------------- | --------------------- |
| Components | PascalCase                       | `ChatInput.tsx`       |
| Hooks      | camelCase with `use` prefix      | `useMessages.ts`      |
| Services   | camelCase with `.service` suffix | `messages.service.ts` |
| Stores     | camelCase with `Store` suffix    | `chatStore.ts`        |
| Types      | camelCase                        | `index.ts`            |
| Utilities  | camelCase                        | `format.ts`           |
| Tests      | Same as source + `.test`         | `ChatInput.test.tsx`  |

### Variables and Functions

```tsx
// ✅ Good: camelCase for variables and functions
const userName = 'John';
const getUserById = (id: string) => {
  /* ... */
};

// ✅ Good: PascalCase for components and types
const UserCard = () => {
  /* ... */
};
interface UserProfile {
  /* ... */
}

// ✅ Good: UPPER_SNAKE_CASE for constants
const MAX_RETRIES = 3;
const API_BASE_URL = 'https://api.example.com';
```

### Event Handlers

```tsx
// ✅ Good: "handle" prefix for component handlers
const handleClick = () => {
  /* ... */
};
const handleSubmit = (data: FormData) => {
  /* ... */
};

// ✅ Good: "on" prefix for prop callbacks
interface ButtonProps {
  onClick?: () => void;
  onSubmit?: (data: FormData) => void;
}
```

## Code Style

### ESLint Configuration

NexChat uses ESLint with TypeScript and React plugins:

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "off",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

### Prettier Configuration

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

### Import Order

```tsx
// 1. React
import { useState, useEffect } from 'react';

// 2. Third-party libraries
import { Box, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

// 3. Internal modules (using aliases)
import { useAuth } from '@/features/auth';
import { messagesService } from '@/features/chat/services/messages.service';

// 4. Relative imports
import { formatDate } from './utils';
import type { Message } from './types';
```

## Error Handling

### Try-Catch with Unknown

```tsx
// ✅ Good: Use unknown and type guard
try {
  await fetchUser(userId);
} catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  }
}

// ✅ Good: Optional catch binding (ES2019+)
try {
  await fetchUser(userId);
} catch {
  console.error('Failed to fetch user');
}
```

### Error Boundaries

```tsx
<ErrorBoundary
  onError={(error, errorInfo) => {
    captureError(error, {
      componentStack: errorInfo.componentStack,
      source: 'ChatPage ErrorBoundary',
    });
  }}
>
  <ChatPage />
</ErrorBoundary>
```

## Comments

### JSDoc for Public APIs

````tsx
/**
 * Sends a message to the specified room.
 *
 * @param roomId - The ID of the room to send the message to
 * @param text - The message text
 * @param userId - The ID of the user sending the message
 * @returns The created message object
 * @throws {Error} If the user is not authenticated
 *
 * @example
 * ```tsx
 * const message = await messagesService.sendMessage('room-1', 'Hello', 'user-1');
 * ```
 */
async function sendMessage(roomId: string, text: string, userId: string): Promise<Message> {
  // ...
}
````

### Inline Comments for Complex Logic

```tsx
// Use exponential backoff for retries to avoid overwhelming the server
const delay = Math.min(1000 * 2 ** attempt, 30000);
await new Promise((resolve) => setTimeout(resolve, delay));
```

### TODO and FIXME

```tsx
// TODO: Implement pagination for large message lists
// FIXME: Race condition when multiple users send messages simultaneously
```

## Git Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type       | Purpose                             |
| ---------- | ----------------------------------- |
| `feat`     | New feature                         |
| `fix`      | Bug fix                             |
| `docs`     | Documentation changes               |
| `style`    | Code style (formatting, semicolons) |
| `refactor` | Code refactoring (no feature/fix)   |
| `perf`     | Performance improvements            |
| `test`     | Adding or updating tests            |
| `build`    | Build system or dependency changes  |
| `ci`       | CI configuration changes            |
| `chore`    | Maintenance tasks                   |

### Examples

```
feat(chat): add real-time message sync

Implemented Firestore onSnapshot listener for real-time
message updates with virtualization for performance.

Closes #42
```

```
fix(auth): prevent race condition in auth listener

Added debounce to auth state changes to prevent
multiple simultaneous navigation attempts.

Fixes #87
```

## Pre-Commit Hooks

Husky + lint-staged run checks before commits:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,css,md}": ["prettier --write"]
  }
}
```

This ensures:

- ESLint errors are fixed
- Code is formatted with Prettier
- Only staged files are checked
