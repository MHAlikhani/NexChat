# NexChat

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646cff.svg)](https://vitejs.dev/)

یک پیام‌رسان مدرن، سریع و امن با الهام از WhatsApp، ساخته شده با جدیدترین استانداردهای مهندسی نرم‌افزار و معماری Feature-Sliced Design.

## 🚀 ویژگی‌های کلیدی

- **Real-time Messaging**: پیام‌رسانی لحظه‌ای با Firebase Firestore
- **Multi-media Support**: ارسال تصاویر (با فشرده‌سازی هوشمند) و پیام‌های صوتی
- **Type-Safe**: ۱۰۰٪ TypeScript با Strict Mode
- **Responsive Design**: طراحی واکنش‌گرا برای موبایل و دسکتاپ
- **Optimistic UI**: به‌روزرسانی‌های آنی رابط کاربری بدون انتظار برای پاسخ سرور
- **Code Splitting**: بارگذاری تنبل (Lazy Loading) برای بهینه‌سازی پرفورمنس
- **Accessibility**: پشتیبانی کامل از استانداردهای WCAG 2.1
- **Internationalization**: پشتیبانی از زبان فارسی (RTL)

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
| **Testing** | Vitest + React Testing Library |
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

# بررسی تایپ‌اسکریپت
npm run type-check
```

## 🏗️ ساختار پروژه

```
src/
├── app/                    # تنظیمات کلی اپلیکیشن (Providers, Routes, ErrorBoundary)
├── features/               # ماژول‌های مستقل (auth, chat, rooms)
│   ├── components/         # کامپوننت‌های اختصاصی فیچر
│   ├── hooks/              # هوک‌های اختصاصی فیچر
│   ├── services/           # لایه دسترسی به داده (Repository Pattern)
│   ├── stores/             # مدیریت state محلی (Zustand)
│   ├── types/              # تعاریف نوع اختصاصی فیچر
│   └── utils/              # توابع کمکی اختصاصی فیچر
├── shared/                 # کدهای مشترک و قابل استفاده مجدد
│   ├── components/         # کامپوننت‌های UI پایه
│   ├── hooks/              # هوک‌های عمومی (مثل useDebounce)
│   ├── utils/              # توابع کمکی عمومی
│   ├── types/              # تعاریف نوع عمومی
│   └── constants/          # مقادیر ثابت
├── lib/                    # پیکربندی کتابخانه‌های خارجی (Firebase, i18n, Sentry)
├── pages/                  # صفحات اصلی اپلیکیشن (ترکیب فیچرها)
└── styles/                 # تم‌ها و استایل‌های سراسری
```

## 📚 مستندات

- [معماری سیستم](docs/ARCHITECTURE.md)
- [تصمیمات معماری (ADR)](docs/adr/)

## 📋 اسکریپت‌های توسعه

| دستور | توضیحات |
|-------|---------|
| `npm run dev` | اجرای سرور توسعه با HMR |
| `npm run build` | ساخت نسخه تولید |
| `npm run preview` | پیش‌نمایش نسخه ساخته شده |
| `npm run lint` | بررسی کد با ESLint |
| `npm run lint:fix` | رفع خودکار خطاهای ESLint |
| `npm run format` | فرمت‌دهی کد با Prettier |
| `npm run type-check` | بررسی خطاهای تایپ‌اسکریپت |

## 🔒 امنیت

- تمام کلیدهای API در متغیرهای محیطی (`VITE_*`) ذخیره می‌شوند.
- قوانین امنیتی Firebase (Security Rules) دسترسی‌ها را در سطح سرور کنترل می‌کنند.
- اعتبارسنجی داده‌ها در هر دو سمت کلاینت (Zod) و سرور انجام می‌شود.

## 🤝 مشارکت

1. Fork کردن مخزن
2. ایجاد شاخه جدید (`git checkout -b feature/amazing-feature`)
3. Commit تغییرات (`git commit -m 'feat: add amazing feature'`)
4. Push به شاخه (`git push origin feature/amazing-feature`)
5. ایجاد Pull Request

## 📄 مجوز

این پروژه تحت مجوز MIT منتشر شده است. جزئیات بیشتر در فایل [LICENSE](LICENSE) موجود است.

---

**توسعه‌دهنده**: محمدحسین علیخانی  
**نسخه**: 2.0.0  
**آخرین به‌روزرسانی**: سپتامبر ۲۰۲۶