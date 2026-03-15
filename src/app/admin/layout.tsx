'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    FolderTree,
    FileText,
    ArrowLeft,
    Menu,
    X,
} from 'lucide-react';
import { useState } from 'react';
import styles from './admin.module.css';

const NAV_ITEMS = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/products', icon: Package, label: 'Products' },
    { href: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { href: '/admin/customers', icon: Users, label: 'Customers' },
    { href: '/admin/categories', icon: FolderTree, label: 'Categories' },
    { href: '/admin/pages', icon: FileText, label: 'Pages' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { profile } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className={styles.layout}>
            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.brand}>
                        <Image src="/logo.png" alt="Riven" width={32} height={32} />
                        <span className={styles.brandText}>Admin</span>
                    </div>
                    <button className={`btn btn-ghost btn-icon hide-desktop`} onClick={() => setSidebarOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                <nav className={styles.nav}>
                    {NAV_ITEMS.map(item => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navItem} ${pathname === item.href ? styles.navActive : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className={styles.sidebarFooter}>
                    <Link href="/" className={styles.backToStore}>
                        <ArrowLeft size={16} /> Back to Store
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <div className={styles.main}>
                <header className={styles.topBar}>
                    <button className={`btn btn-ghost btn-icon hide-desktop`} onClick={() => setSidebarOpen(true)}>
                        <Menu size={20} />
                    </button>
                    <div className={styles.topBarRight}>
                        <span className={styles.adminName}>{profile?.full_name || 'Admin'}</span>
                    </div>
                </header>
                <div className={styles.content}>
                    {children}
                </div>
            </div>

            {/* Mobile overlay */}
            {sidebarOpen && <div className={`overlay hide-desktop`} onClick={() => setSidebarOpen(false)} />}
        </div>
    );
}
