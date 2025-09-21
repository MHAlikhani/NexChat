<div align="center">

# NexChat

### Modern, Fast & Intelligent Messaging Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-10.0-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[Report Bug](https://github.com/mhalikhani/nexchat/issues) · [Request Feature](https://github.com/mhalikhani/nexchat/issues)

</div>

---

<img src="./public/NexChat Preview.png" style="border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); max-width: 100%; height: auto; display: block;">

## About

NexChat is a full-stack real-time messaging application built with **React 18**, **TypeScript**, and **Firebase**. It follows **Feature-Sliced Design** architecture and demonstrates best practices in software engineering — from clean architecture and comprehensive testing to high performance and smooth UX.

This project serves as a production-grade portfolio piece showcasing modern frontend development capabilities.

## Key Features

### Real-time Messaging
- Send and receive text messages with **Markdown** and **line break** support
- Message status indicators (sent, delivered, read) with visual icons
- Live typing indicators showing "typing..." for other users

### Media Sharing
- Upload images in JPEG, PNG, and WebP formats
- **Automatic compression** before sending to reduce bandwidth usage
- Image preview before sending with cancel option

### Voice Messages
- Record audio directly in the browser using the **MediaRecorder API**
- Live timer display during recording
- **Cancel or send** voice messages at any time
- Custom audio player with Play/Pause controls and seek slider

### Secure Authentication
- Sign in with **Google OAuth** via Firebase Authentication
- Session management with **Refresh Tokens** for enhanced security
- Route protection with **Protected Routes**

### User Experience
- Fully **responsive** design for mobile, tablet, and desktop
- Complete **accessibility** support (ARIA labels, keyboard navigation)
- **Lazy loading** for images and heavy components
- Smooth, performant animations

### Performance
- **Code splitting** with React.lazy and Suspense
- Component **memoization** to prevent unnecessary re-renders
- **Debounced** search and frequent operations
- Image optimization before upload

## Tech Stack

| Category | Technology | Description |
|----------|-----------|-------------|
| **Frontend** | React 18.3 | Core UI library with Hooks and Context API |
| **Language** | TypeScript 5.3 | Type safety and improved DX |
| **Build Tool** | Vite 5.0 | Fast builds with instant HMR |
| **Backend** | Firebase 10.0 | Auth, Realtime Database, and Storage |
| **Client State** | Zustand 4.4 | Lightweight and fast state management |
| **Server State** | TanStack Query 5.0 | Caching and server data management |
| **Routing** | React Router 6.20 | SPA routing with protected routes |
| **Styling** | MUI 5.14 | Material Design component library |
| **Forms** | React Hook Form 7.48 | Optimized forms with validation |
| **Validation** | Zod 3.22 | Schema-based validation |
| **Testing** | Vitest + RTL | Unit and integration testing |
| **Code Quality** | ESLint + Prettier | Linting and formatting with Husky |
| **Animation** | Framer Motion 10.16 | Declarative animations |
| **Error Tracking** | Sentry 7.80 | Production error monitoring |

## Project Structure

This project follows the **Feature-Sliced Design (FSD)** architecture:

```
src/
├── app/                    # App-level configuration (Providers, Router)
├── pages/                  # Application pages
├── features/               # Feature modules
│   ├── auth/              # Authentication (Login, Google OAuth)
│   ├── chat/              # Chat (Messages, Input, Media)
│   └── rooms/             # Room management
├── shared/                # Shared reusable code
│   ├── hooks/             # Custom hooks
│   ├── utils/             # Utility functions
│   ├── types/             # Shared type definitions
│   └── constants/         # App-wide constants
├── lib/                   # External library integrations
└── styles/                # Global styles and theme
```

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- A Firebase account (for backend configuration)

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

3. **Configure environment variables**
Copy `.env.example` to `.env` and add your Firebase credentials:
```bash
cp .env.example .env
```

4. **Start development server**
```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

5. **Build for production**
```bash
npm run build
npm run preview  # Preview the production build
```

## Testing & Code Quality

This project is built with a **testing-first culture** using modern tools:

```bash
# Run all tests
npm run test

# Run tests with coverage report
npm run test:coverage

# Check type safety
npm run type-check

# Lint and format checks
npm run lint
npm run lint:fix
```

### Quality Tools
- **Vitest**: Fast unit testing with Jest compatibility
- **React Testing Library**: Component testing from the user's perspective
- **ESLint + Prettier**: Clean and consistent code
- **Husky + lint-staged**: Automated pre-commit checks
- **TypeScript strict mode**: Maximum type safety

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## Developer

<div align="center">

### Mohammad Hosein Alikhani

Full-Stack Developer | React & TypeScript Enthusiast

[![GitHub](https://img.shields.io/badge/GitHub-mhalikhani-181717?style=flat-square&logo=github)](https://github.com/mhalikhani)
[![Email](https://img.shields.io/badge/Email-Contact%20Me-D14836?style=flat-square&logo=gmail&logoColor=white)](mailto:mohammad.hosein.alikhani08@gmail.com)

</div>

---

<div align="center">

Built with ❤️ and clean code

</div>
