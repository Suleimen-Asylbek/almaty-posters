import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

/**
 * The single source of truth for "is this email allowed to administer the
 * store." Three call sites in this codebase used to each implement their
 * own copy of this check — `requireAdmin` below, plus the two admin API
 * route handlers — and all three shared the same bug:
 *
 *   if (adminEmail && user.email !== adminEmail) { ...deny... }
 *
 * When `ADMIN_EMAIL` was unset, `adminEmail` was falsy, the whole
 * condition short-circuited to `false`, and the check was skipped
 * entirely — silently granting admin access (both the `/admin` UI *and*
 * the write API) to *any* authenticated Supabase user. Fail-open on a
 * missing config value is the wrong default for an authorization check;
 * this fails closed instead: no `ADMIN_EMAIL` means no admin access for
 * anyone, full stop, with a loud server-side log so a misconfigured
 * environment is visible in logs rather than silently permissive.
 *
 * Do not re-implement this check locally anywhere else — import this.
 */
export function isAuthorizedAdminEmail(email: string | null | undefined): boolean {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    console.error(
      'SECURITY: ADMIN_EMAIL is not set. Denying admin access to all users ' +
        'until it is configured — see lib/supabase/auth.ts.',
    );
    return false;
  }

  return email === adminEmail;
}

/**
 * Returns the currently authenticated Supabase user, or redirects to
 * /admin/login if there is no session or the session isn't authorized.
 *
 * Authorization is enforced two ways:
 *  1. Supabase Auth must have a valid session (the user is logged in).
 *  2. The user's email must pass isAuthorizedAdminEmail() above.
 *     For multi-admin setups, replace that check with a Supabase RLS
 *     policy backed by an `admins` table or a custom claim instead.
 *
 * The admin panel relies on Supabase Auth, so unlike the public storefront
 * it can't fall back to mock data — if Supabase isn't configured yet we
 * redirect to the login screen with a clear error instead of crashing.
 */
export async function requireAdmin(): Promise<User> {
  let user: User | null = null;

  try {
    const supabase = await createClient();
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch {
    redirect('/admin/login?error=not_configured');
  }

  if (!user) {
    redirect('/admin/login');
  }

  if (!isAuthorizedAdminEmail(user.email)) {
    redirect('/admin/login?error=unauthorized');
  }

  return user;
}

export async function getAdminUser(): Promise<User | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

/**
 * The API-route counterpart to requireAdmin() above — same check
 * (isAuthorizedAdminEmail), but returns a result object instead of
 * redirecting, since API routes need to respond with JSON + a status
 * code, not a Next.js redirect. Was duplicated verbatim across all three
 * admin API routes (products, products/[id], upload); centralized here
 * so there's exactly one place that can get this check wrong, not three.
 */
export async function verifyAdmin(): Promise<
  | { authorized: true; user: User }
  | { authorized: false; error: string; status: number }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { authorized: false, error: 'Не авторизован', status: 401 };
  }

  if (!isAuthorizedAdminEmail(user.email)) {
    return { authorized: false, error: 'Доступ запрещён', status: 403 };
  }

  return { authorized: true, user };
}
