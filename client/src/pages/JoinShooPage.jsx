import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import Input from '../components/ui/Input';
import { useAuthActions } from '../hooks/useAuth';
import { useAuthStore } from '../store';
import Seo from '../components/seo/Seo';

const BENEFITS = [
  ['Order history', 'Every pair you’ve bought, in one place.'],
  ['Saved addresses', 'Check out faster next time — still cash on delivery.'],
  ['Wishlist', 'Keep the ones you’re deciding on.'],
  ['Early access', 'Drops before they go public.'],
];

/**
 * JOIN SHOO — optional membership. Reached only from the account menu, the
 * sign-in page, or the post-order offer. Never from the checkout flow.
 */
export default function JoinShooPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || '/account';
  const prefillEmail = params.get('email') || '';
  const { join } = useAuthActions();
  const user = useAuthStore((s) => s.user);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: prefillEmail,
    password: '',
  });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  // Already a member — no reason to show the signup form again.
  if (user) return <Navigate to={next} replace />;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { claimedOrders } = await join(form);
      // If joining pulled in past guest orders, show them straight away.
      navigate(claimedOrders > 0 ? '/account/orders' : next, { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-black px-6 pt-[84px] text-off-white">
      <Seo title="Join SHOO" noindex />
      <div className="mx-auto flex max-w-[1100px] flex-col gap-16 py-20 lg:flex-row lg:gap-24">
        <div className="w-full max-w-[440px]">
          <p className="text-eyebrow text-green">Membership</p>
          <h1 className="text-display-l mt-5">JOIN SHOO</h1>
          <p className="mt-5 text-[15px] leading-[1.6] text-off-white/60">
            Free, optional, and never required to buy.
          </p>

          <form onSubmit={submit} className="mt-10 flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <Input
                label="First name"
                name="firstName"
                autoComplete="given-name"
                required
                value={form.firstName}
                onChange={set('firstName')}
              />
              <Input
                label="Last name"
                name="lastName"
                autoComplete="family-name"
                required
                value={form.lastName}
                onChange={set('lastName')}
              />
            </div>
            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={set('email')}
            />
            <Input
              label="Password (8+ characters)"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={form.password}
              onChange={set('password')}
            />

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
              {busy ? 'Creating your account…' : 'JOIN SHOO'}
            </button>
          </form>

          <p className="mt-8 text-[14px] text-off-white/60">
            Already a member?{' '}
            <Link
              to={`/sign-in?next=${encodeURIComponent(next)}`}
              className="font-bold text-green underline-offset-4 hover:underline"
            >
              SIGN IN
            </Link>
          </p>
          <p className="mt-3 text-[13px] text-off-white/40">
            <Link to="/shop" className="underline-offset-4 hover:underline">
              Continue shopping as a guest →
            </Link>
          </p>
        </div>

        <ul className="flex flex-1 flex-col gap-6 lg:pt-[120px]">
          {BENEFITS.map(([title, note]) => (
            <li key={title} className="flex gap-4">
              <span
                className="mt-[3px] flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-green text-[12px] text-black"
                aria-hidden="true"
              >
                ✓
              </span>
              <span>
                <span className="block text-[15px] font-semibold">{title}</span>
                <span className="block text-[13px] text-off-white/55">{note}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
