import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { marked } from 'marked';
import { getPost, qk } from '../lib/api';
import Seo from '../components/seo/Seo';
import { absoluteUrl, clampDescription } from '../lib/seo';

const fmt = (d) => new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

export default function JournalPostPage() {
  const { slug } = useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: qk.post(slug),
    queryFn: () => getPost(slug),
    retry: false,
  });
  const post = data?.post;

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

  // Trusted-author content only — posts are written by the admin (the same
  // trust boundary as every other admin-authored field in this app), so
  // this doesn't sanitize the rendered markdown separately.
  const html = marked.parse(post.content);

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

      <article className="mx-auto max-w-[720px] px-6 pb-24 pt-[140px] lg:pt-[148px]">
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
    </div>
  );
}
