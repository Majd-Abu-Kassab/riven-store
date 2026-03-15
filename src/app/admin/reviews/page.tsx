'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Review, Product, Profile } from '@/types';
import { Star, Trash2, Check, X, RefreshCw, MessageSquare } from 'lucide-react';
import styles from './reviews.module.css';

interface AdminReview extends Review {
    product: Product;
    customer: Profile;
}

export default function AdminReviews() {
    const [reviews, setReviews] = useState<AdminReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);

    const fetchReviews = async () => {
        setLoading(true);
        const supabase = createClient();
        try {
            const { data, error } = await supabase
                .from('reviews')
                .select('*, product:products(name), customer:profiles(full_name, email)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReviews(data || []);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this review?')) return;
        setDeleting(id);
        const supabase = createClient();
        try {
            const { error } = await supabase
                .from('reviews')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setReviews(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            alert('Failed to delete review');
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Product Reviews</h1>
                    <p className={styles.subtitle}>Manage customer feedback and ratings</p>
                </div>
                <button onClick={fetchReviews} className="btn btn-secondary btn-sm">
                    <RefreshCw size={16} className={loading ? 'spinner' : ''} />
                    Refresh
                </button>
            </header>

            {loading ? (
                <div className={styles.loading}>
                    <span className="spinner spinner-lg"></span>
                </div>
            ) : reviews.length === 0 ? (
                <div className={styles.emptyState}>
                    <MessageSquare size={48} />
                    <h3>No reviews found</h3>
                    <p>When customers review products, they will appear here.</p>
                </div>
            ) : (
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Product</th>
                                <th>Rating</th>
                                <th>Comment</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reviews.map(review => (
                                <tr key={review.id}>
                                    <td>
                                        <div className={styles.customerInfo}>
                                            <strong>{review.customer?.full_name || 'Deleted User'}</strong>
                                            <span>{review.customer?.email}</span>
                                        </div>
                                    </td>
                                    <td>{review.product?.name}</td>
                                    <td>
                                        <div className={styles.rating}>
                                            <Star size={14} fill="var(--color-warning)" stroke="var(--color-warning)" />
                                            <span>{review.rating}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <p className={styles.comment}>{review.comment}</p>
                                    </td>
                                    <td>{new Date(review.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <button 
                                            onClick={() => handleDelete(review.id)}
                                            className="btn btn-ghost btn-sm text-error"
                                            disabled={deleting === review.id}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
