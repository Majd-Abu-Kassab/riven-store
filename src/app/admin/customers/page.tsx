'use client';

import { useEffect, useState } from 'react';
import { Profile } from '@/types';
import { Search, Users, Mail, Calendar } from 'lucide-react';
import styles from '../products/products.module.css';

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchCustomers = async () => {
            const res = await fetch('/api/admin/customers');
            if (res.ok) {
                const { customers: data } = await res.json();
                if (data) setCustomers(data);
            }
        };
        fetchCustomers();
    }, []);

    const filtered = customers.filter(c =>
        c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.title}>Customers</h1>
            </div>

            <div className={styles.toolbar}>
                <div className={styles.searchWrap}>
                    <Search size={16} />
                    <input className="input" placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: '36px' }} />
                </div>
                <span className={styles.count}>{filtered.length} customers</span>
            </div>

            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Customer</th>
                            <th>Email</th>
                            <th>Orders</th>
                            <th>Total Spent</th>
                            <th>Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(customer => (
                            <tr key={customer.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-primary-bg)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 700, fontSize: '14px' }}>
                                            {customer.full_name?.charAt(0) || '?'}
                                        </div>
                                        <span style={{ fontWeight: 600 }}>{customer.full_name}</span>
                                    </div>
                                </td>
                                <td style={{ color: 'var(--color-text-secondary)' }}>{customer.email}</td>
                                <td>
                                    <span className="badge badge-info">{customer.order_count || 0}</span>
                                </td>
                                <td style={{ fontWeight: 600 }}>${(customer.total_spent || 0).toFixed(2)}</td>
                                <td style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                                    {new Date(customer.created_at).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
