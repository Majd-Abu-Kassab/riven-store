'use client';

import { useEffect, useState } from 'react';
import { Product, Category } from '@/types';
import { Plus, Search, Edit, Trash2, Eye, Package, Loader2 } from 'lucide-react';
import Link from 'next/link';
import styles from './products.module.css';

const DEMO_PRODUCTS: Product[] = [
    { id: '1', name: 'Wireless Headphones Pro', slug: 'wireless-headphones-pro', price: 89.99, compare_at_price: 129.99, category_id: '1', images: [], stock_quantity: 15, is_featured: true, is_active: true, sku: 'WHP-001', created_at: new Date().toISOString(), updated_at: '' },
    { id: '2', name: 'Minimalist Watch', slug: 'minimalist-watch', price: 149.99, category_id: '2', images: [], stock_quantity: 8, is_featured: true, is_active: true, sku: 'MW-001', created_at: new Date().toISOString(), updated_at: '' },
    { id: '3', name: 'Smart Water Bottle', slug: 'smart-water-bottle', price: 34.99, category_id: '3', images: [], stock_quantity: 30, is_featured: true, is_active: true, sku: 'SWB-001', created_at: new Date().toISOString(), updated_at: '' },
    { id: '4', name: 'Yoga Mat Premium', slug: 'yoga-mat-premium', price: 45.00, category_id: '4', images: [], stock_quantity: 22, is_featured: false, is_active: true, sku: 'YMP-001', created_at: new Date().toISOString(), updated_at: '' },
    { id: '5', name: 'Leather Backpack', slug: 'leather-backpack', price: 199.99, category_id: '2', images: [], stock_quantity: 5, is_featured: true, is_active: true, sku: 'LB-001', created_at: new Date().toISOString(), updated_at: '' },
    { id: '6', name: 'Running Shoes', slug: 'running-shoes', price: 119.99, category_id: '4', images: [], stock_quantity: 0, is_featured: false, is_active: true, sku: 'RS-001', created_at: new Date().toISOString(), updated_at: '' },
];

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editProduct, setEditProduct] = useState<Product | null>(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [saving, setSaving] = useState(false);

    // Form state
    const [form, setForm] = useState({
        name: '', slug: '', description: '', price: '', compare_at_price: '', sku: '',
        stock_quantity: '', category_id: '', is_featured: false, is_active: true,
        imageUrl: '',
    });

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/admin/products');
            if (res.ok) {
                const { products } = await res.json();
                if (products) setProducts(products);
            }
        } catch { }
    };

    useEffect(() => {
        fetchProducts();
        fetch('/api/store/categories').then(r => r.json()).then(({ categories: cats }) => {
            if (cats) setCategories(cats);
        }).catch(() => {});
    }, []);

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase())
    );

    const openEdit = (product: Product) => {
        setEditProduct(product);
        setForm({
            name: product.name, slug: product.slug, description: product.description || '',
            price: product.price.toString(), compare_at_price: product.compare_at_price?.toString() || '',
            sku: product.sku || '', stock_quantity: product.stock_quantity.toString(),
            category_id: product.category_id || '', is_featured: product.is_featured, is_active: product.is_active,
            imageUrl: product.images?.[0] || '',
        });
        setShowForm(true);
    };

    const openNew = () => {
        setEditProduct(null);
        setForm({ name: '', slug: '', description: '', price: '', compare_at_price: '', sku: '', stock_quantity: '', category_id: '', is_featured: false, is_active: true, imageUrl: '' });
        setShowForm(true);
    };

    const handleSave = async () => {
        if (!form.name || !form.price) {
            setErrorMsg('Product name and price are required.');
            return;
        }
        setErrorMsg('');
        setSaving(true);
        try {
            const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const payload = {
                ...(editProduct ? { id: editProduct.id } : {}),
                name: form.name, slug, description: form.description, price: parseFloat(form.price),
                compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
                sku: form.sku || null, stock_quantity: parseInt(form.stock_quantity) || 0,
                category_id: form.category_id || null, is_featured: form.is_featured, is_active: form.is_active,
                images: form.imageUrl ? [form.imageUrl] : [],
            };

            const res = await fetch('/api/admin/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Failed to save product');

            setShowForm(false);
            await fetchProducts();
        } catch (error: any) {
            setErrorMsg(error.message || 'Failed to save product');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setProducts(prev => prev.filter(p => p.id !== id));
            }
        } catch { }
    };

    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.title}>Products</h1>
                <button className="btn btn-primary" onClick={openNew}>
                    <Plus size={16} /> Add Product
                </button>
            </div>

            <div className={styles.toolbar}>
                <div className={styles.searchWrap}>
                    <Search size={16} />
                    <input
                        type="text"
                        className="input"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ paddingLeft: '36px' }}
                    />
                </div>
                <span className={styles.count}>{filtered.length} products</span>
            </div>

            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>SKU</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(product => (
                            <tr key={product.id}>
                                <td>
                                    <div className={styles.productName}>
                                        <div className={styles.productThumb}>
                                            {product.images?.[0] ? (
                                                <img src={product.images[0]} alt="" width={32} height={32} style={{ objectFit: 'cover', borderRadius: '4px' }} />
                                            ) : (
                                                <Package size={16} />
                                            )}
                                        </div>
                                        <div>
                                            <span style={{ fontWeight: 600 }}>{product.name}</span>
                                            {product.is_featured && <span className="badge badge-primary" style={{ marginLeft: '8px' }}>Featured</span>}
                                        </div>
                                    </div>
                                </td>
                                <td>{product.sku || '—'}</td>
                                <td style={{ fontWeight: 600 }}>
                                    ${product.price.toFixed(2)}
                                    {product.compare_at_price && (
                                        <span style={{ color: 'var(--color-text-tertiary)', textDecoration: 'line-through', marginLeft: '8px', fontWeight: 400, fontSize: '12px' }}>
                                            ${product.compare_at_price.toFixed(2)}
                                        </span>
                                    )}
                                </td>
                                <td>
                                    <span className={`badge ${product.stock_quantity === 0 ? 'badge-error' : product.stock_quantity <= 5 ? 'badge-warning' : 'badge-success'}`}>
                                        {product.stock_quantity}
                                    </span>
                                </td>
                                <td>
                                    <span className={`badge ${product.is_active ? 'badge-success' : 'badge-error'}`}>
                                        {product.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <Link href={`/shop/${product.slug}`} className="btn btn-ghost btn-icon" title="View">
                                            <Eye size={16} />
                                        </Link>
                                        <button className="btn btn-ghost btn-icon" onClick={() => openEdit(product)} title="Edit">
                                            <Edit size={16} />
                                        </button>
                                        <button className="btn btn-ghost btn-icon" onClick={() => handleDelete(product.id)} title="Delete" style={{ color: 'var(--color-error)' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Product Form Modal */}
            {showForm && (
                <>
                    <div className="overlay" onClick={() => setShowForm(false)} />
                    <div className="modal" style={{ maxWidth: '600px' }}>
                        <h2 style={{ marginBottom: '24px', fontSize: '18px', fontWeight: 700 }}>
                            {editProduct ? 'Edit Product' : 'New Product'}
                        </h2>
                        {errorMsg && (
                            <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                                <strong>Error:</strong> {errorMsg}
                            </div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="input-group">
                                <label>Product Name *</label>
                                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Image URL</label>
                                <input className="input" placeholder="https://example.com/image.jpg" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="input-group">
                                    <label>Price *</label>
                                    <input className="input" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                                </div>
                                <div className="input-group">
                                    <label>Compare-at Price</label>
                                    <input className="input" type="number" step="0.01" value={form.compare_at_price} onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="input-group">
                                    <label>SKU</label>
                                    <input className="input" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
                                </div>
                                <div className="input-group">
                                    <label>Stock Quantity</label>
                                    <input className="input" type="number" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Category</label>
                                <select className="input select" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                                    <option value="">— No Category —</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Description</label>
                                <textarea className="input textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
                            </div>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                                    <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
                                    Featured
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                                    <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                                    Active
                                </label>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                <button className="btn btn-primary" onClick={handleSave} style={{ flex: 1 }} disabled={saving}>
                                    {saving ? <><Loader2 size={16} className="spinner" /> Saving...</> : (editProduct ? 'Update Product' : 'Create Product')}
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
