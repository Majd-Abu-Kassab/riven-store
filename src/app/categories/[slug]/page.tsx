'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import ProductCard from '@/components/product-card';
import { Product, Category } from '@/types';
import { ArrowLeft, Search } from 'lucide-react';
import styles from '../categories.module.css';
import shopStyles from '../../shop/shop.module.css';

export default function CategoryDetailPage() {
    const params = useParams();
    const [category, setCategory] = useState<Category | null>(null);
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        const supabase = createClient();
        const fetchData = async () => {
            try {
                const { data: cat } = await supabase
                    .from('categories')
                    .select('*')
                    .eq('slug', params.slug)
                    .single();
                if (cat) {
                    setCategory(cat);
                    const { data: prods } = await supabase
                        .from('products')
                        .select('*, category:categories(*)')
                        .eq('category_id', cat.id)
                        .eq('is_active', true)
                        .order('created_at', { ascending: false });
                    if (prods) setProducts(prods);
                }
            } catch { }
        };
        fetchData();
    }, [params.slug]);

    return (
        <div className={styles.page}>
            <div className="container">
                <Link href="/categories" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
                    <ArrowLeft size={16} /> All Categories
                </Link>
                <div className={styles.header}>
                    <h1 className={styles.title}>{category?.name || (params.slug as string)}</h1>
                    <p className={styles.subtitle}>{category?.description || 'Loading...'}</p>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginTop: '8px' }}>
                        {products.length} products
                    </p>
                </div>

                {products.length === 0 ? (
                    <div className="empty-state">
                        <Search size={48} />
                        <h3>No products yet</h3>
                        <p>Products will appear here once added to this category</p>
                    </div>
                ) : (
                    <div className={shopStyles.productGrid}>
                        {products.map(p => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
