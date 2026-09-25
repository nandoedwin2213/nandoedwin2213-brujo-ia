# Brujo IA

Plataforma de IA sin restricciones ni censura: generación de texto e imágenes con [Venice.ai](https://venice.ai), pagos locales con [PayPhone](https://www.payphone.app) y autenticación con [Clerk](https://clerk.com).

Basado en [ixartz/SaaS-Boilerplate](https://github.com/ixartz/SaaS-Boilerplate) (Next.js 16, React 19, Tailwind CSS 4, Shadcn UI, Drizzle ORM, next-intl).

## Funcionalidades

- Landing en español e inglés (`/`, `/pricing`).
- Registro / login con Clerk; dashboard protegido en `/dashboard`.
- Plan PRO ($19 / 30 días) pagado con PayPhone:
  - `POST /api/payphone` crea el pago (`/api/button/Prepare`) y devuelve la URL de la cajita de pagos.
  - `GET /api/payphone/response` es la URL de retorno: confirma server-side (`/api/button/V2/Confirm`), guarda el resultado y activa PRO.
- Generador Venice.ai (texto `llama-3.3-70b`, imagen `lustify-sdxl`) en el dashboard, solo para usuarios PRO: `POST /api/generate`.
- Historial de pagos en `/dashboard/billing`.

## Puesta en marcha

```bash
npm install
cp .env .env.local   # y completa los valores reales
npm run dev          # levanta PGlite + Next.js en http://localhost:3000
```

Variables necesarias (`.env.local`):

| Variable | Descripción |
| --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` | Claves de Clerk |
| `DATABASE_URL` | PostgreSQL (en desarrollo se usa PGlite automáticamente) |
| `PAYPHONE_AUTH_TOKEN` | Token de la app en PayPhone Developer |
| `PAYPHONE_STORE_ID` | Opcional; vacío usa la tienda por defecto |
| `VENICE_API_KEY` | API key de Venice.ai |
| `VENICE_MODEL` / `VENICE_IMAGE_MODEL` | Modelos (por defecto `llama-3.3-70b` / `lustify-sdxl`) |
| `NEXT_PUBLIC_APP_URL` | URL pública, usada para las URLs de retorno de PayPhone |

Registra `NEXT_PUBLIC_APP_URL` como dominio autorizado en tu aplicación de PayPhone.

## Comandos

```bash
npm run lint          # ESLint
npm run check:types   # TypeScript
npm run check:deps    # Knip
npm run check:i18n    # Coherencia de traducciones
npm test              # Vitest
npm run build         # Migraciones + build de producción
npm run db:generate   # Genera migraciones tras editar src/models/Schema.ts
```

## Despliegue

Compatible con Vercel: define las variables anteriores, apunta `DATABASE_URL` a un PostgreSQL gestionado (Neon, Supabase…) y el script `build` aplica las migraciones automáticamente.
