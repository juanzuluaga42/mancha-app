// Carga una fuente de Google Fonts como ArrayBuffer para usar en next/og.
// Usa un User-Agent antiguo para forzar que Google devuelva TTF (satori no soporta woff2).
// Si falla la red (ej. build local sin salida), devuelve null y la imagen cae a la fuente por defecto.
const cache = {};

export async function loadGoogleFont(font, text) {
  const key = `${font}|${text}`;
  if (cache[key] !== undefined) return cache[key];

  const url = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(text)}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);

  try {
    const cssRes = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; rv:9.0) Gecko/20100101 Firefox/9.0' },
      signal: ctrl.signal,
    });
    const css = await cssRes.text();
    const resource = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
    if (resource) {
      const fontRes = await fetch(resource[1], { signal: ctrl.signal });
      if (fontRes.ok) {
        const buf = await fontRes.arrayBuffer();
        cache[key] = buf;
        return buf;
      }
    }
  } catch (e) {
    // sin red: la imagen usará la fuente por defecto
  } finally {
    clearTimeout(timer);
  }

  cache[key] = null;
  return null;
}

// Devuelve el array de fuentes para ImageResponse, ya filtrado de las que no cargaron.
export async function manchaFonts(text) {
  const chars = (text || '') + 'MANCHAabcdefghijklmnopqrstuvwxyzáéíóúñ.,·→0123456789 ';
  const [display, editorial] = await Promise.all([
    loadGoogleFont('Unbounded:wght@800', chars),
    loadGoogleFont('Newsreader:ital,wght@1,500', chars),
  ]);
  return [
    display && { name: 'Unbounded', data: display, weight: 800, style: 'normal' },
    editorial && { name: 'Newsreader', data: editorial, weight: 500, style: 'italic' },
  ].filter(Boolean);
}
