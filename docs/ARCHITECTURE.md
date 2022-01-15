# 🏗️ سند معماری سیستم (System Architecture Document)

## ۱. معرفی

این سند معماری فنی پروژه **NexChat** را توصیف می‌کند. هدف این سند ارائه یک دیدگاه جامع از ساختار، تصمیمات فنی، و الگوهای طراحی استفاده شده در پروژه است تا تیم توسعه بتواند با درک کامل از سیستم، به توسعه و نگهداری آن بپردازد.

## ۲. نمای کلی معماری

NexChat از معماری **Feature-Sliced Design (FSD)** الهام گرفته است که بر جداسازی دغدغه‌ها (Separation of Concerns) و ماژولار بودن تأکید دارد. این معماری به سه لایه اصلی تقسیم می‌شود:

### ۲.۱ لایه‌های معماری

```
┌─────────────────────────────────────────────────────────┐
│                     App Layer (app/)                    │
│  (Routing, Global Providers, Error Boundaries)          │
├─────────────────────────────────────────────────────────┤
│                   Features Layer (features/)            │
│  (Business Logic, Domain Models, Feature-specific UI)   │
├─────────────────────────────────────────────────────────┤
│                   Shared Layer (shared/)                │
│  (Reusable Components, Hooks, Utils, Types, Constants)  │
└─────────────────────────────────────────────────────────┘
```

### ۲.۲ قوانین وابستگی (Dependency Rules)

1. **لایه App** می‌تواند به **Features** و **Shared** وابسته باشد.
2. **لایه Features** می‌تواند فقط به **Shared** وابسته باشد (نه به سایر Features).
3. **لایه Shared** نباید به هیچ لایه دیگری وابسته باشد (Independent).

## ۳. پشته فناوری (Tech Stack)

### ۳.۱ فرانت‌اند
| کامپوننت | تکنولوژی | دلیل انتخاب |
|----------|----------|-------------|
| **Build Tool** | Vite 5.x | سرعت توسعه بالا، HMR سریع، پشتیبانی عالی از TypeScript |
| **Framework** | React 18.x | Concurrent Features، Suspense، و اکوسیستم گسترده |
| **Language** | TypeScript 5.x | Type Safety، Refactoring امن، و مستندسازی خودکار |
| **State (Client)** | Zustand | سبک، بدون Boilerplate، و پشتیبانی از DevTools |
| **State (Server)** | TanStack Query | Caching، Deduplication، Optimistic Updates |
| **UI Library** | MUI v6 | دسترسی‌پذیری بالا، کامپوننت‌های آماده، تم‌پذیری |
| **Forms** | React Hook Form + Zod | پرفورمنس بالا (Uncontrolled)، Validation قوی |

### ۳.۲ بک‌اند و زیرساخت
| کامپوننت | تکنولوژی | دلیل انتخاب |
|----------|----------|-------------|
| **Backend** | Firebase v9+ (Modular) | Real-time، Authentication، Storage، Tree-shaking |
| **Hosting** | Firebase Hosting | CDN جهانی، HTTPS خودکار، Deploy سریع |
| **CI/CD** | GitHub Actions | یکپارچگی با GitHub، اتوماسیون تست و deploy |

## ۴. الگوهای طراحی (Design Patterns)

### ۴.۱ Container/Presentational Pattern
- **Presentational Components**: فقط مسئول رندر UI هستند. هیچ منطق business یا fetch داده‌ای ندارند.
- **Container Components/Hooks**: مسئول fetch داده، مدیریت state، و پاس دادن props به کامپوننت‌های Presentational.

### ۴.۲ Compound Components
برای کامپوننت‌های پیچیده مانند `Modal` یا `Select` از الگوی Compound Components استفاده می‌شود تا انعطاف‌پذیری بیشتری در API ارائه دهد.

### ۴.۳ Optimistic Updates
برای بهبود UX، تغییرات state بلافاصله در UI اعمال می‌شوند و در پس‌زمینه با سرور همگام‌سازی می‌شوند. در صورت خطا، state به حالت قبلی بازگردانده می‌شود (Rollback).

## ۵. مدیریت State

### ۵.۱ Server State (TanStack Query)
- داده‌هایی که از Firebase دریافت می‌شوند.
- مدیریت Caching، Stale Time، و Retries.
- مثال: لیست اتاق‌ها، پیام‌های یک اتاق، پروفایل کاربر.

### ۵.۲ Client State (Zustand)
- داده‌های محلی که نیازی به persist در سرور ندارند.
- مثال: وضعیت باز/بسته بودن Sidebar، ID اتاق فعال، تنظیمات تم.

## ۶. مدیریت خطا (Error Handling)

### ۶.۱ Error Boundary
یک `ErrorBoundary` در سطح روت اپلیکیشن قرار دارد تا از کرش کامل برنامه جلوگیری کند و یک UI جایگزین (Fallback) نمایش دهد.

### ۶.۲ Custom Error Classes
خطاهای سفارشی مانند `AppError` برای یکپارچه‌سازی مدیریت خطا در سراسر برنامه:

```typescript
class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
  }
}
```

## ۷. امنیت (Security)

### ۷.۱ Firebase Security Rules
- فقط کاربران احراز هویت شده می‌توانند به داده‌ها دسترسی داشته باشند.
- کاربران فقط می‌توانند پیام‌های خود را حذف یا ویرایش کنند.
- Validation در سطح Rules برای جلوگیری از injection.

### ۷.۲ Environment Variables
- تمام API Keyها و Secrets در `.env.local` ذخیره می‌شوند و هرگز در مخزن commit نمی‌شوند.
- استفاده از `VITE_` prefix برای متغیرهایی که در کلاینت نیاز هستند.

## ۸. پرفورمنس (Performance)

### ۸.۱ Code Splitting
- Route-based splitting با `React.lazy` و `Suspense`.
- Component-based splitting برای کامپوننت‌های سنگین (مانند Image Viewer یا Audio Recorder).

### ۸.۲ Memoization
- استفاده از `React.memo` برای کامپوننت‌هایی که props آن‌ها به ندرت تغییر می‌کند.
- استفاده از `useMemo` و `useCallback` برای جلوگیری از re-renderهای غیرضروری.

### ۸.۳ Virtualization
- استفاده از `@tanstack/react-virtual` برای رندر لیست‌های بزرگ پیام‌ها (فقط آیتم‌های قابل مشاهده در viewport رندر می‌شوند).

## ۹. تست (Testing Strategy)

| نوع تست | ابزار | پوشش هدف |
|---------|-------|----------|
| **Unit** | Vitest + RTL | ۸۰٪+ برای Hooks و Utils |
| **Integration** | Vitest + RTL | ۶۰٪+ برای کامپوننت‌های کلیدی |
| **E2E** | Playwright | Critical Paths (Login, Send Message) |

## ۱۰. استانداردهای کدنویسی

- **ESLint**: با پیکربندی سخت‌گیرانه (`no-console`, `no-unused-vars`, `react-hooks/exhaustive-deps`).
- **Prettier**: برای فرمت‌دهی خودکار کد.
- **Husky + lint-staged**: اجرای خودکار Lint و Format قبل از هر commit.
- **Conventional Commits**: برای تاریخچه commit خوانا و تولید خودکار Changelog.

---

**تاریخ بازنگری**: ۲۰۲۶-۰۹-۰۴  
**نویسنده**: محمدحسین علیخانی  
**وضعیت**: Approved