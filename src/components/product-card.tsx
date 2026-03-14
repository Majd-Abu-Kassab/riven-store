'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { useCart } from '@/contexts/cart-context';
import { ShoppingCart, Heart, Star, Minus, Plus } from 'lucide-react';
import styles from './product-card.module.css';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { addItem, isInCart, getItemQuantity, updateQuantity } = useCart();
    const inCart = isInCart(product.id);
    const qty = getItemQuantity(product.id);
    const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
    const discountPercent = hasDiscount
        ? Math.round((1 - product.price / product.compare_at_price!) * 100)
        : 0;

    return (
        <div className={`${styles.card} card-hover`}>
            <Link href={`/shop/${product.slug}`} className={styles.imageWrap}>
                {product.images?.[0] ? (
                    <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="(max-width: 768px) 50vw, 25vw"
                    />
                ) : (
                    <div className={styles.placeholder}>
                        <ShoppingCart size={32} />
                    </div>
                )}
                {hasDiscount && (
                    <span className={styles.discountBadge}>-{discountPercent}%</span>
                )}
                {product.is_featured && (
                    <span className={styles.featuredBadge}>Featured</span>
                )}
                {product.stock_quantity <= 0 && (
                    <div className={styles.soldOut}>Sold Out</div>
                )}
            </Link>

            <div className={styles.info}>
                {product.category && (
                    <span className={styles.category}>{product.category.name}</span>
                )}
                <Link href={`/shop/${product.slug}`}>
                    <h3 className={styles.name}>{product.name}</h3>
                </Link>

                {product.avg_rating !== undefined && product.avg_rating > 0 && (
                    <div className={styles.rating}>
                        <Star size={14} fill="var(--color-warning)" stroke="var(--color-warning)" />
                        <span>{product.avg_rating.toFixed(1)}</span>
                        <span className={styles.reviewCount}>({product.review_count})</span>
                    </div>
                )}

                <div className={styles.priceRow}>
                    <div className={styles.prices}>
                        <span className={styles.price}>${product.price.toFixed(2)}</span>
                        {hasDiscount && (
                            <span className={styles.comparePrice}>${product.compare_at_price!.toFixed(2)}</span>
                        )}
                    </div>
                </div>

                <div className={styles.actions}>
                    {product.stock_quantity <= 0 ? (
                        <button className="btn btn-secondary btn-sm" disabled>
                            Out of Stock
                        </button>
                    ) : inCart ? (
                        <div className={styles.inlineQty}>
                            <button
                                className={styles.inlineQtyBtn}
                                onClick={() => updateQuantity(product.id, qty - 1)}
                            >
                                <Minus size={14} />
                            </button>
                            <span className={styles.inlineQtyVal}>{qty}</span>
                            <button
                                className={styles.inlineQtyBtn}
                                onClick={() => updateQuantity(product.id, qty + 1)}
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                    ) : (
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => addItem(product)}
                        >
                            <ShoppingCart size={14} />
                            Add to Cart
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
