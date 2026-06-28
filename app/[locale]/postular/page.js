import { redirect } from 'next/navigation';

// El flujo de postulación se unificó con el de cuenta de artista.
// Crear cuenta es libre e inmediato y permite subir obras al instante o más tarde.
export default function PostularPage() {
  redirect('/registro?role=artist');
}
