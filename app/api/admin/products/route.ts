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

export async function POST(req: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();

    const required = ['title', 'image_url', 'category_id', 'price_30x40', 'price_40x50', 'price_50x70'];
    for (const field of required) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        return NextResponse.json(
          { error: `Поле "${field}" обязательно для заполнения` },
          { status: 400 }
        );
      }
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from('products')
      .insert({
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
      .select()
      .single();

    if (error) {
      console.error('SUPABASE ERROR:', error);

      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Постер с таким названием уже существует. Измените название.' },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          error: error.message,
          details: error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ product: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Неверный формат запроса' }, { status: 400 });
  }
}

export async function GET() {
  const auth = await verifyAdmin();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("products")
    .select(`
      id,
      title,
      slug,
      image_url,
      price_30x40,
      price_40x50,
      price_50x70,
      featured,
      is_new,
      category:categories(name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ products: data });
}

export async function DELETE(req: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID требуется' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('products')
    .delete()
    .eq('id', id)
    .select();



  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Продукт удален', product: data });
}
