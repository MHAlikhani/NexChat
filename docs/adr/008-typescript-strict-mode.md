# ADR 008: TypeScript Strict Mode

## Status

Accepted

## Context

TypeScript can be configured with varying levels of strictness. We needed to decide on the strictness level for NexChat to balance:

- Type safety
- Developer experience
- Code quality
- Maintainability

## Decision

We enabled **TypeScript strict mode** with all strict flags.

## Consequences

### Positive

- ✅ **Catch bugs early**: Type errors caught at compile time, not runtime
- ✅ **Better IDE support**: Accurate autocomplete, refactoring, and navigation
- ✅ **Self-documenting code**: Types serve as documentation
- ✅ **Prevent null/undefined errors**: `strictNullChecks` catches common bugs
- ✅ **Consistent codebase**: Enforces best practices across the team
- ✅ **Refactoring confidence**: Type checker catches breaking changes

### Negative

- ⚠️ **Learning curve**: Developers new to TypeScript need time to adapt
- ⚠️ **Slower initial development**: More type annotations required
- ⚠️ **Type gymnastics**: Complex types can be hard to write and understand
- ⚠️ **Third-party library issues**: Some libraries have incomplete type definitions

## Configuration (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noEmit": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### Key Strict Flags Explained

| Flag                         | Purpose                                                  |
| ---------------------------- | -------------------------------------------------------- |
| `strict`                     | Enables all strict type-checking options                 |
| `strictNullChecks`           | `null` and `undefined` are not assignable to other types |
| `noUnusedLocals`             | Report errors on unused local variables                  |
| `noUnusedParameters`         | Report errors on unused function parameters              |
| `noFallthroughCasesInSwitch` | Report errors for fallthrough cases in switch statements |

### Deprecated Flags (Removed)

| Flag      | Reason                                          |
| --------- | ----------------------------------------------- |
| `baseUrl` | Deprecated in TS 5.x, will be removed in TS 7.0 |

**Migration**: Removed `baseUrl` and kept `paths` with relative paths (`./src/*`), which works with `moduleResolution: "bundler"`.

## Alternatives Considered

### Non-strict mode

- **Rejected**: Leads to runtime errors, harder to maintain
- **When it makes sense**: Rapid prototyping, learning TypeScript

### Gradual strictness

- **Rejected**: Inconsistent codebase, tech debt accumulates
- **When it makes sense**: Migrating existing JavaScript codebases

## Best Practices

### Use `unknown` instead of `any`

```tsx
// ❌ Bad
function parse(data: any) {
  return data.value; // No type checking
}

// ✅ Good
function parse(data: unknown) {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return data.value;
  }
  throw new Error('Invalid data');
}
```

### Use discriminated unions for type narrowing

```tsx
type Result<T> = { success: true; data: T } | { success: false; error: string };

function handleResult(result: Result<User>) {
  if (result.success) {
    console.log(result.data.name); // TypeScript knows data exists
  } else {
    console.error(result.error);
  }
}
```

### Use Zod for runtime validation

```tsx
const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

type User = z.infer<typeof UserSchema>;

function validateUser(data: unknown): User {
  return UserSchema.parse(data);
}
```
