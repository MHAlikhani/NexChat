# NexChat Documentation

Welcome to the official documentation for **NexChat** — a modern, enterprise-grade real-time messaging platform built with React 18, TypeScript, Vite, and Firebase.

## 📚 Table of Contents

### Architecture

- [Architecture Overview](./architecture/overview.md) — High-level system design and principles
- [Layered Architecture](./architecture/layers.md) — How the codebase is organized into layers
- [Design Patterns](./architecture/patterns.md) — Patterns used throughout the project
- [Data Flow](./architecture/data-flow.md) — How data moves through the application

### Architecture Decision Records (ADR)

- [ADR Index](./adr/README.md) — Complete list of architectural decisions
- [ADR 001: Vite over Create React App](./adr/001-vite-over-cra.md)
- [ADR 002: Zustand over Redux](./adr/002-zustand-over-redux.md)
- [ADR 003: MUI over Tailwind CSS](./adr/003-mui-over-tailwind.md)
- [ADR 004: Firebase as Backend](./adr/004-firebase-backend.md)
- [ADR 005: i18next for Internationalization](./adr/005-i18next-internationalization.md)
- [ADR 006: Sentry for Error Tracking](./adr/006-sentry-error-tracking.md)
- [ADR 007: Vitest for Testing](./adr/007-vitest-testing.md)
- [ADR 008: TypeScript Strict Mode](./adr/008-typescript-strict-mode.md)
- [ADR 009: TanStack Query for Data Fetching](./adr/009-tanstack-query-data-fetching.md)
- [ADR 010: Feature-Sliced Design](./adr/010-feature-sliced-design.md)
- [ADR 011: Zod for Validation](./adr/011-zod-validation.md)
- [ADR 012: React Hook Form for Forms](./adr/012-react-hook-form.md)

### Setup & Configuration

- [Firebase Setup](./setup/firebase.md) — Complete guide to setting up Firebase
- [Environment Variables](./setup/environment.md) — Required and optional environment variables

### Development

- [Testing Guide](./development/testing.md) — How to write and run tests
- [Coding Standards](./development/coding-standards.md) — Code style and conventions
- [Deployment](./development/deployment.md) — How to deploy NexChat to production

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/nexchat.git

# Install dependencies
npm install

# Set up environment variables (see setup/firebase.md)
cp .env.example .env.local

# Start development server
npm run dev
```

## 📖 Key Technologies

| Technology      | Purpose                    | Version |
| --------------- | -------------------------- | ------- |
| React           | UI Library                 | 18.2.0  |
| TypeScript      | Type Safety                | 5.3.3   |
| Vite            | Build Tool                 | 5.1.0   |
| Firebase        | Backend (Auth + Firestore) | 10.8.0  |
| MUI             | Component Library          | 5.15.10 |
| Zustand         | State Management           | 4.5.0   |
| TanStack Query  | Data Fetching              | 5.24.1  |
| i18next         | Internationalization       | 26.4.2  |
| Sentry          | Error Tracking             | 10.73.0 |
| Vitest          | Testing Framework          | 1.2.2   |
| Zod             | Schema Validation          | 3.22.4  |
| React Hook Form | Form Management            | 7.50.1  |

## 📁 Project Structure

```
src/
├── app/                    # Application-level concerns
│   ├── components/         # App-wide components (ErrorBoundary)
│   ├── providers/          # Global providers (AuthProvider)
│   └── routes/             # Route configuration
├── features/               # Feature modules (auth, chat, rooms)
│   ├── {feature}/
│   │   ├── components/     # UI components
│   │   ├── hooks/          # Feature-specific hooks
│   │   ├── services/       # API/data services
│   │   ├── stores/         # Zustand stores
│   │   ├── types/          # Type definitions
│   │   └── utils/          # Utility functions
│   └── index.ts            # Public API (barrel export)
├── pages/                  # Page components (code-split)
├── shared/                 # Shared utilities
│   ├── constants/          # App constants
│   ├── hooks/              # Shared hooks
│   ├── types/              # Shared types
│   └── utils/              # Shared utilities
├── lib/                    # External library integrations
│   ├── firebase.ts         # Firebase initialization
│   ├── i18n.ts             # i18next configuration
│   ├── sentry.ts           # Sentry configuration
│   └── env.ts              # Environment variable validation
├── locales/                # Translation files (en, fa, de)
├── styles/                 # Global styles and theme
└── test/                   # Test setup and utilities
```
