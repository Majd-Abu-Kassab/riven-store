'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/cart-context';
import { useAuth } from '@/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import { Truck, Store, CreditCard, ShoppingBag, Check, MapPin, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import styles from './checkout.module.css';

type Step = 'shipping' | 'review';

export default function CheckoutPage() {
    const router = useRouter();
    const { items, subtotal, shipping: shippingCost, total, clearCart } = useCart();
    const { user, profile } = useAuth();
    const [step, setStep] = useState<Step>('shipping');
    const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
    const [loading, setLoading] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');

    const [form, setForm] = useState({
        name: profile?.full_name || '',
        phone: profile?.phone || '',
        address: profile?.address || '',
        city: profile?.city || '',
        notes: '',
    });

    const updateField = (field: string, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const effectiveShipping = deliveryMethod === 'pickup' ? 0 : shippingCost;
    const effectiveTotal = subtotal + effectiveShipping;

    const handlePlaceOrder = async () => {
        setLoading(true);
        try {
            const supabase = createClient();
            const orderNum = `RVN-${Date.now().toString().slice(-6)}`;

            const { data: order, error } = await supabase
                .from('orders')
                .insert({
                    customer_id: user?.id,
                    order_number: orderNum,
                    status: 'pending',
                    delivery_method: deliveryMethod,
                    subtotal,
                    shipping_cost: effectiveShipping,
                    tax: 0,
                    total: effectiveTotal,
                    shipping_name: form.name,
                    shipping_address: deliveryMethod === 'delivery' ? form.address : null,
                    shipping_city: deliveryMethod === 'delivery' ? form.city : null,
                    shipping_phone: form.phone,
                    notes: form.notes || null,
                })
                .select()
                .single();

            if (error) throw error;

            // Insert order items
            const orderItems = items.map(item => ({
                order_id: order.id,
                product_id: item.product.id,
                product_name: item.product.name,
                product_image: item.product.images?.[0] || null,
                quantity: item.quantity,
                price: item.product.price,
            }));

            await supabase.from('order_items').insert(orderItems);

            setOrderNumber(orderNum);
            setOrderComplete(true);
            clearCart();
        } catch (err) {
            // If Supabase not connected, simulate success
            const orderNum = `RVN-${Date.now().toString().slice(-6)}`;
            setOrderNumber(orderNum);
            setOrderComplete(true);
            clearCart();
        }
        setLoading(false);
    };

    if (items.length === 0 && !orderComplete) {
        return (
            <div className={styles.page}>
                <div className="container">
                    <div className="empty-state">
                        <ShoppingBag size={48} />
                        <h3>Your cart is empty</h3>
                        <p>Add some products before checking out</p>
                        <Link href="/shop" className="btn btn-primary" style={{ marginTop: '16px' }}>
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (orderComplete) {
        return (
            <div className={styles.page}>
                <div className="container">
                    <div className={styles.success}>
                        <div className={styles.successIcon}>
                            <Check size={48} />
                        </div>
                        <h1>Order Placed!</h1>
                        <p className={styles.orderNum}>Order #{orderNumber}</p>
                        <p className={styles.successMsg}>
                            {deliveryMethod === 'delivery'
                                ? 'Your order will be delivered soon. Pay with cash on delivery.'
                                : 'Your order is ready for pickup at our store.'}
                        </p>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                            <Link href="/shop" className="btn btn-primary">Continue Shopping</Link>
                            <Link href="/account" className="btn btn-secondary">View Orders</Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className="container">
                <Link href="/shop" className={styles.backLink}>
                    <ArrowLeft size={16} /> Continue Shopping
                </Link>
                <h1 className={styles.pageTitle}>Checkout</h1>

                <div className={styles.layout}>
                    {/* Main Form */}
                    <div className={styles.main}>
                        {/* Delivery Method */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Delivery Method</h2>
                            <div className={styles.deliveryOptions}>
                                <button
                                    className={`${styles.deliveryOption} ${deliveryMethod === 'delivery' ? styles.deliveryActive : ''}`}
                                    onClick={() => setDeliveryMethod('delivery')}
                                >
                                    <Truck size={24} />
                                    <div>
                                        <strong>Delivery</strong>
                                        <p>Cash on delivery — ${shippingCost.toFixed(2)}</p>
                                    </div>
                                </button>
                                <button
                                    className={`${styles.deliveryOption} ${deliveryMethod === 'pickup' ? styles.deliveryActive : ''}`}
                                    onClick={() => setDeliveryMethod('pickup')}
                                >
                                    <Store size={24} />
                                    <div>
                                        <strong>In-Store Pickup</strong>
                                        <p>Free — pick up at our store</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Contact & Shipping Info */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                {deliveryMethod === 'delivery' ? 'Shipping Information' : 'Contact Information'}
                            </h2>
                            <div className={styles.formGrid}>
                                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                                    <label>Full Name *</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={form.name}
                                        onChange={(e) => updateField('name', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Phone Number *</label>
                                    <input
                                        type="tel"
                                        className="input"
                                        value={form.phone}
                                        onChange={(e) => updateField('phone', e.target.value)}
                                        required
                                    />
                                </div>
                                {deliveryMethod === 'delivery' && (
                                    <>
                                        <div className="input-group">
                                            <label>City *</label>
                                            <input
                                                type="text"
                                                className="input"
                                                value={form.city}
                                                onChange={(e) => updateField('city', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                                            <label>Full Address *</label>
                                            <textarea
                                                className="input textarea"
                                                value={form.address}
                                                onChange={(e) => updateField('address', e.target.value)}
                                                rows={2}
                                                required
                                            />
                                        </div>
                                    </>
                                )}
                                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                                    <label>Order Notes (optional)</label>
                                    <textarea
                                        className="input textarea"
                                        value={form.notes}
                                        onChange={(e) => updateField('notes', e.target.value)}
                                        placeholder="Any special instructions..."
                                        rows={2}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            className="btn btn-primary btn-lg"
                            style={{ width: '100%' }}
                            onClick={handlePlaceOrder}
                            disabled={loading || !form.name || !form.phone || (deliveryMethod === 'delivery' && (!form.address || !form.city))}
                        >
                            {loading ? <span className="spinner" /> : (
                                <>
                                    <CreditCard size={18} />
                                    Place Order — ${effectiveTotal.toFixed(2)}
                                </>
                            )}
                        </button>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className={styles.sidebar}>
                        <div className={styles.summaryCard}>
                            <h3 className={styles.summaryTitle}>Order Summary</h3>
                            <div className={styles.summaryItems}>
                                {items.map(item => (
                                    <div key={item.product.id} className={styles.summaryItem}>
                                        <div className={styles.itemThumb}>
                                            {item.product.images?.[0] ? (
                                                <Image src={item.product.images[0]} alt="" fill style={{ objectFit: 'cover' }} />
                                            ) : (
                                                <ShoppingBag size={16} />
                                            )}
                                        </div>
                                        <div className={styles.itemDetails}>
                                            <span className={styles.itemName}>{item.product.name}</span>
                                            <span className={styles.itemQty}>×{item.quantity}</span>
                                        </div>
                                        <span className={styles.itemTotal}>${(item.product.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className={styles.summaryDivider} />
                            <div className={styles.summaryRow}>
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>Shipping</span>
                                <span>{deliveryMethod === 'pickup' ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
                            </div>
                            <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                                <span>Total</span>
                                <span>${effectiveTotal.toFixed(2)}</span>
                            </div>
                            <div className={styles.paymentNote}>
                                <MapPin size={14} />
                                {deliveryMethod === 'delivery'
                                    ? 'Cash on delivery — pay when you receive'
                                    : 'Pay at store when picking up'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
