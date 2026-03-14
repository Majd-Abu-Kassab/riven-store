'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';
import { Order } from '@/types';
import { Package, ShoppingBag, User, Clock, Truck, Store, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import styles from './account.module.css';

export default function AccountPage() {
    const { profile } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();
        const fetch = async () => {
            try {
                const { data } = await supabase
                    .from('orders')
                    .select('*, items:order_items(*)')
                    .order('created_at', { ascending: false });
                if (data) setOrders(data);
            } catch { }
            setLoading(false);
        };
        fetch();
    }, []);

    const getStatusBadge = (status: string) => {
        const map: Record<string, string> = {
            pending: 'badge-warning', confirmed: 'badge-info', processing: 'badge-info',
            shipped: 'badge-primary', delivered: 'badge-success', cancelled: 'badge-error',
        };
        return map[status] || 'badge-info';
    };

    return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.header}>
                    <div className={styles.avatar}>
                        {profile?.full_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                        <h1 className={styles.name}>{profile?.full_name || 'My Account'}</h1>
                        <p className={styles.email}>{profile?.email}</p>
                    </div>
                </div>

                <div className={styles.quickLinks}>
                    <Link href="/account/profile" className={styles.quickLink}>
                        <User size={20} />
                        <span>Profile Settings</span>
                        <ArrowRight size={16} />
                    </Link>
                    <Link href="/account/wishlist" className={styles.quickLink}>
                        <ShoppingBag size={20} />
                        <span>Wishlist</span>
                        <ArrowRight size={16} />
                    </Link>
                </div>

                <h2 className={styles.sectionTitle}>My Orders</h2>

                {loading ? (
                    <div className="page-loading"><span className="spinner spinner-lg" /></div>
                ) : orders.length === 0 ? (
                    <div className="empty-state">
                        <Package size={48} />
                        <h3>No orders yet</h3>
                        <p>Start shopping to see your order history here</p>
                        <Link href="/shop" className="btn btn-primary" style={{ marginTop: '16px' }}>
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className={styles.orderList}>
                        {orders.map(order => (
                            <div key={order.id} className={styles.orderCard}>
                                <div className={styles.orderHeader}>
                                    <div>
                                        <span className={styles.orderNum}>{order.order_number}</span>
                                        <span className={styles.orderDate}>{new Date(order.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span className={`badge ${order.delivery_method === 'pickup' ? 'badge-info' : 'badge-primary'}`}>
                                            {order.delivery_method === 'pickup' ? <><Store size={12} /> Pickup</> : <><Truck size={12} /> Delivery</>}
                                        </span>
                                        <span className={`badge ${getStatusBadge(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                                <div className={styles.orderFooter}>
                                    <span className={styles.orderTotal}>${order.total.toFixed(2)}</span>
                                    {order.items && (
                                        <span className={styles.orderItems}>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
