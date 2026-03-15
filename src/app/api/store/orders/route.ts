import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const body = await request.json();
        const { order, items } = body;

        const { data: newOrder, error: orderError } = await supabase
            .from('orders')
            .insert(order)
            .select()
            .single();

        if (orderError) throw orderError;

        if (items && items.length > 0) {
            const orderItems = items.map((item: any) => ({ ...item, order_id: newOrder.id }));
            const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
            if (itemsError) throw itemsError;
        }

        return NextResponse.json({ order: newOrder });
    } catch (error: any) {
        console.error('Order placement error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
