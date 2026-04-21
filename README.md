<div align="center">

# 🚀 NexChat

### _Modern • Fast • Intelligent Messaging_

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.1-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-10.8-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Zustand](https://img.shields.io/badge/Zustand-4.5-453f39?style=flat-square&logo=react&logoColor=white)](https://github.com/pmndrs/zustand)
[![MUI](https://img.shields.io/badge/MUI-5.15-007FFF?style=flat-square&logo=mui&logoColor=white)](https://mui.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[📚 Documentation](./docs/README.md) • [Firebase Setup](#-firebase-setup-guide) • [Contributing](#-contributing)

<img src="./public/NexChat Preview.png" alt="NexChat Preview" style="border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.2); max-width: 100%; height: auto; display: block; margin: 0 auto;">
<br>
<img src="./public/NexChat Preview-2.png" alt="NexChat Preview" style="border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.2); max-width: 100%; height: auto; display: block; margin: 0 auto;">

</div>

---

## 📋 Table of Contents

- [📚 Full Documentation](#-full-documentation)
- [About](#-about)
- [Key Features](#-key-features)
- [Architecture and Patterns](#-architecture-and-patterns)
- [Performance Techniques](#-performance-techniques)
- [Tech Stack](#-tech-stack)
- [Firebase Setup Guide](#-firebase-setup-guide)
- [Getting Started](#-getting-started)
- [Testing](#-testing)
- [Internationalization](#-internationalization)
- [Project Structure](#-project-structure)
- [🇮🇷 راهنمای فارسی](#-راهنمای-فارسی)
- [🇩🇪 Deutsche Anleitung](#-deutsche-anleitung)

---

## 📚 Full Documentation

Comprehensive documentation is available in the [`docs/`](./docs/README.md) directory:

- **[Architecture Overview](./docs/architecture/overview.md)** — High-level system design and principles
- **[Layered Architecture](./docs/architecture/layers.md)** — How the codebase is organized
- **[Design Patterns](./docs/architecture/patterns.md)** — Patterns used throughout the project
- **[Data Flow](./docs/architecture/data-flow.md)** — How data moves through the application
- **[Architecture Decision Records](./docs/adr/README.md)** — 12 ADRs documenting key decisions
- **[Firebase Setup](./docs/setup/firebase.md)** — Complete Firebase configuration guide
- **[Environment Variables](./docs/setup/environment.md)** — Required and optional configuration
- **[Testing Guide](./docs/development/testing.md)** — How to write and run tests
- **[Coding Standards](./docs/development/coding-standards.md)** — Code style and conventions
- **[Deployment](./docs/development/deployment.md)** — Production deployment guide

---

## ✨ About

**NexChat** is a production-grade, real-time messaging platform engineered with modern software engineering principles. Built on **React 18**, **TypeScript**, and **Firebase**, it demonstrates enterprise-level architecture with Feature-Sliced Design, comprehensive test coverage, and Apple-inspired UI/UX.

This isn't just another chat app—it's a showcase of:

- Clean architecture with strict separation of concerns
- Performance-first development philosophy
- Comprehensive error handling and recovery
- Accessibility and internationalization best practices
- Production-ready code quality standards

---

## 🎯 Key Features

### 💬 Real-time Messaging

- **Instant delivery** with Firebase Firestore real-time listeners
- **Message status indicators** (sent, delivered, read) with visual feedback
- **Reply/Quote** functionality for referencing previous messages
- **Link previews** for shared URLs with rich metadata
- **Search within conversations** with real-time filtering

### 🔐 Secure Authentication

- **Google OAuth** via Firebase Authentication
- **Session management** with refresh tokens
- **Protected routes** with authentication guards
- **Stale session detection** with persisted state validation
- **Automatic session timeout** after 24 hours

### 🎨 Apple-Inspired UI/UX

- **Dark mode design** with glassmorphism effects
- **Responsive layout** for mobile, tablet, and desktop
- **Smooth animations** with CSS cubic-bezier timing
- **Accessibility first** (ARIA labels, keyboard navigation)
- **Multi-language support** (English, Persian RTL, German)

### 📊 Smart Room Management

- **Create, join, leave, and delete** chat rooms
- **Public and private** room types
- **Real-time room updates** with optimistic UI
- **Search and filter** rooms with debounced queries
- **Member count tracking** and activity indicators

---

## 🏛️ Architecture and Patterns

NexChat follows **Feature-Sliced Design (FSD)**, a modern architectural methodology that promotes maintainability and scalability. Here are the key patterns and techniques used:

### 🎭 Design Patterns

| Pattern                | Implementation                                        | Benefit                                                              |
| ---------------------- | ----------------------------------------------------- | -------------------------------------------------------------------- |
| **Repository Pattern** | `messagesService`, `roomsService`, `authService`      | Abstracts Firebase logic, enables easy testing and swapping backends |
| **Facade Pattern**     | `useAuth`, `useRooms`, `useMessages` hooks            | Simplifies complex operations into clean APIs                        |
| **Observer Pattern**   | Firebase `onSnapshot` listeners, `useAuthListener`    | Real-time updates without polling                                    |
| **Guard Pattern**      | `AuthGuard` component                                 | Route protection with authentication checks                          |
| **Adapter Pattern**    | `mapFirestoreDocToMessage`, `mapFirebaseUserToDomain` | Converts between Firebase and domain models                          |
| **Singleton Pattern**  | Firebase app initialization, i18n instance            | Ensures single source of truth for shared resources                  |

### 🏗️ Architectural Principles

**Feature-Sliced Design Layers:**

```
src/
├── app/          # App-level config (providers, error boundaries, routes)
├── pages/        # Application pages (HomePage, LoginPage, ChatPage)
├── features/     # Feature modules (auth, chat, rooms)
├── shared/       # Reusable code (hooks, utils, types, constants)
├── lib/          # External integrations (Firebase, i18n, Sentry)
└── styles/       # Global design system
```

**Key Principles:**

- **Single Responsibility:** Each file has one clear purpose
- **Dependency Rule:** Upper layers depend on lower layers, never the reverse
- **Public API:** Features expose only what's needed via `index.ts`
- **Type Safety:** Strict TypeScript with discriminated unions

---

## ⚡ Performance Techniques

NexChat is engineered for speed and efficiency. Here are the techniques that make it fast:

### 🚀 Code Splitting & Lazy Loading

```typescript
// Lazy-loaded pages reduce initial bundle size
const HomePage = lazy(() => import('@/pages/HomePage'));
const ChatPage = lazy(() => import('@/pages/ChatPage'));
```

### 🎯 Manual Chunking Strategy

Vite is configured to split vendor bundles optimally:

- `vendor-react` - React core (~40KB gzipped)
- `vendor-firebase-*` - Firebase services (loaded on-demand)
- `vendor-mui-*` - MUI components (tree-shaken)
- `vendor-i18n` - Internationalization (loaded once)

### 💾 Memoization Strategies

- **`React.memo`** for `MessageBubble` to prevent re-renders
- **`useMemo`** for expensive computations (filtering, grouping)
- **`useCallback`** for stable function references
- **Zustand selectors** with `useShallow` for granular updates

### 📜 Virtualized Lists

Using `@tanstack/react-virtual` for message lists:

```typescript
const virtualizer = useVirtualizer({
  count: groupedItems.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 80,
  overscan: 5,
});
```

This ensures smooth scrolling even with thousands of messages.

### ⏱️ Debouncing

Search queries and frequent operations are debounced to prevent excessive API calls:

```typescript
const debouncedSearchQuery = useDebounce(localSearchQuery, 300);
```

### 🎨 CSS Performance

- **Static gradients** instead of animated backgrounds (reduced GPU usage)
- **`will-change` and `transform`** for hardware-accelerated animations
- **Minimal reflows** with absolute positioning for virtual items

### 🗜️ Bundle Size Optimization

- **Tree-shaking** enabled with `moduleSideEffects: false`
- **ES2022 target** for modern browser features (smaller polyfills)
- **Console removal** in production (`console.log`, `console.debug`)
- **Sourcemap hiding** for security while maintaining debuggability

---

## 🛠️ Tech Stack

| Category           | Technology          | Version | Purpose                                       |
| ------------------ | ------------------- | ------- | --------------------------------------------- |
| **Core**           | React               | 18.2    | UI library with Hooks and Concurrent Features |
| **Language**       | TypeScript          | 5.3     | Type safety and developer experience          |
| **Build**          | Vite                | 5.1     | Lightning-fast builds with instant HMR        |
| **Backend**        | Firebase            | 10.8    | Auth, Firestore, Storage                      |
| **State**          | Zustand             | 4.5     | Lightweight client state management           |
| **Server State**   | TanStack Query      | 5.24    | Caching and async data management             |
| **Routing**        | React Router        | 6.22    | SPA routing with protected routes             |
| **UI Framework**   | MUI                 | 5.15    | Material Design components                    |
| **Forms**          | React Hook Form     | 7.50    | Performant form handling                      |
| **Validation**     | Zod                 | 3.22    | Schema-based validation                       |
| **Virtualization** | TanStack Virtual    | 3.14    | High-performance list rendering               |
| **i18n**           | i18next             | 26.4    | Multi-language support                        |
| **Testing**        | Vitest + RTL        | Latest  | Unit and integration testing                  |
| **Error Tracking** | Sentry              | 10.73   | Production error monitoring                   |
| **Code Quality**   | ESLint + Prettier   | Latest  | Linting and formatting                        |
| **Pre-commit**     | Husky + lint-staged | 9.1     | Automated quality checks                      |

---

## 🔥 Firebase Setup Guide

Follow these steps to configure NexChat with your own Firebase project:

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add Project"** and follow the setup wizard
3. Enable **Google Analytics** (optional but recommended)
4. Once created, click the web icon (`</>`) to add a web app
5. Register your app with a nickname (e.g., "NexChat")
6. Copy the configuration object—you'll need these values

### Step 2: Enable Authentication

1. In Firebase Console, navigate to **Authentication** → **Sign-in method**
2. Click **Google** and enable it
3. Set a **Project support email** (your email)
4. Save the changes

### Step 3: Create Firestore Database

1. Navigate to **Firestore Database** → **Create database**
2. Choose **"Start in production mode"**
3. Select a location closest to your users (e.g., `us-central1`)
4. Click **Enable**

### Step 4: Configure Security Rules

Replace the default Firestore rules with these production-ready rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    function isRoomMember(roomId) {
      return isAuthenticated() &&
             request.auth.uid in get(/databases/$(database)/documents/rooms/$(roomId)).data.members;
    }

    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isOwner(userId);
      allow update: if isOwner(userId);
      allow delete: if false; // Prevent deletion
    }

    // Rooms collection
    match /rooms/{roomId} {
      allow read: if isAuthenticated() &&
                     (resource.data.members.hasAny([request.auth.uid]) ||
                      resource.data.type == 'public');
      allow create: if isAuthenticated();
      allow update: if isRoomMember(roomId);
      allow delete: if isOwner(resource.data.creatorId);

      // Messages subcollection
      match /messages/{messageId} {
        allow read: if isRoomMember(roomId);
        allow create: if isRoomMember(roomId) &&
                         request.resource.data.senderId == request.auth.uid;
        allow delete: if isOwner(resource.data.senderId);
        allow update: if false; // Messages are immutable
      }
    }
  }
}
```

### Step 5: Configure Environment Variables

1. Create a `.env.local` file in your project root
2. Add your Firebase configuration:

```bash
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here

# Optional: Sentry DSN for error tracking
# VITE_SENTRY_DSN=your_sentry_dsn_here
```

⚠️ **Security Note:** Never commit `.env.local` to version control. It's already in `.gitignore`.

### Step 6: Deploy Firestore Rules

```bash
npm install -g firebase-tools
firebase login
firebase init firestore
firebase deploy --only firestore:rules
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** 9+ or **yarn** 1.22+
- A Firebase project (see [Firebase Setup](#-firebase-setup-guide))

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/mhalikhani/nexchat.git
cd nexchat
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment**

```bash
cp .env.example .env.local
# Edit .env.local with your Firebase credentials
```

4. **Start development server**

```bash
npm run dev
```

Visit `http://localhost:5173` to see NexChat in action!

### Available Scripts

| Command                 | Description                       |
| ----------------------- | --------------------------------- |
| `npm run dev`           | Start development server with HMR |
| `npm run build`         | Build for production              |
| `npm run preview`       | Preview production build locally  |
| `npm run test`          | Run tests in watch mode           |
| `npm run test:coverage` | Generate coverage report          |
| `npm run type-check`    | Check TypeScript types            |
| `npm run lint`          | Run ESLint                        |
| `npm run lint:fix`      | Fix ESLint errors automatically   |
| `npm run format`        | Format code with Prettier         |

---

## 🧪 Testing

NexChat follows a **testing-first culture** with comprehensive coverage across all layers:

### Test Categories

- **Unit Tests:** Store logic, utility functions, mappers
- **Integration Tests:** Service layer with mocked Firebase
- **Component Tests:** UI components with React Testing Library
- **Hook Tests:** Custom hooks with `renderHook`

### Running Tests

```bash
# Run all tests in watch mode
npm run test

# Run tests once with coverage
npm run test:coverage

# Run specific test file
npm run test src/features/auth/stores/authStore.test.ts
```

### Test Quality Standards

- ✅ All stores have 100% action and selector coverage
- ✅ All services test success and error paths
- ✅ Components test user interactions, not implementation details
- ✅ Hooks test lifecycle and cleanup behavior
- ✅ Edge cases and error boundaries are tested

---

## 🌍 Internationalization

NexChat supports 3 languages with automatic RTL/LTR switching:

| Language         | Code | Direction | File                              |
| ---------------- | ---- | --------- | --------------------------------- |
| English          | `en` | LTR       | `src/locales/en/translation.json` |
| Persian (فارسی)  | `fa` | RTL       | `src/locales/fa/translation.json` |
| German (Deutsch) | `de` | LTR       | `src/locales/de/translation.json` |

### Adding a New Language

1. Create a new directory: `src/locales/{code}/`
2. Copy `translation.json` from an existing language
3. Translate all keys
4. Update `src/lib/i18n.ts`:

```typescript
export const supportedLanguages = {
  fa: { name: 'فارسی', dir: 'rtl' as const },
  en: { name: 'English', dir: 'ltr' as const },
  de: { name: 'Deutsch', dir: 'ltr' as const },
  // Add your language here
} as const;
```

---

## 📁 Project Structure

```
nexchat/
├── .github/workflows/        # CI/CD pipelines
├── docs/                      # Architecture Decision Records (ADRs)
├── public/                    # Static assets
│   └── manifest.webmanifest  # PWA manifest
├── src/
│   ├── app/                  # App-level configuration
│   │   ├── components/       # ErrorBoundary
│   │   └── providers/        # AuthProvider
│   ├── features/             # Feature modules
│   │   ├── auth/            # Authentication
│   │   │   ├── components/  # SignInButton, AuthGuard, EditNameModal
│   │   │   ├── hooks/       # useAuth, useAuthListener
│   │   │   ├── services/    # auth.service, profile.service
│   │   │   ├── stores/      # authStore (Zustand)
│   │   │   ├── types/       # User, AuthError, AuthProvider
│   │   │   └── utils/       # Mappers
│   │   ├── chat/            # Chat functionality
│   │   │   ├── components/  # ChatInput, MessageBubble, MessageList
│   │   │   ├── hooks/       # useMessages, useSendMessage
│   │   │   ├── services/    # messages.service
│   │   │   ├── stores/      # chatStore (Zustand)
│   │   │   ├── types/       # Message, ChatState
│   │   │   └── utils/       # Mappers
│   │   └── rooms/           # Room management
│   │       ├── components/  # RoomList, RoomItem, CreateRoomModal
│   │       ├── hooks/       # useRooms, useCreateRoom, useRoomActions
│   │       ├── services/    # rooms.service
│   │       ├── stores/      # roomsStore (Zustand)
│   │       ├── types/       # Room, RoomType
│   │       └── utils/       # Validators, Mappers
│   ├── lib/                  # External integrations
│   │   ├── firebase.ts      # Firebase initialization
│   │   ├── i18n.ts          # i18next configuration
│   │   ├── sentry.ts        # Sentry error tracking
│   │   └── env.ts           # Environment validation
│   ├── locales/              # Translation files
│   ├── pages/                # Application pages
│   │   ├── HomePage.tsx     # Landing page
│   │   ├── LoginPage.tsx    # Authentication page
│   │   └── ChatPage.tsx     # Main chat interface
│   ├── shared/               # Reusable code
│   │   ├── constants/       # App-wide constants
│   │   ├── hooks/           # useDebounce
│   │   ├── types/           # Shared types
│   │   └── utils/           # cn, format, validation
│   ├── styles/               # Global styles
│   │   ├── global.css       # Design system
│   │   └── theme.ts         # MUI theme
│   ├── test/                 # Test setup
│   ├── App.tsx              # Root component
│   └── main.tsx             # Application entry point
├── index.html                # HTML template
├── vite.config.ts           # Vite configuration
├── vitest.config.ts         # Vitest configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and scripts
```

---

## 🇮🇷 راهنمای فارسی

### درباره NexChat

**NexChat** یک پلتفرم پیام‌رسان سازمانی نسل جدید است که با **React 18**، **TypeScript** و **Firebase** ساخته شده است. این پروژه با رعایت بهترین شیوه‌های مهندسی نرم‌افزار، از جمله معماری Feature-Sliced Design، تست‌های جامع و طراحی الهام‌گرفته از Apple، توسعه یافته است.

### ویژگی‌های کلیدی

- **پیام‌رسانی بلادرنگ:** ارسال و دریافت فوری پیام‌ها با نشانگرهای وضعیت (ارسال شده، تحویل داده شده، خوانده شده)
- **احراز هویت امن:** ورود با Google OAuth و مدیریت نشست‌ها
- **طراحی مدرن:** رابط کاربری الهام‌گرفته از Apple با افکت‌های شیشه‌ای (Glassmorphism)
- **پشتیبانی از چند زبان:** انگلیسی، فارسی (RTL) و آلمانی
- **مدیریت هوشمند اتاق‌ها:** ایجاد، پیوستن، ترک و حذف اتاق‌های چت
- **عملکرد بالا:** بهینه‌سازی‌های پیشرفته برای سرعت و کارایی

### راه‌اندازی سریع

1. مخزن را کلون کنید:

```bash
git clone https://github.com/mhalikhani/nexchat.git
cd nexchat
```

2. وابستگی‌ها را نصب کنید:

```bash
npm install
```

3. فایل `.env.local` را با اطلاعات Firebase خود پیکربندی کنید

4. سرور توسعه را شروع کنید:

```bash
npm run dev
```

### نکات مهم معماری

- **الگوی Repository:** تمام تعاملات با Firebase از طریق سرویس‌ها انجام می‌شود
- **الگوی Facade:** هوک‌ها API ساده‌ای برای عملیات پیچیده ارائه می‌دهند
- **الگوی Observer:** به‌روزرسانی‌های بلادرنگ با استفاده از Firebase listeners
- **الگوی Guard:** محافظت از مسیرها با بررسی احراز هویت

---

## 🇩🇪 Deutsche Anleitung

### Über NexChat

**NexChat** ist eine moderne Echtzeit-Nachrichtenplattform, entwickelt mit **React 18**, **TypeScript** und **Firebase**. Das Projekt demonstriert erstklassige Softwareentwicklung mit Feature-Sliced Design Architektur, umfassender Testabdeckung und Apple-inspirierter Benutzeroberfläche.

### Hauptfunktionen

- **Echtzeit-Nachrichten:** Sofortige Nachrichtenübermittlung mit Statusanzeigen (gesendet, zugestellt, gelesen)
- **Sichere Authentifizierung:** Google OAuth mit Sitzungsverwaltung
- **Modernes Design:** Apple-inspirierte Benutzeroberfläche mit Glassmorphism-Effekten
- **Mehrsprachigkeit:** Englisch, Persisch (RTL) und Deutsch
- **Intelligente Raumverwaltung:** Erstellen, Beitreten, Verlassen und Löschen von Chaträumen
- **Hohe Leistung:** Fortgeschrittene Optimierungen für Geschwindigkeit und Effizienz

### Schnellstart

1. Repository klonen:

```bash
git clone https://github.com/mhalikhani/nexchat.git
cd nexchat
```

2. Abhängigkeiten installieren:

```bash
npm install
```

3. `.env.local` mit Ihren Firebase-Zugangsdaten konfigurieren

4. Entwicklungsserver starten:

```bash
npm run dev
```

### Architektur-Highlights

- **Repository Pattern:** Alle Firebase-Interaktionen über Services
- **Facade Pattern:** Hooks bieten einfache APIs für komplexe Operationen
- **Observer Pattern:** Echtzeit-Updates mit Firebase Listeners
- **Guard Pattern:** Routenschutz mit Authentifizierungsprüfung

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a **Pull Request**

### Development Guidelines

- Follow **[Feature-Sliced Design](./docs/adr/010-feature-sliced-design.md)** principles
- Write **[tests](./docs/development/testing.md)** for new features
- Ensure **[TypeScript](./docs/adr/008-typescript-strict-mode.md)** strict mode compliance
- Use **[conventional commits](./docs/development/coding-standards.md)** for commit messages
- Update **[documentation](./docs/README.md)** as needed

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Developer

<div align="center">

### Mohammad Hossein Alikhani

_Full-Stack Developer | React & TypeScript Enthusiast_

[![GitHub](https://img.shields.io/badge/GitHub-mhalikhani-181717?style=flat-square&logo=github)](https://github.com/mhalikhani)
[![Email](https://img.shields.io/badge/Email-Contact%20Me-D14836?style=flat-square&logo=gmail&logoColor=white)](mailto:mohammad.hosein.alikhani08@gmail.com)

</div>

---

<div align="center">

**Built with ❤️ and clean code**

_If you find this project helpful, please consider giving it a ⭐_

</div>
