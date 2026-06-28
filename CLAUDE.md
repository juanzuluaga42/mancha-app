# MANCHA — contexto para Claude Code

> **Lee `HANDOFF.md` (en la raíz) antes de empezar cualquier tarea.** Contiene el mapa
> completo del proyecto, qué archivo tocar para cambiar cada cosa, recetas de cambios
> comunes, esquema de DB y los pendientes (Frente 2 zona horaria, Frente 3 moneda). Este
> archivo es solo el resumen rápido; `HANDOFF.md` es la fuente de verdad.

## Qué es
Galería de arte emergente online por temporadas. En producción: **manchagallery.com**.
Next.js 16 (App Router) + Supabase + Stripe + Vercel. **Sin TypeScript, sin Tailwind**
(CSS plano en `app/globals.css`). Internacionalizado **ES/EN** con `next-intl`.

## Estructura mínima
- Todas las páginas públicas viven en `app/[locale]/`. **NO existe `app/layout.js`** (el raíz es `app/[locale]/layout.js`).
- `api/` y `auth/` están FUERA de `[locale]`.
- Textos de UI: `messages/es.json` + `messages/en.json` (mismos keys).
- Datos grandes bilingües: `lib/atlas.js`, `lib/news.js` (helper `L(es,en)`).

## Reglas que NO se rompen
1. **Todo texto nuevo va a `es.json` Y `en.json`** (mismo key). Nunca hardcodear strings en JSX.
2. **Navegación**: importa `Link/redirect/useRouter/usePathname` de `@/i18n/navigation`, nunca de `next/*`.
3. **No tocar Stripe ni la moneda de cobro (USD).** El Frente 3 (moneda) es solo presentación.
4. **El admin (`app/[locale]/admin`) queda solo en español.**
5. **Tono**: español neutro con "tú" (JAMÁS voseo); inglés sobrio/editorial.
6. **Fechas/números**: `locale==='en'?'en-US':'es-AR'` con `getLocale()`.
7. **Build verde antes de commitear**: `npm run build`, luego `git push origin main` (Vercel despliega solo desde `main`).

## Calendario vigente (no cambiar a julio)
Convocatoria **1–31 ago 2026**; Temporada 01 abre **1 sep 2026**. Fase actual: `pre-launch`.

## Pendientes
- **Frente 2 — zona horaria** (no empezado): UTC + `<LocalDate>`. Empezar por aquí cuando se pida.
- **Frente 3 — moneda visual** (no empezado): `lib/rates.js` + `<Price>`, sin tocar el cobro.

Detalle de todo: **`HANDOFF.md`**.
