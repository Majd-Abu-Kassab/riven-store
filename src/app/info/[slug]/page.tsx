'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import { SitePage } from '@/types';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import styles from './info.module.css';

export default function InfoPage() {
    const params = useParams();
    const [page, setPage] = useState<SitePage | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPage = async () => {
            if (!params.slug) { setLoading(false); return; }
            setLoading(true);
            try {
                const res = await fetch(`/api/store/pages?slug=${params.slug}`);
                if (res.status === 404) { notFound(); return; }
                if (!res.ok) { notFound(); return; }
                const { page: data } = await res.json();
                setPage(data);
            } catch {
                notFound();
            } finally {
                setLoading(false);
            }
        };
        fetchPage();
    }, [params.slug]);

    if (loading) {
        return (
            <div className="page-loading">
                <span className="spinner spinner-lg"></span>
            </div>
        );
    }

    if (!page) return null;

    return (
        <div className={styles.container}>
            <div className="container">
                {/* Breadcrumbs */}
                <nav className={styles.breadcrumbs}>
                    <Link href="/">
                        <Home size={14} />
                    </Link>
                    <ChevronRight size={14} />
                    <span>Information</span>
                    <ChevronRight size={14} />
                    <span className={styles.activeLabel}>{page.title}</span>
                </nav>

                <div className={styles.layout}>
                    {/* Sidebar Nav */}
                    <aside className={styles.sidebar}>
                        <h3 className={styles.sidebarTitle}>Information</h3>
                        <nav className={styles.sideNav}>
                            <Link href="/info/about-us" className={params.slug === 'about-us' ? styles.sideLinkActive : styles.sideLink}>About Us</Link>
                            <Link href="/info/faq" className={params.slug === 'faq' ? styles.sideLinkActive : styles.sideLink}>FAQ</Link>
                            <Link href="/info/contact" className={params.slug === 'contact' ? styles.sideLinkActive : styles.sideLink}>Contact Us</Link>
                            <Link href="/info/privacy-policy" className={params.slug === 'privacy-policy' ? styles.sideLinkActive : styles.sideLink}>Privacy Policy</Link>
                        </nav>
                    </aside>

                    {/* Content Area */}
                    <main className={styles.main}>
                        <h1 className={styles.title}>{page.title}</h1>
                        <div 
                            className={styles.content}
                            dangerouslySetInnerHTML={{ __html: page.content || '' }}
                        />
                    </main>
                </div>
            </div>
        </div>
    );
}
