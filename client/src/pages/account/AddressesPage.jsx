import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  qk,
} from '../../lib/api';
import Input from '../../components/ui/Input';

const EMPTY = {
  label: 'Home',
  firstName: '',
  lastName: '',
  phone: '',
  street: '',
  city: '',
  postalCode: '',
  country: 'Pakistan',
};

export default function AddressesPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: qk.addresses(), queryFn: getAddresses });
  const [form, setForm] = useState(EMPTY);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = adding new, else editing this address's id

  const refresh = () => qc.invalidateQueries({ queryKey: qk.addresses() });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const closeForm = () => {
    setOpen(false);
    setEditingId(null);
    setForm(EMPTY);
  };

  const startEdit = (a) => {
    setEditingId(a.id);
    setForm({
      label: a.label,
      firstName: a.firstName,
      lastName: a.lastName,
      phone: a.phone,
      street: a.street,
      city: a.city,
      postalCode: a.postalCode,
      country: a.country,
    });
    setOpen(true);
  };

  const add = useMutation({
    mutationFn: createAddress,
    onSuccess: () => {
      closeForm();
      refresh();
    },
  });
  const edit = useMutation({
    mutationFn: (payload) => updateAddress(editingId, payload),
    onSuccess: () => {
      closeForm();
      refresh();
    },
  });
  const saving = editingId ? edit : add;
  const makeDefault = useMutation({
    mutationFn: (id) => updateAddress(id, { isDefault: true }),
    onSuccess: refresh,
  });
  const remove = useMutation({ mutationFn: deleteAddress, onSuccess: refresh });
  const [confirmingId, setConfirmingId] = useState(null);

  const addresses = data?.addresses ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-h1">Saved Addresses</h2>
        <button
          type="button"
          onClick={() => (open ? closeForm() : setOpen(true))}
          className="rounded-full bg-black px-6 py-3 text-[13px] font-semibold text-off-white"
        >
          {open ? 'Cancel' : 'Add address'}
        </button>
      </div>

      <p className="mt-3 text-[13px] text-grey-500">
        Saved addresses prefill checkout. Cash on delivery is unchanged.
      </p>

      {open && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saving.mutate(form);
          }}
          className="mt-8 flex max-w-[720px] flex-col gap-4 rounded-[8px] bg-white p-6"
        >
          <h3 className="text-[14px] font-bold">{editingId ? 'Edit address' : 'New address'}</h3>
          <Input label="Label (Home, Work…)" name="label" value={form.label} onChange={set('label')} />
          <div className="flex flex-col gap-4 sm:flex-row">
            <Input label="First name" name="firstName" required value={form.firstName} onChange={set('firstName')} />
            <Input label="Last name" name="lastName" required value={form.lastName} onChange={set('lastName')} />
          </div>
          <Input label="Phone" name="phone" type="tel" required value={form.phone} onChange={set('phone')} />
          <Input label="Address" name="street" required value={form.street} onChange={set('street')} />
          <div className="flex flex-col gap-4 sm:flex-row">
            <Input label="City" name="city" required value={form.city} onChange={set('city')} />
            <Input label="Postal code" name="postalCode" required value={form.postalCode} onChange={set('postalCode')} />
            <Input label="Country" name="country" required value={form.country} onChange={set('country')} />
          </div>
          {saving.error && (
            <p role="alert" className="text-[13px] text-red-600">
              {saving.error.message}
            </p>
          )}
          <button
            type="submit"
            disabled={saving.isPending}
            className="mt-2 h-[52px] w-fit rounded-full bg-green px-8 text-[14px] font-bold text-black disabled:opacity-40"
          >
            {saving.isPending ? 'Saving…' : editingId ? 'Save changes' : 'Save address'}
          </button>
        </form>
      )}

      {isLoading ? (
        <p className="mt-8 text-[14px] text-grey-500">Loading addresses…</p>
      ) : addresses.length === 0 ? (
        <div className="mt-8 rounded-[8px] bg-white p-16 text-center">
          <h3 className="text-[18px] font-bold">No saved addresses</h3>
          <p className="mt-3 text-[14px] text-grey-500">
            Add one to skip typing it at checkout next time.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {addresses.map((a) => (
            <div key={a.id} className="rounded-[8px] bg-white p-6">
              <div className="flex items-center gap-2">
                <p className="text-[15px] font-bold">{a.label}</p>
                {a.isDefault && (
                  <span className="rounded-full bg-green px-2 py-[3px] text-[9px] font-bold tracking-[0.06em] text-black">
                    DEFAULT
                  </span>
                )}
              </div>
              <p className="mt-3 text-[13px] leading-[1.6] text-grey-700">
                {a.firstName} {a.lastName}
                <br />
                {a.street}
                <br />
                {a.city} {a.postalCode}
                <br />
                {a.country}
                <br />
                {a.phone}
              </p>
              <div className="mt-5 flex flex-wrap gap-4 text-[12px]">
                <button
                  type="button"
                  onClick={() => startEdit(a)}
                  className="text-grey-700 underline-offset-2 hover:underline"
                >
                  Edit
                </button>
                {!a.isDefault && (
                  <button
                    type="button"
                    onClick={() => makeDefault.mutate(a.id)}
                    className="text-grey-700 underline-offset-2 hover:underline"
                  >
                    Make default
                  </button>
                )}
                {confirmingId === a.id ? (
                  <>
                    <span className="text-grey-700">Remove this address?</span>
                    <button
                      type="button"
                      onClick={() => {
                        remove.mutate(a.id);
                        setConfirmingId(null);
                      }}
                      disabled={remove.isPending}
                      className="font-semibold text-red-600 underline-offset-2 hover:underline disabled:opacity-40"
                    >
                      {remove.isPending ? 'Removing…' : 'Confirm'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingId(null)}
                      className="text-grey-500 underline-offset-2 hover:underline"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmingId(a.id)}
                    className="text-grey-500 underline-offset-2 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
