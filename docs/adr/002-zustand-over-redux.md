# ADR 002: استفاده از Zustand به جای Redux

**تاریخ**: ۲۰۲۶-۰۹-۰۴  
**وضعیت**: Accepted  
**نویسنده**: محمدحسین علیخانی

## زمینه (Context)
در پروژه‌های React، مدیریت state پیچیده می‌تواند چالش‌برانگیز باشد. Redux استاندارد صنعتی است، اما Boilerplate زیادی دارد و برای stateهای ساده overkill است.

## تصمیم (Decision)
ما از **Zustand** برای مدیریت Client State استفاده خواهیم کرد و **TanStack Query** را برای Server State به کار می‌بریم.

## دلایل (Rationale)
1. **کمترین Boilerplate**: Zustand نیاز به Provider در روت اپلیکیشن، Actions، یا Reducers پیچیده ندارد.
2. **Performance**: Zustand از selector-based updates استفاده می‌کند که فقط کامپوننت‌هایی که به یک بخش خاص از state وابسته‌اند re-render می‌شوند.
3. **DevTools**: پشتیبانی بومی از Redux DevTools.
4. **تفکیک State**: با استفاده از TanStack Query برای داده‌های سرور، Zustand فقط برای stateهای محلی (مانند UI state) استفاده می‌شود که حجم آن را بسیار کم نگه می‌دارد.

## پیامدها (Consequences)
- **مثبت**: کد تمیزتر، توسعه سریع‌تر، و پرفورمنس بهتر.
- **منفی**: تیم باید با الگوی Hook-based Zustand آشنا شود (که منحنی یادگیری کوتاهی دارد).