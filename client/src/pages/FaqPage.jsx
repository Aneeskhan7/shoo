import { Link } from 'react-router-dom';
import Seo from '../components/seo/Seo';

/**
 * FAQ — content drawn from facts already live elsewhere in the app
 * (CheckoutPage's Cash on Delivery flow, SHIPPING_METHODS' real costs/ETAs,
 * CartPage's "Free 30-day returns" line, the thrift condition-report model)
 * rather than invented. FAQPage JSON-LD is legitimate here since this is
 * genuinely structured Q&A, not marketing copy dressed up as one.
 */
const FAQS = [
  {
    q: 'How do I pay?',
    a: 'SHOO is Cash on Delivery only — you pay when your order arrives, no card or online payment needed.',
  },
  {
    q: 'What are the shipping options and costs?',
    a: 'Standard Shipping is PKR 250 and arrives in 5–7 business days. Express Shipping is PKR 350, 2–3 business days. Next Day Delivery is PKR 700, 1 business day.',
  },
  {
    q: 'Are the shoes new or used?',
    a: 'Every pair on SHOO is pre-loved and comes with its own condition report — clear photos and notes on wear (outsole, heel, etc.) so you know exactly what you\'re getting before you buy.',
  },
  {
    q: 'What\'s your return policy?',
    a: 'Free returns within 30 days of delivery. If a pair isn\'t right, send it back at no cost to you.',
  },
  {
    q: 'How do I find my size?',
    a: 'Check the Size Guide for full US, UK, EU and cm conversions, plus how to measure at home.',
  },
  {
    q: 'Do you ship nationwide?',
    a: 'Yes — SHOO delivers across Pakistan with Cash on Delivery on every order.',
  },
];

export default function FaqPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <div className="bg-off-white text-black">
      <Seo
        title="FAQ"
        description="Payment, shipping costs and timelines, our pre-loved condition model, returns, and sizing — answered."
        canonical="/faq"
        jsonLd={jsonLd}
      />

      <section className="relative flex min-h-[420px] flex-col justify-center bg-black px-6 py-24 text-off-white lg:px-20">
        <span className="inline-flex w-fit items-center rounded-full bg-green px-[14px] py-[8px] text-[10px] font-bold tracking-[0.12em] text-black">
          FAQ
        </span>
        <h1
          className="mt-[26px] font-black tracking-[-0.04em]"
          style={{ fontSize: 'clamp(40px, 7vw, 96px)', lineHeight: 0.9 }}
        >
          Questions,
          <br />
          answered.
        </h1>
      </section>

      <section className="bg-off-white px-6 py-20 lg:px-20">
        <div className="mx-auto flex max-w-[760px] flex-col divide-y divide-[#d3d3d3] border-t border-[#d3d3d3]">
          {FAQS.map((f) => (
            <details key={f.q} className="group py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[17px] font-semibold tracking-[-0.01em]">
                {f.q}
                <span className="shrink-0 text-[20px] text-grey-500 transition-transform group-open:rotate-45" aria-hidden="true">
                  +
                </span>
              </summary>
              <p className="mt-4 max-w-[640px] text-[15px] leading-[1.7] text-grey-700">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="flex flex-col items-center bg-black px-6 py-20 text-center text-off-white lg:py-24">
        <h2 className="font-black tracking-[-0.03em]" style={{ fontSize: 'clamp(32px, 5vw, 64px)' }}>
          Still have a question?
        </h2>
        <div className="mt-10 flex flex-wrap justify-center gap-[16px]">
          <Link
            to="/contact"
            className="rounded-full bg-green px-[32px] py-[16px] text-[14px] font-bold tracking-[0.02em] text-black transition-opacity hover:opacity-85"
          >
            Contact us →
          </Link>
          <Link
            to="/size-guide"
            className="rounded-full border border-[#4D4D4D] bg-white px-[32px] py-[16px] text-[14px] font-semibold tracking-[0.02em] text-grey-700 transition-opacity hover:opacity-85"
          >
            Size Guide
          </Link>
        </div>
      </section>
    </div>
  );
}
