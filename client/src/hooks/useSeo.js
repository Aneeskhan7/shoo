import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SITE, absoluteUrl, buildTitle, clampDescription } from '../lib/seo';

/** Finds (or creates once) a `<meta>`/`<link>` tag, tagged `data-seo` so it's
 *  identifiable and reused across renders/routes rather than added and
 *  removed on every navigation. */
function upsertTag(selector, create) {
  let el = document.querySelector(selector);
  if (!el) {
    el = create();
    el.setAttribute('data-seo', '');
    document.head.appendChild(el);
  }
  return el;
}

const metaByName = (name) =>
  upsertTag(`meta[name="${name}"]`, () => {
    const m = document.createElement('meta');
    m.setAttribute('name', name);
    return m;
  });

const metaByProp = (prop) =>
  upsertTag(`meta[property="${prop}"]`, () => {
    const m = document.createElement('meta');
    m.setAttribute('property', prop);
    return m;
  });

/**
 * Per-route title/meta/canonical/OG/Twitter tags. Custom hook, not
 * react-helmet-async — this app has no SSR (Helmet's actual reason to
 * exist), every page needs exactly one call with no nesting, and this
 * avoids a dependency that's been effectively unmaintained since 2023.
 *
 * Always writes a COMPLETE set on every call — no restore-on-unmount.
 * Routes are lazy() + Suspense; during a transition React can unmount the
 * outgoing page after the incoming page's effect has already run, so a
 * "save old value, restore on cleanup" pattern would clobber the new
 * page's title with the old one moments later. Writing everything fresh
 * every time sidesteps that ordering problem entirely and is idempotent
 * under React 18 StrictMode's double-invocation.
 *
 * `noindex` is always written explicitly (`index,follow` or
 * `noindex,nofollow`) — never left unset — so a noindex from e.g.
 * /checkout can never leak onto the next route the user visits.
 */
export function useSeo({ title, description, canonical, image, type = 'website', noindex = false }) {
  const { pathname } = useLocation();

  useEffect(() => {
    const resolvedTitle = buildTitle(title);
    const resolvedDescription = clampDescription(description);
    const resolvedCanonical = canonical ? absoluteUrl(canonical) : absoluteUrl(pathname);
    const resolvedImage = absoluteUrl(image || SITE.defaultImage);

    document.title = resolvedTitle;

    metaByName('description').setAttribute('content', resolvedDescription);
    metaByName('robots').setAttribute('content', noindex ? 'noindex,nofollow' : 'index,follow');

    upsertTag('link[rel="canonical"]', () => {
      const l = document.createElement('link');
      l.setAttribute('rel', 'canonical');
      return l;
    }).setAttribute('href', resolvedCanonical);

    metaByProp('og:title').setAttribute('content', resolvedTitle);
    metaByProp('og:description').setAttribute('content', resolvedDescription);
    metaByProp('og:type').setAttribute('content', type);
    metaByProp('og:url').setAttribute('content', resolvedCanonical);
    metaByProp('og:image').setAttribute('content', resolvedImage);
    metaByProp('og:site_name').setAttribute('content', SITE.name);

    metaByName('twitter:card').setAttribute('content', 'summary_large_image');
    metaByName('twitter:title').setAttribute('content', resolvedTitle);
    metaByName('twitter:description').setAttribute('content', resolvedDescription);
    metaByName('twitter:image').setAttribute('content', resolvedImage);
  }, [title, description, canonical, image, type, noindex, pathname]);
}
