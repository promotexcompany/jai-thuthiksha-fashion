import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Default Seed Data
const getInitialData = () => {
  const adminHashedPassword = bcrypt.hashSync('Admin@JTF2026', 10);
  return {
    users: [
      {
        id: 'usr-admin-1',
        email: 'admin@jaithuthiksha.com',
        password: adminHashedPassword,
        name: 'Master Shop Admin',
        role: 'ADMIN',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr-cust-1',
        email: 'customer@example.com',
        password: bcrypt.hashSync('Customer123', 10),
        name: 'Ananya Sharma',
        role: 'CUSTOMER',
        createdAt: new Date().toISOString()
      }
    ],
    categories: [
      { id: 'cat-1', name: 'Bride Dresses', slug: 'bride-dresses', tagline: 'Royal Zardozi & Heritage Embroidery', enabled: true, order: 1, image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800' },
      { id: 'cat-2', name: 'Silk Sarees', slug: 'silk-sarees', tagline: 'Handwoven Pure Mulberry Silk', enabled: true, order: 2, image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800' },
      { id: 'cat-3', name: 'Maternity Wear', slug: 'maternity-wear', tagline: 'Comfortable & Elegant Photoshoot Fits', enabled: true, order: 3, image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=800' },
      { id: 'cat-4', name: 'Photoshoot Dresses', slug: 'photoshoot-dresses', tagline: 'Dramatic Trails & Flared Coutures', enabled: true, order: 4, image: 'https://images.unsplash.com/photo-1546804784-896d0dca3814?auto=format&fit=crop&q=80&w=800' },
      { id: 'cat-5', name: 'Traditional Wear', slug: 'traditional-wear', tagline: 'Anarkalis & Heavy Kurta Sets', enabled: true, order: 5, image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800' },
      { id: 'cat-6', name: 'Party Wear', slug: 'party-wear', tagline: 'Modern Indo-Western Gowns', enabled: true, order: 6, image: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&q=80&w=800' },
      { id: 'cat-7', name: 'Jewelry & Accessories', slug: 'jewelry', tagline: 'Kundan & Temple Jewelry Sets', enabled: true, order: 7, image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800' }
    ],
    filters: {
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom Measurement'],
      colors: ['Crimson Red', 'Royal Maroon', 'Mustard Gold', 'Emerald Green', 'Navy Blue', 'Blush Pink', 'Purple'],
      occasions: ['Wedding Day', 'Reception', 'Sangeet / Cocktails', 'Mehendi / Haldi', 'Photoshoot', 'Festival']
    },
    dresses: [
      {
        id: 'jtf-001',
        name: 'Maharani Velvet Crimson Bridal Lehenga',
        categoryId: 'cat-1',
        categoryName: 'Bride Dresses',
        designer: 'Jai Thuthiksha Couture',
        retailPrice: 85000,
        rentalPrice4Days: 5999,
        rentalPrice8Days: 9499,
        advanceAmount: 2000,
        images: [
          'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800'
        ],
        primaryImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800',
        description: 'Exquisite deep crimson velvet lehenga intricately handcrafted with antique gold dabka, zardozi work, and paired with a double organza dupatta.',
        fabric: 'Micro Velvet & Net Dupatta',
        workType: 'Heavy Zardozi, Sequins & Thread Embroidery',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Crimson Red', 'Royal Maroon'],
        rating: 4.9,
        reviewCount: 38,
        occasion: 'Wedding Day',
        isAvailable: true,
        isHidden: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'jtf-002',
        name: 'Pure Temple Gold Kanjeevaram Silk Saree',
        categoryId: 'cat-2',
        categoryName: 'Silk Sarees',
        designer: 'Kanchipuram Craftsmen',
        retailPrice: 42000,
        rentalPrice4Days: 2999,
        rentalPrice8Days: 4799,
        advanceAmount: 1000,
        images: [
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800'
        ],
        primaryImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
        description: 'Authentic handwoven pure mulberry silk saree featuring traditional gold zari peacock motifs, grand pallu, and unstitched matching blouse piece with custom fitting.',
        fabric: 'Pure Mulberry Silk',
        workType: 'Gold Zari Weaving',
        sizes: ['Custom Measurement'],
        colors: ['Mustard Gold', 'Emerald Green'],
        rating: 4.8,
        reviewCount: 29,
        occasion: 'Reception',
        isAvailable: true,
        isHidden: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'jtf-003',
        name: 'Emerald Glitter Embroidered Indo-Western Gown',
        categoryId: 'cat-6',
        categoryName: 'Party Wear',
        designer: 'JTF Modern Atelier',
        retailPrice: 38000,
        rentalPrice4Days: 2499,
        rentalPrice8Days: 3999,
        advanceAmount: 1000,
        images: [
          'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=800'
        ],
        primaryImage: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=800',
        description: 'Breathtaking emerald green flared floor-length gown featuring structured corset detail, mirror work embellishments, and dramatic ruffled train.',
        fabric: 'Silk Georgette & Tulle',
        workType: 'Mirror Work & Micro Crystals',
        sizes: ['XS', 'S', 'M', 'L'],
        colors: ['Emerald Green'],
        rating: 4.9,
        reviewCount: 22,
        occasion: 'Sangeet / Cocktails',
        isAvailable: true,
        isHidden: false,
        createdAt: new Date().toISOString()
      }
    ],
    bookings: [
      {
        id: 'bkg-101',
        customerName: 'Meera Krishnan',
        customerPhone: '+91 98765 11223',
        dressId: 'jtf-001',
        dressName: 'Maharani Velvet Crimson Bridal Lehenga',
        category: 'Bride Dresses',
        startDate: '2026-10-15',
        returnDate: '2026-10-19',
        durationDays: 4,
        rentalPrice: 5999,
        advancePaid: 2000,
        status: 'Confirmed', // Pending | Confirmed | Ready for Pickup | Rented | Returned | Cancelled
        internalNotes: 'Client visited boutique for custom alterations. Fitting completed.',
        createdAt: new Date().toISOString()
      }
    ],
    settings: {
      shopName: 'Jai Thuthiksha Fashion',
      shopLogo: '/assets/logo.png',
      whatsappNumber: '919876543210',
      phoneDisplay: '+91 98765 43210',
      shopAddress: 'No. 42, Designer Avenue, Usman Road, T. Nagar, Chennai, Tamil Nadu 600017',
      contactEmail: 'rentals@jaithuthiksha.com',
      instagramLink: 'https://instagram.com/jaithuthikshafashion',
      heroTitle: 'Wear the Luxury Designer You Love for Your Special Day.',
      heroSubtitle: 'Rent royal bridal lehengas, handwoven Kanjeevaram silk sarees, and groom sherwanis at up to 80% off retail prices. Includes custom alteration and free dry-cleaned delivery.',
      heroBanners: [
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800'
      ],
      aboutHeading: 'Redefining Luxury Indian Designer Wear for Every Celebration',
      aboutContent: 'Founded with a vision to make royal heritage bridal couture accessible, sustainable, and affordable. At Jai Thuthiksha Fashion, every outfit tells a story of craftsmanship, elegance, and timeless South Asian heritage.',
      termsInstructions: 'Every rental includes complimentary custom alterations, 5-stage medical-grade dry cleaning, and protective garment bag delivery. Orders must be returned in the provided return bag on or before the agreed return date.',
      cancellationAdvanceInfo: 'An advance deposit is required to confirm your rental dates. Cancellations made 7+ days prior to rental start date receive 100% refund of advance deposit.'
    }
  };
};

export const readDb = () => {
  if (!fs.existsSync(DB_FILE)) {
    const initial = getInitialData();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading database file, re-initializing:', err);
    const initial = getInitialData();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
};

export const writeDb = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};
