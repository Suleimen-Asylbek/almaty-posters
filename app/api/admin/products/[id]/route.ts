import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyAdmin } from '@/lib/supabase/auth';
import { buildImagePayload } from '@/lib/product-images';

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
      .update({
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

  const { data: product, error } = await admin
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { error: deleteError } = await admin
    .from('products')
    .delete()
    .eq('id', id);



  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  const imageUrls = Array.isArray(product?.images)
    ? product.images.filter((value: unknown): value is string => typeof value === 'string' && value.trim().length > 0)
    : [];

  const fallbackImageUrl = typeof product?.image_url === 'string' && product.image_url.trim().length > 0
    ? product.image_url
    : null;

  const cleanupTargets = fallbackImageUrl ? [fallbackImageUrl, ...imageUrls.filter((url: string) => url !== fallbackImageUrl)] : imageUrls;

  for (const imageUrl of cleanupTargets) {
    try {
      const url = new URL(imageUrl);
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
