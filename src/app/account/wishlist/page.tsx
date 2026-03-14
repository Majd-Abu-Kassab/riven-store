'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useCart } from '@/contexts/cart-context';
import { createClient } from '@/lib/supabase/client';
import { Product } from '@/types';
import ProductCard from '@/components/product-card';
import { Heart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import styles from '../account.module.css';

export default function WishlistPage() {
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();
        const fetch = async () => {
            try {
                const { data } = await supabase
                    .from('wishlists')
                    .select('*, product:products(*, category:categories(*))')
                    .eq('customer_id', user?.id);
                if (data) setProducts(data.map((w: any) => w.product).filter(Boolean));
            } catch { }
            setLoading(false);
        };
        if (user) fetch();
        else setLoading(false);
    }, [user]);

    return (
        <div className={styles.page}>
            <div className="container">
                <Link href="/account" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
                    <ArrowLeft size={16} /> My Account
                </Link>
                <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '32px' }}>Wishlist</h1>

                {loading ? (
                    <div className="page-loading"><span className="spinner spinner-lg" /></div>
                ) : products.length === 0 ? (
                    <div className="empty-state">
                        <Heart size={48} />
                        <h3>Your wishlist is empty</h3>
                        <p>Save products you love for later</p>
                        <Link href="/shop" className="btn btn-primary" style={{ marginTop: '16px' }}>
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
                        {products.map(p => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
