import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import Input from '../components/ui/Input';
import { useAuthActions } from '../hooks/useAuth';
import { useAuthStore } from '../store';
import Seo from '../components/seo/Seo';

/** SIGN IN — optional. Nothing in the shopping flow sends anyone here. */
export default function SignInPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || '/account';
  const { signIn } = useAuthActions();
  const user = useAuthStore((s) => s.user);

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  // Already signed in (e.g. a stale tab, or reached via a leftover link) —
  // no reason to show the form again.
  if (user) return <Navigate to={next} replace />;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { claimedOrders } = await signIn(form);
      navigate(claimedOrders > 0 ? '/account/orders' : next, { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-6 pt-[84px] text-off-white">
      <Seo title="Sign In" noindex />
      <div className="w-full max-w-[440px] py-20">
        <p className="text-eyebrow text-green">Members</p>
        <h1 className="text-display-l mt-5">SIGN IN</h1>
        <p className="mt-5 text-[15px] leading-[1.6] text-off-white/60">
          Track orders, save addresses and keep a wishlist. You never need an account to buy.
        </p>

        <form onSubmit={submit} className="mt-10 flex flex-col gap-4">
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
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
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
            {busy ? 'Signing in…' : 'SIGN IN'}
          </button>
        </form>

        <p className="mt-8 text-[14px] text-off-white/60">
          Not a member yet?{' '}
          <Link
            to={`/join?next=${encodeURIComponent(next)}`}
            className="font-bold text-green underline-offset-4 hover:underline"
          >
            JOIN SHOO
          </Link>
        </p>
        <p className="mt-3 text-[13px] text-off-white/40">
          <Link to="/shop" className="underline-offset-4 hover:underline">
            Continue shopping as a guest →
          </Link>
        </p>
      </div>
    </div>
  );
}
