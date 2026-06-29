-- ════════════════════════════════════════════════════════════════
-- MANCHA · Curatorial Portal — seed de arranque (F1 + F2)
-- Founder curador + ronda abierta + 3 obras demo con identidad +
-- asignaciones al founder (para probar Fase 1 y Fase 2 de inmediato).
-- Idempotente: se puede correr más de una vez sin duplicar.
-- ════════════════════════════════════════════════════════════════

-- Founder = admin de MANCHA (mancha.gallery@gmail.com).
insert into public.cur_curators (user_id, display_name, role)
select id, 'MANCHA', 'founder' from auth.users where email = 'mancha.gallery@gmail.com'
on conflict (user_id) do update set role = 'founder', active = true;

-- Ronda de revisión abierta.
insert into public.cur_rounds (id, name, status)
values ('11111111-1111-1111-1111-111111111111', 'Convocatoria · Temporada 01', 'open')
on conflict (id) do nothing;

-- Obras demo (cara ciega).
insert into public.cur_works (id, round_id, code, title, year, technique, dimensions, materials, statement, image_url, color_note) values
('22222222-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'OBRA · A1', 'Peso propio', 2025, 'Resina, arena y pigmento', '120 × 90 cm', 'Resina epóxica, arena de río, pigmento mineral', 'Una superficie que parece sostener su propia gravedad; el material no representa, pesa.', 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=1600&q=90&auto=format&fit=crop', 'Fidelidad de color verificada en pantalla calibrada.'),
('22222222-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'OBRA · A2', 'Mapa de lo que no existe', 2024, 'Aguafuerte sobre papel', '50 × 70 cm', 'Aguafuerte, tinta sobre papel de algodón', 'Cartografía de un territorio imposible; la línea insiste donde no hay tierra.', 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1600&q=90&auto=format&fit=crop', null),
('22222222-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'OBRA · A3', 'Registro #7', 2025, 'Serigrafía sobre papel Fabriano', '70 × 100 cm', 'Serigrafía a seis tintas', 'Repetición y diferencia: el séptimo intento que ya no busca el acierto.', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1600&q=90&auto=format&fit=crop', null)
on conflict (id) do nothing;

-- Identidad (queda OCULTA al curador hasta sellar la Fase 1, por RLS).
insert into public.cur_work_identity (work_id, artist_name, artist_bio, artist_location, instagram, prestige_notes, price_usd) values
('22222222-0000-0000-0000-000000000001', 'Valentina Ortiz', 'Trabaja la materia como sedimento del tiempo. Formada en Bellas Artes, vive entre la escultura y la pintura.', 'Bogotá, Colombia', '@valentina.ortiz', 'Bienal de Cuenca 2023; residencia FLORA ars+natura.', 4200),
('22222222-0000-0000-0000-000000000002', 'Tomás Reyes', 'Grabador. Investiga la cartografía como ficción y la línea como insistencia.', 'Ciudad de México, México', '@tomas.reyes.grabado', 'Premio Nacional de Grabado Joven 2022.', 2100),
('22222222-0000-0000-0000-000000000003', 'Lucía Fernández', 'Serigrafía y repetición. Su obra explora el error como método.', 'Buenos Aires, Argentina', '@luciafz.studio', 'Exposición individual en Galería Nora Fisch.', 1800)
on conflict (work_id) do nothing;

-- Asignaciones: las 3 obras al founder (para demostrar F1 y F2).
insert into public.cur_assignments (round_id, work_id, curator_id, phase)
select '11111111-1111-1111-1111-111111111111', w.id, c.id, 'phase1'
from public.cur_works w
cross join public.cur_curators c
where c.role = 'founder' and w.round_id = '11111111-1111-1111-1111-111111111111'
on conflict (work_id, curator_id) do nothing;

-- ════════════════════════════════════════════════════════════════
-- F3 · seed del colegio — 2 curadores más (sin cuenta aún) con sus
-- evaluaciones selladas, para poblar la Sala del colegio (3 miradas).
-- ════════════════════════════════════════════════════════════════
insert into public.cur_curators (id, user_id, display_name, role) values
 ('33333333-0000-0000-0000-0000000000b0', null, 'Consejo · Curador II', 'council'),
 ('33333333-0000-0000-0000-0000000000c0', null, 'Consejo · Curador III', 'council')
on conflict (id) do nothing;

insert into public.cur_assignments (round_id, work_id, curator_id, phase)
select '11111111-1111-1111-1111-111111111111', w.id, c.id, 'done'
from public.cur_works w
cross join (values
  ('33333333-0000-0000-0000-0000000000b0'::uuid),
  ('33333333-0000-0000-0000-0000000000c0'::uuid)) c(id)
where w.round_id = '11111111-1111-1111-1111-111111111111'
on conflict (work_id, curator_id) do nothing;

-- Evaluaciones con índice calculado por los pesos reales
-- (A1 consenso alto, A2 divergencia, A3 parcial).
with crit(key, w, ord) as (values
  ('originalidad',0.15,1),('permanencia',0.13,2),('fuerzaVisual',0.12,3),
  ('profundidad',0.12,4),('lenguaje',0.10,5),('tecnica',0.09,6),
  ('composicion',0.09,7),('coherencia',0.08,8),('valorColeccion',0.07,9),('afinidad',0.05,10)
),
data(work_id, curator_id, scores_arr, conf_arr, reflection, decision) as (values
  ('22222222-0000-0000-0000-000000000001'::uuid,'33333333-0000-0000-0000-0000000000b0'::uuid,
    array[9,8,9,8,8,8,8,8,7,7], array['high','high','high','medium','high','high','high','high','medium','medium'],
    'La materia no representa el peso: lo ejerce. Hay un control raro del accidente. Permanece.', 'recommend'),
  ('22222222-0000-0000-0000-000000000001'::uuid,'33333333-0000-0000-0000-0000000000c0'::uuid,
    array[8,8,9,7,8,9,8,7,8,7], array['high','medium','high','medium','high','high','high','medium','high','medium'],
    'Presencia indiscutible. La superficie sostiene la mirada larga. Entra al estándar.', 'recommend'),
  ('22222222-0000-0000-0000-000000000002'::uuid,'33333333-0000-0000-0000-0000000000b0'::uuid,
    array[7,6,7,8,7,6,7,7,6,6], array['high','medium','high','high','medium','medium','high','high','medium','medium'],
    'La idea de cartografía imposible es fértil; la ejecución la acompaña sin brillar. Con observaciones.', 'recommend_notes'),
  ('22222222-0000-0000-0000-000000000002'::uuid,'33333333-0000-0000-0000-0000000000c0'::uuid,
    array[4,4,5,5,4,6,5,4,4,5], array['medium','low','medium','medium','low','high','medium','low','low','medium'],
    'El concepto promete más de lo que la obra entrega. La línea se repite sin tensión. No alcanza el estándar.', 'not_recommend'),
  ('22222222-0000-0000-0000-000000000003'::uuid,'33333333-0000-0000-0000-0000000000b0'::uuid,
    array[6,7,6,6,7,7,6,6,6,6], array['medium','high','medium','medium','high','high','medium','medium','medium','medium'],
    'Oficio claro, voz aún en formación. Pediría una segunda mirada antes de concluir.', 'second_review'),
  ('22222222-0000-0000-0000-000000000003'::uuid,'33333333-0000-0000-0000-0000000000c0'::uuid,
    array[7,7,7,6,7,7,7,7,6,7], array['high','high','high','medium','high','high','high','high','medium','high'],
    'El error como método funciona; la serie tiene coherencia. Entra con matices.', 'recommend_notes')
),
built as (
  select d.work_id, d.curator_id, d.reflection, d.decision,
    jsonb_object_agg(c.key, jsonb_build_object('score', d.scores_arr[c.ord], 'confidence', d.conf_arr[c.ord], 'note', '')) as scores,
    round((sum(d.scores_arr[c.ord] * c.w) * 10)::numeric, 1) as idx
  from data d cross join crit c
  group by d.work_id, d.curator_id, d.reflection, d.decision
)
insert into public.cur_evaluations (assignment_id, scores, reflection, decision, curatorial_index)
select a.id, b.scores, b.reflection, b.decision, b.idx
from built b
join public.cur_assignments a on a.work_id = b.work_id and a.curator_id = b.curator_id
on conflict (assignment_id) do nothing;
