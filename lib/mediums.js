// Categorías de arte para el registro de artistas (y la carga de obras).
// Bilingües. Se ofrecen como sugerencias; el campo admite texto libre, así
// que un artista puede precisar su técnica si no está en la lista.
export const ART_MEDIUMS = [
  { es: 'Pintura', en: 'Painting' },
  { es: 'Dibujo', en: 'Drawing' },
  { es: 'Fotografía', en: 'Photography' },
  { es: 'Escultura', en: 'Sculpture' },
  { es: 'Grabado y obra gráfica', en: 'Printmaking' },
  { es: 'Ilustración', en: 'Illustration' },
  { es: 'Collage', en: 'Collage' },
  { es: 'Arte textil y fibra', en: 'Textile & fiber art' },
  { es: 'Cerámica', en: 'Ceramics' },
  { es: 'Arte digital y nuevos medios', en: 'Digital & new media' },
  { es: 'Técnica mixta', en: 'Mixed media' },
  { es: 'Instalación', en: 'Installation' },
  { es: 'Videoarte', en: 'Video art' },
  { es: 'Performance', en: 'Performance' },
  { es: 'Arte sonoro', en: 'Sound art' },
  { es: 'Muralismo y arte urbano', en: 'Mural & street art' },
  { es: 'Arte objeto y ensamblaje', en: 'Assemblage & art objects' },
  { es: 'Joyería de autor', en: 'Art jewelry' },
  { es: 'Tipografía y letra', en: 'Lettering & type art' },
];

export function mediumOptions(locale) {
  return ART_MEDIUMS.map((m) => (locale === 'en' ? m.en : m.es));
}
