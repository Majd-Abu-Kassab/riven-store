'use client';

import { useEffect, useState } from 'react';
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
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalCustomers: 0,
        recentOrders: [],
        lowStockProducts: [],
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/admin/dashboard');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
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
