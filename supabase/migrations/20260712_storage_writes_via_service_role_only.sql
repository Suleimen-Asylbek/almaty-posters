-- Storage writes now go exclusively through POST /api/admin/upload
-- (service_role client, gated by isAuthorizedAdminEmail()). Browser
-- clients no longer need — and must not have — direct insert/update/
-- delete access to the posters bucket. This drops the old policies that
-- granted that to any authenticated Supabase user, not just this app's
-- admin.
--
-- Idempotent: safe to run against a database that already has the old
-- policies, and safe to re-run if it's already been applied (DROP ...
-- IF EXISTS on policies that no longer exist is a no-op, not an error).

drop policy if exists "Authenticated users can upload poster images" on storage.objects;
drop policy if exists "Authenticated users can update poster images" on storage.objects;
drop policy if exists "Authenticated users can delete poster images" on storage.objects;

-- "Public can view poster images" (select) is intentionally left as-is —
-- reading posters was always meant to be public, that never changed.
