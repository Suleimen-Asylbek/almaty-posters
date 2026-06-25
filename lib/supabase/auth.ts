import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

/**
 * Returns the currently authenticated Supabase user, or redirects to
 * /admin/login if there is no session.
 *
 * Authorization is enforced two ways:
 *  1. Supabase Auth must have a valid session (the user is logged in).
 *  2. The user's email must match ADMIN_EMAIL (simple allow-list approach).
 *     For multi-admin setups, replace this check with a Supabase RLS
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

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail && user.email !== adminEmail) {
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
