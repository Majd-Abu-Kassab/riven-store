'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Locale = 'en' | 'ar';
type Direction = 'ltr' | 'rtl';

interface LanguageContextType {
    locale: Locale;
    direction: Direction;
    t: (key: string) => string;
    switchLanguage: (lang: Locale) => void;
}

const translations: Record<Locale, Record<string, string>> = {
    en: {
        // Navigation
        'home': 'Home',
        'shop': 'Shop',
        'categories': 'Categories',
        'account': 'My Account',
        'login': 'Sign In',
        'signup': 'Create Account',
        'logout': 'Log Out',
        'cart': 'Cart',
        'search': 'Search',
        'search_products': 'Search products...',
        'theme_toggle': 'Toggle theme',

        // Homepage
        'hero_badge': '✨ New Season Collection',
        'hero_title_1': 'Discover Premium',
        'hero_title_2': 'Quality',
        'hero_title_3': 'Products',
        'hero_subtitle': 'Curated selection of the finest products with fast delivery and in-store pickup. Cash on delivery available.',
        'shop_now': 'Shop Now',
        'browse_categories': 'Browse Categories',
        'fast_delivery': 'Fast Delivery',
        'fast_delivery_desc': 'Cash on delivery available',
        'in_store_pickup': 'In-Store Pickup',
        'in_store_pickup_desc': 'Free pickup at our store',
        'quality_guaranteed': 'Quality Guaranteed',
        'quality_guaranteed_desc': 'Premium products only',
        'top_rated': 'Top Rated',
        'top_rated_desc': 'Trusted by thousands',
        'shop_by_category': 'Shop by Category',
        'see_all': 'See All',
        'featured_products': 'Featured Products',
        'new_arrivals': 'New Arrivals',
        'cta_title': 'Ready to shop?',
        'cta_subtitle': 'Browse our full collection and find exactly what you need. Cash on delivery & in-store pickup.',
        'explore_all': 'Explore All Products',
        'explore': 'Explore',

        // Shop
        'products': 'products',
        'filters': 'Filters',
        'newest': 'Newest',
        'price_low_high': 'Price: Low to High',
        'price_high_low': 'Price: High to Low',
        'name_az': 'Name A-Z',
        'top_rated_sort': 'Top Rated',
        'search_label': 'Search',
        'category': 'Category',
        'all_products': 'All Products',
        'price_range': 'Price Range',
        'clear_filters': 'Clear All Filters',
        'no_products_found': 'No products found',
        'try_adjusting': 'Try adjusting your filters or search query',

        // Product Detail
        'back_to_shop': 'Back to Shop',
        'add_to_cart': 'Add to Cart',
        'add_more': 'Add More to Cart',
        'out_of_stock': 'Out of Stock',
        'in_stock': 'In Stock',
        'available': 'available',
        'already_in_cart': 'already in your cart',
        'cash_on_delivery': 'Cash on Delivery',
        'pay_on_receive': 'Pay when you receive your order',
        'free_pickup': 'Free — pick up at our store',
        'related_products': 'Related Products',
        'reviews': 'reviews',

        // Cart
        'your_cart': 'Your Cart',
        'cart_empty': 'Your cart is empty',
        'cart_empty_desc': 'Add some products to get started',
        'subtotal': 'Subtotal',
        'shipping': 'Shipping',
        'tax': 'Tax',
        'total': 'Total',
        'checkout': 'Checkout',
        'continue_shopping': 'Continue Shopping',
        'remove': 'Remove',

        // Checkout
        'delivery_method': 'Delivery Method',
        'delivery': 'Delivery',
        'pickup': 'Pickup',
        'shipping_info': 'Shipping Information',
        'contact_info': 'Contact Information',
        'full_name': 'Full Name',
        'phone_number': 'Phone Number',
        'city': 'City',
        'full_address': 'Full Address',
        'order_notes': 'Order Notes (optional)',
        'special_instructions': 'Any special instructions...',
        'place_order': 'Place Order',
        'order_summary': 'Order Summary',
        'order_placed': 'Order Placed!',
        'order_delivery_msg': 'Your order will be delivered soon. Pay with cash on delivery.',
        'order_pickup_msg': 'Your order is ready for pickup at our store.',
        'view_orders': 'View Orders',
        'free': 'Free',
        'pay_at_store': 'Pay at store when picking up',
        'pay_cash_delivery': 'Cash on delivery — pay when you receive',

        // Auth
        'welcome_back': 'Welcome Back',
        'sign_in_desc': 'Sign in to your Riven account',
        'email': 'Email',
        'password': 'Password',
        'sign_in': 'Sign In',
        'no_account': "Don't have an account?",
        'create_one': 'Create one',
        'create_account': 'Create Account',
        'join_riven': 'Join Riven and start shopping',
        'already_account': 'Already have an account?',

        // Account
        'profile_settings': 'Profile Settings',
        'wishlist': 'Wishlist',
        'my_orders': 'My Orders',
        'no_orders': 'No orders yet',
        'no_orders_desc': 'Start shopping to see your order history here',
        'start_shopping': 'Start Shopping',
        'items': 'items',
        'item': 'item',
        'save_changes': 'Save Changes',
        'saved': 'Saved!',
        'wishlist_empty': 'Your wishlist is empty',
        'wishlist_empty_desc': 'Save products you love for later',
        'browse_products': 'Browse Products',

        // Admin
        'admin': 'Admin',
        'dashboard': 'Dashboard',
        'admin_products': 'Products',
        'admin_orders': 'Orders',
        'admin_customers': 'Customers',
        'admin_categories': 'Categories',
        'back_to_store': 'Back to Store',
        'total_revenue': 'Total Revenue',
        'total_orders': 'Total Orders',
        'recent_orders': 'Recent Orders',
        'low_stock_alerts': 'Low Stock Alerts',
        'out_of_stock_badge': 'Out of stock',
        'left': 'left',
        'all_stocked': 'All products are well stocked!',
        'add_product': 'Add Product',
        'search_products_admin': 'Search products...',
        'product': 'Product',
        'sku': 'SKU',
        'price': 'Price',
        'stock': 'Stock',
        'status': 'Status',
        'actions': 'Actions',
        'active': 'Active',
        'inactive': 'Inactive',
        'edit_product': 'Edit Product',
        'new_product': 'New Product',
        'product_name': 'Product Name',
        'compare_price': 'Compare-at Price',
        'stock_quantity': 'Stock Quantity',
        'description': 'Description',
        'featured': 'Featured',
        'update_product': 'Update Product',
        'create_product': 'Create Product',
        'cancel': 'Cancel',
        'order': 'Order',
        'customer': 'Customer',
        'method': 'Method',
        'date': 'Date',
        'all': 'All',
        'pending': 'Pending',
        'confirmed': 'Confirmed',
        'processing': 'Processing',
        'shipped': 'Shipped',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled',
        'search_orders': 'Search orders...',
        'order_details': 'Order Details',
        'phone': 'Phone',
        'address': 'Address',
        'notes': 'Notes',
        'close': 'Close',
        'add_category': 'Add Category',
        'name': 'Name',
        'slug': 'Slug',
        'sort_order': 'Sort Order',
        'edit_category': 'Edit Category',
        'new_category': 'New Category',
        'update': 'Update',
        'create': 'Create',
        'search_customers': 'Search customers...',
        'orders': 'Orders',
        'total_spent': 'Total Spent',
        'joined': 'Joined',

        // Footer
        'footer_brand': 'Premium quality products with fast delivery and in-store pickup.',
        'footer_info': 'Information',
        'about': 'About Us',
        'contact': 'Contact',
        'faq': 'FAQ',
        'privacy': 'Privacy Policy',
        'terms': 'Terms of Service',
        'rights': 'All rights reserved.',
    },
    ar: {
        // Navigation
        'home': 'الرئيسية',
        'shop': 'المتجر',
        'categories': 'الأقسام',
        'account': 'حسابي',
        'login': 'تسجيل الدخول',
        'signup': 'إنشاء حساب',
        'logout': 'تسجيل الخروج',
        'cart': 'عربة التسوق',
        'search': 'بحث',
        'search_products': 'ابحث عن المنتجات...',
        'theme_toggle': 'تبديل المظهر',

        // Homepage
        'hero_badge': '✨ تشكيلة الموسم الجديد',
        'hero_title_1': 'اكتشف',
        'hero_title_2': 'المنتجات',
        'hero_title_3': 'المميزة',
        'hero_subtitle': 'مجموعة مختارة بعناية من أفضل المنتجات. توفر خدمة التوصيل السريع والاستلام من الفرع مع إمكانية الدفع عند الاستلام.',
        'shop_now': 'تسوق الآن',
        'browse_categories': 'تصفح الأقسام',
        'fast_delivery': 'توصيل سريع',
        'fast_delivery_desc': 'خدمة الدفع عند الاستلام متاحة',
        'in_store_pickup': 'استلام من الفرع',
        'in_store_pickup_desc': 'استلام مجاني من فرعنا',
        'quality_guaranteed': 'جودة مضمونة',
        'quality_guaranteed_desc': 'منتجات أصلية فقط',
        'top_rated': 'الأعلى تقييمًا',
        'top_rated_desc': 'موثوقة من قبل الآلاف',
        'shop_by_category': 'تسوق حسب القسم',
        'see_all': 'عرض الكل',
        'featured_products': 'منتجات مختارة',
        'new_arrivals': 'وصل حديثًا',
        'cta_title': 'مستعد للتسوق؟',
        'cta_subtitle': 'استكشف مجموعتنا الكاملة واعثر على ما تبحث عنه. الدفع عند الاستلام والاستلام من الفرع.',
        'explore_all': 'تصفح جميع المنتجات',
        'explore': 'تصفح',

        // Shop
        'products': 'منتجات',
        'filters': 'تصفية',
        'newest': 'الأحدث',
        'price_low_high': 'السعر: من الأقل للأعلى',
        'price_high_low': 'السعر: من الأعلى للأقل',
        'name_az': 'الاسم: أ-ي',
        'top_rated_sort': 'الأعلى تقييمًا',
        'search_label': 'بحث',
        'category': 'القسم',
        'all_products': 'جميع المنتجات',
        'price_range': 'نطاق السعر',
        'clear_filters': 'مسح الفلاتر',
        'no_products_found': 'لم يتم العثور على أي منتجات',
        'try_adjusting': 'حاول تعديل الفلاتر أو كلمات البحث',

        // Product Detail
        'back_to_shop': 'العودة للمتجر',
        'add_to_cart': 'أضف إلى العربة',
        'add_more': 'أضف المزيد',
        'out_of_stock': 'نفدت الكمية',
        'in_stock': 'متوفر',
        'available': 'متوفر',
        'already_in_cart': 'تمت إضافته مسبقًا',
        'cash_on_delivery': 'الدفع عند الاستلام',
        'pay_on_receive': 'ادفع قيمة طلبك عند استلامه',
        'free_pickup': 'مجاني — استلم من فرعنا',
        'related_products': 'منتجات ذات صلة',
        'reviews': 'تقييمات',

        // Cart
        'your_cart': 'عربة التسوق الخاصة بك',
        'cart_empty': 'عربة التسوق فارغة',
        'cart_empty_desc': 'أضف بعض المنتجات للبدء',
        'subtotal': 'المجموع الفرعي',
        'shipping': 'الشحن',
        'tax': 'الضريبة',
        'total': 'الإجمالي',
        'checkout': 'إتمام الطلب',
        'continue_shopping': 'متابعة التسوق',
        'remove': 'إزالة',

        // Checkout
        'delivery_method': 'طريقة التوصيل',
        'delivery': 'توصيل',
        'pickup': 'استلام بالفرع',
        'shipping_info': 'معلومات الشحن',
        'contact_info': 'معلومات الاتصال',
        'full_name': 'الاسم الكامل',
        'phone_number': 'رقم الجوال',
        'city': 'المدينة',
        'full_address': 'العنوان بالكامل',
        'order_notes': 'ملاحظات الطلب (اختياري)',
        'special_instructions': 'أضف أي تعليمات خاصة بالتوصيل...',
        'place_order': 'تأكيد الطلب',
        'order_summary': 'ملخص الطلب',
        'order_placed': 'تم تأكيد طلبك بنجاح!',
        'order_delivery_msg': 'سيتم توصيل طلبك في أقرب وقت. يرجى تجهيز المبلغ للدفع عند الاستلام.',
        'order_pickup_msg': 'طلبك جاهز للاستلام من فرعنا.',
        'view_orders': 'عرض الطلبات',
        'free': 'مجاني',
        'pay_at_store': 'الدفع عند الاستلام في الفرع',
        'pay_cash_delivery': 'الدفع نقدًا عند الاستلام',

        // Auth
        'welcome_back': 'مرحبًا بك من جديد',
        'sign_in_desc': 'سجل الدخول إلى حسابك',
        'email': 'البريد الإلكتروني',
        'password': 'كلمة المرور',
        'sign_in': 'تسجيل الدخول',
        'no_account': 'ليس لديك حساب؟',
        'create_one': 'إنشاء حساب جديد',
        'create_account': 'إنشاء حساب',
        'join_riven': 'انضم إلينا وابدأ التسوق',
        'already_account': 'لديك حساب بالفعل؟',

        // Account
        'profile_settings': 'إعدادات الحساب',
        'wishlist': 'قائمة الأمنيات',
        'my_orders': 'طلباتي',
        'no_orders': 'لا توجد طلبات سابقة',
        'no_orders_desc': 'ابدأ التسوق لتظهر طلباتك هنا',
        'start_shopping': 'ابدأ التسوق',
        'items': 'منتجات',
        'item': 'منتج',
        'save_changes': 'حفظ التغييرات',
        'saved': 'تم الحفظ!',
        'wishlist_empty': 'قائمة الأمنيات فارغة',
        'wishlist_empty_desc': 'احفظ المنتجات التي أعجبتك للرجوع إليها لاحقًا',
        'browse_products': 'تصفح المنتجات',

        // Admin
        'admin': 'لوحة الإدارة',
        'dashboard': 'لوحة التحكم',
        'admin_products': 'المنتجات',
        'admin_orders': 'الطلبات',
        'admin_customers': 'العملاء',
        'admin_categories': 'الأقسام',
        'back_to_store': 'العودة للمتجر',
        'total_revenue': 'إجمالي المبيعات',
        'total_orders': 'إجمالي الطلبات',
        'recent_orders': 'أحدث الطلبات',
        'low_stock_alerts': 'تنبيهات انخفاض المخزون',
        'out_of_stock_badge': 'نفدت الكمية',
        'left': 'متبقي',
        'all_stocked': 'جميع المنتجات الطبية متوفرة بكميات كافية!',
        'add_product': 'إضافة منتج',
        'search_products_admin': 'ابحث عن المنتجات...',
        'product': 'المنتج',
        'sku': 'رمز التخزين',
        'price': 'السعر',
        'stock': 'المخزون',
        'status': 'الحالة',
        'actions': 'إجراءات',
        'active': 'نشط',
        'inactive': 'غير نشط',
        'edit_product': 'تعديل',
        'new_product': 'منتج جديد',
        'product_name': 'اسم المنتج',
        'compare_price': 'السعر قبل الخصم',
        'stock_quantity': 'الكمية المتوفرة',
        'description': 'الوصف',
        'featured': 'مميز',
        'update_product': 'حفظ التعديلات',
        'create_product': 'إنشاء',
        'cancel': 'إلغاء',
        'order': 'الطلب',
        'customer': 'العميل',
        'method': 'التوصيل',
        'date': 'التاريخ',
        'all': 'الكل',
        'pending': 'جديد',
        'confirmed': 'مؤكد',
        'processing': 'قيد التجهيز',
        'shipped': 'تم الشحن',
        'delivered': 'مكتمل',
        'cancelled': 'ملغي',
        'search_orders': 'ابحث في الطلبات...',
        'order_details': 'تفاصيل الطلب',
        'phone': 'رقم الجوال',
        'address': 'العنوان',
        'notes': 'ملاحظات',
        'close': 'إغلاق',
        'add_category': 'إضافة قسم',
        'name': 'الاسم',
        'slug': 'الرابط المختصر',
        'sort_order': 'الترتيب',
        'edit_category': 'تعديل القسم',
        'new_category': 'قسم جديد',
        'update': 'تحديث',
        'create': 'إنشاء',
        'search_customers': 'ابحث عن العملاء...',
        'orders': 'الطلبات',
        'total_spent': 'إجمالي المدفوعات',
        'joined': 'تاريخ الانضمام',

        // Footer
        'footer_brand': 'منتجات عالية الجودة مع التوصيل السريع والاستلام من الفرع.',
        'footer_info': 'المعلومات',
        'about': 'من نحن',
        'contact': 'اتصل بنا',
        'faq': 'الأسئلة الشائعة',
        'privacy': 'سياسة الخصوصية',
        'terms': 'شروط الخدمة',
        'rights': 'جميع الحقوق محفوظة.',
    },
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [locale, setLocale] = useState<Locale>('en');

    useEffect(() => {
        // Load saved preference
        const saved = localStorage.getItem('riven-lang') as Locale;
        if (saved === 'en' || saved === 'ar') setLocale(saved);
    }, []);

    useEffect(() => {
        document.documentElement.lang = locale;
        document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
        localStorage.setItem('riven-lang', locale);
    }, [locale]);

    function switchLanguage(lang: Locale) {
        setLocale(lang);
    }

    function t(key: string): string {
        return translations[locale][key] || key;
    }

    return (
        <LanguageContext.Provider value={{ locale, direction: locale === 'ar' ? 'rtl' : 'ltr', t, switchLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
    return context;
}
