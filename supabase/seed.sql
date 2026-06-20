-- ============================================================
-- DATOS DE MUESTRA (opcional)
-- Corré esto solo si querés ver el catálogo con contenido de ejemplo.
-- Estos artistas NO tienen cuenta real (profile_id queda en null).
-- Antes de lanzar de verdad, borralos con:
--   delete from public.artists where profile_id is null;
-- ============================================================

with s as (select id from public.seasons where is_current = true limit 1),
a1 as (
  insert into public.artists (season_id, display_name, bio, location, medium)
  select s.id, 'Lucía Ferraro',
    'Lucía pinta como quien escribe una carta urgente: pinceladas gruesas, colores que no piden permiso. Después de diez años en colectivas, esta es su primera muestra individual.',
    'Buenos Aires, AR', 'Pintura expresionista'
  from s returning id
),
a2 as (
  insert into public.artists (season_id, display_name, bio, location, medium)
  select s.id, 'Kenji Voss',
    'Kenji construye sus piezas con recortes de revistas que ya nadie compra y pigmento mezclado a mano. Cada obra tarda semanas en secar — literal y figuradamente.',
    'Berlín, DE', 'Técnica mixta / collage'
  from s returning id
),
a3 as (
  insert into public.artists (season_id, display_name, bio, location, medium)
  select s.id, 'Marina Etxeberria',
    'Marina pinta la luz del Cantábrico antes de que cambie. Trabaja rápido, en sesiones de una sola tarde, y casi nunca retoca una pieza ya terminada.',
    'Bilbao, ES', 'Acuarela y tinta'
  from s returning id
),
a4 as (
  insert into public.artists (season_id, display_name, bio, location, medium)
  select s.id, 'Tomás Rey',
    'Tomás viene de una familia de restauradores y aprendió a pintar reparando cuadros ajenos. Sus retratos miran de vuelta más de lo que resulta cómodo.',
    'Ciudad de México, MX', 'Óleo sobre lienzo'
  from s returning id
)
insert into public.pieces (artist_id, title, year, technique, dimensions, min_bid, image_url)
select id, 'Incendio doméstico', 2025, 'Óleo sobre lienzo', '90 × 120 cm', 1450, null from a1
union all
select id, 'Lo que no dijimos', 2026, 'Óleo sobre lienzo', '60 × 80 cm', 890, null from a1
union all
select id, 'Domingo a las tres', 2026, 'Óleo sobre tabla', '50 × 50 cm', 620, null from a1
union all
select id, 'Archivo perdido N°3', 2025, 'Collage y acrílico', '70 × 100 cm', 1200, null from a2
union all
select id, 'Señal débil', 2026, 'Técnica mixta sobre madera', '45 × 60 cm', 740, null from a2
union all
select id, 'Todo lo que guardé', 2026, 'Collage sobre lienzo', '80 × 80 cm', 980, null from a2
union all
select id, 'Marea baja', 2026, 'Acuarela sobre papel', '40 × 60 cm', 410, null from a3
union all
select id, 'Gris de febrero', 2026, 'Tinta y acuarela', '35 × 50 cm', 360, null from a3
union all
select id, 'La casa de mi abuela', 2025, 'Acuarela sobre papel', '50 × 70 cm', 520, null from a3
union all
select id, 'Autorretrato con mancha', 2026, 'Óleo sobre lienzo', '70 × 90 cm', 1100, null from a4
union all
select id, 'Mi tía nunca sonríe en fotos', 2025, 'Óleo sobre lienzo', '60 × 60 cm', 780, null from a4
union all
select id, 'Después del velorio', 2026, 'Óleo sobre lienzo', '100 × 130 cm', 1890, null from a4;
