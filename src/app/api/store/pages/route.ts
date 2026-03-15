import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');

        if (!slug) return NextResponse.json({ error: 'Slug required' }, { status: 400 });

        const { data, error } = await supabase
            .from('site_pages')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        return NextResponse.json({ page: data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
