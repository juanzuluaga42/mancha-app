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
