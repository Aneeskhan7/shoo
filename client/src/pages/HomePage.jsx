import Seo from '../components/seo/Seo';
import Hero from '../components/hero/Hero';
import CollectionSection from '../components/home/CollectionSection';
import ComfortSection from '../components/home/ComfortSection';
import TrendingSection from '../components/home/TrendingSection';

/** Homepage — Figma 38:2 (1440×6340). Section order matches the frame. */
export default function HomePage() {
  return (
    <>
      <Seo canonical="/" />
      {/* Hero's giant "SHOO" wordmark is a decorative background layer
          (near-invisible on desktop, aria-hidden on mobile) — it was
          previously the page's only <h1>, and mobile had none at all. This
          is the one real, keyword-bearing heading for the page; visually
          hidden so it doesn't compete with the wordmark's design. */}
      <h1 className="sr-only">SHOO — Premium Sneakers &amp; Streetwear in Pakistan</h1>
      <Hero />
      <CollectionSection />
      <ComfortSection />
      <TrendingSection />
    </>
  );
}
