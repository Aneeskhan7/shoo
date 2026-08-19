-- Supabase's Security Advisor flags every public table for having Row
-- Level Security disabled: any table in `public` (Supabase's default
-- schema) is auto-exposed via Supabase's PostgREST REST API, reachable by
-- anyone holding the project's `anon` key, independent of this app's own
-- Express API / auth. With RLS off, that's unauthenticated read/write
-- access to every row in every table — users, addresses, orders, etc.
--
-- This app never uses Supabase's PostgREST/client-SDK/Auth layer — the
-- Express server (server/src/config/prisma.js) connects straight to
-- Postgres via Prisma as the `postgres` role, which has BYPASSRLS (confirmed
-- live: `SELECT rolbypassrls FROM pg_roles WHERE rolname = 'postgres'` -> true).
-- `anon`/`authenticated` (the roles PostgREST connects as) do not have
-- BYPASSRLS. So: enabling RLS with zero policies below is a hard default-deny
-- for PostgREST/the anon key, and a complete no-op for this app's own
-- server, which never touches those roles.
ALTER TABLE public._prisma_migrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_condition_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
