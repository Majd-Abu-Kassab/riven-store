'use client';

import { useState, useEffect } from 'react';
import { SitePage } from '@/types';
import { FileText, Edit, Save, X, RefreshCw } from 'lucide-react';
import styles from './pages.module.css';

export default function AdminPages() {
    const [pages, setPages] = useState<SitePage[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingPage, setEditingPage] = useState<SitePage | null>(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const fetchPages = async () => {
        setLoading(true);
        setMessage({ text: '', type: '' });
        try {
            const res = await fetch('/api/admin/site-pages');
            if (res.ok) {
                const { pages: data } = await res.json();
                setPages(data || []);
            }
        } catch (error: any) {
            setMessage({ text: 'Error fetching pages: ' + error.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPages();
    }, []);

    const handleSave = async () => {
        if (!editingPage) return;
        setSaving(true);
        setMessage({ text: '', type: '' });
        try {
            const res = await fetch('/api/admin/site-pages', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: editingPage.id, title: editingPage.title, content: editingPage.content }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Failed to save');
            setMessage({ text: 'Page updated successfully!', type: 'success' });
            setEditingPage(null);
            fetchPages();
        } catch (error: any) {
            setMessage({ text: 'Error saving page: ' + error.message, type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Site Pages</h1>
                    <p className={styles.subtitle}>Manage your Information pages (About Us, FAQ, etc.)</p>
                </div>
                <button onClick={fetchPages} className="btn btn-secondary btn-sm">
                    <RefreshCw size={16} className={loading ? 'spinner' : ''} />
                    Refresh
                </button>
            </header>

            {message.text && (
                <div className={`${styles.alert} ${styles[message.type]}`}>
                    {message.text}
                </div>
            )}

            {loading ? (
                <div className={styles.loading}>
                    <span className="spinner spinner-lg"></span>
                </div>
            ) : (
                <div className={styles.grid}>
                    {pages.length === 0 ? (
                        <div className={styles.emptyState}>
                            No pages found. Did you run the SQL script?
                        </div>
                    ) : (
                        pages.map(page => (
                            <div key={page.id} className={styles.pageCard}>
                                <div className={styles.pageIcon}>
                                    <FileText size={24} />
                                </div>
                                <div className={styles.pageInfo}>
                                    <h3 className={styles.pageName}>{page.title}</h3>
                                    <p className={styles.pageSlug}>Slug: info/{page.slug}</p>
                                </div>
                                <button 
                                    onClick={() => setEditingPage(page)}
                                    className="btn btn-secondary btn-sm"
                                >
                                    <Edit size={16} /> Edit
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Edit Modal */}
            {editingPage && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h2>Edit Page: {editingPage.title}</h2>
                            <button onClick={() => setEditingPage(null)} className={styles.closeBtn}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className="input-group">
                                <label>Page Title</label>
                                <input 
                                    className="input" 
                                    value={editingPage.title}
                                    onChange={(e) => setEditingPage({...editingPage, title: e.target.value})}
                                />
                            </div>
                            <div className="input-group">
                                <label>Content (HTML/Text)</label>
                                <textarea 
                                    className="input textarea" 
                                    style={{ minHeight: '300px' }}
                                    value={editingPage.content || ''}
                                    onChange={(e) => setEditingPage({...editingPage, content: e.target.value})}
                                    placeholder="Enter page content here..."
                                />
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button 
                                onClick={() => setEditingPage(null)} 
                                className="btn btn-secondary"
                                disabled={saving}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSave} 
                                className="btn btn-primary"
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
