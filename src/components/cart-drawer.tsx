'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/cart-context';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import styles from './cart-drawer.module.css';

export default function CartDrawer() {
    const {
        items,
        itemCount,
        subtotal,
        shipping,
        total,
        isOpen,
        closeCart,
        removeItem,
        updateQuantity,
    } = useCart();

    if (!isOpen) return null;

    return (
        <>
            <div className="overlay" onClick={closeCart} />
            <div className={styles.drawer}>
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        <ShoppingBag size={20} />
                        Cart ({itemCount})
                    </h2>
                    <button className="btn btn-ghost btn-icon" onClick={closeCart}>
                        <X size={20} />
                    </button>
                </div>

                {items.length === 0 ? (
                    <div className={styles.empty}>
                        <ShoppingBag size={48} />
                        <p>Your cart is empty</p>
                        <Link href="/shop" className="btn btn-primary" onClick={closeCart}>
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className={styles.items}>
                            {items.map((item) => (
                                <div key={item.product.id} className={styles.item}>
                                    <div className={styles.itemImage}>
                                        {item.product.images?.[0] ? (
                                            <Image
                                                src={item.product.images[0]}
                                                alt={item.product.name}
                                                fill
                                                style={{ objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div className={styles.placeholder}>
                                                <ShoppingBag size={20} />
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.itemInfo}>
                                        <h4 className={styles.itemName}>{item.product.name}</h4>
                                        <p className={styles.itemPrice}>${item.product.price.toFixed(2)}</p>
                                        <div className={styles.quantityRow}>
                                            <div className={styles.quantityControl}>
                                                <button
                                                    className={styles.qtyBtn}
                                                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className={styles.qtyValue}>{item.quantity}</span>
                                                <button
                                                    className={styles.qtyBtn}
                                                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                            <button
                                                className={styles.removeBtn}
                                                onClick={() => removeItem(item.product.id)}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={styles.footer}>
                            <div className={styles.summaryRow}>
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>Shipping</span>
                                <span>${shipping.toFixed(2)}</span>
                            </div>
                            <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                            <Link href="/checkout" className="btn btn-primary btn-lg" onClick={closeCart} style={{ width: '100%' }}>
                                Checkout
                            </Link>
                            <button className={`btn btn-ghost ${styles.continueShopping}`} onClick={closeCart}>
                                Continue Shopping
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
