import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile, qk } from '../../lib/api';
import { useAuthStore } from '../../store';
import Input from '../../components/ui/Input';

export default function ProfilePage() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const { data } = useQuery({ queryKey: qk.profile(), queryFn: getProfile });

  const [form, setForm] = useState({ firstName: '', lastName: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data?.user) setForm({ firstName: data.user.firstName, lastName: data.user.lastName });
  }, [data]);

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (d) => {
      setUser(d.user);
      qc.invalidateQueries({ queryKey: qk.profile() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  const counts = data?.counts;

  return (
    <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
      <section className="max-w-[520px] flex-1">
        <h2 className="text-h1">Profile</h2>
        <form
          className="mt-8 flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate(form);
          }}
        >
          <div className="flex flex-col gap-4 sm:flex-row">
            <Input
              label="First name"
              name="firstName"
              value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
            />
            <Input
              label="Last name"
              name="lastName"
              value={form.lastName}
              onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
            />
          </div>
          <p className="text-[13px] text-grey-500">
            Email {data?.user.email} — contact us to change this.
          </p>

          {mutation.error && (
            <p role="alert" className="text-[13px] text-red-600">
              {mutation.error.message}
            </p>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="mt-2 h-[52px] w-fit rounded-full bg-black px-8 text-[14px] font-bold text-off-white disabled:opacity-40"
          >
            {mutation.isPending ? 'Saving…' : saved ? 'Saved ✓' : 'Save changes'}
          </button>
        </form>
      </section>

      <aside className="lg:w-[320px]">
        <h3 className="text-eyebrow text-grey-500">At a glance</h3>
        <div className="mt-5 flex flex-col gap-3">
          {[
            ['Orders', counts?.orders, '/account/orders'],
            ['Wishlist', counts?.wishlist, '/account/wishlist'],
            ['Saved addresses', counts?.addresses, '/account/addresses'],
          ].map(([label, value, to]) => (
            <Link
              key={label}
              to={to}
              className="flex items-center justify-between rounded-[8px] bg-white p-5 transition-opacity hover:opacity-80"
            >
              <span className="text-[14px]">{label}</span>
              <span className="text-[20px] font-bold">{value ?? '—'}</span>
            </Link>
          ))}
        </div>
      </aside>
    </div>
  );
}
