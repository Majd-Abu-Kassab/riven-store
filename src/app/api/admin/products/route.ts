import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return NextResponse.json({ products: data || [] });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Verify the user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify the user is an admin
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { id, ...payload } = body;

        if (id) {
            // Update existing product
            const { error } = await supabase.from('products').update(payload).eq('id', id);
            if (error) throw error;
        } else {
            // Insert new product
            const { error } = await supabase.from('products').insert(payload);
            if (error) throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Product save error:', error);
        return NextResponse.json({ error: error.message || 'Failed to save product' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
        }

        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
