import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyAdmin } from '@/lib/supabase/auth';
import { buildImagePayload } from '@/lib/product-images';




export async function POST(req: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();

    const required = ['title', 'category_id', 'price_30x40', 'price_40x50', 'price_50x70'];
    for (const field of required) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        return NextResponse.json(
          { error: `Поле "${field}" обязательно для заполнения` },
          { status: 400 }
        );
      }
    }

    const hasImageInput =
      (typeof body.image_url === 'string' && body.image_url.trim().length > 0) ||
      (Array.isArray(body.images) && body.images.some((value: unknown) => typeof value === 'string' && value.trim().length > 0));

    if (!hasImageInput) {
      return NextResponse.json(
        { error: 'Добавьте хотя бы одно изображение' },
        { status: 400 }
      );
    }

    const { image_url, images } = buildImagePayload(body.image_url, body.images);

    const admin = createAdminClient();
    const { data, error } = await admin
      .from('products')
      .insert({
        title: body.title,
        description: body.description ?? '',
        image_url,
        images,
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

