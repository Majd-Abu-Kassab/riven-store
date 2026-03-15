import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase.from('profiles').select('*').eq('role', 'customer').order('created_at', { ascending: false });
        if (error) throw error;
        return NextResponse.json({ customers: data || [] });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
