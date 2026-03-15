'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import ProductCard from '@/components/product-card';
import { Product, Category } from '@/types';
import { SlidersHorizontal, Grid3X3, LayoutList, Search } from 'lucide-react';
import styles from './shop.module.css';

const DEMO_CATEGORIES: Category[] = [
    { id: '1', name: 'Electronics', slug: 'electronics', description: '', image_url: '', sort_order: 1, created_at: '' },
    { id: '2', name: 'Fashion', slug: 'fashion', description: '', image_url: '', sort_order: 2, created_at: '' },
    { id: '3', name: 'Home & Living', slug: 'home-living', description: '', image_url: '', sort_order: 3, created_at: '' },
    { id: '4', name: 'Sports', slug: 'sports', description: '', image_url: '', sort_order: 4, created_at: '' },
];

const DEMO_PRODUCTS: Product[] = [
    { id: '1', name: 'Wireless Headphones Pro', slug: 'wireless-headphones-pro', price: 89.99, compare_at_price: 129.99, category_id: '1', category: DEMO_CATEGORIES[0], images: [], stock_quantity: 15, is_featured: true, is_active: true, created_at: '', updated_at: '', avg_rating: 4.8, review_count: 124 },
    { id: '2', name: 'Minimalist Watch', slug: 'minimalist-watch', price: 149.99, category_id: '2', category: DEMO_CATEGORIES[1], images: [], stock_quantity: 8, is_featured: true, is_active: true, created_at: '', updated_at: '', avg_rating: 4.6, review_count: 89 },
    { id: '3', name: 'Smart Water Bottle', slug: 'smart-water-bottle', price: 34.99, compare_at_price: 49.99, category_id: '3', category: DEMO_CATEGORIES[2], images: [], stock_quantity: 30, is_featured: true, is_active: true, created_at: '', updated_at: '', avg_rating: 4.3, review_count: 56 },
    { id: '4', name: 'Yoga Mat Premium', slug: 'yoga-mat-premium', price: 45.00, category_id: '4', category: DEMO_CATEGORIES[3], images: [], stock_quantity: 22, is_featured: false, is_active: true, created_at: '', updated_at: '', avg_rating: 4.9, review_count: 201 },
    { id: '5', name: 'Leather Backpack', slug: 'leather-backpack', price: 199.99, compare_at_price: 249.99, category_id: '2', category: DEMO_CATEGORIES[1], images: [], stock_quantity: 5, is_featured: true, is_active: true, created_at: '', updated_at: '', avg_rating: 4.7, review_count: 67 },
    { id: '6', name: 'Portable Speaker', slug: 'portable-speaker', price: 59.99, category_id: '1', category: DEMO_CATEGORIES[0], images: [], stock_quantity: 18, is_featured: false, is_active: true, created_at: '', updated_at: '', avg_rating: 4.5, review_count: 143 },
    { id: '7', name: 'Scented Candle Set', slug: 'scented-candle-set', price: 28.99, category_id: '3', category: DEMO_CATEGORIES[2], images: [], stock_quantity: 40, is_featured: false, is_active: true, created_at: '', updated_at: '', avg_rating: 4.4, review_count: 78 },
    { id: '8', name: 'Running Shoes', slug: 'running-shoes', price: 119.99, compare_at_price: 159.99, category_id: '4', category: DEMO_CATEGORIES[3], images: [], stock_quantity: 0, is_featured: false, is_active: true, created_at: '', updated_at: '', avg_rating: 4.6, review_count: 95 },
    { id: '9', name: 'USB-C Hub Pro', slug: 'usb-c-hub-pro', price: 49.99, category_id: '1', category: DEMO_CATEGORIES[0], images: [], stock_quantity: 25, is_featured: false, is_active: true, created_at: '', updated_at: '', avg_rating: 4.2, review_count: 45 },
    { id: '10', name: 'Ceramic Vase Set', slug: 'ceramic-vase-set', price: 67.99, category_id: '3', category: DEMO_CATEGORIES[2], images: [], stock_quantity: 12, is_featured: false, is_active: true, created_at: '', updated_at: '', avg_rating: 4.7, review_count: 33 },
    { id: '11', name: 'Linen Shirt', slug: 'linen-shirt', price: 54.99, category_id: '2', category: DEMO_CATEGORIES[1], images: [], stock_quantity: 20, is_featured: false, is_active: true, created_at: '', updated_at: '', avg_rating: 4.5, review_count: 61 },
    { id: '12', name: 'Resistance Bands Set', slug: 'resistance-bands-set', price: 24.99, category_id: '4', category: DEMO_CATEGORIES[3], images: [], stock_quantity: 50, is_featured: false, is_active: true, created_at: '', updated_at: '', avg_rating: 4.3, review_count: 87 },
];

export default function ShopPage() {
    const searchParams = useSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('newest');
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catsRes, prodsRes] = await Promise.all([
                    fetch('/api/store/categories'),
                    fetch('/api/store/products?active=true'),
                ]);
                if (catsRes.ok) {
                    const { categories: cats } = await catsRes.json();
                    if (cats && cats.length > 0) setCategories(cats);
                }
                if (prodsRes.ok) {
                    const { products: prods } = await prodsRes.json();
                    if (prods && prods.length > 0) setProducts(prods);
                }
            } catch { }
        };
        fetchData();
    }, []);

    // Filter & sort
    const filtered = products
        .filter(p => {
            if (selectedCategory !== 'all' && p.category_id !== selectedCategory) return false;
            if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
            if (searchParams.get('featured') === 'true' && !p.is_featured) return false;
            return true;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'price-low': return a.price - b.price;
                case 'price-high': return b.price - a.price;
                case 'name': return a.name.localeCompare(b.name);
                case 'rating': return (b.avg_rating || 0) - (a.avg_rating || 0);
                default: return 0;
            }
        });

    return (
        <div className={styles.page}>
            <div className="container">
                {/* Page Header */}
                <div className={styles.pageHeader}>
                    <div>
                        <h1 className={styles.pageTitle}>
                            {searchParams.get('featured') === 'true' ? 'Featured Products' : 'Shop'}
                        </h1>
                        <p className={styles.resultCount}>{filtered.length} products</p>
                    </div>
                    <div className={styles.headerActions}>
                        <button
                            className={`btn btn-secondary btn-sm ${styles.filterToggle}`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <SlidersHorizontal size={16} />
                            Filters
                        </button>
                        <select
                            className="input select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{ width: 'auto', padding: '8px 40px 8px 12px' }}
                        >
                            <option value="newest">Newest</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="name">Name A-Z</option>
                            <option value="rating">Top Rated</option>
                        </select>
                    </div>
                </div>

                <div className={styles.layout}>
                    {/* Sidebar Filters */}
                    <aside className={`${styles.sidebar} ${showFilters ? styles.sidebarOpen : ''}`}>
                        {/* Search */}
                        <div className={styles.filterGroup}>
                            <h4 className={styles.filterTitle}>Search</h4>
                            <div className={styles.searchWrap}>
                                <Search size={16} className={styles.searchIcon} />
                                <input
                                    type="text"
                                    className={`input ${styles.searchInput}`}
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Categories */}
                        <div className={styles.filterGroup}>
                            <h4 className={styles.filterTitle}>Category</h4>
                            <div className={styles.filterOptions}>
                                <button
                                    className={`${styles.filterOption} ${selectedCategory === 'all' ? styles.filterActive : ''}`}
                                    onClick={() => setSelectedCategory('all')}
                                >
                                    All Products
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        className={`${styles.filterOption} ${selectedCategory === cat.id ? styles.filterActive : ''}`}
                                        onClick={() => setSelectedCategory(cat.id)}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div className={styles.filterGroup}>
                            <h4 className={styles.filterTitle}>Price Range</h4>
                            <div className={styles.priceInputs}>
                                <input
                                    type="number"
                                    className="input"
                                    placeholder="Min"
                                    value={priceRange[0] || ''}
                                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                                    style={{ width: '100%' }}
                                />
                                <span>—</span>
                                <input
                                    type="number"
                                    className="input"
                                    placeholder="Max"
                                    value={priceRange[1] || ''}
                                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </div>

                        <button
                            className={`btn btn-ghost ${styles.clearFilters}`}
                            onClick={() => {
                                setSelectedCategory('all');
                                setSearchQuery('');
                                setPriceRange([0, 500]);
                            }}
                        >
                            Clear All Filters
                        </button>
                    </aside>

                    {/* Product Grid */}
                    <div className={styles.content}>
                        {filtered.length === 0 ? (
                            <div className="empty-state">
                                <Search size={48} />
                                <h3>No products found</h3>
                                <p>Try adjusting your filters or search query</p>
                            </div>
                        ) : (
                            <div className={styles.productGrid}>
                                {filtered.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
