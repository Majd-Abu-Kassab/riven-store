'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import styles from '../login/auth.module.css';

export default function SignupPage() {
    const router = useRouter();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const supabase = createClient();
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName },
            },
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push('/');
            router.refresh();
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.header}>
                        <Image src="/logo.png" alt="Riven" width={48} height={48} />
                        <h1 className={styles.title}>Create Account</h1>
                        <p className={styles.subtitle}>Join Riven and start shopping</p>
                    </div>

                    {error && <div className={styles.error}>{error}</div>}

                    <form onSubmit={handleSignup} className={styles.form}>
                        <div className="input-group">
                            <label>Full Name</label>
                            <div className={styles.inputWrap}>
                                <User size={16} className={styles.inputIcon} />
                                <input
                                    type="text"
                                    className={`input ${styles.inputWithIcon}`}
                                    placeholder="John Doe"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

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
                                    placeholder="Min. 6 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    minLength={6}
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
                            {loading ? <span className="spinner" /> : 'Create Account'}
                        </button>
                    </form>

                    <p className={styles.switchText}>
                        Already have an account?{' '}
                        <Link href="/login" className={styles.switchLink}>Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
