'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Category } from '@/types';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import styles from './categories.module.css';

const DEMO_CATEGORIES: Category[] = [
    { id: '1', name: 'Electronics', slug: 'electronics', description: 'Latest gadgets, audio gear, and smart devices', image_url: '', sort_order: 1, created_at: '' },
    { id: '2', name: 'Fashion', slug: 'fashion', description: 'Trending styles, accessories, and footwear', image_url: '', sort_order: 2, created_at: '' },
    { id: '3', name: 'Home & Living', slug: 'home-living', description: 'Decor, furniture, and lifestyle products', image_url: '', sort_order: 3, created_at: '' },
    { id: '4', name: 'Sports & Outdoors', slug: 'sports', description: 'Fitness gear, activewear, and equipment', image_url: '', sort_order: 4, created_at: '' },
    { id: '5', name: 'Beauty & Health', slug: 'beauty-health', description: 'Skincare, wellness, and personal care', image_url: '', sort_order: 5, created_at: '' },
    { id: '6', name: 'Books & Stationery', slug: 'books', description: 'Books, planners, and office supplies', image_url: '', sort_order: 6, created_at: '' },
];

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        const supabase = createClient();
        const fetchCategories = async () => {
            try {
                const { data } = await supabase.from('categories').select('*').order('sort_order');
                if (data && data.length > 0) setCategories(data);
            } catch { }
        };
        fetchCategories();
    }, []);

    return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.header}>
                    <h1 className={styles.title}>Categories</h1>
                    <p className={styles.subtitle}>Browse our curated collections</p>
                </div>

                <div className={styles.grid}>
                    {categories.map((cat) => (
                        <Link key={cat.id} href={`/categories/${cat.slug}`} className={styles.card}>
                            <div className={styles.cardIcon}>
                                <ShoppingBag size={32} />
                            </div>
                            <div className={styles.cardContent}>
                                <h2 className={styles.cardName}>{cat.name}</h2>
                                <p className={styles.cardDesc}>{cat.description}</p>
                                <span className={styles.cardLink}>
                                    Explore <ArrowRight size={14} />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
