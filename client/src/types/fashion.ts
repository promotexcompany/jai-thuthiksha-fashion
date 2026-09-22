export interface Product {
  id: string;
  name: string;
  category: 'bridal' | 'sarees' | 'indo-western' | 'menswear' | 'anarkalis' | 'jewelry';
  categoryLabel: string;
  designer: string;
  retailPrice: number;
  rentalPrice4Days: number;
  rentalPrice8Days: number;
  image: string;
  galleryImages: string[];
  description: string;
  fabric: string;
  workType: string;
  sizes: string[];
  colors: string[];
  rating: number;
  reviewCount: number;
  isTrending?: boolean;
  isNewArrival?: boolean;
  primaryImage?: string;
  occasion: string;
}

export interface Category {
  id: string;
  name: string;
  tagline: string;
  itemCount: number;
  image: string;
  badge?: string;
  order?: number;
  enabled?: boolean;
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  startDate: string;
  durationDays: 4 | 8;
  totalPrice: number;
}

export interface Review {
  id: string;
  author: string;
  role: string;
  rating: number;
  comment: string;
  outfitName: string;
  date: string;
  avatar: string;
}
