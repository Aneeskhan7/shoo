import { useSeo } from '../../hooks/useSeo';
import { useJsonLd } from '../../hooks/useJsonLd';

/**
 * Drop this once near the top of any page component:
 *   <Seo title="Men's Sneakers" description="..." jsonLd={schema} />
 * Renders nothing — it exists purely so pages declare their own SEO tags
 * declaratively instead of reaching for the hooks directly.
 */
export default function Seo({ jsonLd, ...meta }) {
  useSeo(meta);
  useJsonLd('page', jsonLd ?? null);
  return null;
}
