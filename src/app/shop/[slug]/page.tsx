'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useCart } from '@/contexts/cart-context';
import ProductCard from '@/components/product-card';
import { Product } from '@/types';
import { ShoppingCart, Heart, Star, Minus, Plus, Truck, Store, ArrowLeft, ShoppingBag } from 'lucide-react';
import styles from './detail.module.css';

const DEMO_PRODUCT: Product = {
    id: '1', name: 'Wireless Headphones Pro', slug: 'wireless-headphones-pro',
    description: 'Experience premium sound quality with our Wireless Headphones Pro. Featuring advanced noise-canceling technology, 40-hour battery life, and ultra-comfortable ear cushions. Perfect for music lovers, gamers, and professionals who demand the best audio experience.\n\n• Active Noise Cancellation\n• 40-hour battery life\n• Premium leather ear cushions\n• Bluetooth 5.3\n• Quick charge — 10 min = 3 hours\n• Foldable design for portability',
    price: 89.99, compare_at_price: 129.99, category_id: '1',
    category: { id: '1', name: 'Electronics', slug: 'electronics', description: '', image_url: '', sort_order: 1, created_at: '' },
    images: [], stock_quantity: 15, is_featured: true, is_active: true, sku: 'WHP-001',
    created_at: '', updated_at: '', avg_rating: 4.8, review_count: 124,
};

export default function ProductDetailPage() {
    const params = useParams();
    const [product, setProduct] = useState<Product>(DEMO_PRODUCT);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const { addItem, isInCart, getItemQuantity } = useCart();
    const inCart = isInCart(product.id);
    const cartQty = getItemQuantity(product.id);
    const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;

    useEffect(() => {
        const supabase = createClient();
        const fetchProduct = async () => {
            try {
                const { data } = await supabase
                    .from('products')
                    .select('*, category:categories(*)')
                    .eq('slug', params.slug)
                    .single();
                if (data) {
                    setProduct(data);
                    // Fetch related
                    const { data: related } = await supabase
                        .from('products')
                        .select('*, category:categories(*)')
                        .eq('category_id', data.category_id)
                        .neq('id', data.id)
                        .eq('is_active', true)
                        .limit(4);
                    if (related) setRelatedProducts(related);
                }
            } catch { }
        };
        fetchProduct();
    }, [params.slug]);

    return (
        <div className={styles.page}>
            <div className="container">
                <Link href="/shop" className={styles.backLink}>
                    <ArrowLeft size={16} /> Back to Shop
                </Link>

                <div className={styles.productLayout}>
                    {/* Image Gallery */}
                    <div className={styles.gallery}>
                        <div className={styles.mainImage}>
                            {product.images?.[selectedImage] ? (
                                <Image
                                    src={product.images[selectedImage]}
                                    alt={product.name}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    priority
                                />
                            ) : (
                                <div className={styles.placeholder}>
                                    <ShoppingBag size={64} />
                                </div>
                            )}
                            {hasDiscount && (
                                <span className={styles.discountBadge}>
                                    -{Math.round((1 - product.price / product.compare_at_price!) * 100)}%
                                </span>
                            )}
                        </div>
                        {product.images && product.images.length > 1 && (
                            <div className={styles.thumbnails}>
                                {product.images.map((img, i) => (
                                    <button
                                        key={i}
                                        className={`${styles.thumb} ${i === selectedImage ? styles.thumbActive : ''}`}
                                        onClick={() => setSelectedImage(i)}
                                    >
                                        <Image src={img} alt="" fill style={{ objectFit: 'cover' }} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className={styles.info}>
                        {product.category && (
                            <Link href={`/categories/${product.category.slug}`} className={styles.category}>
                                {product.category.name}
                            </Link>
                        )}
                        <h1 className={styles.name}>{product.name}</h1>

                        {product.avg_rating !== undefined && product.avg_rating > 0 && (
                            <div className={styles.rating}>
                                <div className={styles.stars}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <Star
                                            key={star}
                                            size={16}
                                            fill={star <= Math.round(product.avg_rating!) ? 'var(--color-warning)' : 'none'}
                                            stroke="var(--color-warning)"
                                        />
                                    ))}
                                </div>
                                <span>{product.avg_rating.toFixed(1)}</span>
                                <span className={styles.reviewCount}>({product.review_count} reviews)</span>
                            </div>
                        )}

                        <div className={styles.priceBlock}>
                            <span className={styles.price}>${product.price.toFixed(2)}</span>
                            {hasDiscount && (
                                <span className={styles.comparePrice}>${product.compare_at_price!.toFixed(2)}</span>
                            )}
                        </div>

                        <p className={styles.description}>{product.description}</p>

                        {product.sku && (
                            <p className={styles.sku}>SKU: {product.sku}</p>
                        )}

                        <div className={styles.divider} />

                        {/* Add to Cart */}
                        <div className={styles.addToCart}>
                            <div className={styles.qtyControl}>
                                <button
                                    className={styles.qtyBtn}
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                >
                                    <Minus size={16} />
                                </button>
                                <span className={styles.qtyValue}>{quantity}</span>
                                <button
                                    className={styles.qtyBtn}
                                    onClick={() => setQuantity(quantity + 1)}
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                            <button
                                className="btn btn-primary btn-lg"
                                style={{ flex: 1 }}
                                onClick={() => addItem(product, quantity)}
                                disabled={product.stock_quantity <= 0}
                            >
                                <ShoppingCart size={18} />
                                {product.stock_quantity <= 0 ? 'Out of Stock' : inCart ? 'Add More to Cart' : 'Add to Cart'}
                            </button>
                        </div>

                        {inCart && (
                            <p className={styles.inCartMsg}>✓ {cartQty} already in your cart</p>
                        )}

                        <div className={styles.deliveryInfo}>
                            <div className={styles.deliveryItem}>
                                <Truck size={18} />
                                <div>
                                    <strong>Cash on Delivery</strong>
                                    <p>Pay when you receive your order</p>
                                </div>
                            </div>
                            <div className={styles.deliveryItem}>
                                <Store size={18} />
                                <div>
                                    <strong>In-Store Pickup</strong>
                                    <p>Free — pick up at our store</p>
                                </div>
                            </div>
                        </div>

                        <p className={styles.stock}>
                            {product.stock_quantity > 0 ? (
                                <span className={styles.inStock}>✓ In Stock ({product.stock_quantity} available)</span>
                            ) : (
                                <span className={styles.outOfStock}>✗ Out of Stock</span>
                            )}
                        </p>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className={styles.related}>
                        <h2 className={styles.relatedTitle}>Related Products</h2>
                        <div className={styles.relatedGrid}>
                            {relatedProducts.map(p => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
