import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMyOrders, qk } from '../../lib/api';
import { formatPrice } from '../../components/ui/Price';
import { useAuthStore } from '../../store';
import { useAuthActions } from '../../hooks/useAuth';

const STATUS_TONE = {
  PENDING: 'bg-green text-black',
  CONFIRMED: 'bg-green text-black',
  PROCESSING: 'bg-black text-off-white',
  SHIPPED: 'bg-black text-off-white',
  DELIVERED: 'bg-black text-off-white',
  CANCELLED: 'bg-[#d3d3d3] text-grey-700',
  REFUNDED: 'bg-[#d3d3d3] text-grey-700',
};

/**
 * /account — a real dashboard distinct from /account/profile: quick links +
 * a recent-orders preview. Reuses listMyOrders (already scoped server-side
 * to the authenticated user, already cheap — OrderItem snapshots its own
 * product data, no catalog join) rather than a new endpoint.
 */
export default function AccountDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const { signOut } = useAuthActions();
  const { data, isLoading } = useQuery({ queryKey: qk.myOrders(), queryFn: getMyOrders });
  const recent = (data?.orders ?? []).slice(0, 3);

  return (
    <div>
      <h2 className="text-h1">Welcome back, {user?.firstName}.</h2>
      <p className="mt-2 text-[14px] text-grey-500">{user?.email}</p>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Link
          to="/account/orders"
          className="rounded-[8px] bg-white p-5 text-center text-[13px] font-semibold transition-opacity hover:opacity-80"
        >
          My Orders
        </Link>
        <Link
          to="/account/profile"
          className="rounded-[8px] bg-white p-5 text-center text-[13px] font-semibold transition-opacity hover:opacity-80"
        >
          Profile
        </Link>
        <Link
          to="/account/addresses"
          className="rounded-[8px] bg-white p-5 text-center text-[13px] font-semibold transition-opacity hover:opacity-80"
        >
          Addresses
        </Link>
        <button
          type="button"
          onClick={async () => {
            await signOut();
            navigate('/');
          }}
          className="rounded-[8px] bg-black p-5 text-center text-[13px] font-semibold text-off-white transition-opacity hover:opacity-85"
        >
          Logout
        </button>
      </div>

      <div className="mt-12">
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-bold">Recent Orders</h3>
          {recent.length > 0 && (
            <Link to="/account/orders" className="text-[13px] text-grey-500 hover:underline">
              View all →
            </Link>
          )}
        </div>

        {isLoading ? (
          <p className="mt-4 text-[14px] text-grey-500">Loading…</p>
        ) : recent.length === 0 ? (
          <div className="mt-4 rounded-[8px] bg-white p-12 text-center">
            <p className="text-[14px] text-grey-500">You haven’t placed any orders yet.</p>
            <Link
              to="/shop"
              className="mt-6 inline-flex rounded-full bg-black px-7 py-3 text-[13px] font-semibold text-off-white"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {recent.map((o) => (
              <Link
                key={o.id}
                to={`/account/orders/${o.orderNumber}`}
                className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-[8px] bg-white p-5 transition-opacity hover:opacity-85"
              >
                <p className="text-[14px] font-bold">#{o.orderNumber}</p>
                <p className="text-[12px] text-grey-500">
                  {o.items.length} item{o.items.length === 1 ? '' : 's'}
                </p>
                <span
                  className={`rounded-full px-3 py-[4px] text-[10px] font-bold tracking-[0.08em] ${
                    STATUS_TONE[o.status] ?? 'bg-[#d3d3d3] text-grey-700'
                  }`}
                >
                  {o.status}
                </span>
                <p className="ml-auto text-[15px] font-bold">
                  {formatPrice(o.total, { currency: true })}
                </p>
                <span className="text-[12px] font-medium text-grey-700 underline-offset-2 hover:underline">
                  View Order →
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
