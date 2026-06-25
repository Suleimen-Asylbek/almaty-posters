import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { authorized: false as const, error: 'Не авторизован', status: 401 };
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail && user.email !== adminEmail) {
    return { authorized: false as const, error: 'Доступ запрещён', status: 403 };
  }

  return { authorized: true as const, user };
}

interface Params {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: Params) {
  const auth = await verifyAdmin();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;

  try {
    const body = await req.json();

    const admin = createAdminClient();
    const { data, error } = await admin
      .from('products')
      .update({
        title: body.title,
        description: body.description ?? '',
        image_url: body.image_url,
        category_id: body.category_id,
        price_30x40: body.price_30x40,
        price_40x50: body.price_40x50,
        price_50x70: body.price_50x70,
        is_new: Boolean(body.is_new),
        featured: Boolean(body.featured),
        slug: body.slug,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Постер с таким названием уже существует. Измените название.' },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ product: data });
  } catch {
    return NextResponse.json({ error: 'Неверный формат запроса' }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const auth = await verifyAdmin();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;


  const admin = createAdminClient();

  // Look up the image path first so we can clean up storage too.
  const { data: product, error: findError } = await admin
    .from('products')
    .select('*')
    .eq('id', id)
    .single();



  const { error } = await admin
    .from('products')
    .delete()
    .eq('id', id);



  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Best-effort storage cleanup; ignore failures (e.g. external image URL).
  if (product?.image_url) {
    try {
      const url = new URL(product.image_url);
      const parts = url.pathname.split('/posters/');
      if (parts[1]) {
        await admin.storage.from('posters').remove([parts[1]]);
      }
    } catch {
      // non-fatal
    }
  }

  return NextResponse.json({ success: true });
}
