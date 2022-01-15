# ADR 003: مهاجرت به Firebase Modular SDK (v9+)

**تاریخ**: ۲۰۲۶-۰۹-۰۴  
**وضعیت**: Accepted  
**نویسنده**: محمدحسین علیخانی

## زمینه (Context)
پروژه قبلی از Firebase v8 (Namespaced API) استفاده می‌کرد. این نسخه قدیمی است، حجم bundle بالایی دارد، و با Tree-shaking مدرن سازگار نیست.

## تصمیم (Decision)
ما به **Firebase v9+ Modular SDK** مهاجرت می‌کنیم.

## دلایل (Rationale)
1. **Tree-shaking**: فقط کدهایی که واقعاً استفاده می‌شوند در bundle نهایی قرار می‌گیرند. این می‌تواند حجم Firebase را تا ۸۰٪ کاهش دهد.
2. **TypeScript Support**: Modular SDK تایپ‌های بهتری دارد و با TypeScript یکپارچه‌تر است.
3. **Future-proof**: این نسخه، نسخه استاندارد و پشتیبانی‌شده توسط Google است.

## پیامدها (Consequences)
- **مثبت**: کاهش چشمگیر حجم bundle، کد ماژولارتر و قابل تست‌تر.
- **منفی**: نیاز به بازنویسی تمام فراخوانی‌های Firebase (که در فاز Migration انجام می‌شود).