# ADR 012: React Hook Form for Forms

## Status

Accepted

## Context

NexChat has several forms:

- Login form
- Create room modal
- Edit name modal
- Search inputs

We needed a form library that:

- Minimizes re-renders
- Integrates with validation libraries
- Has good TypeScript support
- Handles complex form state
- Provides accessible error handling

## Decision

We chose **React Hook Form** with **Zod** for validation.

## Consequences

### Positive

- ✅ **Performance**: Uncontrolled inputs minimize re-renders
- ✅ **Small bundle**: ~5KB gzipped
- ✅ **Zod integration**: `@hookform/resolvers/zod` works seamlessly
- ✅ **TypeScript**: Excellent type inference for form data
- ✅ **DevTools**: Visual form debugger available
- ✅ **Accessibility**: Built-in ARIA attributes and keyboard navigation
- ✅ **Nested forms**: Easy to build complex form structures

### Negative

- ⚠️ **Learning curve**: Different from Formik (controlled vs uncontrolled)
- ⚠️ **Uncontrolled by default**: Some patterns require `Controller` wrapper
- ⚠️ **Documentation gaps**: Some edge cases not well-documented

## Alternatives Considered

### Formik

- **Rejected**: More re-renders, larger bundle, less TypeScript-friendly
- **When it makes sense**: Existing Formik codebases, controlled component preference

### Final Form

- **Rejected**: Less React-idiomatic, smaller community
- **When it makes sense**: Complex wizard forms, field-level validation

### Redux Form

- **Rejected**: Redux dependency, performance issues, deprecated
- **When it makes sense**: Legacy Redux applications (not recommended)

### Custom hooks

- **Rejected**: Too much boilerplate, accessibility concerns, edge cases
- **When it makes sense**: Very simple forms (1-2 fields), no external dependencies

## Implementation

### Basic Form

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
});

type FormData = z.infer<typeof schema>;

const MyForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}

      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <button type="submit">Submit</button>
    </form>
  );
};
```

### With MUI Components (Controller)

```tsx
import { Controller } from 'react-hook-form';
import { TextField } from '@mui/material';

const MyForm = () => {
  const { control, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="name"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <TextField {...field} label="Name" error={!!error} helperText={error?.message} />
        )}
      />
    </form>
  );
};
```

### Async Validation

```tsx
const schema = z.object({
  roomName: z
    .string()
    .min(3)
    .refine(
      async (name) => {
        const exists = await roomsService.checkRoomExists(name);
        return !exists;
      },
      { message: 'Room name already exists' }
    ),
});
```

### Watch Form Values

```tsx
const { watch } = useForm<FormData>();
const nameValue = watch('name'); // Re-renders when name changes
```

### Reset Form

```tsx
const { reset } = useForm<FormData>();

// Reset to default values
reset();

// Reset to new values
reset({ name: 'John', email: 'john@example.com' });
```

## Performance Characteristics

| Pattern                   | Re-renders | Use Case                             |
| ------------------------- | ---------- | ------------------------------------ |
| `register` (uncontrolled) | Minimal    | Simple inputs, most form fields      |
| `Controller` (controlled) | Per field  | MUI components, custom inputs        |
| `watch`                   | Per change | Derived state, conditional rendering |

## Best Practices

1. **Use `register` for simple inputs** — best performance
2. **Use `Controller` for complex components** — MUI, custom inputs
3. **Avoid `watch` unless necessary** — causes re-renders
4. **Use `useFormContext` for nested forms** — avoid prop drilling
5. **Validate on blur for better UX** — `mode: 'onBlur'`

## Form Organization

```tsx
// features/rooms/components/CreateRoomModal.tsx
const CreateRoomModal = () => {
  const { register, handleSubmit, formState } = useForm<CreateRoomData>({
    resolver: zodResolver(createRoomSchema),
    mode: 'onBlur',
  });

  const mutation = useCreateRoom();

  const onSubmit = (data: CreateRoomData) => {
    mutation.mutate(data, {
      onSuccess: () => {
        // Close modal
      },
    });
  };

  return (
    <Dialog open>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField {...register('name')} error={!!formState.errors.name} />
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Creating...' : 'Create'}
        </Button>
      </form>
    </Dialog>
  );
};
```
