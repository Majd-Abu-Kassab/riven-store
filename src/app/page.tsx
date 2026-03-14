'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Truck, Store, ShieldCheck, Star, ShoppingBag } from 'lucide-react';
import ProductCard from '@/components/product-card';
import { Product, Category } from '@/types';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import styles from './page.module.css';

// Demo data for when Supabase isn't connected yet
const DEMO_CATEGORIES: Category[] = [
  { id: '1', name: 'Electronics', slug: 'electronics', description: 'Latest gadgets and tech', image_url: '', sort_order: 1, created_at: '' },
  { id: '2', name: 'Fashion', slug: 'fashion', description: 'Trending styles', image_url: '', sort_order: 2, created_at: '' },
  { id: '3', name: 'Home & Living', slug: 'home-living', description: 'Make your space beautiful', image_url: '', sort_order: 3, created_at: '' },
  { id: '4', name: 'Sports', slug: 'sports', description: 'Gear up for adventure', image_url: '', sort_order: 4, created_at: '' },
];

const DEMO_PRODUCTS: Product[] = [
  { id: '1', name: 'Wireless Headphones Pro', slug: 'wireless-headphones-pro', description: 'Premium noise-canceling headphones', price: 89.99, compare_at_price: 129.99, category_id: '1', category: DEMO_CATEGORIES[0], images: [], stock_quantity: 15, is_featured: true, is_active: true, sku: 'WHP-001', created_at: '', updated_at: '', avg_rating: 4.8, review_count: 124 },
  { id: '2', name: 'Minimalist Watch', slug: 'minimalist-watch', description: 'Elegant timepiece for everyday wear', price: 149.99, category_id: '2', category: DEMO_CATEGORIES[1], images: [], stock_quantity: 8, is_featured: true, is_active: true, sku: 'MW-001', created_at: '', updated_at: '', avg_rating: 4.6, review_count: 89 },
  { id: '3', name: 'Smart Water Bottle', slug: 'smart-water-bottle', description: 'Tracks your hydration', price: 34.99, compare_at_price: 49.99, category_id: '3', category: DEMO_CATEGORIES[2], images: [], stock_quantity: 30, is_featured: true, is_active: true, sku: 'SWB-001', created_at: '', updated_at: '', avg_rating: 4.3, review_count: 56 },
  { id: '4', name: 'Yoga Mat Premium', slug: 'yoga-mat-premium', description: 'Non-slip exercise mat', price: 45.00, category_id: '4', category: DEMO_CATEGORIES[3], images: [], stock_quantity: 22, is_featured: false, is_active: true, sku: 'YMP-001', created_at: '', updated_at: '', avg_rating: 4.9, review_count: 201 },
  { id: '5', name: 'Leather Backpack', slug: 'leather-backpack', description: 'Handcrafted genuine leather', price: 199.99, compare_at_price: 249.99, category_id: '2', category: DEMO_CATEGORIES[1], images: [], stock_quantity: 5, is_featured: true, is_active: true, sku: 'LB-001', created_at: '', updated_at: '', avg_rating: 4.7, review_count: 67 },
  { id: '6', name: 'Portable Speaker', slug: 'portable-speaker', description: 'Waterproof bluetooth speaker', price: 59.99, category_id: '1', category: DEMO_CATEGORIES[0], images: [], stock_quantity: 18, is_featured: false, is_active: true, sku: 'PS-001', created_at: '', updated_at: '', avg_rating: 4.5, review_count: 143 },
  { id: '7', name: 'Scented Candle Set', slug: 'scented-candle-set', description: 'Set of 3 luxury candles', price: 28.99, category_id: '3', category: DEMO_CATEGORIES[2], images: [], stock_quantity: 40, is_featured: false, is_active: true, sku: 'SCS-001', created_at: '', updated_at: '', avg_rating: 4.4, review_count: 78 },
  { id: '8', name: 'Running Shoes', slug: 'running-shoes', description: 'Lightweight performance shoes', price: 119.99, compare_at_price: 159.99, category_id: '4', category: DEMO_CATEGORIES[3], images: [], stock_quantity: 0, is_featured: false, is_active: true, sku: 'RS-001', created_at: '', updated_at: '', avg_rating: 4.6, review_count: 95 },
];

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);

  useEffect(() => {
    const supabase = createClient();

    // Try to fetch real data
    const fetchData = async () => {
      try {
        const { data: cats } = await supabase
          .from('categories')
          .select('*')
          .order('sort_order');
        if (cats && cats.length > 0) setCategories(cats);

        const { data: featured } = await supabase
          .from('products')
          .select('*, category:categories(*)')
          .eq('is_featured', true)
          .eq('is_active', true)
          .limit(4);
        if (featured && featured.length > 0) setFeaturedProducts(featured);

        const { data: newest } = await supabase
          .from('products')
          .select('*, category:categories(*)')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(8);
        if (newest && newest.length > 0) setNewProducts(newest);
      } catch {
        // Handle errors or show empty state without falling back to demo data
        setCategories([]);
        setFeaturedProducts([]);
        setNewProducts([]);
      }
    };

    fetchData();
  }, []);

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <div className={styles.heroOrb1} />
          <div className={styles.heroOrb2} />
          <div className={styles.heroOrb3} />
        </div>
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroText}>
            <span className={styles.heroBadge}>✨ New Season Collection</span>
            <h1 className={styles.heroTitle}>
              Discover Premium <span className="gradient-text">Quality</span> Products
            </h1>
            <p className={styles.heroSubtitle}>
              Curated selection of the finest products with fast delivery and in-store pickup. Cash on delivery available.
            </p>
            <div className={styles.heroCTA}>
              <Link href="/shop" className="btn btn-primary btn-lg">
                Shop Now <ArrowRight size={18} />
              </Link>
              <Link href="/categories" className="btn btn-secondary btn-lg">
                Browse Categories
              </Link>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.heroCard}>
              <Image src="/logo.png" alt="Riven" width={200} height={200} className={styles.heroLogo} />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <div className="container">
          <div className={styles.featureGrid}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <Truck size={24} />
              </div>
              <div>
                <h4>Fast Delivery</h4>
                <p>Cash on delivery available</p>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <Store size={24} />
              </div>
              <div>
                <h4>In-Store Pickup</h4>
                <p>Free pickup at our store</p>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4>Quality Guaranteed</h4>
                <p>Premium products only</p>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <Star size={24} />
              </div>
              <div>
                <h4>Top Rated</h4>
                <p>Trusted by thousands</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Shop by Category</h2>
            <Link href="/categories" className={styles.seeAll}>
              See All <ArrowRight size={16} />
            </Link>
          </div>
          <div className={styles.categoryGrid}>
            {categories.slice(0, 4).map((cat) => (
              <Link key={cat.id} href={`/categories/${cat.slug}`} className={styles.categoryCard}>
                <div className={styles.categoryIcon}>
                  <ShoppingBag size={28} />
                </div>
                <h3 className={styles.categoryName}>{cat.name}</h3>
                <p className={styles.categoryDesc}>{cat.description}</p>
                <span className={styles.categoryLink}>
                  Explore <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Featured Products</h2>
            <Link href="/shop?featured=true" className={styles.seeAll}>
              See All <ArrowRight size={16} />
            </Link>
          </div>
          <div className={styles.productGrid}>
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className={styles.ctaBanner}>
        <div className="container">
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Ready to shop?</h2>
            <p className={styles.ctaSubtitle}>
              Browse our full collection and find exactly what you need. Cash on delivery &amp; in-store pickup.
            </p>
            <Link href="/shop" className="btn btn-primary btn-lg">
              Explore All Products <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>New Arrivals</h2>
            <Link href="/shop?sort=newest" className={styles.seeAll}>
              See All <ArrowRight size={16} />
            </Link>
          </div>
          <div className={styles.productGrid}>
            {newProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
