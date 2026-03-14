'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Category } from '@/types';
import { Plus, Edit, Trash2, FolderTree } from 'lucide-react';
import styles from '../products/products.module.css';

const DEMO_CATS: Category[] = [
    { id: '1', name: 'Electronics', slug: 'electronics', description: 'Latest gadgets and tech', sort_order: 1, created_at: '' },
    { id: '2', name: 'Fashion', slug: 'fashion', description: 'Trending styles', sort_order: 2, created_at: '' },
    { id: '3', name: 'Home & Living', slug: 'home-living', description: 'Decor and lifestyle', sort_order: 3, created_at: '' },
    { id: '4', name: 'Sports', slug: 'sports', description: 'Fitness and outdoors', sort_order: 4, created_at: '' },
];

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>(DEMO_CATS);
    const [showForm, setShowForm] = useState(false);
    const [editCat, setEditCat] = useState<Category | null>(null);
    const [form, setForm] = useState({ name: '', slug: '', description: '', sort_order: '' });

    useEffect(() => {
        const supabase = createClient();
        const fetch = async () => {
            try {
                const { data } = await supabase.from('categories').select('*').order('sort_order');
                if (data && data.length > 0) setCategories(data);
            } catch { }
        };
        fetch();
    }, []);

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
        const supabase = createClient();
        const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const payload = { name: form.name, slug, description: form.description, sort_order: parseInt(form.sort_order) || 0 };

        try {
            if (editCat) {
                await supabase.from('categories').update(payload).eq('id', editCat.id);
            } else {
                await supabase.from('categories').insert(payload);
            }
            const { data } = await supabase.from('categories').select('*').order('sort_order');
            if (data) setCategories(data);
        } catch { }
        setShowForm(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this category?')) return;
        const supabase = createClient();
        try {
            await supabase.from('categories').delete().eq('id', id);
            setCategories(prev => prev.filter(c => c.id !== id));
        } catch { }
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
                                <button className="btn btn-primary" onClick={handleSave} style={{ flex: 1 }}>
                                    {editCat ? 'Update' : 'Create'}
                                </button>
                                <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
