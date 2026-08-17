import { useJsonLd } from '../../hooks/useJsonLd';
import { SITE, absoluteUrl } from '../../lib/seo';

/**
 * Sitewide Organization + WebSite JSON-LD, mounted once in Layout.jsx (not
 * App.jsx) — Layout wraps only the storefront route branch, so /admin/*
 * never emits this. Uses key 'site', distinct from each page's own 'page'
 * key (see useJsonLd), so the two coexist.
 */
export default function SiteSchema() {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${absoluteUrl('/')}#organization`,
        name: SITE.name,
        url: absoluteUrl('/'),
        logo: absoluteUrl(SITE.logo),
        sameAs: SITE.sameAs,
        contactPoint: {
          '@type': 'ContactPoint',
          email: SITE.email,
          contactType: 'customer support',
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${absoluteUrl('/')}#website`,
        url: absoluteUrl('/'),
        name: SITE.name,
        publisher: { '@id': `${absoluteUrl('/')}#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${absoluteUrl('/search')}?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  useJsonLd('site', graph);
  return null;
}
