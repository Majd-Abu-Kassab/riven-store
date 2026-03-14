'use client';

import { Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

export default function LanguageSwitcher() {
    const { locale, switchLanguage } = useLanguage();

    return (
        <button
            className="btn btn-ghost btn-icon"
            onClick={() => switchLanguage(locale === 'en' ? 'ar' : 'en')}
            title={locale === 'en' ? 'العربية' : 'English'}
            aria-label="Switch language"
        >
            <Globe size={18} />
            <span style={{ fontSize: '12px', fontWeight: 600, marginLeft: '2px' }}>
                {locale === 'en' ? 'AR' : 'EN'}
            </span>
        </button>
    );
}
