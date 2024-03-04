# سند معماری سیستم (System Architecture Document)

## معرفی

این سند معماری فنی پروژه **NexChat** را توصیف می‌کند. هدف این سند ارائه یک دیدگاه جامع از ساختار، تصمیمات فنی، و الگوهای طراحی استفاده شده در پروژه است.

## نمای کلی معماری

NexChat از معماری **Feature-Sliced Design (FSD)** الهام گرفته است که بر جداسازی دغدغه‌ها و ماژولار بودن تأکید دارد.

### لایه‌های معماری

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

### قوانین وابستگی (Dependency Rules)

1. **لایه App** می‌تواند به **Features** و **Shared** وابسته باشد.
2. **لایه Features** می‌تواند فقط به **Shared** وابسته باشد (نه به سایر Features).
3. **لایه Shared** نباید به هیچ لایه دیگری وابسته باشد (Independent).

## پشته فناوری (Tech Stack)

### فرانت‌اند

| کامپوننت | تکنولوژی | دلیل انتخاب |
|----------|----------|-------------|
| **Build Tool** | Vite 5.x | سرعت توسعه بالا، HMR سریع |
| **Framework** | React 18.x | Concurrent Features، Suspense |
| **Language** | TypeScript 5.x | Type Safety، Refactoring امن |
| **State (Client)** | Zustand | سبک، بدون Boilerplate |
| **State (Server)** | TanStack Query | Caching، Optimistic Updates |
| **UI Library** | MUI v6 | دسترسی‌پذیری بالا، تم‌پذیری |
| **Forms** | React Hook Form + Zod | پرفورمنس بالا، Validation قوی |

### بک‌اند و زیرساخت

| کامپوننت | تکنولوژی | دلیل انتخاب |
|----------|----------|-------------|
| **Backend** | Firebase v9+ (Modular) | Real-time، Tree-shaking |
| **Hosting** | Firebase Hosting | CDN جهانی، Deploy سریع |
| **CI/CD** | GitHub Actions | یکپارچگی با GitHub |

## الگوهای طراحی (Design Patterns)

### Container/Presentational Pattern

- **Presentational Components**: فقط مسئول رندر UI هستند.
- **Container Components/Hooks**: مسئول fetch داده و مدیریت state.

### Compound Components

برای کامپوننت‌های پیچیده مانند `Modal` یا `Select` از الگوی Compound Components استفاده می‌شود.

### Optimistic Updates

برای بهبود UX، تغییرات state بلافاصله در UI اعمال می‌شوند و در پس‌زمینه با سرور همگام‌سازی می‌شوند.

## مدیریت State

### Server State (TanStack Query)

- داده‌هایی که از Firebase دریافت می‌شوند.
- مدیریت Caching، Stale Time، و Retries.

### Client State (Zustand)

- داده‌های محلی که نیازی به persist در سرور ندارند.
- مثال: وضعیت باز/بسته بودن Sidebar، ID اتاق فعال.

## مدیریت خطا (Error Handling)

### Error Boundary

یک `ErrorBoundary` در سطح روت اپلیکیشن قرار دارد تا از کرش کامل برنامه جلوگیری کند.

### Custom Error Classes

خطاهای سفارشی مانند `AppError` برای یکپارچه‌سازی مدیریت خطا در سراسر برنامه.

## امنیت (Security)

### Firebase Security Rules

- فقط کاربران احراز هویت شده می‌توانند به داده‌ها دسترسی داشته باشند.
- کاربران فقط می‌توانند پیام‌های خود را حذف یا ویرایش کنند.

### Environment Variables

- تمام API Keyها و Secrets در `.env.local` ذخیره می‌شوند.
- استفاده از `VITE_` prefix برای متغیرهای کلاینت.

## پرفورمنس (Performance)

### Code Splitting

- Route-based splitting با `React.lazy` و `Suspense`.
- Component-based splitting برای کامپوننت‌های سنگین.

### Memoization

- استفاده از `React.memo` برای کامپوننت‌هایی که props آن‌ها به ندرت تغییر می‌کند.
- استفاده از `useMemo` و `useCallback` برای جلوگیری از re-renderهای غیرضروری.

### Virtualization

- استفاده از `@tanstack/react-virtual` برای رندر لیست‌های بزرگ پیام‌ها.

## تست (Testing Strategy)

| نوع تست | ابزار | پوشش هدف |
|---------|-------|----------|
| **Unit** | Vitest + RTL | ۸۰٪+ برای Hooks و Utils |
| **Integration** | Vitest + RTL | ۶۰٪+ برای کامپوننت‌های کلیدی |
| **E2E** | Playwright | Critical Paths |

## استانداردهای کدنویسی

- **ESLint**: با پیکربندی سخت‌گیرانه.
- **Prettier**: برای فرمت‌دهی خودکار کد.
- **Husky + lint-staged**: اجرای خودکار Lint و Format قبل از هر commit.
- **Conventional Commits**: برای تاریخچه commit خوانا.

---

**تاریخ بازنگری**: ۲۰۲۶-۰۹-۰۵
**نویسنده**: محمدحسین علیخانی
**وضعیت**: Approved
