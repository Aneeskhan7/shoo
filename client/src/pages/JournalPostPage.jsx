import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { marked } from 'marked';
import { getPost, getPosts, qk } from '../lib/api';
import Seo from '../components/seo/Seo';
import { absoluteUrl, clampDescription } from '../lib/seo';

const fmt = (d) => new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

const slugifyHeading = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');

// Every h2/h3 gets a stable id (built from the same raw token.text the TOC
// list below reads, so the two never drift apart) and enough top
// scroll-margin to clear the fixed nav + promo strip on a native jump —
// belt-and-braces alongside the explicit Lenis-aware scroll in
// scrollToHeading(), which is what actually runs on a TOC click.
marked.use({
  renderer: {
    heading({ tokens, depth, text }) {
      const slug = slugifyHeading(text);
      const html = this.parser.parseInline(tokens);
      return `<h${depth} id="${slug}" class="scroll-mt-[160px]">${html}</h${depth}>\n`;
    },
  },
});

function scrollToHeading(e, slug) {
  e.preventDefault();
  const el = document.getElementById(slug);
  if (!el) return;
  if (window.__lenis) window.__lenis.scrollTo(el, { offset: -160 });
  else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  window.history.replaceState(null, '', `#${slug}`);
}

export default function JournalPostPage() {
  const { slug } = useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: qk.post(slug),
    queryFn: () => getPost(slug),
    retry: false,
  });
  const post = data?.post;

  // Right rail — a handful of other posts to keep readers on the site
  // instead of the page dead-ending. Deliberately not gated on `post`
  // being loaded — it's independent content, no reason to wait.
  const { data: postsData } = useQuery({ queryKey: qk.posts({}), queryFn: () => getPosts({}) });
  const otherPosts = (postsData?.posts ?? []).filter((p) => p.slug !== slug).slice(0, 3);

  // Trusted-author content only — posts are written by the admin (the same
  // trust boundary as every other admin-authored field in this app), so
  // this doesn't sanitize the rendered markdown separately.
  const html = useMemo(() => (post ? marked.parse(post.content) : ''), [post]);

  // Table of contents from the post's own h2/h3s — same slugify as the
  // renderer above, so these ids always resolve.
  const toc = useMemo(() => {
    if (!post) return [];
    return marked
      .lexer(post.content)
      .filter((t) => t.type === 'heading' && (t.depth === 2 || t.depth === 3))
      .map((t) => ({ text: t.text, slug: slugifyHeading(t.text), depth: t.depth }));
  }, [post]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-off-white text-black">
        <Seo title="Journal" noindex />
        <span className="text-eyebrow text-grey-500">Loading…</span>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-off-white px-6 text-center text-black">
        <Seo title="Post not found" noindex />
        <h1 className="text-display-l">This post doesn't exist.</h1>
        <Link to="/journal" className="rounded-full bg-black px-8 py-[16px] text-[14px] font-bold text-off-white">
          ← Back to Journal
        </Link>
      </div>
    );
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || clampDescription(post.content),
    image: post.coverImage ? [post.coverImage] : undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: absoluteUrl(`/journal/${post.slug}`),
  };

  return (
    <div className="min-h-screen bg-off-white text-black">
      <Seo
        title={post.title}
        description={post.excerpt || undefined}
        image={post.coverImage || undefined}
        type="article"
        canonical={`/journal/${post.slug}`}
        jsonLd={jsonLd}
      />

      <div
        className={`mx-auto grid max-w-[1240px] gap-x-10 px-6 pb-24 pt-[140px] lg:pt-[148px] ${
          toc.length > 0 ? 'lg:grid-cols-[200px_1fr_280px]' : 'lg:grid-cols-[1fr_280px]'
        }`}
      >
        {/* On this page — sticky, desktop only. A short read doesn't need
            one and a mobile screen doesn't have the width for it, so it's
            simply omitted rather than squeezed in. */}
        {toc.length > 0 && (
          <aside className="hidden lg:block">
            <div className="sticky top-[160px]">
              <p className="text-[11px] font-bold tracking-[0.12em] text-grey-500">ON THIS PAGE</p>
              <nav className="mt-4 flex flex-col gap-[10px] border-l border-black/10 text-[13px] leading-[1.4]">
                {toc.map((h) => (
                  <a
                    key={h.slug}
                    href={`#${h.slug}`}
                    onClick={(e) => scrollToHeading(e, h.slug)}
                    className={`border-l-2 border-transparent py-[1px] text-grey-600 transition-colors hover:border-black hover:text-black ${
                      h.depth === 3 ? 'pl-7' : 'pl-4'
                    }`}
                  >
                    {h.text}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        )}

        <article className="min-w-0">
          <Link to="/journal" className="text-[12px] tracking-[0.02em] text-grey-500 hover:text-black">
            ← Journal
          </Link>
          {post.publishedAt && <p className="mt-6 text-[12px] tracking-[0.05em] text-grey-500">{fmt(post.publishedAt)}</p>}
          <h1 className="text-display-l mt-3">{post.title}</h1>

          {post.coverImage && (
            <div className="mt-10 aspect-[16/9] w-full overflow-hidden rounded-[8px] bg-[#f2f2f2]">
              <img src={post.coverImage} alt={post.title} className="h-full w-full object-cover" />
            </div>
          )}

          <div
            className="prose prose-neutral mt-10 max-w-none text-[16px] leading-[1.75] text-grey-800 [&_a]:text-black [&_a]:underline [&_h2]:mt-10 [&_h2]:text-[26px] [&_h2]:font-black [&_h3]:mt-8 [&_h3]:text-[20px] [&_h3]:font-bold [&_p]:mt-5 [&_ul]:mt-5 [&_ul]:list-disc [&_ul]:pl-6"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </article>

        {/* Right rail — sticky, desktop only: other posts + a shop CTA so
            the wide gutter next to a narrow article column actually does
            something instead of sitting empty. */}
        <aside className="hidden lg:block">
          <div className="sticky top-[160px] flex flex-col gap-8">
            {otherPosts.length > 0 && (
              <div>
                <p className="text-[11px] font-bold tracking-[0.12em] text-grey-500">MORE FROM THE JOURNAL</p>
                <div className="mt-4 flex flex-col gap-5">
                  {otherPosts.map((p) => (
                    <Link key={p.slug} to={`/journal/${p.slug}`} className="group block">
                      {p.coverImage && (
                        <div className="aspect-[4/3] w-full overflow-hidden rounded-[6px] bg-[#f2f2f2]">
                          <img
                            src={p.coverImage}
                            alt={p.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      )}
                      <p className="mt-2 text-[13px] font-bold leading-snug group-hover:underline">{p.title}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-[10px] bg-black p-6 text-off-white">
              <p className="text-[13px] font-bold">Shop the drop</p>
              <p className="mt-2 text-[12px] leading-[1.5] text-off-white/70">
                Curated sneakers, real prices, real availability.
              </p>
              <Link
                to="/shop"
                className="mt-4 inline-flex rounded-full bg-green px-5 py-[10px] text-[12px] font-bold tracking-[0.01em] text-black transition-opacity hover:opacity-85"
              >
                Browse the Collection →
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
