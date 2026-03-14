'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types';
import { Search, Users, Mail, Calendar } from 'lucide-react';
import styles from '../products/products.module.css';

const DEMO_CUSTOMERS: (Profile & { order_count?: number; total_spent?: number })[] = [
    { id: '1', email: 'ahmed@example.com', full_name: 'Ahmed Ali', role: 'customer', created_at: new Date(Date.now() - 2592000000).toISOString(), order_count: 5, total_spent: 549.95 },
    { id: '2', email: 'sara@example.com', full_name: 'Sara Hassan', role: 'customer', created_at: new Date(Date.now() - 1296000000).toISOString(), order_count: 3, total_spent: 324.97 },
    { id: '3', email: 'omar@example.com', full_name: 'Omar Khaled', role: 'customer', created_at: new Date(Date.now() - 604800000).toISOString(), order_count: 1, total_spent: 89.99 },
    { id: '4', email: 'nour@example.com', full_name: 'Nour Saleh', role: 'customer', created_at: new Date(Date.now() - 259200000).toISOString(), order_count: 8, total_spent: 1249.92 },
];

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState(DEMO_CUSTOMERS);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const supabase = createClient();
        const fetch = async () => {
            try {
                const { data } = await supabase.from('profiles').select('*').eq('role', 'customer').order('created_at', { ascending: false });
                if (data && data.length > 0) setCustomers(data);
            } catch { }
        };
        fetch();
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
