# shadcn / TypeScript Kurulum Notları

Proje artık shadcn uyumlu yapıda çalışıyor.

## Yapı

```
src/
├── components/
│   └── ui/                    ← shadcn bileşenleri (zorunlu klasör)
│       ├── animated-glassy-pricing.tsx
│       └── multi-type-ripple-buttons.tsx
├── lib/
│   └── utils.ts               ← cn() helper
└── pages/
```

`components.json` — shadcn CLI alias ayarları (`@/components/ui`)

## Neden `/components/ui`?

shadcn CLI tüm UI primitives'i bu klasöre yazar. `@/components/ui/button` gibi import'lar standarttır; karışıklığı önler ve yeni bileşen eklerken CLI ile uyum sağlar.

## Kurulu bağımlılıklar

- TypeScript + `@types/react`
- `tailwindcss` v4 + `tw-animate-css`
- `clsx` + `tailwind-merge` (`cn` utility)
- Path alias: `@/*` → `src/*` (`vite.config.ts` + `tsconfig.app.json`)

## Yeni shadcn bileşeni eklemek

```bash
npx shadcn@latest init   # ilk kez (zaten yapılandırıldı)
npx shadcn@latest add button
```

## Fiyatlandırma sayfası

`/fiyatlandirma` — `ModernPricingPage` (`showAnimatedBackground={false}`)
