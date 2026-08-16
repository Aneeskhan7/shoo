/**
 * OrderItem never stored an image (it snapshots name/size/color/price at
 * purchase time, but no photo) — every order page (confirmation, account
 * history) was rendering the placeholder icon for that reason. This joins
 * each item's product's current primary photo at read time instead. A
 * product's photos can change after the order shipped, so this shows
 * today's primary shot rather than exactly what the customer saw at
 * checkout — a reasonable trade since OrderItem was never built to
 * snapshot one, and "today's photo" beats "no photo" for a visual reference.
 */
export const ORDER_ITEM_INCLUDE = {
  product: {
    select: {
      images: {
        where: { conditionCategory: null },
        orderBy: { position: 'asc' },
        take: 1,
        select: { url: true },
      },
    },
  },
};

export function shapeOrderItem(item) {
  const { product, ...rest } = item;
  return { ...rest, image: product?.images?.[0]?.url ?? null };
}

export function shapeOrder(order) {
  if (!order) return order;
  return { ...order, items: order.items?.map(shapeOrderItem) ?? order.items };
}
