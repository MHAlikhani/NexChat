# ADR 011: Zod for Validation

## Status

Accepted

## Context

NexChat needs runtime validation for:

- Form inputs (room names, messages)
- API responses
- Environment variables
- Local storage data

We evaluated:

1. Zod
2. Yup
3. Joi
4. Class Validator
5. Custom validation

## Decision

We chose **Zod** for schema validation.

## Consequences

### Positive

- ✅ **TypeScript-first**: Infers TypeScript types from schemas
- ✅ **Small bundle**: ~8KB gzipped
- ✅ **Composable**: Build complex schemas from simple ones
- ✅ **No decorators**: Pure functional API, no class-based magic
- ✅ **Great DX**: Excellent error messages, autocomplete
- ✅ **Ecosystem**: Integrations with React Hook Form, tRPC, etc.
- ✅ **Active development**: Regular updates, growing community

### Negative

- ⚠️ **Runtime overhead**: Validation adds small performance cost
- ⚠️ **Learning curve**: New syntax for developers used to Yup/Joi
- ⚠️ **Limited async validation**: Async validation is less ergonomic

## Alternatives Considered

### Yup

- **Rejected**: Less TypeScript-friendly, mutable API, larger bundle
- **When it makes sense**: JavaScript projects, Formik integration

### Joi

- **Rejected**: Node.js-focused, larger bundle, less React-friendly
- **When it makes sense**: Backend validation, Hapi.js projects

### Class Validator

- **Rejected**: Requires decorators, class-based (less idiomatic in React)
- **When it makes sense**: NestJS backends, OOP-heavy codebases

### Custom validation

- **Rejected**: Too much maintenance, error-prone, missing edge cases
- **When it makes sense**: Very simple validation, no external dependencies

## Implementation

### Basic Schema

```tsx
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string(),
  name: z.string().min(2).max(50),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
});

type User = z.infer<typeof UserSchema>;
```

### Form Validation with React Hook Form

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const CreateRoomSchema = z.object({
  name: z
    .string()
    .min(3, i18n.t('validation.minLength', { min: 3 }))
    .max(50, i18n.t('validation.maxLength', { max: 50 })),
  description: z
    .string()
    .max(200, i18n.t('validation.maxLength', { max: 200 }))
    .optional(),
});

type CreateRoomData = z.infer<typeof CreateRoomSchema>;

const CreateRoomModal = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateRoomData>({
    resolver: zodResolver(CreateRoomSchema),
  });

  const onSubmit = (data: CreateRoomData) => {
    // data is type-safe
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
    </form>
  );
};
```

### Environment Variable Validation

```tsx
// src/lib/env.ts
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  // ...
] as const;

type RequiredEnvVar = (typeof requiredEnvVars)[number];

function validateEnv(): Record<RequiredEnvVar, string> {
  const missingVars = requiredEnvVars.filter((envVar) => !import.meta.env[envVar]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  return {/* ... */};
}
```

### API Response Validation

```tsx
const MessageResponseSchema = z.object({
  id: z.string(),
  text: z.string(),
  userId: z.string(),
  timestamp: z.number(),
});

async function getMessages(roomId: string): Promise<Message[]> {
  const snapshot = await getDocs(collection(db, 'rooms', roomId, 'messages'));

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return MessageResponseSchema.parse({
      id: doc.id,
      ...data,
    });
  });
}
```

## Error Handling

```tsx
const result = UserSchema.safeParse(unknownData);

if (result.success) {
  // result.data is typed as User
  console.log(result.data.name);
} else {
  // result.error contains detailed validation errors
  result.error.errors.forEach((err) => {
    console.error(`${err.path.join('.')}: ${err.message}`);
  });
}
```

## Custom Error Messages

```tsx
const CreateRoomSchema = z.object({
  name: z
    .string({
      required_error: i18n.t('validation.required'),
      invalid_type_error: i18n.t('validation.mustBeString'),
    })
    .min(3, i18n.t('validation.minLength', { min: 3 }))
    .max(50, i18n.t('validation.maxLength', { max: 50 })),
});
```

## Advanced Patterns

### Unions

```tsx
const ResultSchema = z.union([
  z.object({ success: z.literal(true), data: z.any() }),
  z.object({ success: z.literal(false), error: z.string() }),
]);
```

### Discriminated Unions

```tsx
const MessageSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('text'), text: z.string() }),
  z.object({ type: z.literal('system'), text: z.string() }),
]);
```

### Refinements

```tsx
const PasswordSchema = z
  .string()
  .min(8)
  .refine((val) => /[A-Z]/.test(val), 'Must contain uppercase')
  .refine((val) => /[0-9]/.test(val), 'Must contain number');
```
