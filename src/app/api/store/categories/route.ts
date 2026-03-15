import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase.from('categories').select('*').order('sort_order');
        if (error) throw error;
        return NextResponse.json({ categories: data || [] });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
