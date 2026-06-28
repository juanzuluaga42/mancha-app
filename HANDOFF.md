# MANCHA — Handoff de proyecto (detallado)

> Documento de continuidad para retomar el desarrollo sin perder contexto.
> Si vas a cambiar algo, empieza por la sección **"Mapa: qué archivo toco para cambiar X"** y **"Recetas de cambios comunes"** al final.
> Última actualización: 2026-06.

---

# 1. Resumen del proyecto

**Objetivo.** MANCHA es una **galería de arte emergente online por temporadas**. Modelo: pocos artistas seleccionados a mano por temporada, **3 piezas por artista**, subasta en vivo durante ~3 meses; cuando la temporada cierra, lo no vendido "se fue". Posicionamiento editorial/institucional (estética A24 / Apple / MUBI / Sotheby's / NYT Magazine). El artista se lleva el **75%** de cada venta.

**Dos públicos** con portadas separadas:
- **Coleccionistas** → `/para-coleccionistas`
- **Artistas** → `/para-artistas`

La raíz `/` es un **selector (picker)** que pregunta si eres coleccionista o artista y guarda la elección en `localStorage` (`mancha_role` = `'coleccionistas'` | `'artistas'`).

**Estado actual.** En producción en `https://manchagallery.com` (antes `mancha-app.vercel.app`). Fase actual = **pre-launch** (`NEXT_PUBLIC_FASE`). Calendario: **convocatoria 1–31 ago 2026**, **Temporada 01 abre 1 sep 2026**. Funciona: auth (email+contraseña y Google OAuth), registro de artistas con subida de obras, pujas, pagos Stripe, blog/atlas, panel admin. **Internacionalización ES/EN COMPLETA** en todo lo público. Pendientes grandes: **Frente 2 (zona horaria)** y **Frente 3 (moneda visual)** — NO empezados.

**Arquitectura.** Next.js 16 App Router (server components por defecto), Supabase (Postgres + Auth + Storage) con RLS, Stripe para pagos, nodemailer+Gmail para correos, desplegado en Vercel. i18n con `next-intl` (rutas `app/[locale]`).

---

# 2. Stack tecnológico

- **Framework:** Next.js 16.2.9 (App Router, Turbopack), React 19.2.7.
- **i18n:** `next-intl` ^4.13 (rutas con prefijo `/en`, español por defecto sin prefijo, `localePrefix: 'as-needed'`).
- **DB/Auth/Storage:** Supabase (`@supabase/ssr` ^0.12, `@supabase/supabase-js` ^2.108). Proyecto: **`ycvvpttgmrsukaognwfr`** ("MANCHA", us-east-1).
- **Pagos:** Stripe ^22.2 (Checkout, moneda **USD** = cobro real).
- **Email:** nodemailer ^9 vía Gmail.
- **Analytics:** `@vercel/analytics`.
- **Deploy:** Vercel, team `manchagallery`, project `prj_V8cppDD5ccFjSOYDsC4RkipzGrvV`. Deploy automático desde `main`.
- **Sin TypeScript** (todo `.js`/`.mjs`). **Sin Tailwind** — CSS plano en `app/globals.css` (~3300 líneas).
- `package-lock.json` commiteado; deps fijadas. `overrides.postcss ^8.5.10`.

### Variables de entorno (en Vercel — solo el usuario las edita)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (solo server)
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `GMAIL_USER`, `GMAIL_APP_PASSWORD`
- `NEXT_PUBLIC_SITE_URL` = `https://manchagallery.com`
- `NEXT_PUBLIC_FASE` = `pre-launch` | `convocatoria` | `temporada_activa` (default `pre-launch` en `lib/fase.js`)

---

# 3. Estructura del proyecto (árbol real, rama `main`)

```
app/
  [locale]/                     ← TODAS las páginas públicas (es/en)
    layout.js                   ← <html lang>, fuentes, NextIntlClientProvider, PulseTicker, Analytics (layout RAÍZ)
    page.js                     ← Role picker (client)
    not-found.js
    para-coleccionistas/page.js ← portada coleccionista (251 líneas, fechas + countdown)
    para-artistas/page.js       ← portada artista (255 líneas, fechas + countdown + convocatoria)
    sobre-mancha/page.js        ← "about"
    criterio/page.js
    seleccionados/page.js       ← obras de la temporada (vista coleccionista)
    obras/page.js               ← catálogo
    obras/[id]/page.js          ← ficha de pieza + pujar
    obras/[id]/opengraph-image.js
    obras/[id]/certificado/route.js  ← certificado de colección (imagen)
    artistas/page.js  artistas/[id]/page.js  artistas/[id]/opengraph-image.js
    cuenta/page.js (+ actions.js)        ← panel del artista (subir obras), 400 líneas
    login/page.js (+ actions.js)
    registro/page.js (+ actions.js + revisa-tu-correo/page.js)
    postular/page.js (+ actions.js)      ← redirige a /registro?role=artist
    manifiesto/page.js  legal/page.js  elegidos/page.js
    notas/page.js  notas/[slug]/page.js  ← blog/atlas
    temporadas/page.js  temporadas/[id]/page.js
    tips/page.js                          ← redirect
    admin/page.js (+ actions.js)          ← SOLO ESPAÑOL (interno)
    pago/exito/page.js
  api/                ← NO localizado: pulse/route.js, stripe-webhook/route.js
  auth/               ← NO localizado: callback/route.js (OAuth), confirm/route.js (email)
  actions.js          ← server actions compartidas: toggleFavorite, placeBid
  leads/actions.js    ← joinWaitlist
  globals.css  sitemap.js  robots.js  opengraph-image.js  icon.js
components/   ← (ver sección 5)
i18n/         ← routing.js (defineRouting), navigation.js (Link/redirect/useRouter/usePathname), request.js
messages/     ← es.json, en.json  (TODO el texto de UI, 629 líneas c/u, mismos keys)
lib/          ← fase.js, utils.js, email.js, stripe.js, news.js, atlas.js, og.js, tips.js
utils/supabase/ ← client.js (browser), server.js (SSR cookies), admin.js (service-role)
middleware.js ← compone next-intl + refresco de sesión Supabase
next.config.mjs ← plugin next-intl + securityHeaders + images.remotePatterns
```

> **OJO:** NO existe `app/layout.js`. El layout raíz es `app/[locale]/layout.js`.

**Flujo de la app.**
1. `/` (picker) → elige rol → `window.location.href = '/para-{role}'`.
2. **Coleccionista:** portada → `/obras` → `/obras/[id]` → pujar (requiere login) → ganar → email con link de pago Stripe → `/pago/exito` → certificado.
3. **Artista:** portada → `/registro?role=artist` (crea cuenta con técnica/ciudad/bio en metadata) → confirma email (`/auth/confirm` crea la fila `artists` desde metadata) → `/cuenta` sube hasta 3 obras → admin revisa en `/admin` → Seleccionar/No seleccionar.
4. `Nav`/`Footer` se adaptan por **fase** (`lib/fase.js`) y por **lado** (localStorage `mancha_role`, leído en cliente).

---

# 4. Mapa: qué archivo toco para cambiar X  ⭐ (la sección clave)

| Quiero cambiar… | Voy a… |
|---|---|
| **Cualquier texto visible** | `messages/es.json` **Y** `messages/en.json` (mismo key, mismo namespace). NO hardcodear texto en JSX. |
| **Las fechas / calendario** | `app/[locale]/para-artistas/page.js` (constantes `CONV_OPEN_DATE`, `CONV_CLOSE_DATE`, `LAUNCH_DATE`) y `app/[locale]/para-coleccionistas/page.js` (`LAUNCH_DATE`). Formato ISO con offset `-05:00`. Las muestra `<Countdown>`. (Frente 2 unificará esto en `lib/dates.js`.) |
| **La fase actual (pre-launch/convocatoria/activa)** | Variable de entorno `NEXT_PUBLIC_FASE` en Vercel (solo usuario). Lógica en `lib/fase.js` (`isPreLaunch/isConvocatoria/isTemporadaActiva`). |
| **El menú de navegación** | `components/Nav.js` (+ `NavMenu.js`, `NavDropdown.js`, `NavLogoLink.js`). Textos en namespace `nav`. |
| **El footer** | `components/Footer.js`. Textos en namespace `footer`. |
| **Colores / tipografías / estilos** | `app/globals.css` (variables CSS al inicio del archivo; estilos por sección). Añadir estilos nuevos AL FINAL con un bloque comentado. |
| **La portada del coleccionista** | `app/[locale]/para-coleccionistas/page.js` + namespace `collectors`. |
| **La portada del artista** | `app/[locale]/para-artistas/page.js` + namespace `artists`. |
| **El catálogo de obras** | `app/[locale]/obras/page.js`, `components/ObrasCatalog.js`, `components/PieceCard.js` + namespaces `catalog`, `piece`. |
| **La ficha de una obra / pujar** | `app/[locale]/obras/[id]/page.js` + server action `placeBid` en `app/actions.js` + namespace `piece`/`actions`. |
| **El panel del artista (subir obra)** | `app/[locale]/cuenta/page.js` + `app/[locale]/cuenta/actions.js` + namespace `account`. |
| **El registro / login** | `app/[locale]/registro/page.js` + `components/RegistroForm.js`; `app/[locale]/login/page.js` + `components/GoogleButton.js`. Actions en sus carpetas. Namespace `auth`. |
| **El flujo OAuth de Google** | `app/auth/callback/route.js`. La confirmación de email crea el perfil en `app/auth/confirm/route.js`. |
| **El panel admin** | `app/[locale]/admin/page.js` + `app/[locale]/admin/actions.js`. **SOLO ESPAÑOL — no internacionalizar.** Admin = `mancha.gallery@gmail.com`. |
| **Los correos (emails)** | `lib/email.js` (helper nodemailer) + los textos están en cada action: `app/actions.js`, `app/[locale]/admin/actions.js`, `app/[locale]/registro|cuenta/actions.js`, `app/api/stripe-webhook/route.js`, `app/auth/confirm/route.js`. **Siguen en español** (ver TODO). |
| **El blog / atlas** | `lib/news.js` (`getArticles(locale)`, `getArticleBySlug(slug, locale)`) y `lib/atlas.js` (`getAtlas(locale)`). Datos bilingües con helper `L(es,en)`. Páginas: `app/[locale]/notas/page.js` y `notas/[slug]/page.js`. |
| **Imágenes OG (compartir en redes)** | `app/opengraph-image.js` (global), `app/[locale]/.../opengraph-image.js` (por página), `app/elegidos/opengraph-image.js`. Fuentes en `lib/og.js`. |
| **El precio mostrado** | Hoy USD directo en `PieceCard`, `obras/[id]`, `seleccionados`, `cuenta`. (Frente 3 añadirá `<Price>` + `lib/rates.js`.) **No tocar Stripe / cobro real.** |
| **El pago Stripe / checkout** | `lib/stripe.js` (crea checkout USD) + `app/api/stripe-webhook/route.js` (marca pagado, envía correos). **No cambiar la moneda.** |
| **El selector de idioma (banderas)** | `components/LocaleSwitch.js` (🇪🇸/🇺🇸). Ya está en Nav, picker y `/elegidos`. |
| **Cambiar de rol (coleccionista↔artista)** | `components/RoleSwitch.js` + `SoloArtista.js`/`OcultarColeccionista.js` (muestran/ocultan según `localStorage mancha_role`). |
| **Metadata / SEO (título, descripción)** | `generateMetadata()` en cada `page.js` leyendo namespace `meta`. Sitemap: `app/sitemap.js`; robots: `app/robots.js`. |
| **Routing / locales / middleware** | `i18n/routing.js`, `i18n/navigation.js`, `i18n/request.js`, `middleware.js`. |
| **Cabeceras de seguridad / dominios de imágenes** | `next.config.mjs` (`securityHeaders`, `images.remotePatterns`). |
| **La base de datos / RLS** | Supabase MCP (`mcp__Supabase__*`) o dashboard. Esquema en sección 9. |

---

# 5. Componentes (qué hace cada uno)

- **Nav.js / NavMenu.js / NavDropdown.js / NavLogoLink.js**: navegación; se adapta a fase y lado. `NavLogoLink` lee `localStorage mancha_role` para llevar al logo al lado correcto.
- **Footer.js**: pie con fechas/links, se adapta por fase.
- **LocaleSwitch.js**: banderas 🇪🇸/🇺🇸; usa `useRouter().replace(pathname, {locale})`.
- **GoogleButton.js**: botón "Continuar con Google" (OAuth Supabase).
- **RegistroForm.js**: formulario de registro de artista (técnica/ciudad/bio → metadata).
- **PieceCard.js**: tarjeta de obra en catálogo (`'use client'`, usa `useTranslations`). El precio se muestra aquí.
- **ObrasCatalog.js**: grilla + filtros del catálogo (ojo: la variable de técnica se llama `tech`, no `t`, para no chocar con translations).
- **Countdown.js**: cuenta regresiva; calcula con `getTime()` (absoluto, correcto para zonas horarias). Recibe `endsAt` y `label`.
- **WaitlistForm.js**: form de lista de espera (→ `app/leads/actions.js`).
- **Toast.js**: muestra mensajes de `?error=`/`?success=` (los actions los pasan por query).
- **WelcomeModal.js**: modal de bienvenida.
- **PulseTicker.js**: ticker animado (consume `app/api/pulse`).
- **SelloSeleccionado.js**: sello "seleccionado".
- **RoleSwitch.js / SoloArtista.js / OcultarColeccionista.js**: control de "lado" por `localStorage mancha_role` (valores plurales `coleccionistas`/`artistas`).
- **Splat.js**: manchas decorativas. `globals.css` las oculta (`.splat{display:none}`) pero NO quites los imports/JSX.
- **ScrollReveal.js / CursorTrail.js / PaintTrail.js**: efectos visuales.
- **BlogImg.js**: imagen de blog con fallback de iniciales/color.
- **SubmitButton.js**: botón con estado de envío (`useFormStatus`).
- **HiddenMessage.js**: easter egg / mensaje oculto.

---

# 6. Decisiones técnicas (y por qué)

- **i18n con `next-intl` + rutas `/en` (`localePrefix: 'as-needed'`).** Español = default sin prefijo → **las URLs en español quedaron idénticas a antes**, así no se rompen auth/pagos/links ni redirects de Stripe/OAuth. Inglés en `/en/...`.
- **Todas las páginas en `app/[locale]/`**; se eliminó `app/layout.js`. `api/`, `auth/`, `sitemap.js`, `robots.js`, `opengraph-image.js`, `icon.js` quedan FUERA de `[locale]`.
- **Middleware compuesto**: corre `next-intl` (detección idioma + cookie `NEXT_LOCALE` + prefijo) y luego refresca sesión Supabase. Matcher excluye `api|auth|_next|_vercel|opengraph-image|icon|sitemap|robots|*.*`.
- **Navegación locale-aware**: SIEMPRE importar `Link/redirect/useRouter/usePathname` desde `@/i18n/navigation`, nunca de `next/*`.
- **Datos bilingües por función** (`getAtlas(locale)`, `getArticles(locale)`) con helper `L(es,en)` — NO son mensajes de next-intl (son datos grandes).
- **Server actions traducen** con `getTranslations('actions')`; mensajes viajan por `?error=`/`?success=` y los muestra `Toast`.
- **Moneda base real = USD** (`lib/stripe.js` `currency:'usd'`). Frente 3 es solo visual.
- **Confirmación de email se mantiene (decisión "1b")**: el registro guarda datos en metadata; al confirmar, `auth/confirm` crea la fila `artists`.
- **Admin sin traducir** (interno).
- **Seguridad**: certificado expone solo nombre de pila; `safePath()` evita open-redirects; `escapeHtml()` en emails; CSP `frame-ancestors 'none'`; RLS endurecido; funciones SECURITY DEFINER con EXECUTE revocado a PUBLIC.
- **Pantalla de consentimiento Google** muestra `*.supabase.co`; cambiarlo requiere Custom Domain de Supabase (de pago) — se dejó así (cosmético).

---

# 7. Convenciones

- **Naming**: componentes `PascalCase.js`; helpers `camelCase`; rutas en español (`/sobre-mancha`, `/seleccionados`, `/obras`). Keys i18n en inglés camelCase por namespace.
- **i18n namespaces** (`messages/es.json` y `en.json`): `meta, common, waitlist, actions, nav, footer, auth, picker, collectors, artists, about, criterioPage, selected, catalog, piece, account, elegidos, misc, manifestoPage, legal, season, artistPage, notasPage`. Plurales ICU (`{count, plural, one {...} other {...}}`). Números/fechas: `toLocaleString(locale==='en'?'en-US':'es-AR')`.
- **Branding**: dark `#0D0C0A`, papel/cream `var(--paper)` `#FAF3E6`, tinta `--ink` `#16110D`, `--red` `#E5402B`, `--yellow` `#F2B705`, `--lilac`. Tipografías: **Unbounded** 800 (display), **Newsreader** italic (editorial), **Space Mono** (labels/mono). `border-radius: 2px`. Logo: `MANCHA` + punto rojo.
- **Tono**: español **neutro "tú" (NUNCA voseo)**; inglés sobrio/editorial.
- **Estilo de código**: server components async + `getTranslations`/`getLocale` de `next-intl/server`; client components con `'use client'` + `useTranslations`/`useLocale`. CSS plano en `globals.css` (añadir al final con bloque comentado).
- **Git**: trabajar en `main`, `git push origin main` (deploy auto). Commits claros.

---

# 8. Funcionalidades terminadas

- **Auth**: registro email+contraseña, **Google OAuth**, login, confirmación email, logout.
- **Flujo de artista unificado** (un solo momento de decisión): cuenta libre; obras opcionales; subir obra activa revisión. Estados: registrado-sin-obra / en-revisión / seleccionado (`approved`) / no-seleccionado (`rejected`). Recordatorio por email al confirmar sin obras.
- **Admin**: bandejas "En revisión" y "Registrados sin obra", aprobar/rechazar, marcar vendidas, reenviar recordatorio de pago. **En español a propósito.**
- **Pujas** (`placeBid`): múltiplo de 5, > máximo actual y >= min_bid (reforzado en RLS). Emails "te superaron" y confirmación.
- **Pagos Stripe**: checkout USD; webhook verificado marca `paid_at` y envía correos.
- **Certificado de colección**: imagen OG dinámica, solo nombre de pila (privacidad).
- **Blog/Editorial + Atlas** (20 artistas, cuadros caros, museos, premios, datos, timeline).
- **Diseño editorial** en todo el sitio. **OG images** rediseñadas con fuentes de marca.
- **Seguridad** auditada y aplicada (headers, CSP, RLS, safePath, escapeHtml).
- **i18n ES/EN COMPLETO** en todo lo público.

---

# 9. Esquema de base de datos (Supabase)

- **profiles** (id→auth.users, role `artist|buyer`, full_name, email). Trigger `on_auth_user_created` la crea; `protect_profile_role` impide cambiar `role` salvo founder.
- **artists** (profile_id unique, season_id, display_name, bio, location, medium, status `pending|approved|rejected`).
- **pieces** (artist_id, title, year, technique, dimensions, min_bid>0, image_url, sold, paid_at, description).
- **bids** (piece_id, buyer_id, amount>0). RLS exige comprador + amount>=min_bid + amount>max actual.
- **favorites** (piece_id, buyer_id).
- **leads** (email, piece_id) — lista de espera.
- **seasons** (name, starts_at date, ends_at timestamptz, is_current).
- **artist_applications** — tabla legacy del flujo viejo de `/postular` (ya no se usa; no borrar, histórico).
- **Storage buckets** (públicos): `pieces`, `applications`. Sin policy de listado (solo acceso por URL).
- Admin = `mancha.gallery@gmail.com` (en código y RLS).

---

# 10. Pendientes mayores

### Frente 2 — Zona horaria (NO empezado)
Objetivo: cada visitante ve fechas y countdown en SU hora local; guardar en UTC, convertir al mostrar. Hoy: fechas hardcodeadas con offset `-05:00` en `para-artistas/page.js` y `para-coleccionistas/page.js`. `Countdown.js` ya usa `getTime()` (correcto). Las fechas mostradas usan `toLocaleDateString` por idioma pero **sin `timeZone`**. **Plan acordado:** `lib/dates.js` con constantes ISO-UTC + componente cliente `<LocalDate>` que formatea con `Intl.DateTimeFormat` en la zona del visitante. **Calendario vigente (no cambiar a julio):** convocatoria 1–31 ago 2026, Temporada 01 abre 1 sep 2026.

### Frente 3 — Moneda visual (NO empezado)
Objetivo: precios "≈ aprox." manteniendo **USD como cobro real (no tocar Stripe)**. Reglas: USD real siempre visible; etiqueta "≈ aprox." + nota "el cobro se realiza en USD"; selector de moneda recordado en cookie. Tasas: API gratuita cacheada 1×/día (`open.er-api.com` o `exchangerate.host`), nunca hardcodeadas. **Plan:** `lib/rates.js` + `app/api/rates/route.js` (revalidate 86400) + componente `<Price usd={...} />`. Precios hoy en `PieceCard`, `obras/[id]`, `seleccionados`, `cuenta`.

### TODO opcional
- [ ] Emails transaccionales en idioma del usuario (requiere **guardar el locale del usuario** primero — hoy no se guarda).
- [ ] OG image dinámica por idioma.
- [ ] En Supabase (dashboard): "Leaked password protection" + min. contraseña 8. 2FA en Gmail admin.
- [ ] Revisar fila de prueba en `seasons` antes de lanzar `temporada_activa`.

---

# 11. Bugs conocidos / a vigilar

- **Artista logueado por el "lado" coleccionista**: en `/sobre-mancha` ve la versión coleccionista (las secciones de artista se ocultan con `<SoloArtista>` según `localStorage`). Intencional pero confunde.
- **`mancha_role` plural**: picker guarda y `RoleSwitch` normaliza a plural (`coleccionistas`/`artistas`). Si hay inconsistencia de "lado", revisar esos valores en `NavLogoLink`/`RoleSwitch`.
- **OAuth Google** muestra `ycvvpttgmrsukaognwfr.supabase.co` (limitación sin Custom Domain de pago, no bug).
- **Imágenes del atlas** dependen de Wikimedia Commons; pueden fallar si cambian nombres de archivo.

---

# 12. Recetas de cambios comunes  ⭐

**Cambiar un texto:**
1. Busca el key en `messages/es.json`. 2. Edita ahí y el mismo key en `messages/en.json`. 3. Listo (el JSX ya lo consume con `t('key')`).

**Agregar una página nueva:**
1. Crea `app/[locale]/mi-ruta/page.js` (server component async). 2. `const t = await getTranslations('miNamespace')`. 3. Importa `Link` desde `@/i18n/navigation`. 4. Agrega `generateMetadata()` leyendo namespace `meta`. 5. Añade el namespace a `es.json` y `en.json`.

**Agregar texto nuevo a una página existente:**
1. Añade el key a su namespace en ambos JSON. 2. Úsalo con `t('nuevoKey')`. NUNCA hardcodees el string.

**Cambiar colores/estética:**
- Variables CSS al inicio de `app/globals.css`. Estilos nuevos al final, en bloque comentado por sección.

**Cambiar fechas del calendario:**
- Edita las constantes `*_DATE` en `para-artistas/page.js` y `para-coleccionistas/page.js` (formato `YYYY-MM-DDTHH:mm:ss-05:00`).

**Antes de commitear SIEMPRE:**
```bash
npm run build          # Turbopack, debe quedar verde
git add -A && git commit -m "..." && git push origin main   # deploy auto en Vercel
```

---

# 13. Instrucciones para el siguiente Claude

1. **Build verde antes de commitear** (`npm run build`), luego `git push origin main`. Vercel despliega desde `main`.
2. **i18n es obligatorio**: todo texto nuevo va a `es.json` Y `en.json`. Datos grandes → patrón `L(es,en)`.
3. **Navegación**: importa de `@/i18n/navigation`, nunca de `next/*`.
4. **Server actions** que muestran mensajes: tradúcelos con `getTranslations('actions')`.
5. **No toques Stripe ni la moneda de cobro (USD).** Frente 3 es solo visual.
6. **Admin queda en español** — no internacionalizar `app/[locale]/admin`.
7. **Fechas/números**: `locale==='en'?'en-US':'es-AR'` con `getLocale()`.
8. **Tono**: español neutro "tú" (jamás voseo); inglés sobrio/editorial.
9. **Herramientas MCP**: GitHub (`juanzuluaga42/mancha-app`), Vercel (team `manchagallery`, project `prj_V8cppDD5ccFjSOYDsC4RkipzGrvV`), Supabase (`ycvvpttgmrsukaognwfr`). Env vars, toggles de auth, Google consent y Custom Domain SOLO los hace el usuario en dashboards.
10. **Frente 2 (zona horaria) primero** cuando el usuario lo pida. Calendario vigente: convocatoria 1–31 ago 2026, Temporada 01 abre 1 sep 2026.
11. **Ejecuta, confirma poco**: el usuario prefiere avances por tandas con build verde y push, e ir diciendo "sigue".
