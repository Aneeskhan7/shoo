import { useEffect } from 'react';
import { safeJsonLd } from '../lib/seo';

/**
 * Manages one `<script type="application/ld+json" data-seo-jsonld="{key}">`
 * per key, so e.g. the sitewide Organization/WebSite schema (key: 'site')
 * and a per-page Product schema (key: 'page') coexist without clobbering
 * each other. Writes via `.textContent`, never `dangerouslySetInnerHTML` —
 * the browser never HTML-parses script textContent, so this is safe by
 * construction even with untrusted admin-authored product/post data.
 *
 * Pass `data: null` to remove the slot's script tag entirely (e.g. a PDP
 * with a product that failed to load).
 */
export function useJsonLd(key, data) {
  const json = data ? safeJsonLd(data) : null;

  useEffect(() => {
    const selector = `script[data-seo-jsonld="${key}"]`;
    let el = document.querySelector(selector);

    if (!json) {
      el?.remove();
      return undefined;
    }

    if (!el) {
      el = document.createElement('script');
      el.type = 'application/ld+json';
      el.setAttribute('data-seo-jsonld', key);
      document.head.appendChild(el);
    }
    el.textContent = json;

    return undefined;
  }, [key, json]);
}
