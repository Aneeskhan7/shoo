import Hero from '../components/hero/Hero';
import CollectionSection from '../components/home/CollectionSection';
import ComfortSection from '../components/home/ComfortSection';
import FutureSection from '../components/home/FutureSection';

/** Homepage — Figma 38:2 (1440×6340). Section order matches the frame. */
export default function HomePage() {
  return (
    <>
      <Hero />
      <CollectionSection />
      <ComfortSection />
      <FutureSection />
    </>
  );
}
