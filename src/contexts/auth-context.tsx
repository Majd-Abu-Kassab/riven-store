'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    isAdmin: boolean;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: true,
    isAdmin: false,
    signOut: async () => { },
    refreshProfile: async () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = useMemo(() => createClient(), []);

    const fetchProfile = useCallback(async (userId: string) => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        setProfile(data);
    }, [supabase]);

    const refreshProfile = useCallback(async () => {
        if (user) {
            await fetchProfile(user.id);
        }
    }, [user, fetchProfile]);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                await fetchProfile(user.id);
            }
            setLoading(false);
        };

        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setUser(session?.user ?? null);
                if (session?.user) {
                    await fetchProfile(session.user.id);
                } else {
                    setProfile(null);
                }
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, [supabase, fetchProfile]);

    const signOut = async () => {
        try {
            await fetch('/api/auth/signout', { method: 'POST' });
        } catch { }
        setUser(null);
        setProfile(null);
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                loading,
                isAdmin: profile?.role === 'admin',
                signOut,
                refreshProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
