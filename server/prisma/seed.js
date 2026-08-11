/**
 * Seed data mirrors the copy in the Figma file so the built pages read like the
 * design: product names, colorways, prices and review text all come from frames.
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SIZES = ['US 7', 'US 8', 'US 9', 'US 10', 'US 11'];
// Kids run on their own scale — matches the kids' chart in the size guide.
const KIDS_SIZES = ['US 11K', 'US 13K', 'US 1', 'US 2', 'US 3'];

const COLORS = {
  deepNoir: { colorName: 'Deep Noir', colorHex: '#0A0A0A' },
  boneWhite: { colorName: 'Bone White', colorHex: '#F5F4F0' },
  ashStorm: { colorName: 'Ash Storm', colorHex: '#808080' },
  ghostWhite: { colorName: 'Ghost White', colorHex: '#E8E6E1' },
  electricBlack: { colorName: 'Electric Black', colorHex: '#141414' },
};

const PRODUCTS = [
  {
    name: 'SHOO DRIFT ONE',
    slug: 'shoo-drift-one',
    tagline: 'Engineered for speed. Designed to turn heads.',
    silhouette: 'Runners',
    category: 'runners',
    gender: 'UNISEX',
    price: 41500,
    isFeatured: true,
    colors: [COLORS.deepNoir, COLORS.boneWhite],
    tags: ['new-release', 'bestseller'],
    story:
      'Every shoe on SHOO is personally tested before it lists. We curate brands that earn their place — no filler, no noise.',
  },
  {
    name: 'SHOO ORBIT LX',
    slug: 'shoo-orbit-lx',
    tagline: 'Move differently. Built for the long walk.',
    silhouette: 'Lifestyle',
    category: 'lifestyle',
    gender: 'UNISEX',
    price: 47500,
    isFeatured: true,
    colors: [COLORS.boneWhite, COLORS.ashStorm],
    tags: ['new-release'],
    story: 'A long-haul silhouette with a cushioned ride that holds up past hour ten.',
  },
  {
    name: 'SHOO PULSE',
    slug: 'shoo-pulse',
    tagline: 'Daily rhythm. Zero compromise.',
    silhouette: 'Runners',
    category: 'runners',
    gender: 'UNISEX',
    price: 36000,
    isFeatured: true,
    colors: [COLORS.ashStorm, COLORS.deepNoir],
    tags: ['bestseller'],
    story: 'The everyday runner — light, responsive, and quietly built to last.',
  },
  {
    name: 'SHOO GROUND X',
    slug: 'shoo-ground-x',
    tagline: 'Grip the city.',
    silhouette: 'Trainers',
    category: 'lifestyle',
    gender: 'MEN',
    price: 44500,
    isFeatured: true,
    colors: [COLORS.electricBlack, COLORS.ashStorm],
    tags: ['new-release'],
    story: 'Outsole tuned for wet pavement and long transit days.',
  },
  {
    name: 'SHOO FORM LOW',
    slug: 'shoo-form-low',
    tagline: 'Clean lines, all day.',
    silhouette: 'Low-Top',
    category: 'lifestyle',
    gender: 'UNISEX',
    price: 33500,
    colors: [COLORS.boneWhite, COLORS.deepNoir],
    tags: ['bestseller'],
    story: 'A pared-back low top that disappears into any fit.',
  },
  {
    name: 'SHOO DRIFT LACE',
    slug: 'shoo-drift-lace',
    tagline: 'The Drift, laced up.',
    silhouette: 'Runners',
    category: 'runners',
    gender: 'WOMEN',
    price: 39000,
    colors: [COLORS.ghostWhite, COLORS.deepNoir],
    tags: [],
    story: 'Drift geometry with a refined lacing system and a narrower last.',
  },
  {
    name: 'SHOO DRIFT LOW',
    slug: 'shoo-drift-low',
    tagline: 'Dropped profile. Same drive.',
    silhouette: 'Low-Top',
    category: 'runners',
    gender: 'UNISEX',
    price: 37500,
    colors: [COLORS.deepNoir, COLORS.ashStorm],
    tags: [],
    story: 'A lower collar for a faster on-off and a cleaner ankle line.',
  },
  {
    name: 'SHOO DRIFT HI',
    slug: 'shoo-drift-hi',
    tagline: 'Ankle up.',
    silhouette: 'High-Top',
    category: 'lifestyle',
    gender: 'MEN',
    price: 43000,
    colors: [COLORS.electricBlack, COLORS.boneWhite],
    tags: ['new-release'],
    story: 'High collar, padded throat, built for cold mornings.',
  },
  {
    name: 'SHOO DRIFT SPORT',
    slug: 'shoo-drift-sport',
    tagline: 'Train, then keep going.',
    silhouette: 'Trainers',
    category: 'runners',
    gender: 'UNISEX',
    price: 40500,
    colors: [COLORS.ashStorm, COLORS.boneWhite],
    tags: [],
    story: 'Wider platform and a firmer heel for lateral work.',
  },
  {
    name: 'SHOO DRIFT LITE',
    slug: 'shoo-drift-lite',
    tagline: 'Barely there.',
    silhouette: 'Runners',
    category: 'runners',
    gender: 'WOMEN',
    price: 34500,
    colors: [COLORS.ghostWhite, COLORS.ashStorm],
    tags: ['sale'],
    story: 'The lightest Drift yet — a summer-weight upper over the same midsole.',
  },
  {
    name: 'SHOO DRIFT SLIDE',
    slug: 'shoo-drift-slide',
    tagline: 'Off-duty.',
    silhouette: 'Slide',
    category: 'lifestyle',
    gender: 'UNISEX',
    price: 22000,
    colors: [COLORS.deepNoir, COLORS.boneWhite],
    tags: ['sale'],
    story: 'Recovery slide with the Drift midsole foam.',
  },
  {
    name: 'SHOO DRIFT SOCK',
    slug: 'shoo-drift-sock',
    tagline: 'Second skin.',
    silhouette: 'Sock',
    category: 'lifestyle',
    gender: 'WOMEN',
    price: 30500,
    colors: [COLORS.electricBlack, COLORS.ghostWhite],
    tags: [],
    story: 'A knit sock upper that moves with the foot and packs flat.',
  },
  // KIDS — the nav has a KIDS category and the size guide ships a kids' chart,
  // so the catalogue needs stock behind that link.
  {
    name: 'SHOO DRIFT MINI',
    slug: 'shoo-drift-mini',
    tagline: 'The Drift, sized down.',
    silhouette: 'Runners',
    category: 'runners',
    gender: 'KIDS',
    price: 19500,
    sizes: KIDS_SIZES,
    colors: [COLORS.deepNoir, COLORS.boneWhite],
    tags: ['new-release'],
    story: 'Same midsole, lighter build, and a strap they can fasten themselves.',
  },
  {
    name: 'SHOO PULSE KIDS',
    slug: 'shoo-pulse-kids',
    tagline: 'Playground tested.',
    silhouette: 'Low-Top',
    category: 'lifestyle',
    gender: 'KIDS',
    price: 16500,
    sizes: KIDS_SIZES,
    colors: [COLORS.ashStorm, COLORS.ghostWhite],
    tags: ['bestseller'],
    story: 'A scuff-resistant toe and a washable upper, because they will.',
  },
];

// Review copy lifted from the PDP frame (39:91 / 39:100 / 39:109).
const REVIEWS = [
  {
    authorName: 'Hamza R.',
    rating: 5,
    body: "Most comfortable shoes I've owned. Cushioning is incredible.",
    size: 'US 10',
    fit: 'True to size',
    verified: true,
  },
  {
    authorName: 'Sana M.',
    rating: 5,
    body: 'Saw them on Instagram. Worth every penny — the green detail catches everyone\'s eye.',
    size: 'US 8',
    fit: 'True to size',
    verified: true,
  },
  {
    authorName: 'Bilal K.',
    rating: 4,
    body: 'Half size up if wide feet. Otherwise perfect — lightweight and great grip.',
    size: 'US 11',
    fit: 'Snug — half size up',
    verified: true,
  },
];

async function main() {
  console.log('Clearing existing data…');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productTag.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  await prisma.promoCode.deleteMany();

  const brand = await prisma.brand.create({
    data: {
      name: 'SHOO',
      slug: 'shoo',
      description: 'Premium sneakers. Streetwear. Curated for every step.',
      logoUrl: '/brand/logo.png',
    },
  });

  const categories = {};
  for (const [slug, name] of [
    ['runners', 'Runners'],
    ['lifestyle', 'Lifestyle'],
  ]) {
    categories[slug] = await prisma.category.create({ data: { name, slug } });
  }

  console.log('Seeding products…');
  for (const p of PRODUCTS) {
    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        tagline: p.tagline,
        description: p.story,
        story: p.story,
        silhouette: p.silhouette,
        gender: p.gender,
        isFeatured: Boolean(p.isFeatured),
        brandId: brand.id,
        categoryId: categories[p.category].id,
        tags: { create: p.tags.map((tag) => ({ tag })) },
        images: {
          create: p.colors.map((c, i) => ({
            url: '',
            altText: `${p.name} — ${c.colorName}`,
            colorName: c.colorName,
            position: i,
            isPrimary: i === 0,
          })),
        },
        variants: {
          create: p.colors.flatMap((c, ci) =>
            (p.sizes ?? SIZES).map((size, si) => ({
              size,
              colorName: c.colorName,
              colorHex: c.colorHex,
              price: p.price,
              // Deliberately uneven, with one guaranteed sold-out variant per
              // product so empty/out-of-stock states are exercisable.
              stock: ci === 1 && si === 0 ? 0 : 4 + ((si * 3 + ci * 2) % 12),
              sku: `${p.slug}-${c.colorName.toLowerCase().replace(/\s+/g, '')}-${size.replace(/\s+/g, '')}`.toUpperCase(),
            })),
          ),
        },
      },
    });

    if (['shoo-drift-one', 'shoo-orbit-lx', 'shoo-pulse'].includes(p.slug)) {
      await prisma.review.createMany({
        data: REVIEWS.map((r) => ({ ...r, productId: product.id })),
      });
    }
  }

  console.log('Seeding users…');
  const password = await bcrypt.hash('password123', 10);
  await prisma.user.createMany({
    data: [
      { email: 'admin@shoo.com', password, firstName: 'Anees', lastName: 'Khan', role: 'ADMIN' },
      { email: 'customer@shoo.com', password, firstName: 'Sara', lastName: 'Ahmed' },
    ],
  });

  console.log('Seeding promo codes…');
  await prisma.promoCode.createMany({
    data: [
      { code: 'DROP01', type: 'PERCENT', value: 10, minOrder: 28000, maxUses: 500 },
      { code: 'SHOO20', type: 'FIXED', value: 5500, minOrder: 42000, maxUses: 200 },
      {
        code: 'EXPIRED',
        type: 'PERCENT',
        value: 50,
        expiresAt: new Date('2025-01-01'),
        isActive: false,
      },
    ],
  });

  const counts = {
    products: await prisma.product.count(),
    variants: await prisma.productVariant.count(),
    reviews: await prisma.review.count(),
  };
  console.log('Done:', counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
