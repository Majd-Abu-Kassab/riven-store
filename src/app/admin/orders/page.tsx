'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Order } from '@/types';
import { Search, Eye, ChevronDown } from 'lucide-react';
import styles from '../products/products.module.css';

const DEMO_ORDERS: Order[] = [
    { id: '1', order_number: 'RVN-001234', customer_id: '1', status: 'pending', delivery_method: 'delivery', subtotal: 89.99, shipping_cost: 5, tax: 0, total: 94.99, shipping_name: 'Ahmed Ali', shipping_phone: '0501234567', shipping_address: '123 Main St', shipping_city: 'Amman', created_at: new Date().toISOString(), updated_at: '' },
    { id: '2', order_number: 'RVN-001233', customer_id: '2', status: 'confirmed', delivery_method: 'pickup', subtotal: 249.98, shipping_cost: 0, tax: 0, total: 249.98, shipping_name: 'Sara Hassan', shipping_phone: '0509876543', created_at: new Date(Date.now() - 3600000).toISOString(), updated_at: '' },
    { id: '3', order_number: 'RVN-001232', customer_id: '3', status: 'shipped', delivery_method: 'delivery', subtotal: 34.99, shipping_cost: 5, tax: 0, total: 39.99, shipping_name: 'Omar Khaled', shipping_phone: '0507654321', shipping_address: '456 Oak Ave', shipping_city: 'Amman', created_at: new Date(Date.now() - 7200000).toISOString(), updated_at: '' },
    { id: '4', order_number: 'RVN-001231', customer_id: '4', status: 'delivered', delivery_method: 'delivery', subtotal: 174.99, shipping_cost: 5, tax: 0, total: 179.99, shipping_name: 'Nour Saleh', shipping_phone: '0505555555', shipping_address: '789 Elm Rd', shipping_city: 'Irbid', created_at: new Date(Date.now() - 86400000).toISOString(), updated_at: '' },
    { id: '5', order_number: 'RVN-001230', customer_id: '5', status: 'cancelled', delivery_method: 'pickup', subtotal: 45.00, shipping_cost: 0, tax: 0, total: 45.00, shipping_name: 'Lina Abed', shipping_phone: '0506666666', created_at: new Date(Date.now() - 172800000).toISOString(), updated_at: '' },
];

const STATUSES = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>(DEMO_ORDERS);
    const [statusFilter, setStatusFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        const supabase = createClient();
        const fetch = async () => {
            try {
                const { data } = await supabase.from('orders').select('*, items:order_items(*)').order('created_at', { ascending: false });
                if (data && data.length > 0) setOrders(data);
            } catch { }
        };
        fetch();
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
        const supabase = createClient();
        try {
            await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
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
