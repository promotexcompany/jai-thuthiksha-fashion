export interface Product {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  categoryId?: string;
  designer: string;
  retailPrice: number;
  rentalPrice4Days: number;
  rentalPrice8Days: number;
  image: string;
  galleryImages: string[];
  images?: string[];
  description: string;
  fabric: string;
  workType: string;
  sizes: string[];
  colors: string[];
  rating: number;
  reviewCount: number;
  isTrending?: boolean;
  isNewArrival?: boolean;
  showOnHomepage?: boolean;
  displayOrder?: number;
  isAvailable?: boolean;
  isHidden?: boolean;
  advanceAmount?: number;
  primaryImage?: string;
  occasion: string;
}

export interface Category {
  id: string;
  name: string;
  slug?: string;
  tagline: string;
  itemCount: number;
  image: string;
  badge?: string;
  order?: number;
  enabled?: boolean;
}

export interface CategoryOffer {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  discountPercentage: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
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
