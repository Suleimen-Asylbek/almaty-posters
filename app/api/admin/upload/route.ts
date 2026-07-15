import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyAdmin } from '@/lib/supabase/auth';

/**
 * Moves poster-image writes to Storage behind the same admin gate every
 * other write in this project already goes through — verifyAdmin() is
 * shared from lib/supabase/auth.ts, not a local copy (it used to be
 * duplicated across all three admin API routes; centralized during
 * final cleanup).
 *
 * Why this route exists at all: ProductForm.tsx previously called
 * supabase.storage.from('posters').upload(...) directly from the
 * browser, using the anon-key client with the logged-in user's own
 * session. That meant Storage RLS — not this app's own admin check —
 * was the only thing standing between "authenticated Supabase user" and
 * "can write to the public posters bucket". Every other write in this
 * app (products table) already goes through an API route backed by
 * service_role, with isAuthorizedAdminEmail() as the actual gate. This
 * route brings Storage writes in line with that same pattern instead of
 * introducing a second, parallel authorization mechanism inside
 * Storage's own RLS policies.
 */

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const formData = await req.formData();
  const file = formData.get('file');
  const fileName = formData.get('fileName');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Файл не найден в запросе' }, { status: 400 });
  }

  if (typeof fileName !== 'string' || fileName.trim().length === 0) {
    return NextResponse.json({ error: 'Не указано имя файла' }, { status: 400 });
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: 'Допустимы только изображения JPEG, PNG или WebP' },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: 'Файл слишком большой (максимум 10 МБ)' },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const { error: uploadError } = await admin.storage
    .from('posters')
    .upload(fileName, file, { upsert: false, contentType: file.type });

  if (uploadError) {
    console.error('STORAGE UPLOAD ERROR:', uploadError);
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data } = admin.storage.from('posters').getPublicUrl(fileName);

  return NextResponse.json({ url: data.publicUrl }, { status: 201 });
}
