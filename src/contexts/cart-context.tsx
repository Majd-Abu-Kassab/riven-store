'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { CartItem, Product } from '@/types';

interface CartContextType {
    items: CartItem[];
    itemCount: number;
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    addItem: (product: Product, quantity?: number) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    isInCart: (productId: string) => boolean;
    getItemQuantity: (productId: string) => number;
    isOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
    toggleCart: () => void;
}

const CartContext = createContext<CartContextType>({
    items: [],
    itemCount: 0,
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0,
    addItem: () => { },
    removeItem: () => { },
    updateQuantity: () => { },
    clearCart: () => { },
    isInCart: () => false,
    getItemQuantity: () => 0,
    isOpen: false,
    openCart: () => { },
    closeCart: () => { },
    toggleCart: () => { },
});

const CART_KEY = 'riven-cart';
const SHIPPING_COST = 5.00;
const TAX_RATE = 0.0;

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Load cart from localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem(CART_KEY);
            if (stored) {
                setItems(JSON.parse(stored));
            }
        } catch { }
        setMounted(true);
    }, []);

    // Save cart to localStorage
    useEffect(() => {
        if (mounted) {
            localStorage.setItem(CART_KEY, JSON.stringify(items));
        }
    }, [items, mounted]);

    const addItem = useCallback((product: Product, quantity = 1) => {
        setItems(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, { product, quantity }];
        });
        setIsOpen(true);
    }, []);

    const removeItem = useCallback((productId: string) => {
        setItems(prev => prev.filter(item => item.product.id !== productId));
    }, []);

    const updateQuantity = useCallback((productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(productId);
            return;
        }
        setItems(prev =>
            prev.map(item =>
                item.product.id === productId ? { ...item, quantity } : item
            )
        );
    }, [removeItem]);

    const clearCart = useCallback(() => {
        setItems([]);
        setIsOpen(false);
    }, []);

    const isInCart = useCallback((productId: string) => {
        return items.some(item => item.product.id === productId);
    }, [items]);

    const getItemQuantity = useCallback((productId: string) => {
        return items.find(item => item.product.id === productId)?.quantity ?? 0;
    }, [items]);

    const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const shipping = items.length > 0 ? SHIPPING_COST : 0;
    const tax = subtotal * TAX_RATE;
    const total = subtotal + shipping + tax;
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                itemCount,
                subtotal,
                shipping,
                tax,
                total,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                isInCart,
                getItemQuantity,
                isOpen,
                openCart: () => setIsOpen(true),
                closeCart: () => setIsOpen(false),
                toggleCart: () => setIsOpen(prev => !prev),
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);
