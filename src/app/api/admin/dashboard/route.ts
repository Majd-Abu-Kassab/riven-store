import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const [ordersRes, productsRes, profilesRes] = await Promise.all([
            supabase.from('orders').select('*').order('created_at', { ascending: false }),
            supabase.from('products').select('*'),
            supabase.from('profiles').select('*').eq('role', 'customer'),
        ]);

        const orders = ordersRes.data || [];
        const products = productsRes.data || [];
        const customers = profilesRes.data || [];

        const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
        const recentOrders = [...orders].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);
        const lowStockProducts = products.filter((p: any) => p.stock_quantity <= 5).sort((a: any, b: any) => a.stock_quantity - b.stock_quantity);

        return NextResponse.json({
            totalRevenue,
            totalOrders: orders.length,
            totalProducts: products.length,
            totalCustomers: customers.length,
            recentOrders,
            lowStockProducts,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
