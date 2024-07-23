<div align="center">

# 🚀 NexChat

### پیام‌رسان مدرن، سریع و هوشمند

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-10.0-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

[گزارش مشکل](https://github.com/mhalikhani/nexchat/issues) · [پیشنهاد ویژگی](https://github.com/mhalikhani/nexchat/issues)

</div>

---

<img src="./public/NexChat Preview.png" style="border-radius: 10px; box-shadow: 0 16px 48px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.04); max-width: 100%; height: auto; display: block; border: 1px solid rgba(255,255,255,0.3); transition: all 0.3s ease; filter: brightness(1.02);" onmouseover="this.style.transform='scale(1.01)'" onmouseout="this.style.transform='scale(1)'">

## 📖 درباره پروژه

وقتی شروع به ساخت NexChat کردم، هدفم فقط ساخت یه چت اپلیکیشن ساده نبود. می‌خواستم نشون بدم که چطور می‌شه یه اپلیکیشن real-time رو با **بهترین شیوه‌های مهندسی نرم‌افزار** ساخت - از معماری تمیز و تست‌های جامع گرفته تا پرفورمنس بالا و تجربه کاربری روان.

NexChat یه پیام‌رسان full-stack هست که با **React 18**، **TypeScript** و **Firebase** ساخته شده و از معماری **Feature-Sliced Design** استفاده می‌کنه. این پروژه نتیجه ساعت‌ها تحقیق، کدنویسی و تست هست و آماده‌ست تا به‌عنوان یه نمونه واقعی از توانایی‌های فنی من در پورتفولیوم قرار بگیره.

## ✨ ویژگی‌های کلیدی

### 💬 پیام‌رسانی Real-time
- ارسال و دریافت پیام متنی با پشتیبانی از **Markdown** و **Line Breaks**
- نمایش وضعیت پیام (ارسال شد، دریافت شد، خوانده شد) با آیکون‌های بصری
- تایپ به صورت زنده و نمایش "در حال نوشتن..." برای کاربران دیگه

### 🖼️ اشتراک‌گذاری مدیا
- آپلود تصاویر با فرمت‌های JPEG، PNG و WebP
- **فشرده‌سازی خودکار** تصاویر قبل از ارسال برای کاهش مصرف پهنای باند
- پیش‌نمایش تصویر قبل از ارسال با امکان لغو

### 🎤 ضبط پیام صوتی
- ضبط صدا مستقیماً از مرورگر با **MediaRecorder API**
- نمایش تایمر زنده در حین ضبط
- **لغو ضبط** در هر لحظه یا ارسال پیام صوتی
- پخش‌کننده صوتی سفارشی با کنترل‌های Play/Pause و Slider

### 🔐 احراز هویت امن
- ورود با **Google OAuth** از طریق Firebase Authentication
- مدیریت Session با **Refresh Token** برای امنیت بالا
- محافظت از Routeها با **Protected Routes**

### 🎨 تجربه کاربری فوق‌العاده
- طراحی **Responsive** برای موبایل، تبلت و دسکتاپ
- پشتیبانی کامل از **Accessibility** (ARIA labels، Keyboard navigation)
- **Lazy Loading** برای تصاویر و کامپوننت‌های سنگین
- انیمیشن‌های روان با **Framer Motion**

### ⚡ پرفورمنس بهینه
- **Code Splitting** با React.lazy و Suspense
- **Memoization** کامپوننت‌ها برای جلوگیری از re-renderهای غیرضروری
- **Debounce** برای جستجو و عملیات‌های پرتکرار
- بهینه‌سازی اندازه تصاویر قبل از آپلود

## 🛠️ پشته فناوری

| دسته‌بندی | تکنولوژی | توضیح |
|-----------|---------|-------|
| **Frontend** | React 18.3 | کتابخانه اصلی UI با Hooks و Context API |
| **Language** | TypeScript 5.3 | تایپ‌اسکریپت برای ایمنی کد و DX بهتر |
| **Build Tool** | Vite 5.0 | بیلد سریع و بهینه با HMR آنی |
| **Backend** | Firebase 10.0 | احراز هویت، دیتابیس Realtime و Storage |
| **State (Client)** | Zustand 4.4 | مدیریت State سبک و سریع برای UI |
| **State (Server)** | TanStack Query 5.0 | کش‌گذاری و مدیریت داده‌های سرور |
| **Routing** | React Router 6.20 | مسیریابی SPA با Protected Routes |
| **Styling** | MUI 5.14 | کامپوننت‌های Material Design آماده |
| **Forms** | React Hook Form 7.48 | فرم‌های بهینه با Validation |
| **Validation** | Zod 3.22 | اعتبارسنجی Schema-based |
| **Testing** | Vitest + RTL | تست واحد و Integration با Coverage بالا |
| **Code Quality** | ESLint + Prettier | لینتر و فرمتر کد با Husky |
| **Animation** | Framer Motion 10.16 | انیمیشن‌های روان و declarative |
| **Error Tracking** | Sentry 7.80 | مانیتورینگ خطا در Production |

## 📁 ساختار پروژه

این پروژه از معماری **Feature-Sliced Design (FSD)** استفاده می‌کنه:

```
src/
├── app/                    # تنظیمات کلی اپلیکیشن (Providers, Router)
├── processes/              # فرآیندهای پیچیده business logic
├── pages/                  # صفحات اصلی اپلیکیشن
├── widgets/                # کامپوننت‌های ترکیبی مستقل
├── features/               # ویژگی‌های اصلی اپلیکیشن
│   ├── auth/              # احراز هویت (Login, Signup, Google OAuth)
│   ├── chat/              # چت (Messages, Input, Media)
│   └── user/              # پروفایل کاربر
├── entities/              # موجودیت‌های domain (User, Message, Room)
├── shared/                # کدهای مشترک و reusable
│   ├── api/               # تنظیمات Firebase و API
│   ├── ui/                # کامپوننت‌های UI مشترک
│   ├── lib/               # utility functions و helpers
│   └── config/            # تنظیمات environment
└── lib/                   # کتابخانه‌های خارجی و integrations
```

## 🚀 شروع سریع

### پیش‌نیازها
- Node.js نسخه 18 یا بالاتر
- npm یا yarn
- اکانت Firebase (برای تنظیمات Backend)

### نصب و راه‌اندازی

1️⃣ **کلون کردن ریپازیتوری**
```bash
git clone https://github.com/mhalikhani/nexchat.git
cd nexchat
```

2️⃣ **نصب وابستگی‌ها**
```bash
npm install
```

3️⃣ **تنظیم متغیرهای محیطی**
فایل `.env.example` رو به `.env` تغییر بدید و مقادیر Firebase خودتون رو وارد کنید:
```bash
cp .env.example .env
```

4️⃣ **اجرای پروژه در حالت توسعه**
```bash
npm run dev
```
اپلیکیشن روی `http://localhost:5173` در دسترس خواهد بود.

5️⃣ **بیلد برای Production**
```bash
npm run build
npm run preview  # پیش‌نمایش بیلد production
```

## 🧪 تست و کیفیت کد

این پروژه با **فرهنگ تست‌نویسی** ساخته شده و از ابزارهای مدرن برای تضمین کیفیت استفاده می‌کنه:

```bash
# اجرای تمام تست‌ها
npm run test

# اجرای تست‌ها با Coverage Report
npm run test:coverage

# بررسی type safety
npm run type-check

# بررسی lint و format
npm run lint
npm run lint:fix
```

### ابزارهای کیفیت کد
- ✅ **Vitest**: تست واحد سریع با سازگاری کامل Jest
- ✅ **React Testing Library**: تست کامپوننت‌ها از دید کاربر
- ✅ **ESLint + Prettier**: کد تمیز و یکدست
- ✅ **Husky + lint-staged**: بررسی خودکار قبل از هر commit
- ✅ **TypeScript strict mode**: ایمنی تایپ در بالاترین سطح

## 🤝 مشارکت

خوشحال می‌شم اگر دوست دارید در توسعه NexChat مشارکت کنید! لطفاً مراحل زیر رو دنبال کنید:

1. Fork کردن ریپازیتوری
2. ساخت Branch جدید (`git checkout -b feature/AmazingFeature`)
3. Commit کردن تغییرات (`git commit -m 'Add some AmazingFeature'`)
4. Push به Branch (`git push origin feature/AmazingFeature`)
5. باز کردن Pull Request

## 📄 لایسنس

این پروژه تحت لایسنس MIT منتشر شده - برای جزئیات بیشتر فایل [LICENSE](LICENSE) رو مشاهده کنید.

## 👨‍💻 توسعه‌دهنده

<div align="center">

### **محمدحسین علیخانی**

Full-Stack Developer | React & TypeScript Enthusiast

[![GitHub](https://img.shields.io/badge/GitHub-mhalikhani-181717?style=for-the-badge&logo=github)](https://github.com/mhalikhani)
[![Email](https://img.shields.io/badge/Email-Contact%20Me-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:mohammad.hosein.alikhani08@gmail.com)

</div>

---

<div align="center">

### ⭐ اگر این پروژه براتون مفید بود، یه Star بدید! ⭐

ساخته شده با ❤️ و ساعت‌ها کدنویسی

</div>
