# MANCHA

Galería de arte emergente con subastas por temporada. Artistas seleccionados a mano, tres piezas cada uno, tiempo limitado. Cuando cierra la temporada, cierra para siempre.

**Stack:** Next.js 15 (App Router) · Supabase (Postgres + Auth + Storage) · Stripe · Nodemailer (Gmail) · Vercel

---

## Arquitectura general

```
mancha-app/
├── app/                        # Páginas y rutas (Next.js App Router)
│   ├── page.js                 # Homepage
│   ├── actions.js              # Server actions globales (pujar, favoritos)
│   ├── admin/                  # Panel de administración (solo mancha.gallery@gmail.com)
│   ├── artistas/[id]/          # Perfil público de cada artista
│   ├── cuenta/                 # Panel de cuenta (artista o comprador)
│   ├── elegidos/               # Landing secreta para invitar artistas (noindex)
│   ├── legal/                  # Términos y privacidad
│   ├── login/ & registro/      # Autenticación
│   ├── manifiesto/             # Manifiesto de MANCHA (solo visible a artistas en nav)
│   ├── notas/                  # Atlas del Arte — blog editorial
│   ├── obras/[id]/
│   │   ├── page.js             # Detalle de pieza + formulario de puja
│   │   └── certificado/        # Certificado de colección (imagen PNG generada)
│   ├── pago/exito/             # Página de confirmación post-Stripe
│   ├── postular/               # Formulario de postulación para artistas
│   ├── seleccionados/          # Los elegidos: temporada actual + archivo histórico
│   ├── sobre-mancha/           # Quiénes somos
│   ├── temporadas/[id]/        # Detalle de cada temporada
│   └── api/stripe-webhook/     # Webhook de Stripe (checkout.session.completed)
├── components/                 # Componentes reutilizables
├── lib/
│   ├── atlas.js                # Datos del blog (artistas históricos, museos, etc.)
│   ├── email.js                # Envío de correos via Nodemailer/Gmail
│   ├── news.js                 # Artículos del blog
│   └── stripe.js               # Creación de sesiones de Stripe Checkout
├── utils/supabase/             # Clientes de Supabase (server, client, admin)
└── supabase/                   # Schema SQL de la base de datos
```

---

## Variables de entorno

Crea un archivo `.env.local` con estas variables (en producción van en Vercel → Settings → Environment Variables):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# URL pública del sitio
NEXT_PUBLIC_SITE_URL=https://mancha-app.vercel.app

# Gmail (correos transaccionales)
GMAIL_USER=mancha.gallery@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Cómo obtener el App Password de Gmail
1. Google Account → Seguridad → Verificación en dos pasos (debe estar activa)
2. Busca "Contraseñas de aplicaciones"
3. Crea una para "Correo" → copia las 16 letras

---

## Base de datos

### Tablas principales

| Tabla | Descripción |
|---|---|
| `profiles` | Datos de usuario: nombre, rol (`artist` / `buyer`) |
| `seasons` | Temporadas: nombre, fechas de inicio y fin, `is_current` |
| `artists` | Artistas aprobados: bio, medium, location, `season_id`, `status` |
| `pieces` | Piezas: título, técnica, dimensiones, año, imagen, precio mínimo, `sold`, `paid_at` |
| `bids` | Pujas: monto, `piece_id`, `buyer_id`, timestamp |
| `favorites` | Favoritos: `piece_id`, `buyer_id` |
| `artist_applications` | Postulaciones antes de crear cuenta |
| `leads` | Lista de espera (email + pieza de interés opcional) |

### RLS
- Solo artistas pueden crear piezas
- Un artista no puede subir más de 3 piezas (enforced en DB)
- Solo compradores pueden pujar
- Nadie puede editar pujas ajenas ni favoritos ajenos

---

## Flujo completo de una subasta

### Artista
1. Llega a `/postular` o a `/elegidos` (link privado de invitación)
2. Completa formulario → recibe email de confirmación
3. Admin revisa en `/admin` → aprueba o rechaza → artista recibe email
4. Si aprobado: crea cuenta en `/registro` → sube hasta 3 piezas desde `/cuenta`

### Comprador
1. Navega `/obras` o `/seleccionados` → entra al detalle de una pieza
2. Puja → necesita cuenta → recibe email de confirmación
3. Si alguien puja más: recibe email "te superaron" con link para volver a pujar
4. Al cierre de temporada: admin marca la pieza como vendida desde `/admin`
5. El ganador recibe email con link de pago de Stripe
6. Completa el pago → recibe email de confirmación + link al certificado
7. Certificado disponible en `/obras/[id]/certificado`

### Admin (`/admin`, solo `mancha.gallery@gmail.com`)
- Gestionar postulaciones (aprobar / rechazar con email automático)
- Gestionar artistas pendientes de aprobación
- Ver todas las piezas con pujas en tiempo real
- Marcar piezas vendidas → genera y envía link de Stripe al ganador
- Reenviar recordatorio de pago (genera nuevo link de Stripe)
- Ver lista de espera

---

## Emails transaccionales

| Momento | Destinatario | Asunto |
|---|---|---|
| Artista postula | Artista | "Recibimos tu postulación a MANCHA" |
| Admin aprueba postulación | Artista | "¡Tu postulación fue aceptada!" |
| Admin rechaza postulación | Artista | "Tu postulación a MANCHA" |
| Comprador puja | Comprador | "Tu puja por [pieza] quedó registrada" |
| Alguien supera una puja | Ex-líder | "Alguien superó tu puja por [pieza]" |
| Admin marca pieza vendida | Ganador | "¡Ganaste la puja! — link de pago Stripe" |
| Stripe confirma pago | Ganador | "Tu pago fue confirmado — ver certificado" |
| Stripe confirma pago | Admin | "💰 Pago confirmado: [pieza]" |
| Admin reenvía recordatorio | Ganador | "Tu pago sigue pendiente" |

---

## Stripe

1. Crea cuenta en [stripe.com](https://stripe.com) → copia `STRIPE_SECRET_KEY`
2. Crea un webhook en el dashboard apuntando a:
   ```
   https://mancha-app.vercel.app/api/stripe-webhook
   ```
   Evento: `checkout.session.completed`
3. Copia `STRIPE_WEBHOOK_SECRET` desde la config del webhook
4. En producción usar claves `sk_live_` (no las de test)

Para probar en local con Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

---

## Certificado de colección

Generado automáticamente como imagen PNG (1200×800) en `/obras/[id]/certificado/route.js`.

Solo disponible cuando `piece.sold === true`. Contiene:
- Imagen de la obra
- Nombre de la pieza, artista y datos técnicos
- Nombre del coleccionista (ganador de la puja)
- Temporada de MANCHA
- Fecha de emisión
- Frase del manifiesto

El comprador recibe el link en el email de confirmación de pago.

---

## Páginas

| Ruta | Descripción |
|---|---|
| `/` | Homepage editorial |
| `/seleccionados` | Temporada actual + archivo histórico |
| `/obras` | Catálogo completo |
| `/obras/[id]` | Detalle de pieza + puja |
| `/artistas/[id]` | Perfil del artista |
| `/postular` | Formulario de postulación |
| `/elegidos` | Landing de invitación privada (noindex) |
| `/notas` | Atlas del Arte — blog editorial |
| `/notas/[slug]` | Artículo del blog |
| `/sobre-mancha` | Historia y valores de MANCHA |
| `/manifiesto` | Manifiesto completo (solo en nav para artistas) |
| `/legal` | Términos y privacidad |
| `/admin` | Panel de administración |
| `/cuenta` | Panel personal del usuario |

---

## Correr localmente

```bash
npm install
# crear .env.local con las variables de arriba
npm run dev
# → http://localhost:3000
```

---

## Deploy

Push a `main` despliega automáticamente en Vercel.

```bash
git add .
git commit -m "descripción"
git push origin main
```

---

## Componentes destacados

| Componente | Descripción |
|---|---|
| `WelcomeModal` | Modal de bienvenida una vez por sesión (sessionStorage) |
| `PaintTrail` | Efecto de pintura siguiendo el cursor en el hero |
| `CursorTrail` | Rastro de manchas de pintura (en `/elegidos`) |
| `Countdown` | Contador regresivo al cierre de temporada |
| `PulseTicker` | Ticker flotante con actividad de pujas recientes |
| `Splat` | Manchas decorativas de marca |
| `BlogImg` | Imagen con fallback: si no carga muestra color + iniciales |
| `SelloSeleccionado` | Badge "Seleccionado — Temporada X" |
| `WaitlistForm` | Lista de espera sin cuenta requerida |

---

## Diseño

- **Tipografías:** Unbounded (display, 800w) · Newsreader (body, serif) · Space Mono (labels/mono)
- **Paleta:** `--paper` #FAF3E6 · `--ink` #16110D · `--red` #E5402B · `--yellow` #F2B705 · `--lilac` #8E6FD1
- **CSS:** Todo en `app/globals.css`, sin frameworks. Prefijos por sección: `hp-` (home), `sel-` (seleccionados), `atlas-` (blog), `mf-` (manifiesto), etc.
- **Sin UI libraries:** No hay Tailwind, no hay shadcn, no hay component libraries externas
