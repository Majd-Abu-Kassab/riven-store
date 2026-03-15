import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/store/products?active=true&featured=true&limit=8&category=slug
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const activeOnly = searchParams.get('active') === 'true';
        const featuredOnly = searchParams.get('featured') === 'true';
        const limit = searchParams.get('limit');
        const categorySlug = searchParams.get('category');

        let query = supabase.from('products').select('*, category:categories(*)');

        if (activeOnly) query = query.eq('is_active', true);
        if (featuredOnly) query = query.eq('is_featured', true);
        if (categorySlug) query = query.eq('categories.slug', categorySlug);

        query = query.order('created_at', { ascending: false });
        if (limit) query = query.limit(parseInt(limit));

        const { data, error } = await query;
        if (error) throw error;

        return NextResponse.json({ products: data || [] });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
