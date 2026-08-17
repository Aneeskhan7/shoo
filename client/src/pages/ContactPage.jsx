import { useState } from 'react';
import Input from '../components/ui/Input';
import { submitContact } from '../lib/api';
import Seo from '../components/seo/Seo';

const EMPTY = { name: '', email: '', subject: '', message: '' };

/**
 * Contact Us — no dedicated Figma frame exists, so this follows the same
 * dark single-column form pattern as JoinShooPage/SignInPage rather than
 * inventing a new layout language.
 */
export default function ContactPage() {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await submitContact(form);
      setSent(true);
      setForm(EMPTY);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-black px-6 pt-[84px] text-off-white">
      <Seo
        title="Contact"
        description="Question about an order, sizing, or a drop? Send it over — a real person on the SHOO team replies to every message."
        canonical="/contact"
      />
      <div className="mx-auto max-w-[560px] py-20">
        <p className="text-eyebrow text-green">Get in touch</p>
        <h1 className="text-display-l mt-5">CONTACT US</h1>
        <p className="mt-5 text-[15px] leading-[1.6] text-off-white/60">
          Question about an order, sizing, or a drop? Send it over — a real person on the SHOO
          team replies to every message.
        </p>

        {sent ? (
          <div
            role="status"
            className="mt-10 rounded-[8px] border border-green/30 bg-green/10 p-6"
          >
            <p className="text-[15px] font-semibold text-green">Message sent.</p>
            <p className="mt-2 text-[13px] leading-[1.6] text-off-white/70">
              Thanks for reaching out — we'll get back to you at your email soon.
            </p>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="mt-5 text-[13px] font-bold text-green underline-offset-4 hover:underline"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-10 flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <Input
                label="Name"
                name="name"
                autoComplete="name"
                required
                value={form.name}
                onChange={set('name')}
              />
              <Input
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={set('email')}
              />
            </div>
            <Input
              label="Subject"
              name="subject"
              required
              value={form.subject}
              onChange={set('subject')}
            />

            <div className="w-full">
              <div className="relative w-full rounded-[8px] border border-current/20 px-[18px] pb-[14px] pt-[14px] transition-colors focus-within:border-green">
                <label htmlFor="message" className="block text-[13px] leading-none opacity-60">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={set('message')}
                  className="mt-[8px] w-full resize-none bg-transparent text-[16px] leading-[1.5] outline-none placeholder:opacity-30"
                />
              </div>
            </div>

            {error && (
              <p role="alert" className="rounded-[8px] bg-red-500/15 p-4 text-[13px] text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="mt-2 h-[54px] rounded-full bg-green text-[14px] font-bold tracking-[0.02em] text-black disabled:opacity-50"
            >
              {busy ? 'Sending…' : 'SEND MESSAGE'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
