'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import styles from '../account.module.css';

export default function ProfilePage() {
    const { profile, refreshProfile } = useAuth();
    const [form, setForm] = useState({
        full_name: '',
        phone: '',
        address: '',
        city: '',
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Sync form when profile loads from AuthContext
    useEffect(() => {
        if (profile) {
            setForm({
                full_name: profile.full_name || '',
                phone: profile.phone || '',
                address: profile.address || '',
                city: profile.city || '',
            });
        }
    }, [profile]);

    const handleSave = async () => {
        setSaving(true);
        setErrorMsg('');
        try {
            const res = await fetch('/api/account/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            if (!res.ok) { const r = await res.json(); throw new Error(r.error); }
            await refreshProfile();
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (e: any) {
            setErrorMsg(e.message || 'Failed to save');
        }
        setSaving(false);
    };

    return (
        <div className={styles.page}>
            <div className="container" style={{ maxWidth: '600px' }}>
                <Link href="/account" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
                    <ArrowLeft size={16} /> My Account
                </Link>
                <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '32px' }}>Profile Settings</h1>

                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {errorMsg && <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', fontSize: '14px' }}>{errorMsg}</div>}
                    <div className="input-group">
                        <label>Full Name</label>
                        <input className="input" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                    </div>
                    <div className="input-group">
                        <label>Email</label>
                        <input className="input" value={profile?.email || ''} disabled style={{ opacity: 0.6 }} />
                    </div>
                    <div className="input-group">
                        <label>Phone</label>
                        <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </div>
                    <div className="input-group">
                        <label>City</label>
                        <input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                    </div>
                    <div className="input-group">
                        <label>Address</label>
                        <textarea className="input textarea" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} />
                    </div>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                        {saving ? <span className="spinner" /> : <><Save size={16} /> {saved ? 'Saved!' : 'Save Changes'}</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
