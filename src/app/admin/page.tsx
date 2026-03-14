'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DollarSign, Package, ShoppingCart, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import styles from './dashboard.module.css';

interface DashboardStats {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
    recentOrders: Array<{
        id: string;
        order_number: string;
        status: string;
        total: number;
        shipping_name: string;
        created_at: string;
    }>;
    lowStockProducts: Array<{
        id: string;
        name: string;
        stock_quantity: number;
    }>;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalRevenue: 12450.00,
        totalOrders: 48,
        totalProducts: 156,
        totalCustomers: 234,
        recentOrders: [
            { id: '1', order_number: 'RVN-001234', status: 'pending', total: 89.99, shipping_name: 'Ahmed Ali', created_at: new Date().toISOString() },
            { id: '2', order_number: 'RVN-001233', status: 'confirmed', total: 249.98, shipping_name: 'Sara Hassan', created_at: new Date(Date.now() - 3600000).toISOString() },
            { id: '3', order_number: 'RVN-001232', status: 'shipped', total: 34.99, shipping_name: 'Omar Khaled', created_at: new Date(Date.now() - 7200000).toISOString() },
            { id: '4', order_number: 'RVN-001231', status: 'delivered', total: 174.99, shipping_name: 'Nour Saleh', created_at: new Date(Date.now() - 86400000).toISOString() },
        ],
        lowStockProducts: [
            { id: '1', name: 'Leather Backpack', stock_quantity: 3 },
            { id: '2', name: 'Minimalist Watch', stock_quantity: 5 },
            { id: '3', name: 'Running Shoes', stock_quantity: 0 },
        ],
    });

    useEffect(() => {
        const supabase = createClient();
        const fetchStats = async () => {
            try {
                const [ordersRes, productsRes, profilesRes] = await Promise.all([
                    supabase.from('orders').select('*'),
                    supabase.from('products').select('*'),
                    supabase.from('profiles').select('*').eq('role', 'customer'),
                ]);

                if (ordersRes.data) {
                    const totalRevenue = ordersRes.data.reduce((sum, o) => sum + (o.total || 0), 0);
                    const recentOrders = ordersRes.data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);

                    setStats(prev => ({
                        ...prev,
                        totalRevenue,
                        totalOrders: ordersRes.data!.length,
                        recentOrders,
                    }));
                }

                if (productsRes.data) {
                    const lowStock = productsRes.data.filter(p => p.stock_quantity <= 5).sort((a, b) => a.stock_quantity - b.stock_quantity);
                    setStats(prev => ({
                        ...prev,
                        totalProducts: productsRes.data!.length,
                        lowStockProducts: lowStock,
                    }));
                }

                if (profilesRes.data) {
                    setStats(prev => ({
                        ...prev,
                        totalCustomers: profilesRes.data!.length,
                    }));
                }
            } catch { }
        };
        fetchStats();
    }, []);

    const getStatusBadge = (status: string) => {
        const map: Record<string, string> = {
            pending: 'badge-warning',
            confirmed: 'badge-info',
            processing: 'badge-info',
            shipped: 'badge-primary',
            delivered: 'badge-success',
            cancelled: 'badge-error',
        };
        return map[status] || 'badge-info';
    };

    return (
        <div className={styles.dashboard}>
            <h1 className={styles.title}>Dashboard</h1>

            {/* KPI Cards */}
            <div className={styles.kpiGrid}>
                <div className={`${styles.kpiCard} ${styles.kpiRevenue}`}>
                    <div className={styles.kpiIcon}>
                        <DollarSign size={22} />
                    </div>
                    <div>
                        <p className={styles.kpiLabel}>Total Revenue</p>
                        <p className={styles.kpiValue}>${stats.totalRevenue.toFixed(2)}</p>
                    </div>
                </div>
                <div className={`${styles.kpiCard} ${styles.kpiOrders}`}>
                    <div className={styles.kpiIcon}>
                        <ShoppingCart size={22} />
                    </div>
                    <div>
                        <p className={styles.kpiLabel}>Total Orders</p>
                        <p className={styles.kpiValue}>{stats.totalOrders}</p>
                    </div>
                </div>
                <div className={`${styles.kpiCard} ${styles.kpiProducts}`}>
                    <div className={styles.kpiIcon}>
                        <Package size={22} />
                    </div>
                    <div>
                        <p className={styles.kpiLabel}>Products</p>
                        <p className={styles.kpiValue}>{stats.totalProducts}</p>
                    </div>
                </div>
                <div className={`${styles.kpiCard} ${styles.kpiCustomers}`}>
                    <div className={styles.kpiIcon}>
                        <Users size={22} />
                    </div>
                    <div>
                        <p className={styles.kpiLabel}>Customers</p>
                        <p className={styles.kpiValue}>{stats.totalCustomers}</p>
                    </div>
                </div>
            </div>

            <div className={styles.gridRow}>
                {/* Recent Orders */}
                <div className={styles.panel}>
                    <h2 className={styles.panelTitle}>Recent Orders</h2>
                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Order</th>
                                    <th>Customer</th>
                                    <th>Status</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentOrders.map(order => (
                                    <tr key={order.id}>
                                        <td style={{ fontWeight: 600 }}>{order.order_number}</td>
                                        <td>{order.shipping_name}</td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 600 }}>${order.total.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Low Stock Alerts */}
                <div className={styles.panel}>
                    <h2 className={styles.panelTitle}>
                        <AlertTriangle size={18} />
                        Low Stock Alerts
                    </h2>
                    <div className={styles.alertList}>
                        {stats.lowStockProducts.map(product => (
                            <div key={product.id} className={styles.alertItem}>
                                <span className={styles.alertName}>{product.name}</span>
                                <span className={`badge ${product.stock_quantity === 0 ? 'badge-error' : 'badge-warning'}`}>
                                    {product.stock_quantity === 0 ? 'Out of stock' : `${product.stock_quantity} left`}
                                </span>
                            </div>
                        ))}
                        {stats.lowStockProducts.length === 0 && (
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>All products are well stocked!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
