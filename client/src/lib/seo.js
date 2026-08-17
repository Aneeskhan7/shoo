/**
 * SEO constants + pure helpers. No React here — see hooks/useSeo.js and
 * hooks/useJsonLd.js for the DOM-writing side.
 *
 * SITE_ORIGIN deliberately does NOT fall back to window.location.origin —
 * that would let a preview/*.vercel.app deploy self-canonicalize to itself,
 * silently indexing staging. VITE_SITE_URL must be set on the real
 * production deploy; the hardcoded fallback below is that same production
 * value, not a generic placeholder.
 */
export const SITE_ORIGIN = (import.meta.env.VITE_SITE_URL || 'https://www.shoo.business').replace(
  /\/$/,
  '',
);

export const SITE = {
  name: 'SHOO',
  defaultTitle: 'SHOO — Premium Sneakers & Streetwear in Pakistan',
  defaultDescription:
    'Curated for every step. Premium sneakers and streetwear, 100% authentic, nationwide delivery with cash on delivery.',
  defaultImage: '/brand/cover.png',
  logo: '/brand/logo.png',
  locale: 'en_PK',
  email: 'shoo.bussiness@gmail.com',
  // Mirrors Footer.jsx's FOLLOW column — kept as a separate literal here
  // rather than imported, since Footer.jsx isn't a data module. If the
  // social links ever change, update both.
  sameAs: [
    'https://www.instagram.com/shoodrops/?hl=en',
    'https://www.facebook.com/shoodrops',
    'https://www.tiktok.com/@shoodrops',
    'https://www.pinterest.com/shoodrops',
  ],
};

/** Resolves a path (or already-absolute URL) against SITE_ORIGIN. */
export function absoluteUrl(path) {
  if (!path) return SITE_ORIGIN + '/';
  if (/^https?:\/\//i.test(path)) return path;
  return SITE_ORIGIN + (path.startsWith('/') ? path : `/${path}`);
}

/** `"Men's Sneakers"` -> `"Men's Sneakers | SHOO"`. Falsy/already-suffixed
 *  titles fall back to the site default instead of doubling up. */
export function buildTitle(title) {
  if (!title) return SITE.defaultTitle;
  return title.trim().endsWith(SITE.name) ? title : `${title} | ${SITE.name}`;
}

/** Trims to a word boundary near `max` chars, for meta descriptions. */
export function clampDescription(str, max = 155) {
  if (!str) return SITE.defaultDescription;
  const clean = str.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : max)}…`;
}

/**
 * JSON-LD is written via `.textContent` (see useJsonLd.js), which the
 * browser never HTML-parses, so a `</script>` inside admin-authored content
 * can't break out today. The `<` escape here is defence-in-depth only, in
 * case the injection method ever changes.
 */
export function safeJsonLd(obj) {
  return JSON.stringify(obj).replace(/</g, '\\u003c');
}
