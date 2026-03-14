'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/auth-context';
import { useCart } from '@/contexts/cart-context';
import { useTheme } from '@/contexts/theme-context';
import { useLanguage } from '@/contexts/language-context';
import LanguageSwitcher from '@/components/language-switcher';
import {
    ShoppingCart,
    User,
    Search,
    Menu,
    X,
    Moon,
    Sun,
    LogOut,
    Settings,
    Package,
    Heart,
    Shield,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import styles from './header.module.css';

export default function Header() {
    const { user, profile, isAdmin, signOut } = useAuth();
    const { itemCount, openCart } = useCart();
    const { theme, toggleTheme } = useTheme();
    const { t } = useLanguage();
    const [menuOpen, setMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const userMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`;
            setSearchOpen(false);
            setSearchQuery('');
        }
    };

    return (
        <header className={`${styles.header} glass`}>
            <div className={`container ${styles.inner}`}>
                {/* Logo */}
                <Link href="/" className={styles.logo}>
                    <Image src="/logo.png" alt="Riven" width={40} height={40} />
                    <span className={styles.logoText}>RIVEN</span>
                </Link>

                {/* Desktop Nav */}
                <nav className={`${styles.nav} hide-mobile`}>
                    <Link href="/shop" className={styles.navLink}>{t('shop')}</Link>
                    <Link href="/categories" className={styles.navLink}>{t('categories')}</Link>
                    <Link href="/shop?featured=true" className={styles.navLink}>{t('featured')}</Link>
                </nav>

                {/* Actions */}
                <div className={styles.actions}>
                    {/* Search */}
                    <button
                        className={`btn btn-ghost btn-icon ${styles.actionBtn}`}
                        onClick={() => setSearchOpen(!searchOpen)}
                        aria-label={t('search')}
                    >
                        <Search size={20} />
                    </button>

                    {/* Language Switcher */}
                    <div className="hide-mobile">
                        <LanguageSwitcher />
                    </div>

                    {/* Theme Toggle */}
                    <button
                        className={`btn btn-ghost btn-icon ${styles.actionBtn} hide-mobile`}
                        onClick={toggleTheme}
                        aria-label={t('theme_toggle')}
                    >
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>

                    {/* Cart */}
                    <button
                        className={`btn btn-ghost btn-icon ${styles.cartBtn}`}
                        onClick={openCart}
                        aria-label={t('cart')}
                    >
                        <ShoppingCart size={20} />
                        {itemCount > 0 && (
                            <span className={styles.cartBadge}>{itemCount}</span>
                        )}
                    </button>

                    {/* User */}
                    {user ? (
                        <div className={styles.userMenu} ref={userMenuRef}>
                            <button
                                className={`btn btn-ghost btn-icon ${styles.actionBtn}`}
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                            >
                                <User size={20} />
                            </button>
                            {userMenuOpen && (
                                <div className={styles.dropdown}>
                                    <div className={styles.dropdownHeader}>
                                        <p className={styles.dropdownName}>{profile?.full_name || 'User'}</p>
                                        <p className={styles.dropdownEmail}>{profile?.email}</p>
                                    </div>
                                    <div className={styles.dropdownDivider} />
                                    <Link href="/account" className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                                        <Package size={16} /> {t('my_orders')}
                                    </Link>
                                    <Link href="/account/wishlist" className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                                        <Heart size={16} /> {t('wishlist')}
                                    </Link>
                                    <Link href="/account/profile" className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                                        <Settings size={16} /> {t('profile_settings')}
                                    </Link>
                                    {isAdmin && (
                                        <>
                                            <div className={styles.dropdownDivider} />
                                            <Link href="/admin" className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                                                <Shield size={16} /> {t('admin')}
                                            </Link>
                                        </>
                                    )}
                                    <div className={styles.dropdownDivider} />
                                    <button className={styles.dropdownItem} onClick={() => { signOut(); setUserMenuOpen(false); }}>
                                        <LogOut size={16} /> {t('logout')}
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link href="/login" className={`btn btn-primary btn-sm hide-mobile`}>
                            {t('login')}
                        </Link>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        className={`btn btn-ghost btn-icon hide-desktop`}
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        {menuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            {searchOpen && (
                <div className={styles.searchBar}>
                    <form onSubmit={handleSearch} className={`container ${styles.searchForm}`}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder={t('search_products')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                            autoFocus
                        />
                        <button type="button" className="btn btn-ghost btn-icon" onClick={() => setSearchOpen(false)}>
                            <X size={18} />
                        </button>
                    </form>
                </div>
            )}

            {/* Mobile Menu */}
            {menuOpen && (
                <nav className={`${styles.mobileMenu} hide-desktop`}>
                    <Link href="/shop" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>{t('shop')}</Link>
                    <Link href="/categories" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>{t('categories')}</Link>
                    <Link href="/shop?featured=true" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>{t('featured')}</Link>
                    <div className={styles.dropdownDivider} />
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <LanguageSwitcher />
                        <button className={styles.mobileLink} onClick={() => { toggleTheme(); setMenuOpen(false); }}>
                            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                        </button>
                    </div>
                    {!user && (
                        <Link href="/login" className={`btn btn-primary ${styles.mobileSignIn}`} onClick={() => setMenuOpen(false)}>
                            {t('login')}
                        </Link>
                    )}
                </nav>
            )}
        </header>
    );
}
