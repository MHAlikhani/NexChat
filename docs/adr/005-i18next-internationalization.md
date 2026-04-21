# ADR 005: i18next for Internationalization

## Status

Accepted

## Context

NexChat needed to support multiple languages from the start:

- English (default)
- Persian (RTL support required)
- German

Requirements:

- Type-safe translations
- RTL/LTR support
- Language detection
- Easy to add new languages
- Good React integration

## Decision

We chose **i18next** with `react-i18next` for internationalization.

## Consequences

### Positive

- ✅ **Mature ecosystem**: Industry standard for i18n in JavaScript
- ✅ **Plugin support**: Language detection, backend loading, formatting
- ✅ **React integration**: `useTranslation` hook is ergonomic
- ✅ **RTL support**: Easy to switch `dir` attribute based on language
- ✅ **Namespaces**: Organize translations by feature
- ✅ **Interpolation**: Dynamic values in translations
- ✅ **Pluralization**: Handle singular/plural forms correctly

### Negative

- ⚠️ **Bundle size**: Adds ~30KB to bundle
- ⚠️ **Complexity**: More setup than simple i18n solutions
- ⚠️ **Runtime overhead**: Translation lookups have small performance cost

## Alternatives Considered

### react-intl (FormatJS)

- **Rejected**: Less flexible, more opinionated API
- **When it makes sense**: Apps needing ICU message syntax, date/number formatting

### next-intl

- **Rejected**: Next.js-specific, not usable in Vite
- **When it makes sense**: Next.js projects

### Custom i18n solution

- **Rejected**: Too much maintenance, missing features like pluralization
- **When it makes sense**: Very small apps with few translations

## Implementation

### Configuration (`src/lib/i18n.ts`)

```tsx
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from '@/locales/en/translation.json';
import fa from '@/locales/fa/translation.json';
import de from '@/locales/de/translation.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fa: { translation: fa },
      de: { translation: de },
    },
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });
```

### Usage in Components

```tsx
import { useTranslation } from 'react-i18next';

const Component = () => {
  const { t, i18n } = useTranslation();

  return (
    <div dir={i18n.dir()}>
      <h1>{t('welcome')}</h1>
      <p>{t('messages.count', { count: 5 })}</p>
    </div>
  );
};
```

### RTL Support

```tsx
// Automatically sets dir based on language
<div dir={i18n.dir()}>{/* Persian: dir="rtl", English/German: dir="ltr" */}</div>
```

## Translation File Structure

```json
{
  "auth": {
    "signIn": "Sign In",
    "signingIn": "Signing in...",
    "signInSuccess": "Successfully signed in",
    "signInFailed": "Sign in failed"
  },
  "chat": {
    "typeMessage": "Type a message...",
    "sendMessage": "Send"
  },
  "validation": {
    "required": "This field is required",
    "minLength": "Must be at least {{min}} characters"
  }
}
```

## Adding a New Language

1. Create `src/locales/{lang}/translation.json`
2. Copy English translations and translate
3. Add to `resources` in `src/lib/i18n.ts`
4. Language is automatically detected or user can select
