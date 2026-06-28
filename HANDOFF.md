# MANCHA — Handoff de proyecto

> Documento de continuidad para retomar el desarrollo sin perder contexto.
> Última actualización: 2026-06 (sesión de internacionalización).

---

# Resumen del proyecto

**Objetivo.** MANCHA es una **galería de arte emergente online por temporadas**. Modelo: pocos artistas seleccionados a mano por temporada, **3 piezas por artista**, subasta en vivo durante ~3 meses, y cuando la temporada cierra, lo no vendido "se fue". Posicionamiento editorial/institucional (estética A24 / Apple / MUBI / Sotheby's / NYT Magazine). El artista se lleva el **75%** de cada venta.

Hay **dos públicos** con portadas separadas:
- **Coleccionistas** → `/para-coleccionistas`
- **Artistas** → `/para-artistas`
La raíz `/` es un **selector (picker)** que pregunta si eres coleccionista o artista y guarda la elección en `localStorage` (`mancha_role` = `'coleccionistas'` | `'artistas'`).

**Estado actual.** En producción en `https://manchagallery.com` (dominio nuevo; antes `mancha-app.vercel.app`). Fase actual = **pre-launch** (`NEXT_PUBLIC_FASE`). Calendario: **convocatoria 1–31 ago 2026**, **Temporada 01 abre 1 sep 2026**. Funciona: auth (email+contraseña y Google OAuth), registro de artistas con subida de obras, pujas, pagos Stripe, blog/atlas, panel admin. **Internacionalización ES/EN COMPLETA** en todo lo público (ver más abajo). Pendientes grandes: **Frente 2 (zona horaria)** y **Frente 3 (moneda visual)** — NO empezados.

**Arquitectura general.** Next.js 16 App Router (server components por defecto), Supabase (Postgres + Auth + Storage) con RLS, Stripe para pagos, nodemailer+Gmail para correos, desplegado en Vercel. i18n con `next-intl` (rutas `app/[locale]`).

---

# Stack tecnológico

- **Framework:** Next.js 16.2.9 (App Router, Turbopack), React 19.2.7.
- **i18n:** `next-intl` ^4.13 (rutas con prefijo `/en`, español por defecto sin prefijo).
- **DB/Auth/Storage:** Supabase (`@supabase/ssr` ^0.12, `@supabase/supabase-js` ^2.108). Proyecto Supabase: **`ycvvpttgmrsukaognwfr`** (nombre "MANCHA", región us-east-1).
- **Pagos:** Stripe ^22.2 (Checkout, moneda **USD**).
- **Email:** nodemailer ^9 vía Gmail.
- **Analytics:** `@vercel/analytics`.
- **Deploy:** Vercel, team `manchagallery`, project id `prj_V8cppDD5ccFjSOYDsC4RkipzGrvV`. Deploy automático desde `main`.
- **Sin TypeScript** (todo `.js`/`.mjs`). **Sin Tailwind** — CSS plano en `app/globals.css` (~3400 líneas).
- **Lockfile** `package-lock.json` está commiteado; deps fijadas (no `latest`). `overrides.postcss ^8.5.10`.

### Variables de entorno necesarias (en Vercel)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (clave pública; el cliente SSR la usa)
- `SUPABASE_SERVICE_ROLE_KEY` (solo server: webhook Stripe + certificado)
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `GMAIL_USER`, `GMAIL_APP_PASSWORD`
- `NEXT_PUBLIC_SITE_URL` = `https://manchagallery.com`
- `NEXT_PUBLIC_FASE` = `pre-launch` | `convocatoria` | `temporada_activa` (default `pre-launch` en `lib/fase.js`)

---

# Estructura del proyecto

```
app/
  layout? -> NO existe app/layout.js (root). El layout raíz es app/[locale]/layout.js (tiene <html>).
  [locale]/                 ← TODAS las páginas públicas viven aquí (es/en)
    layout.js               ← <html lang>, fuentes, NextIntlClientProvider, PulseTicker, Analytics
    page.js                 ← Role picker (cliente)
    para-coleccionistas/    para-artistas/    sobre-mancha/    criterio/
    seleccionados/    obras/ (+ [id]/ + [id]/certificado route)    artistas/[id]/
    cuenta/ (+ actions.js)    login/ (+ actions.js)    registro/ (+ actions.js + revisa-tu-correo/)
    postular/ (redirige a /registro?role=artist)    manifiesto/    legal/    elegidos/
    notas/ (+ [slug]/)    temporadas/ (+ [id]/)    tips/ (redirect)    admin/ (SOLO ESPAÑOL)
    pago/exito/
  api/        ← NO localizado: pulse/, stripe-webhook/
  auth/       ← NO localizado: callback/ (OAuth), confirm/ (email)
  actions.js  ← server actions: toggleFavorite, placeBid (raíz, compartido)
  leads/actions.js  ← joinWaitlist (raíz)
  globals.css, sitemap.js, robots.js, opengraph-image.js, icon.js
components/   ← Nav, NavMenu, NavLogoLink, Footer, LocaleSwitch, RegistroForm, GoogleButton,
               PieceCard, ObrasCatalog, WaitlistForm, Toast, WelcomeModal, PulseTicker,
               SelloSeleccionado, RoleSwitch, SoloArtista, OcultarColeccionista, Splat,
               ScrollReveal, SubmitButton, CursorTrail, BlogImg
i18n/         ← routing.js (defineRouting), navigation.js (Link/redirect/useRouter/usePathname), request.js
messages/     ← es.json, en.json  (TODO el texto de UI)
lib/          ← fase.js, utils.js (cap, safePath, escapeHtml), email.js, stripe.js,
               news.js (getArticles/getArticleBySlug), atlas.js (getAtlas/wiki), og.js (fuentes OG)
utils/supabase/ ← client.js (browser), server.js (SSR cookies), admin.js (service-role)
middleware.js ← compone next-intl + refresco de sesión Supabase
```

**Flujo de la app.**
1. `/` (picker) → elige rol → `window.location.href = '/para-{role}'`.
2. Coleccionista: portada → catálogo `/obras` → ficha `/obras/[id]` → pujar (requiere login) → ganar → email con link de pago Stripe → `/pago/exito` → certificado.
3. Artista: portada → `/registro?role=artist` (crea cuenta con técnica/ciudad/bio en metadata) → confirma email (`/auth/confirm` crea la fila `artists` desde metadata) → `/cuenta` sube hasta 3 obras → admin revisa en `/admin` → Seleccionar/No seleccionar.
4. `Nav`/`Footer` se adaptan por **fase** (`lib/fase.js`) y por **lado** (localStorage `mancha_role`, leído en cliente).

---

# Funcionalidades terminadas

- **Auth**: registro email+contraseña, **Google OAuth** (`/auth/callback`), login, confirmación email (`/auth/confirm`), logout.
- **Flujo de artista unificado** (un solo momento de decisión): cuenta libre e inmediata; obras opcionales; subir obra NO requiere aprobación, solo activa revisión. Estados derivados: registrado-sin-obra / en-revisión (pending + 1 obra) / seleccionado (`approved`) / no-seleccionado (`rejected`). Recordatorio por email al confirmar sin obras.
- **Admin** (`/admin`, solo `mancha.gallery@gmail.com`): bandejas "En revisión" y "Registrados sin obra", aprobar/rechazar, marcar vendidas, reenviar recordatorio de pago. **Queda en español a propósito.**
- **Pujas** (`placeBid`): valida múltiplo de 5, > máximo actual y >= min_bid (validación reforzada en RLS de DB). Emails: "te superaron" y confirmación.
- **Pagos Stripe**: `lib/stripe.js` crea checkout en USD; webhook `/api/stripe-webhook` (firma verificada, usa service-role) marca `paid_at` y envía correos.
- **Certificado de colección**: `/obras/[id]/certificado` (imagen OG dinámica). Muestra solo **nombre de pila** del comprador (privacidad).
- **Blog/Editorial** (`/notas`) + Atlas del arte (20 artistas, cuadros caros, museos, premios, datos, timeline) + artículos `/notas/[slug]`.
- **Diseño editorial** aplicado a todo el sitio (dark `#0D0C0A`, cream `--paper`, bordes 2px, sin splats visibles).
- **OG images** rediseñadas con fuentes de marca (`lib/og.js` carga Unbounded/Newsreader de Google Fonts).
- **Seguridad** (auditoría aplicada): headers (X-Frame-Options, CSP frame-ancestors, etc.) en `next.config.mjs`; `images.remotePatterns` restringido; open-redirect bloqueado con `safePath`; HTML escapado en emails (`escapeHtml`); RLS endurecido; funciones SECURITY DEFINER con EXECUTE revocado; trigger `protect_profile_role`.
- **i18n ES/EN COMPLETO** en todo lo público (ver "Decisiones" e "Instrucciones").

---

# Funcionalidades en desarrollo / pendientes mayores

- **Frente 2 — Zona horaria (NO empezado).** Objetivo: cada visitante ve fechas y countdown en SU hora local; guardar todo en UTC, convertir solo al mostrar. Hoy hay fechas hardcodeadas con offset `-05:00` en `app/[locale]/para-artistas/page.js` (CONV_OPEN_DATE, CONV_CLOSE_DATE, LAUNCH_DATE) y `app/[locale]/para-coleccionistas/page.js` (LAUNCH_DATE). `components/Countdown.js` ya calcula con `getTime()` (absoluto, correcto). Fechas mostradas usan `toLocaleDateString` con locale por idioma pero **sin `timeZone`**. Plan propuesto (ya acordado con el usuario): `lib/dates.js` con constantes ISO-UTC, componente cliente `<LocalDate>` que formatea con `Intl.DateTimeFormat` en la zona del visitante.
- **Frente 3 — Moneda visual (NO empezado).** Objetivo: mostrar precios convertidos "≈ aprox." manteniendo **USD como cobro real (no tocar Stripe)**. Reglas: USD real siempre visible; etiqueta "≈ aprox." + nota "el cobro se realiza en USD"; selector manual de moneda recordado en cookie. Tasas: API gratuita cacheada 1×/día (recomendado `open.er-api.com` o `exchangerate.host`), nunca tasas hardcodeadas. Plan: `lib/rates.js` + route `app/api/rates/route.js` (revalidate 86400) + componente `<Price usd={...} />`. Precios hoy en `PieceCard`, `obras/[id]`, `seleccionados`, `cuenta`.

---

# Próximas tareas priorizadas

1. **Frente 2 (zona horaria)** — empezar aquí (es lo que el usuario dejó "pendiente" para continuar).
2. **Frente 3 (moneda visual)**.
3. (Opcional i18n) Traducir correos transaccionales del admin (aprobación/venta/recordatorio) al idioma del destinatario — requiere **guardar el idioma del usuario** (no se guarda hoy). Los emails de `app/actions.js`, `app/admin/actions.js`, `app/[locale]/registro|cuenta/actions.js`, `app/api/stripe-webhook/route.js`, `auth/confirm` siguen en español.
4. (Opcional) OG image dinámica por idioma.

---

# Decisiones técnicas importantes (y por qué)

- **i18n con `next-intl` + rutas `/en` (`localePrefix: 'as-needed'`).** El usuario eligió URL con prefijo (mejor SEO). Español = default sin prefijo → **las URLs en español quedaron idénticas a antes**, así no se rompen auth/pagos/links/redirects de Stripe ni OAuth. Inglés en `/en/...`.
- **Se movieron TODAS las páginas a `app/[locale]/`** y se **eliminó `app/layout.js`**; el layout raíz ahora es `app/[locale]/layout.js` (patrón oficial next-intl). `api/`, `auth/`, `sitemap.js`, `robots.js`, `opengraph-image.js`, `icon.js` quedan **fuera** de `[locale]`.
- **Middleware compuesto** (`middleware.js`): corre `next-intl` (detección idioma + cookie `NEXT_LOCALE` + prefijo) y luego refresca la sesión Supabase escribiendo cookies en la misma respuesta. Matcher excluye `api|auth|_next|_vercel|opengraph-image|icon|sitemap|robots|*.*`.
- **Navegación locale-aware**: usar SIEMPRE `import { Link, redirect, useRouter, usePathname } from '@/i18n/navigation'` (no `next/link`/`next/navigation`) en páginas/componentes para conservar el idioma.
- **Datos de contenido bilingües por función**: `lib/atlas.js` exporta `getAtlas(locale)` y `lib/news.js` `getArticles(locale)`/`getArticleBySlug(slug, locale)`, usando un helper interno `L(es, en)`. NO son mensajes de next-intl (son datos grandes).
- **Server actions traducen** sus mensajes con `getTranslations('actions')` (next-intl lee el locale de la cookie incluso en actions). Los mensajes viajan por `?error=`/`?success=` y los muestra `Toast`.
- **Moneda base real = USD** (confirmado en `lib/stripe.js` `currency:'usd'`). Frente 3 es solo visual.
- **Confirmación de email se mantiene (decisión "1b")**: el registro guarda datos de artista en `auth metadata`; al confirmar, `app/auth/confirm/route.js` crea la fila `artists`. (No se desactivó la verificación.)
- **Admin sin traducir** (interno, solo founder).
- **Seguridad**: certificado expone solo nombre de pila; `safePath()` evita open-redirects; `escapeHtml()` en emails; CSP mínima que no rompe (frame-ancestors 'none').
- **Pantalla de consentimiento Google** muestra el dominio de Supabase (`*.supabase.co`); cambiarlo requiere Custom Domain de Supabase (de pago) — se dejó así (cosmético).

---

# Convenciones del proyecto

- **Naming**: componentes `PascalCase.js`; helpers `camelCase`; rutas en español (`/sobre-mancha`, `/seleccionados`, `/obras`). Claves i18n en inglés camelCase agrupadas por namespace.
- **i18n namespaces** (en `messages/es.json` y `en.json`): `meta, common, waitlist, actions, nav, footer, auth, picker, collectors, artists, about, criterioPage, selected, catalog, piece, account, elegidos, misc, manifestoPage, legal, season, artistPage, notasPage`. Plurales con ICU (`{count, plural, one {...} other {...}}`). Fechas/números: `toLocaleString(locale==='en'?'en-US':'es-AR')`.
- **Diseño/Branding**: dark `#0D0C0A`, papel/cream `var(--paper)` `#FAF3E6`, tinta `--ink` `#16110D`, acentos `--red` `#E5402B`, `--yellow` `#F2B705`, `--lilac`. Tipografías: **Unbounded** 800 (display), **Newsreader** italic (editorial), **Space Mono** (labels/mono). `border-radius: 2px`. Sin splats visibles (`.splat{display:none}` global) pero los componentes `<Splat/>` siguen en el JSX (no quitar imports). Logo: `MANCHA` + punto rojo.
- **Tono**: español **neutro "tú" (NUNCA voseo)**; inglés sobrio y editorial, no informal. (Ojo: se corrigieron voseos como "Sumate"→"Súmate", "Probá"→"Prueba".)
- **Estilo de código**: server components async + `getTranslations`/`getLocale` de `next-intl/server`; client components con `'use client'` + `useTranslations`/`useLocale`. CSS plano en `globals.css` (añadir al final con bloque comentado).
- **Git**: trabajar en `main` y `git push origin main` (deploy auto en Vercel). Mensajes de commit claros. (Nota: la rama de desarrollo designada en sesiones anteriores fue `claude/sharp-albattani-bukz26`, pero el trabajo reciente se hizo y mergeó a `main`.)

---

# Archivos modificados recientemente (sesión i18n)

- **Nuevos**: `i18n/routing.js`, `i18n/navigation.js`, `i18n/request.js`, `messages/es.json`, `messages/en.json`, `components/LocaleSwitch.js`, `components/GoogleButton.js`, `components/SoloArtista.js`, `components/OcultarColeccionista.js`, `components/NavLogoLink.js`, `components/RegistroForm.js`, `app/auth/callback/route.js`, `lib/og.js`, `HANDOFF.md`.
- **Reescritos a bilingüe**: `lib/atlas.js`, `lib/news.js`, y casi todas las páginas en `app/[locale]/**` + componentes (`Nav`, `Footer`, `Toast`, `WaitlistForm`, `PieceCard`, `ObrasCatalog`, `WelcomeModal`, `PulseTicker`, `SelloSeleccionado`, `RoleSwitch`).
- **Config**: `next.config.mjs` (plugin next-intl + headers + images), `middleware.js`, `package.json`.
- Último commit relevante: metadata bilingüe (`generateMetadata` + namespace `meta`).

---

# Bugs conocidos / cosas a vigilar

- **Artista logueado entrando por el "lado" coleccionista**: en `/sobre-mancha` verá la versión de coleccionista (las secciones de artista se ocultan con `<SoloArtista>` según `localStorage` primero). Es intencional pero puede confundir.
- **`NavLogoLink`** lee `localStorage mancha_role` (plural `coleccionistas`/`artistas`). `RoleSwitch` ya normaliza a plural; el picker guarda plural. Si aparece inconsistencia de "lado", revisar esos valores.
- **Pantalla OAuth de Google** muestra `ycvvpttgmrsukaognwfr.supabase.co` (no es bug, es limitación sin Custom Domain de pago).
- **Imágenes del atlas** dependen de Wikimedia Commons (`commons.wikimedia.org` / `upload.wikimedia.org`); algunas pueden fallar si cambian los nombres de archivo.

---

# TODO pendiente

- [ ] Frente 2: zona horaria (UTC + `<LocalDate>`).
- [ ] Frente 3: moneda visual (rates API cacheada + `<Price>` + selector).
- [ ] (Opcional) Emails transaccionales en idioma del usuario (guardar locale del usuario primero).
- [ ] (Opcional) Activar en Supabase: "Leaked password protection" + subir min. contraseña a 8 (dashboard). 2FA en el Gmail admin.
- [ ] (Opcional) Revisar fila de prueba en tabla `seasons` antes de lanzar `temporada_activa` (starts_at/ends_at/is_current).

---

# Esquema de base de datos (Supabase, resumen)

- **profiles** (id→auth.users, role `artist|buyer`, full_name, email). Trigger `on_auth_user_created` la crea. Trigger `protect_profile_role` impide cambiar `role` salvo founder.
- **artists** (profile_id unique, season_id, display_name, bio, location, medium, status `pending|approved|rejected`).
- **pieces** (artist_id, title, year, technique, dimensions, min_bid>0, image_url, sold, paid_at, description).
- **bids** (piece_id, buyer_id, amount>0). RLS exige comprador + amount>=min_bid + amount>max actual.
- **favorites** (piece_id, buyer_id).
- **leads** (email, piece_id) — lista de espera.
- **seasons** (name, starts_at date, ends_at timestamptz, is_current).
- **artist_applications** — tabla legacy del flujo viejo de `/postular` (ya no se usa; `/postular` redirige a registro). No borrar (histórico).
- **Storage buckets** (públicos): `pieces`, `applications`. Se quitó la policy de listado (solo acceso por URL).
- Admin = email `mancha.gallery@gmail.com` (en código y en políticas RLS).

---

# Instrucciones para el siguiente Claude

1. **Build siempre verde antes de commitear**: `npm run build` (Turbopack). Luego `git add -A && git commit -m "..." && git push origin main`. Vercel despliega solo desde `main`.
2. **i18n es la regla, no la excepción**: cualquier texto nuevo de UI va a `messages/es.json` Y `messages/en.json` (mismo key) y se consume con `useTranslations`/`getTranslations`. Para datos de contenido grande, usar el patrón `L(es,en)` de `lib/atlas.js`/`lib/news.js`.
3. **Navegación**: importa `Link`/`redirect`/`useRouter`/`usePathname` desde `@/i18n/navigation`, nunca de `next/*`, para no perder el locale.
4. **Server actions**: si muestran mensajes al usuario, tradúcelos con `getTranslations('actions')` y agrégalos al namespace `actions`.
5. **No toques el flujo de Stripe ni la moneda de cobro** (USD). El Frente 3 es solo presentación.
6. **Admin queda en español** — no internacionalizar `app/[locale]/admin`.
7. **Fechas/números**: usa `locale==='en'?'en-US':'es-AR'` con `getLocale()`.
8. **Tono**: español neutro con "tú" (jamás voseo); inglés sobrio/editorial.
9. **Herramientas disponibles** en el entorno: GitHub MCP (repo `juanzuluaga42/mancha-app`), Vercel MCP (team `manchagallery`, project `prj_V8cppDD5ccFjSOYDsC4RkipzGrvV`), Supabase MCP (project `ycvvpttgmrsukaognwfr`). Hay cosas que SOLO el usuario puede hacer en dashboards (env vars, toggles de auth, Google Cloud consent, Custom Domain).
10. **Empieza por el Frente 2 (zona horaria)** cuando el usuario lo pida. Antes de cambiar fechas, recuerda el calendario vigente: convocatoria 1–31 ago 2026, Temporada 01 abre 1 sep 2026 (NO usar julio; ya se corrigió en una sesión previa).
11. **Confírmale poco, ejecuta**: el usuario prefiere avances por tandas con build verde y push, e ir confirmando "sigue".
