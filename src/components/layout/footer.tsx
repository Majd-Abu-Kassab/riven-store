'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/contexts/language-context';
import styles from './footer.module.css';

export default function Footer() {
    const { t } = useLanguage();

    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.inner}`}>
                <div className={styles.grid}>
                    {/* Brand */}
                    <div className={styles.brand}>
                        <div className={styles.logo}>
                            <Image src="/logo.png" alt="Riven" width={36} height={36} />
                            <span className={styles.logoText}>RIVEN</span>
                        </div>
                        <p className={styles.tagline}>
                            {t('footer_brand')}
                        </p>
                    </div>

                    {/* Shop Links */}
                    <div className={styles.column}>
                        <h4 className={styles.columnTitle}>{t('shop')}</h4>
                        <Link href="/shop" className={styles.link}>{t('all_products')}</Link>
                        <Link href="/categories" className={styles.link}>{t('categories')}</Link>
                        <Link href="/shop?featured=true" className={styles.link}>{t('featured_products')}</Link>
                        <Link href="/shop?sort=newest" className={styles.link}>{t('new_arrivals')}</Link>
                    </div>

                    {/* Account Links */}
                    <div className={styles.column}>
                        <h4 className={styles.columnTitle}>{t('account')}</h4>
                        <Link href="/login" className={styles.link}>{t('login')}</Link>
                        <Link href="/signup" className={styles.link}>{t('signup')}</Link>
                        <Link href="/account" className={styles.link}>{t('my_orders')}</Link>
                        <Link href="/account/wishlist" className={styles.link}>{t('wishlist')}</Link>
                    </div>

                    {/* Info Links */}
                    <div className={styles.column}>
                        <h4 className={styles.columnTitle}>{t('footer_info')}</h4>
                        <Link href="/info/about-us" className={styles.link}>{t('about')}</Link>
                        <Link href="/info/contact" className={styles.link}>{t('contact')}</Link>
                        <Link href="/info/faq" className={styles.link}>{t('faq')}</Link>
                        <Link href="/info/privacy-policy" className={styles.link}>{t('privacy')}</Link>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <p className={styles.copyright}>&copy; {new Date().getFullYear()} Riven. {t('rights')}</p>
                </div>
            </div>
        </footer>
    );
}
