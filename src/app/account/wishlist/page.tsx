'use client';

import { useAuth } from '@/contexts/auth-context';
import { useWishlist } from '@/contexts/wishlist-context';
import ProductCard from '@/components/product-card';
import { Heart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import styles from '../account.module.css';

export default function WishlistPage() {
    const { user } = useAuth();
    const { items, loading } = useWishlist();

    return (
        <div className={styles.page}>
            <div className="container">
                <Link href="/account" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
                    <ArrowLeft size={16} /> My Account
                </Link>
                <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '32px' }}>Wishlist</h1>

                {loading ? (
                    <div className="page-loading"><span className="spinner spinner-lg" /></div>
                ) : !user ? (
                    <div className="empty-state">
                        <Heart size={48} />
                        <h3>Please login to see your wishlist</h3>
                        <Link href="/login" className="btn btn-primary" style={{ marginTop: '16px' }}>
                            Login
                        </Link>
                    </div>
                ) : items.length === 0 ? (
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
                        {items.map(item => (
                            item.product && <ProductCard key={item.id} product={item.product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
