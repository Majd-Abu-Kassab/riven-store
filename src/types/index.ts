// ===== User & Auth Types =====
export type UserRole = 'customer' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  phone?: string;
  address?: string;
  city?: string;
  created_at: string;
}

// ===== Category Types =====
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: string;
  sort_order: number;
  created_at: string;
}

// ===== Product Types =====
export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  compare_at_price?: number;
  category_id?: string;
  category?: Category;
  images: string[];
  stock_quantity: number;
  is_featured: boolean;
  is_active: boolean;
  sku?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  // Computed
  avg_rating?: number;
  review_count?: number;
}

// ===== Cart Types =====
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

// ===== Order Types =====
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type DeliveryMethod = 'delivery' | 'pickup';

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  customer?: Profile;
  status: OrderStatus;
  delivery_method: DeliveryMethod;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  shipping_name: string;
  shipping_address?: string;
  shipping_city?: string;
  shipping_phone: string;
  notes?: string;
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product?: Product;
  product_name: string;
  product_image?: string;
  quantity: number;
  price: number;
  created_at: string;
}

// ===== Review Types =====
export interface Review {
  id: string;
  product_id: string;
  customer_id: string;
  customer?: Profile;
  rating: number;
  comment?: string;
  created_at: string;
}

// ===== Wishlist Types =====
export interface WishlistItem {
  id: string;
  customer_id: string;
  product_id: string;
  product?: Product;
  created_at: string;
}

// ===== Site Page Types =====
export interface SitePage {
  id: string;
  slug: string;
  title: string;
  content: string;
  updated_at: string;
}
