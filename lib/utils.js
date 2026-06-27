export function cap(str) {
  if (!str) return '';
  return str
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// Evita open redirects: solo acepta rutas internas ("/algo"), nunca URLs
// absolutas ni "//host". Devuelve fallback si la ruta no es segura.
export function safePath(path, fallback = '/') {
  if (typeof path !== 'string') return fallback;
  if (!path.startsWith('/')) return fallback;
  if (path.startsWith('//') || path.startsWith('/\\')) return fallback;
  return path;
}

// Escapa texto que se interpola en HTML (p. ej. correos) para evitar inyección.
export function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
