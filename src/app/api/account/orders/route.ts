import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/account/orders — returns orders for the currently logged in user
export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ orders: [] });

        const { data, error } = await supabase
            .from('orders')
            .select('*, items:order_items(*)')
            .eq('customer_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json({ orders: data || [] });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
