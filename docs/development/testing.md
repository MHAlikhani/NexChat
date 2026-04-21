# Testing Guide

NexChat uses **Vitest** for unit and integration testing, with **Testing Library** for React component testing.

## Running Tests

```bash
# Run tests in watch mode (default)
npm run test

# Run tests once (CI/CD)
npm run test -- --run

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test -- ChatInput.test.tsx

# Run tests matching pattern
npm run test -- --grep "should send message"
```

## Test Structure

Tests are co-located with the code they test:

```
features/chat/
├── components/
│   ├── ChatInput.tsx
│   └── ChatInput.test.tsx          # ← Tests next to component
├── hooks/
│   ├── useMessages.ts
│   └── useMessages.test.ts         # ← Tests next to hook
└── services/
    ├── messages.service.ts
    └── messages.service.test.ts    # ← Tests next to service
```

## Test Setup

### Global Setup (`src/test/setup.ts`)

```tsx
import '@testing-library/jest-dom';

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
```

### Vitest Config (`vitest.config.ts`)

```tsx
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/setup.ts', '**/*.d.ts'],
    },
  },
});
```

## Writing Tests

### Component Test

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ChatInput } from './ChatInput';

describe('ChatInput', () => {
  it('calls onSend when Enter is pressed', () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);

    const input = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.keyPress(input, { key: 'Enter', charCode: 13 });

    expect(onSend).toHaveBeenCalledWith('Hello');
  });

  it('clears input after send', () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);

    const input = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.keyPress(input, { key: 'Enter', charCode: 13 });

    expect(input.value).toBe('');
  });

  it('does not send empty messages', () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);

    const input = screen.getByPlaceholderText('Type a message...');
    fireEvent.keyPress(input, { key: 'Enter', charCode: 13 });

    expect(onSend).not.toHaveBeenCalled();
  });
});
```

### Hook Test

```tsx
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  it('debounces value changes', async () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 100), {
      initialProps: { value: 'initial' },
    });

    expect(result.current).toBe('initial');

    rerender({ value: 'updated' });
    expect(result.current).toBe('initial'); // Still initial

    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(result.current).toBe('updated'); // Now updated
  });
});
```

### Service Test (with Mocks)

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { messagesService } from './messages.service';

// Mock Firebase
vi.mock('@/lib/firebase', () => ({
  db: {
    collection: vi.fn(),
  },
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
}));

describe('messagesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends message with correct data', async () => {
    const { addDoc } = await import('firebase/firestore');
    vi.mocked(addDoc).mockResolvedValue({ id: 'msg-1' });

    const message = await messagesService.sendMessage('room-1', 'Hello', 'user-1');

    expect(message.text).toBe('Hello');
    expect(message.userId).toBe('user-1');
    expect(addDoc).toHaveBeenCalled();
  });
});
```

## Mocking

### Mock Modules

```tsx
vi.mock('@/lib/firebase', () => ({
  auth: {},
  db: {},
}));
```

### Mock Functions

```tsx
const mockFn = vi.fn().mockResolvedValue('result');
const mockFn2 = vi.fn().mockImplementation((x) => x * 2);
```

### Mock Timers

```tsx
vi.useFakeTimers();

act(() => {
  vi.advanceTimersByTime(1000);
});

vi.useRealTimers();
```

## Testing i18n

When testing components that use `useTranslation`:

```tsx
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';

const renderWithI18n = (ui: React.ReactElement) => {
  return render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);
};

it('shows translated text', () => {
  renderWithI18n(<MyComponent />);
  expect(screen.getByText('Translated text')).toBeInTheDocument();
});
```

## Coverage Reports

Generate coverage reports:

```bash
npm run test:coverage
```

Output:

```
----------------|---------|----------|---------|---------|
File            | % Stmts | % Branch | % Funcs | % Lines |
----------------|---------|----------|---------|---------|
All files       |   85.2  |   72.4   |   88.1  |   85.2  |
 ChatInput.tsx  |   92.3  |   85.7   |   100   |   92.3  |
 useMessages.ts |   78.1  |   60.0   |   75.0  |   78.1  |
----------------|---------|----------|---------|---------|
```

## Best Practices

### ✅ Do

- **Test behavior, not implementation** — focus on what the code does, not how
- **Use descriptive test names** — "should send message when Enter pressed"
- **Test edge cases** — empty input, error states, loading states
- **Mock external dependencies** — Firebase, Sentry, browser APIs
- **Keep tests fast** — avoid unnecessary waits, use fake timers
- **Clean up after tests** — `afterEach` for cleanup

### ❌ Don't

- **Don't test library code** — trust React, MUI, Firebase
- **Don't test implementation details** — avoid querying by class names
- **Don't over-mock** — test real behavior when possible
- **Don't skip tests** — fix or delete them, don't skip

## Test Patterns

### Arrange-Act-Assert

```tsx
it('does something', () => {
  // Arrange
  const input = 'test';

  // Act
  const result = myFunction(input);

  // Assert
  expect(result).toBe('expected');
});
```

### Given-When-Then

```tsx
it('does something', () => {
  // Given
  const user = { name: 'John' };

  // When
  const greeting = greet(user);

  // Then
  expect(greeting).toBe('Hello, John');
});
```

## Continuous Integration

Add to your CI pipeline:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run test -- --run
      - run: npm run test:coverage
```
