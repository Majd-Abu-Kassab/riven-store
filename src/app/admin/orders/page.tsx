'use client';

import { useEffect, useState } from 'react';
import { Order } from '@/types';
import { Search, Eye, ChevronDown } from 'lucide-react';
import styles from '../products/products.module.css';

const STATUSES = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [statusFilter, setStatusFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            const res = await fetch('/api/admin/orders');
            if (res.ok) {
                const { orders: data } = await res.json();
                if (data) setOrders(data);
            }
        };
        fetchOrders();
    }, []);

    const filtered = orders.filter(o => {
        if (statusFilter !== 'all' && o.status !== statusFilter) return false;
        if (search && !o.order_number.toLowerCase().includes(search.toLowerCase()) && !o.shipping_name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const getStatusBadge = (status: string) => {
        const map: Record<string, string> = {
            pending: 'badge-warning', confirmed: 'badge-info', processing: 'badge-info',
            shipped: 'badge-primary', delivered: 'badge-success', cancelled: 'badge-error',
        };
        return map[status] || 'badge-info';
    };

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            await fetch('/api/admin/orders', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: orderId, status: newStatus }),
            });
        } catch { }
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as Order['status'] } : o));
        if (selectedOrder?.id === orderId) {
            setSelectedOrder(prev => prev ? { ...prev, status: newStatus as Order['status'] } : null);
        }
    };

    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.title}>Orders</h1>
            </div>

            <div className={styles.toolbar}>
                <div className={styles.searchWrap}>
                    <Search size={16} />
                    <input className="input" placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: '36px' }} />
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {STATUSES.map(s => (
                        <button
                            key={s}
                            className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setStatusFilter(s)}
                        >
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Order</th>
                            <th>Customer</th>
                            <th>Method</th>
                            <th>Status</th>
                            <th>Total</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(order => (
                            <tr key={order.id}>
                                <td style={{ fontWeight: 600 }}>{order.order_number}</td>
                                <td>{order.shipping_name}</td>
                                <td>
                                    <span className={`badge ${order.delivery_method === 'pickup' ? 'badge-info' : 'badge-primary'}`}>
                                        {order.delivery_method === 'pickup' ? 'Pickup' : 'Delivery'}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ position: 'relative', display: 'inline-block' }}>
                                        <select
                                            className="input select"
                                            value={order.status}
                                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                            style={{ padding: '4px 32px 4px 8px', fontSize: '12px', fontWeight: 600, borderRadius: '12px' }}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="processing">Processing</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </td>
                                <td style={{ fontWeight: 600 }}>${order.total.toFixed(2)}</td>
                                <td style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                                    {new Date(order.created_at).toLocaleDateString()}
                                </td>
                                <td>
                                    <button className="btn btn-ghost btn-icon" onClick={() => setSelectedOrder(order)} title="View Details">
                                        <Eye size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <>
                    <div className="overlay" onClick={() => setSelectedOrder(null)} />
                    <div className="modal">
                        <h2 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 700 }}>
                            Order {selectedOrder.order_number}
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--color-text-secondary)' }}>Status</span>
                                <span className={`badge ${getStatusBadge(selectedOrder.status)}`}>{selectedOrder.status}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--color-text-secondary)' }}>Method</span>
                                <span>{selectedOrder.delivery_method === 'pickup' ? 'In-Store Pickup' : 'Delivery'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--color-text-secondary)' }}>Customer</span>
                                <span>{selectedOrder.shipping_name}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--color-text-secondary)' }}>Phone</span>
                                <span>{selectedOrder.shipping_phone}</span>
                            </div>
                            {selectedOrder.shipping_address && (
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--color-text-secondary)' }}>Address</span>
                                    <span>{selectedOrder.shipping_address}, {selectedOrder.shipping_city}</span>
                                </div>
                            )}
                            {selectedOrder.notes && (
                                <div>
                                    <span style={{ color: 'var(--color-text-secondary)' }}>Notes</span>
                                    <p style={{ marginTop: '4px' }}>{selectedOrder.notes}</p>
                                </div>
                            )}
                            <div className="divider" />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '16px' }}>
                                <span>Total</span>
                                <span>${selectedOrder.total.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
                                <span>Date</span>
                                <span>{new Date(selectedOrder.created_at).toLocaleString()}</span>
                            </div>
                        </div>
                        <button className="btn btn-secondary" onClick={() => setSelectedOrder(null)} style={{ width: '100%', marginTop: '20px' }}>
                            Close
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
