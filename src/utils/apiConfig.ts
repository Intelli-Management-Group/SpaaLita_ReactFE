/**
 * Laravel backend (SpaaLita_backend) connection settings.
 *
 * Production builds (`npm run build`) always use the production API, so a
 * local .env can never end up in a deployed site.
 *
 * `npm run dev` only:
 * VITE_API_BASE_URL - API root, e.g. http://localhost:5000/api/ for a local backend
 *                     (start-server.bat). Unset: the production API.
 * VITE_API_URL      - optional: host that serves uploaded files (/uploads/...).
 *                     Defaults to VITE_API_BASE_URL without the trailing /api.
 */
const PRODUCTION_API_BASE_URL = 'https://backend.spaalita.intellimanagement.com/api/';

const devOverride = (value?: string): string | undefined => (import.meta.env.DEV && value?.trim()) || undefined;

export const API_BASE_URL: string = devOverride(import.meta.env.VITE_API_BASE_URL) || PRODUCTION_API_BASE_URL;

export const API_ORIGIN: string = (
    devOverride(import.meta.env.VITE_API_URL) || API_BASE_URL.replace(/\/api\/?$/, '')
).replace(/\/+$/, '');

/**
 * Turn an image value from the API into a URL the browser can load.
 *
 * The backend returns three forms:
 * - full URLs (imported WooCommerce images) or data URIs: used as-is
 * - paths such as "/uploads/gallery/x.jpg": served by the API host
 * - bare file names (product uploads): stored in /uploads/{folder}/
 */
export const resolveImageUrl = (path?: string | null, folder = 'products'): string => {
    if (!path) return '';
    if (/^(https?:|data:|blob:)/i.test(path) || path.startsWith('//')) return path;
    if (path.startsWith('/')) return `${API_ORIGIN}${path}`;
    if (path.startsWith('uploads/')) return `${API_ORIGIN}/${path}`;
    return `${API_ORIGIN}/uploads/${folder}/${path}`;
};
