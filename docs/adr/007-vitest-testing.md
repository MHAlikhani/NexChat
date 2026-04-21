# ADR 007: Vitest for Testing

## Status

Accepted

## Context

NexChat needed a testing framework that:

- Integrates seamlessly with Vite
- Supports TypeScript and JSX
- Provides fast test execution
- Has built-in mocking and coverage
- Compatible with Testing Library

We evaluated:

1. Vitest
2. Jest
3. Mocha + Chai
4. Web Test Runner

## Decision

We chose **Vitest** as our testing framework.

## Consequences

### Positive

- ✅ **Vite-native**: Uses the same config, plugins, and transforms as Vite
- ✅ **Fast**: Runs tests in parallel using worker threads
- ✅ **TypeScript**: First-class TypeScript support without additional config
- ✅ **Jest-compatible**: Similar API, easy to migrate from Jest
- ✅ **ESM support**: Native ES modules, no transpilation overhead
- ✅ **Built-in coverage**: V8 coverage provider included
- ✅ **Watch mode**: Fast re-runs on file changes

### Negative

- ⚠️ **Younger ecosystem**: Fewer plugins than Jest
- ⚠️ **Less documentation**: Some edge cases not well-documented
- ⚠️ **Node.js version**: Requires Node.js 18+

## Alternatives Considered

### Jest

- **Rejected**: Slower, requires Babel/SWC setup for Vite projects, ESM issues
- **When it makes sense**: Existing Jest projects, CRA applications, teams with Jest expertise

### Mocha + Chai

- **Rejected**: Requires manual setup for React, no built-in coverage
- **When it makes sense**: Node.js backend testing, projects with existing Mocha setup

### Web Test Runner

- **Rejected**: More complex setup, less intuitive for React testing
- **When it makes sense**: Multi-framework projects, Web Components testing

## Configuration (`vitest.config.ts`)

```tsx
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default defineConfig(async (configEnv) => {
  const resolvedViteConfig =
    typeof viteConfig === 'function' ? await viteConfig(configEnv) : viteConfig;

  return mergeConfig(
    resolvedViteConfig,
    defineConfig({
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
    })
  );
});
```

## Test Setup (`src/test/setup.ts`)

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

## Example Test

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
});
```

## Test Commands

```bash
npm run test           # Run tests in watch mode
npm run test:coverage  # Run tests with coverage report
```
