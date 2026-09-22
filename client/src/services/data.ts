import type { Product, Category, Review } from '../types/fashion';

export const CATEGORIES: Category[] = [
  {
    id: 'bridal',
    name: 'Bridal Lehengas',
    tagline: 'Royal Zardozi & Heritage Embroidery',
    itemCount: 42,
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800',
    badge: 'Most Popular'
  },
  {
    id: 'sarees',
    name: 'Kanjeevaram & Designer Sarees',
    tagline: 'Handwoven Pure Silk & Organza Elegance',
    itemCount: 58,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
    badge: 'Trending'
  },
  {
    id: 'indo-western',
    name: 'Indo-Western & Gowns',
    tagline: 'Modern Cut Coutures for Sangeet & Reception',
    itemCount: 35,
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'menswear',
    name: 'Sherwanis & Groom Wear',
    tagline: 'Majestic Velvet & Brocade Sherwanis',
    itemCount: 29,
    image: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'anarkalis',
    name: 'Anarkalis & Festive Suits',
    tagline: 'Flowy Silhouettes for Haldi & Mehendi',
    itemCount: 38,
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'jewelry',
    name: 'Bridal Jewelry & Accessories',
    tagline: 'Kundan, Polki & Temple Jewelry Sets',
    itemCount: 46,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800',
    badge: 'New Collection'
  }
];

export const PRODUCTS: Product[] = [
  {
    id: 'jtf-001',
    name: 'Maharani Velvet Crimson Bridal Lehenga',
    category: 'bridal',
    categoryLabel: 'Bridal Lehenga',
    designer: 'Jai Thuthiksha Couture',
    retailPrice: 85000,
    rentalPrice4Days: 5999,
    rentalPrice8Days: 9499,
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800',
    galleryImages: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Exquisite deep crimson velvet lehenga intricately handcrafted with antique gold dabka, zardozi work, and paired with a double organza dupatta. Ideal for royal wedding ceremonies.',
    fabric: 'Micro Velvet & Net Dupatta',
    workType: 'Heavy Zardozi, Sequins & Thread Embroidery',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Crimson Red', 'Royal Maroon'],
    rating: 4.9,
    reviewCount: 38,
    isTrending: true,
    occasion: 'Wedding Day'
  },
  {
    id: 'jtf-002',
    name: 'Pure Temple Gold Kanjeevaram Silk Saree',
    category: 'sarees',
    categoryLabel: 'Silk Saree',
    designer: 'Kanchipuram Craftsmen',
    retailPrice: 42000,
    rentalPrice4Days: 2999,
    rentalPrice8Days: 4799,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
    galleryImages: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Authentic handwoven pure mulberry silk saree featuring traditional gold zari peacock motifs, grand pallu, and unstitched matching blouse piece with custom fitting.',
    fabric: 'Pure Mulberry Silk (Silk Mark Certified)',
    workType: 'Gold Zari Weaving',
    sizes: ['Free Size (Custom Blouse)'],
    colors: ['Mustard Gold', 'Deep Emerald'],
    rating: 4.8,
    reviewCount: 29,
    isTrending: true,
    occasion: 'Reception / Festive'
  },
  {
    id: 'jtf-003',
    name: 'Emerald Glitter Embroidered Indo-Western Gown',
    category: 'indo-western',
    categoryLabel: 'Indo-Western',
    designer: 'JTF Modern Atelier',
    retailPrice: 38000,
    rentalPrice4Days: 2499,
    rentalPrice8Days: 3999,
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=800',
    galleryImages: [
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Breathtaking emerald green flared floor-length gown featuring structured corset detail, mirror work embellishments, and dramatic ruffled train.',
    fabric: 'Silk Georgette & Tulle',
    workType: 'Mirror Work & Micro Crystals',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Emerald Green', 'Sapphire Blue'],
    rating: 4.9,
    reviewCount: 22,
    isNewArrival: true,
    occasion: 'Sangeet / Cocktails'
  },
  {
    id: 'jtf-004',
    name: 'Royal Navy Blue Velvet Groom Sherwani',
    category: 'menswear',
    categoryLabel: 'Mens Sherwani',
    designer: 'JTF Menswear',
    retailPrice: 55000,
    rentalPrice4Days: 3999,
    rentalPrice8Days: 6299,
    image: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&q=80&w=800',
    galleryImages: [
      'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Regal navy blue velvet sherwani embellished with antique gold threadwork, paired with silk churidar, layered pearl necklace, and embroidered safa.',
    fabric: 'Premium Velvet & Raw Silk',
    workType: 'Gold Thread Embroidered Collar & Cuffs',
    sizes: ['38', '40', '42', '44'],
    colors: ['Navy Blue', 'Royal Ivory'],
    rating: 4.9,
    reviewCount: 31,
    isTrending: true,
    occasion: 'Groom Outfit'
  },
  {
    id: 'jtf-005',
    name: 'Pastel Blush Pink Mirror Work Anarkali Set',
    category: 'anarkalis',
    categoryLabel: 'Anarkali Set',
    designer: 'Jai Thuthiksha Fashion',
    retailPrice: 28000,
    rentalPrice4Days: 1899,
    rentalPrice8Days: 2999,
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800',
    galleryImages: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Dreamy pastel blush pink floor-length flared Anarkali embellished with genuine mirrors, Chikankari thread accents, and soft organza scalloped dupatta.',
    fabric: 'Georgette & Net',
    workType: 'Chikankari & Mirror Work',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Blush Pink', 'Peach Pastel'],
    rating: 4.7,
    reviewCount: 19,
    isNewArrival: true,
    occasion: 'Mehendi / Haldi'
  },
  {
    id: 'jtf-006',
    name: 'Heritage Kundan & Uncut Diamond Bridal Necklace Set',
    category: 'jewelry',
    categoryLabel: 'Bridal Jewelry',
    designer: 'JTF Heritage Jewels',
    retailPrice: 65000,
    rentalPrice4Days: 3499,
    rentalPrice8Days: 5499,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800',
    galleryImages: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Complete 22K gold-plated bridal set including heavy choker necklace, long rani haar, matching chandelier earrings, maang tikka, and nath.',
    fabric: 'Gold Plated Brass & Kundan Glass Stones',
    workType: 'Handcrafted Meenakari & Kundan',
    sizes: ['Adjustable'],
    colors: ['Gold & Pearl', 'Emerald Accents'],
    rating: 5.0,
    reviewCount: 44,
    isTrending: true,
    occasion: 'Bridal Jewelry'
  },
  {
    id: 'jtf-007',
    name: 'Rose Pink Sequined Pastel Bridal Lehenga',
    category: 'bridal',
    categoryLabel: 'Bridal Lehenga',
    designer: 'JTF Luxury Collection',
    retailPrice: 92000,
    rentalPrice4Days: 6499,
    rentalPrice8Days: 9999,
    image: 'https://images.unsplash.com/photo-1546804784-896d0dca3814?auto=format&fit=crop&q=80&w=800',
    galleryImages: [
      'https://images.unsplash.com/photo-1546804784-896d0dca3814?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Ethereal rose pink organza lehenga with silver crystal sequin highlights and handmade pearl latkan tassels.',
    fabric: 'Silk Organza',
    workType: 'Crystal & Sequin Hand Embroidery',
    sizes: ['S', 'M', 'L'],
    colors: ['Rose Pink'],
    rating: 4.9,
    reviewCount: 16,
    occasion: 'Reception'
  },
  {
    id: 'jtf-008',
    name: 'Royal Purple Tissue Organza Designer Saree',
    category: 'sarees',
    categoryLabel: 'Designer Saree',
    designer: 'Jai Thuthiksha Weaves',
    retailPrice: 32000,
    rentalPrice4Days: 2199,
    rentalPrice8Days: 3499,
    image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=800',
    galleryImages: [
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Shimmering purple tissue organza saree paired with an intricately hand-embroidered raw silk blouse piece.',
    fabric: 'Tissue Organza & Raw Silk',
    workType: 'Cutdana & Zircon Embellishments',
    sizes: ['Free Size'],
    colors: ['Royal Purple'],
    rating: 4.8,
    reviewCount: 25,
    occasion: 'Cocktail / Engagement'
  }
];

export const REVIEWS: Review[] = [
  {
    id: 'rev-1',
    author: 'Priya Sundaram',
    role: 'Bride from Chennai',
    rating: 5,
    comment: 'Jai Thuthiksha Fashion made my dream wedding outfit possible! The Maharani Crimson Lehenga was in pristine condition, smelled fresh like new, and fitted like it was tailor-made for me. Everyone at the reception couldn’t stop complimenting it!',
    outfitName: 'Maharani Velvet Crimson Bridal Lehenga',
    date: '2 weeks ago',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'rev-2',
    author: 'Ananya & Vikram',
    role: 'Groom & Bride',
    rating: 5,
    comment: 'We rented both the Kanjeevaram Silk Saree and the Navy Velvet Sherwani. The alteration service was spot on, and the free home pickup after the event was so hassle-free!',
    outfitName: 'Pure Temple Gold Kanjeevaram Saree',
    date: '1 month ago',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'rev-3',
    author: 'Kavitha Rajan',
    role: 'Sangeet Performer',
    rating: 5,
    comment: 'Renting from Jai Thuthiksha saved me over ₹30,000! High quality designer clothes at an affordable rental rate. The customer service team kept me updated every step of the way.',
    outfitName: 'Emerald Glitter Indo-Western Gown',
    date: '3 weeks ago',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=200'
  }
];

export const FAQS = [
  {
    q: 'How does renting fashion outfits from Jai Thuthiksha work?',
    a: 'Simply select your favorite designer outfit, pick your rental dates (4-day or 8-day period), enter your custom measurements, and place your order. We deliver the sanitized, ready-to-wear outfit 1 day prior to your event date. After your event, place the outfit in our return bag and we collect it!'
  },
  {
    q: 'Will the outfit fit me perfectly?',
    a: 'Yes! We offer custom alterations on all rental garments. When booking, submit your bust, waist, hip, and height measurements, or book an in-person trial fitting appointment at our boutique.'
  },
  {
    q: 'How are garments sanitized and cleaned?',
    a: 'Every item goes through a strict 5-stage medical-grade dry cleaning and steam sanitization process after every use. It is delivered in a sealed protective garment bag.'
  },
  {
    q: 'What if I accidentally spill something or damage the outfit?',
    a: 'We understand accidents happen! All rentals include complimentary basic damage coverage for minor stains or loose threads. For major alterations or severe damage, minimal fees apply as detailed in our rental agreement.'
  },
  {
    q: 'Can I try on the outfits before renting?',
    a: 'Absolutely! You can visit our boutique in person for a free styling and trial session. Click "Book Fitting Appointment" in the menu to schedule your visit.'
  }
];
