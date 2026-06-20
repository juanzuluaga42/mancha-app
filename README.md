# MANCHA — app real (Next.js + Supabase)

Galería con subastas por temporada. Artistas y compradores tienen cuenta real, guardada en una base de datos real (Supabase/Postgres). Hecha para deployar en Vercel.

## Qué incluye

- Catálogo público con pujas y favoritos conectados a la base de datos.
- Registro y login para dos tipos de cuenta: artista y comprador.
- Cuenta de artista: crear perfil y subir hasta 3 piezas (el límite lo aplica la propia base de datos, no solo el frontend).
- Cuenta de comprador: pujar por piezas, marcar favoritos, ver historial de pujas y favoritos.
- Página `/postular` con la info para artistas nuevos.

## Lo que vos tenés que hacer (yo no puedo hacerlo por vos)

### 1. Crear el proyecto en Supabase
1. Andá a [supabase.com](https://supabase.com) y creá una cuenta gratis.
2. Creá un nuevo proyecto (elegí cualquier nombre y contraseña de base de datos).
3. Andá a **SQL Editor** → **New query**, pegá todo el contenido de `supabase/schema.sql` y dale **Run**.
4. (Opcional, solo para ver el catálogo con contenido de ejemplo) Repetí el paso anterior con `supabase/seed.sql`.
5. Andá a **Project Settings → API**. Vas a necesitar la **Project URL** y la **anon / publishable key**.

### 2. Configurar el correo de confirmación
En Supabase: **Authentication → URL Configuration**, agregá como *Redirect URL*:
`https://tu-dominio.vercel.app/auth/confirm` (y `http://localhost:3000/auth/confirm` si vas a probar en tu compu primero).

### 3. Correrlo en tu computadora (opcional, para probar antes de publicar)
```
npm install
cp .env.local.example .env.local
# completá .env.local con los datos de tu proyecto de Supabase
npm run dev
```
Abrí `http://localhost:3000`.

### 4. Publicar en Vercel
1. Subí esta carpeta a un repositorio de GitHub.
2. En [vercel.com](https://vercel.com), importá ese repositorio.
3. En **Environment Variables**, cargá las mismas tres variables de `.env.local.example` (con `NEXT_PUBLIC_SITE_URL` apuntando a la URL que te va a dar Vercel).
4. Deploy. Listo.

## Cómo está armado (por si después seguís vos o le pasás esto a alguien)

- `app/` — páginas (App Router de Next.js).
- `app/actions.js` — pujar y marcar favoritos (escriben directo en Supabase).
- `app/cuenta/` — panel de cuenta, distinto según seas artista o comprador.
- `app/registro`, `app/login`, `app/auth/confirm` — todo el flujo de cuentas.
- `utils/supabase/` — conexión a la base de datos (cliente de navegador y de servidor).
- `supabase/schema.sql` — toda la base de datos: tablas, y las reglas de seguridad que impiden, por ejemplo, que alguien suba una cuarta pieza o puje sin estar registrado.

## Lo que falta para que esto sea un negocio funcionando de verdad

No lo armé en esta primera vuelta porque cada uno es un proyecto en sí mismo — te los dejo anotados en orden de prioridad:

1. **Cobro real**: hoy las pujas quedan guardadas en la base de datos pero no se cobra nada. Para eso hace falta Stripe Connect, que además reparte el 75/25 automáticamente.
2. **Subida real de fotos**: hoy el artista pega una URL de imagen. Con Supabase Storage se puede subir el archivo directo.
3. **Panel para vos**: para aprobar postulaciones y armar cada temporada sin entrar a la base de datos a mano.
4. **Avisos por correo**: "te superaron la puja", "ganaste la subasta", "cierra la temporada".
5. **Páginas legales**: términos de uso y qué pasa si alguien gana una subasta y no paga.
