'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import styles from './auth.module.css';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push(redirect);
            router.refresh();
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.header}>
                        <Image src="/logo.png" alt="Riven" width={48} height={48} />
                        <h1 className={styles.title}>Welcome Back</h1>
                        <p className={styles.subtitle}>Sign in to your Riven account</p>
                    </div>

                    {error && (
                        <div className={styles.error}>{error}</div>
                    )}

                    <form onSubmit={handleLogin} className={styles.form}>
                        <div className="input-group">
                            <label>Email</label>
                            <div className={styles.inputWrap}>
                                <Mail size={16} className={styles.inputIcon} />
                                <input
                                    type="email"
                                    className={`input ${styles.inputWithIcon}`}
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Password</label>
                            <div className={styles.inputWrap}>
                                <Lock size={16} className={styles.inputIcon} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className={`input ${styles.inputWithIcon}`}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className={styles.eyeBtn}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
                            {loading ? <span className="spinner" /> : 'Sign In'}
                        </button>
                    </form>

                    <p className={styles.switchText}>
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className={styles.switchLink}>Create one</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
