'use client';

import { useEffect, useState } from 'react';
import { Category } from '@/types';
import { Plus, Edit, Trash2, FolderTree, Loader2 } from 'lucide-react';
import styles from '../products/products.module.css';

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editCat, setEditCat] = useState<Category | null>(null);
    const [form, setForm] = useState({ name: '', slug: '', description: '', sort_order: '' });
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const fetchCategories = async () => {
        const res = await fetch('/api/admin/categories');
        if (res.ok) {
            const { categories: cats } = await res.json();
            if (cats) setCategories(cats);
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    const openEdit = (cat: Category) => {
        setEditCat(cat);
        setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', sort_order: cat.sort_order.toString() });
        setShowForm(true);
    };

    const openNew = () => {
        setEditCat(null);
        setForm({ name: '', slug: '', description: '', sort_order: (categories.length + 1).toString() });
        setShowForm(true);
    };

    const handleSave = async () => {
        if (!form.name) { setErrorMsg('Name is required.'); return; }
        setErrorMsg('');
        setSaving(true);
        try {
            const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const payload = { ...(editCat ? { id: editCat.id } : {}), name: form.name, slug, description: form.description, sort_order: parseInt(form.sort_order) || 0 };
            const res = await fetch('/api/admin/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Failed to save');
            setShowForm(false);
            await fetchCategories();
        } catch (e: any) {
            setErrorMsg(e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this category?')) return;
        const res = await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' });
        if (res.ok) setCategories(prev => prev.filter(c => c.id !== id));
    };

    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.title}>Categories</h1>
                <button className="btn btn-primary" onClick={openNew}>
                    <Plus size={16} /> Add Category
                </button>
            </div>

            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Slug</th>
                            <th>Description</th>
                            <th>Order</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(cat => (
                            <tr key={cat.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <FolderTree size={16} style={{ color: 'var(--color-primary)' }} />
                                        <span style={{ fontWeight: 600 }}>{cat.name}</span>
                                    </div>
                                </td>
                                <td style={{ color: 'var(--color-text-secondary)' }}>{cat.slug}</td>
                                <td style={{ color: 'var(--color-text-secondary)', maxWidth: '300px' }}>{cat.description || '—'}</td>
                                <td>{cat.sort_order}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <button className="btn btn-ghost btn-icon" onClick={() => openEdit(cat)}><Edit size={16} /></button>
                                        <button className="btn btn-ghost btn-icon" onClick={() => handleDelete(cat.id)} style={{ color: 'var(--color-error)' }}><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showForm && (
                <>
                    <div className="overlay" onClick={() => setShowForm(false)} />
                    <div className="modal">
                        <h2 style={{ marginBottom: '24px', fontSize: '18px', fontWeight: 700 }}>
                            {editCat ? 'Edit Category' : 'New Category'}
                        </h2>
                        {errorMsg && <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}><strong>Error:</strong> {errorMsg}</div>}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="input-group">
                                <label>Name *</label>
                                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Slug</label>
                                <input className="input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" />
                            </div>
                            <div className="input-group">
                                <label>Description</label>
                                <textarea className="input textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
                            </div>
                            <div className="input-group">
                                <label>Sort Order</label>
                                <input className="input" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button className="btn btn-primary" onClick={handleSave} style={{ flex: 1 }} disabled={saving}>
                                    {saving ? <><Loader2 size={16} className="spinner" /> Saving...</> : (editCat ? 'Update' : 'Create')}
                                </button>
                                <button className="btn btn-secondary" onClick={() => setShowForm(false)} disabled={saving}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
