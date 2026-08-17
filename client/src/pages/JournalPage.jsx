import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPosts, qk } from '../lib/api';
import Seo from '../components/seo/Seo';

const fmt = (d) => new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

/** /journal — published posts, newest first. Infrastructure only; the user
 *  writes the actual posts through /admin/blog. */
export default function JournalPage() {
  const { data, isLoading, error } = useQuery({ queryKey: qk.posts({}), queryFn: () => getPosts({}) });
  const posts = data?.posts ?? [];

  return (
    <div className="min-h-screen bg-off-white pt-[120px] text-black lg:pt-[128px]">
      <Seo
        title="Journal"
        description="Notes on drops, sourcing, and what SHOO is thinking about."
        canonical="/journal"
      />
      <header className="px-6 pb-10 pt-12 lg:px-20">
        <p className="text-eyebrow text-grey-500">SHOO</p>
        <h1 className="text-display-l mt-4">Journal</h1>
      </header>

      <div className="px-6 pb-24 lg:px-20">
        {isLoading ? (
          <p className="text-[13px] text-grey-500">Loading…</p>
        ) : error ? (
          <p className="text-[13px] text-red-600">{error.message}</p>
        ) : posts.length === 0 ? (
          <p className="text-[13px] text-grey-500">Nothing published yet — check back soon.</p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.slug}
                to={`/journal/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-[8px] border-[0.5px] border-[#d3d3d3] bg-white"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-[#f2f2f2]">
                  {post.coverImage && (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  {post.publishedAt && (
                    <p className="text-[11px] tracking-[0.05em] text-grey-500">{fmt(post.publishedAt)}</p>
                  )}
                  <h2 className="text-[18px] font-bold tracking-[-0.01em]">{post.title}</h2>
                  {post.excerpt && <p className="text-[13px] leading-[1.55] text-grey-700">{post.excerpt}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
