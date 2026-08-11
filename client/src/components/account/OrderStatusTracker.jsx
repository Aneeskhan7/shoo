/**
 * Visual progress indicator for the existing OrderStatus enum — no second
 * status system, just a rendering of the one that already exists
 * (server/prisma/schema.prisma). CANCELLED/REFUNDED are terminal exceptions
 * to the normal flow, so they render as a banner instead of a step position.
 */
const STEPS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
const LABELS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
};

export default function OrderStatusTracker({ status }) {
  if (status === 'CANCELLED' || status === 'REFUNDED') {
    const cancelled = status === 'CANCELLED';
    return (
      <div className="rounded-[8px] border border-red-200 bg-red-50 px-5 py-4">
        <p className="text-[13px] font-bold text-red-700">
          {cancelled ? 'Order Cancelled' : 'Refunded'}
        </p>
        <p className="mt-1 text-[12px] text-red-600">
          {cancelled
            ? 'This order was cancelled and will not be processed further.'
            : 'This order has been refunded.'}
        </p>
      </div>
    );
  }

  const currentIndex = STEPS.indexOf(status);

  return (
    <div className="flex items-start" role="list" aria-label="Order status">
      {STEPS.map((s, i) => {
        const done = i <= currentIndex;
        return (
          <div key={s} className="flex flex-1 items-center last:flex-none" role="listitem">
            <div className="flex flex-col items-center gap-2">
              <span
                className={`flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors ${
                  done ? 'bg-green text-black' : 'bg-black/10 text-grey-500'
                }`}
                aria-current={i === currentIndex ? 'step' : undefined}
              >
                {done ? '✓' : i + 1}
              </span>
              <span
                className={`whitespace-nowrap text-[10px] font-medium tracking-[0.04em] ${
                  done ? 'text-black' : 'text-grey-500'
                }`}
              >
                {LABELS[s].toUpperCase()}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span className={`mx-2 h-px flex-1 ${i < currentIndex ? 'bg-green' : 'bg-black/10'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
