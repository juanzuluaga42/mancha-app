import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// Wrappers locale-aware de Link/redirect/router. Reemplazan a next/link y
// next/navigation en los componentes para que respeten el prefijo de idioma.
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
