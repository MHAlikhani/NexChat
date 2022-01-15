# NexChat

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb.svg)](https://reactjs.org/)

یک پیام‌رسان مدرن، سریع و امن با الهام از WhatsApp، ساخته شده با جدیدترین استانداردهای مهندسی نرم‌افزار.

## 🚀 ویژگی‌های کلیدی

- **Real-time Messaging**: پیام‌رسانی لحظه‌ای با Firebase Firestore
- **Multi-media Support**: ارسال تصاویر (با فشرده‌سازی هوشمند) و پیام‌های صوتی
- **Type-Safe**: ۱۰۰٪ TypeScript با Strict Mode
- **Responsive Design**: طراحی واکنش‌گرا برای موبایل و دسکتاپ
- **Optimistic UI**: به‌روزرسانی‌های آنی رابط کاربری بدون انتظار برای پاسخ سرور
- **Code Splitting**: بارگذاری تنبل (Lazy Loading) برای بهینه‌سازی پرفورمنس
- **Accessibility**: پشتیبانی کامل از استانداردهای WCAG 2.1

## 🛠️ پشته فناوری (Tech Stack)

| دسته‌بندی | تکنولوژی |
|-----------|----------|
| **Build Tool** | Vite 5.x |
| **Framework** | React 18.x + TypeScript 5.x |
| **State Management** | Zustand (Client) + TanStack Query (Server) |
| **UI Library** | Material-UI (MUI) v6 |
| **Backend** | Firebase v9+ (Modular SDK) |
| **Routing** | React Router v6 |
| **Forms & Validation** | React Hook Form + Zod |
| **Testing** | Vitest + React Testing Library + Playwright |
| **Code Quality** | ESLint + Prettier + Husky + lint-staged |

## 📦 نصب و راه‌اندازی

### پیش‌نیازها
- Node.js >= 20.x
- npm >= 10.x یا pnpm >= 8.x

### مراحل نصب

1. **کلون کردن مخزن**
   ```bash
   git clone https://github.com/your-username/nexchat.git
   cd nexchat
   ```

2. **نصب وابستگی‌ها**
   ```bash
   npm install
   # یا
   pnpm install
   ```

3. **پیکربندی متغیرهای محیطی**
   ```bash
   cp .env.example .env.local
   ```
   سپس مقادیر Firebase خود را در فایل `.env.local` وارد کنید.

4. **اجرای سرور توسعه**
   ```bash
   npm run dev
   ```
   اپلیکیشن در `http://localhost:5173` در دسترس خواهد بود.

## 🧪 تست

```bash
# اجرای تست‌های واحد
npm run test

# اجرای تست‌های واحد با پوشش کد
npm run test:coverage

# اجرای تست‌های End-to-End
npm run test:e2e
```

## 🏗️ ساختار پروژه

```
src/
├── app/                    # تنظیمات کلی اپلیکیشن (Providers, Routes)
├── features/               # ماژول‌های مستقل (auth, chat, rooms, media)
├── shared/                 # کدهای مشترک (components, hooks, utils, types)
├── assets/                 # تصاویر، فونت‌ها و آیکون‌ها
└── styles/                 # تم‌ها و استایل‌های سراسری
```

## 📚 مستندات

- [معماری سیستم](docs/ARCHITECTURE.md)
- [تصمیمات معماری (ADR)](docs/adr/)
- [راهنمای مشارکت](CONTRIBUTING.md)

## 📄 مجوز

این پروژه تحت مجوز MIT منتشر شده است. برای جزئیات بیشتر به فایل [LICENSE](LICENSE) مراجعه کنید.

---

**توسعه‌دهنده**: محمدحسین علیخانی  
**نسخه**: 2.0.0 (Enterprise Edition)