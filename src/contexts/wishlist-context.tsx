'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Product, WishlistItem } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/auth-context';

interface WishlistContextType {
    items: WishlistItem[];
    toggleWishlist: (product: Product) => Promise<void>;
    isInWishlist: (productId: string) => boolean;
    loading: boolean;
}

const WishlistContext = createContext<WishlistContextType>({
    items: [],
    toggleWishlist: async () => { },
    isInWishlist: () => false,
    loading: true,
});

export function WishlistProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchWishlist = useCallback(async () => {
        if (!user) {
            setItems([]);
            setLoading(false);
            return;
        }

        const supabase = createClient();
        try {
            const { data } = await supabase
                .from('wishlists')
                .select('*, product:products(*, category:categories(*))')
                .eq('customer_id', user.id);
            if (data) setItems(data);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    const toggleWishlist = useCallback(async (product: Product) => {
        if (!user) return;

        const supabase = createClient();
        const existing = items.find(item => item.product_id === product.id);

        try {
            if (existing) {
                // Remove
                const { error } = await supabase
                    .from('wishlists')
                    .delete()
                    .eq('id', existing.id);
                
                if (!error) {
                    setItems(prev => prev.filter(item => item.id !== existing.id));
                }
            } else {
                // Add
                const { data, error } = await supabase
                    .from('wishlists')
                    .insert({
                        customer_id: user.id,
                        product_id: product.id
                    })
                    .select('*, product:products(*, category:categories(*))')
                    .single();

                if (!error && data) {
                    setItems(prev => [...prev, data]);
                }
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error);
        }
    }, [user, items]);

    const isInWishlist = useCallback((productId: string) => {
        return items.some(item => item.product_id === productId);
    }, [items]);

    return (
        <WishlistContext.Provider
            value={{
                items,
                toggleWishlist,
                isInWishlist,
                loading,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
}

export const useWishlist = () => useContext(WishlistContext);
