'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useCart } from '@/contexts/cart-context';
import { useWishlist } from '@/contexts/wishlist-context';
import { useAuth } from '@/contexts/auth-context';
import ProductCard from '@/components/product-card';
import { Product } from '@/types';
import { ShoppingCart, Heart, Star, Minus, Plus, Truck, Store, ArrowLeft, ShoppingBag } from 'lucide-react';
import styles from './detail.module.css';

function ReviewForm({ productId, onSubmitted }: { productId: string, onSubmitted: () => void }) {
    const { user } = useAuth();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!user) {
        return (
            <div className={styles.loginToReview}>
                <p>Please <Link href="/login">login</Link> to write a review.</p>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        const supabase = createClient();
        try {
            const { error: err } = await supabase
                .from('reviews')
                .insert({
                    product_id: productId,
                    customer_id: user.id,
                    rating,
                    comment
                });
            
            if (err) throw err;
            onSubmitted();
        } catch (error: any) {
            setError(error.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form className={styles.reviewForm} onSubmit={handleSubmit}>
            <div className={styles.ratingSelect}>
                <label>Your Rating</label>
                <div className={styles.starInput}>
                    {[1, 2, 3, 4, 5].map(star => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className={styles.starBtn}
                        >
                            <Star
                                size={24}
                                fill={star <= rating ? 'var(--color-warning)' : 'none'}
                                stroke="var(--color-warning)"
                            />
                        </button>
                    ))}
                </div>
            </div>
            <div className={styles.inputGroup}>
                <label>Your Comment</label>
                <textarea
                    className="input textarea"
                    placeholder="Share your experience with this product..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    required
                />
            </div>
            {error && <p className={styles.errorMsg}>{error}</p>}
            <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ width: '100%' }}
            >
                {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
        </form>
    );
}

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
    const [reviews, setReviews] = useState<any[]>([]);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const { addItem, isInCart, getItemQuantity } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const inCart = isInCart(product.id);
    const cartQty = getItemQuantity(product.id);
    const isWishlisted = isInWishlist(product.id);
    const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;

    useEffect(() => {
        const supabase = createClient();
        const fetchProduct = async () => {
            try {
                // Fetch product with reviews
                const { data } = await supabase
                    .from('products')
                    .select('*, category:categories(*), reviews(*, customer:profiles(full_name, avatar_url))')
                    .eq('slug', params.slug)
                    .single();
                
                if (data) {
                    const revs = data.reviews || [];
                    const avgRating = revs.length > 0 
                        ? revs.reduce((acc: number, r: any) => acc + r.rating, 0) / revs.length 
                        : 0;
                    
                    setProduct({
                        ...data,
                        avg_rating: avgRating,
                        review_count: revs.length
                    });
                    setReviews(revs.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));

                    // Fetch related
                    const { data: related } = await supabase
                        .from('products')
                        .select('*, category:categories(*), reviews(rating)')
                        .eq('category_id', data.category_id)
                        .neq('id', data.id)
                        .eq('is_active', true)
                        .limit(4);
                    
                    if (related) {
                        const relatedWithRatings = related.map((p: any) => ({
                            ...p,
                            avg_rating: p.reviews.length > 0 ? p.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / p.reviews.length : 0,
                            review_count: p.reviews.length
                        }));
                        setRelatedProducts(relatedWithRatings);
                    }
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
                            <button
                                className={`btn btn-secondary btn-lg ${isWishlisted ? styles.wishlisted : ''}`}
                                onClick={() => toggleWishlist(product)}
                                title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                                style={{ width: '56px', padding: 0, display: 'flex', alignItems: 'center', justifySelf: 'center' }}
                            >
                                <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
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

                {/* Reviews Section */}
                <div className={styles.reviewsSection}>
                    <div className={styles.reviewsHeader}>
                        <h2 className={styles.sectionTitle}>Customer Reviews</h2>
                        <div className={styles.ratingSummary}>
                            <div className={styles.bigRating}>{product.avg_rating?.toFixed(1) || '0.0'}</div>
                            <div>
                                <div className={styles.stars}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <Star
                                            key={star}
                                            size={18}
                                            fill={star <= Math.round(product.avg_rating || 0) ? 'var(--color-warning)' : 'none'}
                                            stroke="var(--color-warning)"
                                        />
                                    ))}
                                </div>
                                <div className={styles.reviewCountInfo}>Based on {product.review_count} reviews</div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.reviewsLayout}>
                        {/* Write a Review */}
                        <div className={styles.writeReview}>
                            <h3>Write a Review</h3>
                            <p>Share your thoughts with other customers</p>
                            
                            <ReviewForm 
                                productId={product.id} 
                                onSubmitted={() => {
                                    // Refresh (this is a simplified refresh)
                                    window.location.reload();
                                }} 
                            />
                        </div>

                        {/* Reviews List */}
                        <div className={styles.reviewsList}>
                            {reviews.length === 0 ? (
                                <div className={styles.noReviews}>
                                    <p>No reviews yet. Be the first to review this product!</p>
                                </div>
                            ) : (
                                reviews.map((review, i) => (
                                    <div key={review.id} className={styles.reviewItem}>
                                        <div className={styles.reviewTop}>
                                            <div className={styles.reviewAuthor}>
                                                <div className={styles.authorAvatar}>
                                                    {review.customer?.full_name?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <div className={styles.authorName}>{review.customer?.full_name || 'Verified Customer'}</div>
                                                    <div className={styles.reviewDate}>{new Date(review.created_at).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                            <div className={styles.reviewStars}>
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <Star
                                                        key={star}
                                                        size={14}
                                                        fill={star <= review.rating ? 'var(--color-warning)' : 'none'}
                                                        stroke="var(--color-warning)"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        {review.comment && <p className={styles.reviewComment}>{review.comment}</p>}
                                    </div>
                                ))
                            )}
                        </div>
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
