import React, { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { api } from '../services/api';
import type { Product, Category } from '../types/fashion';
import {
  LogOut, Plus, Trash2, Edit3, ShoppingBag, X, Tag,
  Eye, EyeOff, Check, Upload, Calendar, Settings,
  LayoutDashboard, Search, AlertCircle, RefreshCw,
  ArrowUpRight
} from 'lucide-react';
import logoImg from '../assets/logo.png';

interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  dressId: string;
  dressName: string;
  category: string;
  startDate: string;
  returnDate: string;
  durationDays: number;
  rentalPrice: number;
  status: 'Pending' | 'Confirmed' | 'Ready for Pickup' | 'Rented' | 'Returned' | 'Cancelled';
  internalNotes: string;
  createdAt: string;
}

export const AdminDashboard: React.FC = () => {
  const { logout, adminUser } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'dresses' | 'categories' | 'bookings' | 'settings'>('overview');

  // Server Data States
  const [loading, setLoading] = useState(true);
  const [dresses, setDresses] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Dress Form State
  const [showDressModal, setShowDressModal] = useState(false);
  const [editingDressId, setEditingDressId] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [dressForm, setDressForm] = useState({
    name: '',
    price: 2500,
    retailPrice: 25000,
    rentalPrice4Days: 2500,
    rentalPrice8Days: 4000,
    advanceAmount: 1000,
    categoryId: '',
    categoryName: 'Photoshoot',
    designer: 'Jai Thuthiksha Couture',
    description: 'Exquisite designer outfit with handcrafted detailing.',
    fabric: 'Micro Velvet & Organza',
    workType: 'Heavy Zardozi Embroidery',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Crimson Red', 'Royal Gold'],
    occasion: 'Photoshoot',
    isAvailable: true,
    isHidden: false,
    images: [] as string[],
    primaryImage: ''
  });

  // Category Form State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catForm, setCatForm] = useState({
    name: '',
    tagline: '',
    image: '',
    order: 1,
    enabled: true
  });

  // Booking Form State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [bookingForm, setBookingForm] = useState({
    status: 'Pending' as Booking['status'],
    internalNotes: '',
    customerName: '',
    customerPhone: '',
    startDate: '',
    returnDate: ''
  });

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState({
    shopName: 'Jai Thuthiksha Fashion',
    phoneDisplay: '+91 84891 66899',
    whatsappNumber: '8489166899',
    contactEmail: 'sakthimurugesan1986@gmail.com',
    shopAddress: 'Karur Bypass road, Gandhiji Street, Sakthi Nagar, Erode, 638002',
    city: 'Erode',
    state: 'Tamil Nadu',
    pincode: '638002',
    mapsUrl: 'https://maps.google.com/?q=Karur+Bypass+road+Gandhiji+Street+Sakthi+Nagar+Erode',
    heroTitle: 'Wear the Luxury Designer You Love for Your Special Day.',
    heroSubtitle: 'Rent royal bridal lehengas, handwoven Kanjeevaram silk sarees, and designer gowns at accessible prices.',
    aboutHeading: 'Redefining Luxury Indian Designer Wear for Every Celebration',
    aboutContent: 'Founded with a vision to make royal heritage bridal couture accessible, sustainable, and affordable.'
  });

  // Load backend data efficiently
  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [dressesData, catsData, bookingsData, settingsData] = await Promise.all([
        api.getAllAdminDresses().catch(() => []),
        api.getAllAdminCategories().catch(() => []),
        api.getAllAdminBookings().catch(() => []),
        api.getSettings().catch(() => null)
      ]);

      if (Array.isArray(dressesData)) setDresses(dressesData);
      if (Array.isArray(catsData)) setCategories(catsData);
      if (Array.isArray(bookingsData)) setBookings(bookingsData);
      if (settingsData) {
        setSettingsForm({
          shopName: settingsData.shopName || 'Jai Thuthiksha Fashion',
          phoneDisplay: settingsData.phoneDisplay || '+91 84891 66899',
          whatsappNumber: settingsData.whatsappNumber || '8489166899',
          contactEmail: settingsData.contactEmail || 'sakthimurugesan1986@gmail.com',
          shopAddress: settingsData.shopAddress || 'Karur Bypass road, Gandhiji Street, Sakthi Nagar, Erode, 638002',
          city: settingsData.city || 'Erode',
          state: settingsData.state || 'Tamil Nadu',
          pincode: settingsData.pincode || '638002',
          mapsUrl: settingsData.mapsUrl || 'https://maps.google.com/?q=Karur+Bypass+road+Gandhiji+Street+Sakthi+Nagar+Erode',
          heroTitle: settingsData.heroTitle || 'Wear the Luxury Designer You Love for Your Special Day.',
          heroSubtitle: settingsData.heroSubtitle || 'Rent royal bridal lehengas, handwoven Kanjeevaram silk sarees, and designer gowns at accessible prices.',
          aboutHeading: settingsData.aboutHeading || 'Redefining Luxury Indian Designer Wear for Every Celebration',
          aboutContent: settingsData.aboutContent || 'Founded with a vision to make royal heritage bridal couture accessible, sustainable, and affordable.'
        });
      }
    } catch (err: any) {
      console.error('Error fetching admin data:', err);
      setErrorMessage('Failed to connect to backend server. Retrying with local cache...');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const notify = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Dress Handlers
  const handleOpenAddDress = () => {
    setEditingDressId(null);
    const defaultCat = categories[0] || { id: 'cat-photoshoot', name: 'Photoshoot' };
    setDressForm({
      name: '',
      price: 2500,
      retailPrice: 25000,
      rentalPrice4Days: 2500,
      rentalPrice8Days: 4000,
      advanceAmount: 1000,
      categoryId: defaultCat.id,
      categoryName: defaultCat.name,
      designer: 'Jai Thuthiksha Couture',
      description: 'Exquisite designer outfit crafted for luxury events.',
      fabric: 'Micro Velvet & Net',
      workType: 'Heavy Zardozi Embroidery',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Crimson Red', 'Royal Gold'],
      occasion: defaultCat.name || 'Photoshoot',
      isAvailable: true,
      isHidden: false,
      images: [],
      primaryImage: ''
    });
    setCustomImageUrl('');
    setShowDressModal(true);
  };

  const handleEditDress = (dress: Product) => {
    setEditingDressId(dress.id);
    const existingImages = dress.galleryImages && dress.galleryImages.length > 0
      ? dress.galleryImages
      : dress.images && dress.images.length > 0
      ? dress.images
      : dress.image ? [dress.image] : [];

    const matchedCat = categories.find(c => c.id === (dress as any).categoryId || c.name.toLowerCase() === dress.category?.toLowerCase());
    const dressPrice = (dress as any).price || dress.rentalPrice4Days || dress.retailPrice || 2500;

    setDressForm({
      name: dress.name,
      price: dressPrice,
      retailPrice: dress.retailPrice || dressPrice * 8,
      rentalPrice4Days: dress.rentalPrice4Days || dressPrice,
      rentalPrice8Days: dress.rentalPrice8Days || dressPrice * 1.6,
      advanceAmount: (dress as any).advanceAmount || 1000,
      categoryId: (dress as any).categoryId || matchedCat?.id || categories[0]?.id || 'cat-photoshoot',
      categoryName: dress.categoryLabel || matchedCat?.name || dress.category || 'Photoshoot',
      designer: dress.designer || 'Jai Thuthiksha Couture',
      description: dress.description || 'Designer fashion dress',
      fabric: dress.fabric || 'Premium Fabric',
      workType: dress.workType || 'Handcrafted',
      sizes: dress.sizes && dress.sizes.length > 0 ? dress.sizes : ['S', 'M', 'L', 'XL'],
      colors: dress.colors && dress.colors.length > 0 ? dress.colors : ['Multi'],
      occasion: dress.occasion || 'Special Occasion',
      isAvailable: (dress as any).isAvailable !== undefined ? (dress as any).isAvailable : true,
      isHidden: (dress as any).isHidden || false,
      images: existingImages,
      primaryImage: dress.image || existingImages[0] || ''
    });
    setCustomImageUrl('');
    setShowDressModal(true);
  };

  const handleSaveDress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dressForm.name.trim()) {
      alert('Please enter a dress name.');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedCat = categories.find(c => c.id === dressForm.categoryId);
      const catName = selectedCat ? selectedCat.name : dressForm.categoryName;
      const primary = dressForm.images[0] || dressForm.primaryImage || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800';
      const priceVal = Number(dressForm.price) || 0;

      const payload = {
        ...dressForm,
        name: dressForm.name.trim(),
        price: priceVal,
        rentalPrice4Days: Number(dressForm.rentalPrice4Days) || priceVal,
        rentalPrice8Days: Number(dressForm.rentalPrice8Days) || priceVal * 1.6,
        retailPrice: Number(dressForm.retailPrice) || priceVal * 8,
        advanceAmount: Number(dressForm.advanceAmount) || 0,
        categoryName: catName,
        primaryImage: primary,
        images: dressForm.images.length > 0 ? dressForm.images : [primary]
      };

      if (editingDressId) {
        const res = await api.updateDress(editingDressId, payload);
        if (res.dress) {
          setDresses(prev => prev.map(d => d.id === editingDressId ? res.dress : d));
        }
        notify('Dress updated successfully!');
      } else {
        const res = await api.addDress(payload);
        if (res.dress) {
          setDresses(prev => [res.dress, ...prev]);
        }
        notify('New dress created and saved!');
      }
      setShowDressModal(false);
      setEditingDressId(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to save dress');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleDressVisibility = async (id: string, currentIsHidden: boolean) => {
    try {
      setDresses(prev => prev.map(d => d.id === id ? ({ ...d, isHidden: !currentIsHidden } as any) : d));
      await api.toggleDressStatus(id, { isHidden: !currentIsHidden });
      notify(`Dress ${!currentIsHidden ? 'hidden from' : 'shown in'} public catalogue.`);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update dress visibility');
      fetchData();
    }
  };

  const handleDeleteDress = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this dress?')) {
      try {
        const res = await api.deleteDress(id);
        if (res.isArchived) {
          notify(res.message || 'Dress hidden from public catalogue due to booking history.');
          setDresses(prev => prev.map(d => d.id === id ? ({ ...d, isHidden: true } as any) : d));
        } else {
          setDresses(prev => prev.filter(d => d.id !== id));
          notify(res.message || 'Dress deleted successfully');
        }
        fetchData();
      } catch (err: any) {
        alert(err.message || 'Failed to delete dress');
        fetchData();
      }
    }
  };

  // Image Upload Handlers
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    try {
      const res = await api.uploadImages(files);
      if (res.urls && Array.isArray(res.urls)) {
        const newImages = [...dressForm.images, ...res.urls];
        setDressForm({
          ...dressForm,
          images: newImages,
          primaryImage: dressForm.primaryImage || newImages[0]
        });
        notify(`${res.urls.length} image(s) uploaded successfully`);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to upload images');
    } finally {
      setUploadingImages(false);
      e.target.value = '';
    }
  };

  const handleAddCustomImageUrl = () => {
    if (!customImageUrl.trim()) return;
    const url = customImageUrl.trim();
    const newImages = [...dressForm.images, url];
    setDressForm({
      ...dressForm,
      images: newImages,
      primaryImage: dressForm.primaryImage || newImages[0]
    });
    setCustomImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    const updated = dressForm.images.filter((_, i) => i !== index);
    setDressForm({
      ...dressForm,
      images: updated,
      primaryImage: updated[0] || ''
    });
  };

  const handleSetPrimaryImage = (index: number) => {
    const selected = dressForm.images[index];
    if (!selected) return;
    const reordered = [selected, ...dressForm.images.filter((_, i) => i !== index)];
    setDressForm({
      ...dressForm,
      images: reordered,
      primaryImage: selected
    });
    notify('Main cover image updated');
  };

  // Category Handlers
  const handleOpenAddCategory = () => {
    setEditingCatId(null);
    setCatForm({
      name: '',
      tagline: '',
      image: '',
      order: categories.length + 1,
      enabled: true
    });
    setShowCategoryModal(true);
  };

  const handleEditCategory = (cat: Category) => {
    setEditingCatId(cat.id);
    setCatForm({
      name: cat.name,
      tagline: cat.tagline || '',
      image: cat.image || '',
      order: cat.order || 1,
      enabled: cat.enabled !== false
    });
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.name.trim()) {
      alert('Please enter a category name');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCatId) {
        const res = await api.updateCategory(editingCatId, catForm);
        if (res.category) {
          setCategories(prev => prev.map(c => c.id === editingCatId ? res.category : c));
        }
        notify('Category updated successfully');
      } else {
        const res = await api.addCategory(catForm);
        if (res.category) {
          setCategories(prev => [...prev, res.category]);
        }
        notify('New category added successfully');
      }
      setShowCategoryModal(false);
      setEditingCatId(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('Delete this category? Category will be removed if no dresses are currently assigned.')) {
      try {
        await api.deleteCategory(id);
        setCategories(prev => prev.filter(c => c.id !== id));
        notify('Category deleted successfully');
        fetchData();
      } catch (err: any) {
        alert(err.message || 'Failed to delete category');
        fetchData();
      }
    }
  };

  // Booking Handlers
  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setBookingForm({
      status: booking.status || 'Pending',
      internalNotes: booking.internalNotes || '',
      customerName: booking.customerName || '',
      customerPhone: booking.customerPhone || '',
      startDate: booking.startDate || '',
      returnDate: booking.returnDate || ''
    });
    setShowBookingModal(true);
  };

  const handleSaveBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;
    setIsSubmitting(true);
    try {
      await api.updateBooking(editingBooking.id, bookingForm);
      notify('Booking updated successfully');
      setShowBookingModal(false);
      setEditingBooking(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (window.confirm('Delete this booking record?')) {
      try {
        await api.deleteBooking(id);
        notify('Booking deleted');
        fetchData();
      } catch (err: any) {
        alert(err.message || 'Failed to delete booking');
      }
    }
  };

  // Settings Handler
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.updateSettings(settingsForm);
      notify('Shop settings & website content updated!');
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered Dresses List
  const filteredDresses = dresses.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.designer && d.designer.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.description && d.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (categoryFilter === 'ALL') return matchesSearch;
    const catId = (d as any).categoryId || d.category;
    return matchesSearch && (catId === categoryFilter || d.categoryLabel === categoryFilter || (d as any).categoryName === categoryFilter);
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row">
      
      {/* Sidebar Navigation - Desktop */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex-col justify-between p-4 shrink-0 hidden md:flex min-h-screen">
        <div className="space-y-6">
          
          {/* Logo & Header */}
          <div className="flex items-center gap-3 px-2 pt-2">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 p-1 flex items-center justify-center shrink-0">
              <img src={logoImg} alt="JTF Admin" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="font-bold font-serif text-white text-base">JTF Control</h2>
              <span className="text-[10px] text-amber-400 font-bold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/80 uppercase tracking-wider">
                Admin Console
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 text-xs font-bold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                activeTab === 'overview' ? 'bg-pink-700 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('dresses')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                activeTab === 'dresses' ? 'bg-pink-700 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Dress Inventory</span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                activeTab === 'categories' ? 'bg-pink-700 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>Categories</span>
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                activeTab === 'bookings' ? 'bg-pink-700 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <div className="flex items-center justify-between flex-1">
                <span>Bookings / Enquiries</span>
                {bookings.length > 0 && (
                  <span className="bg-pink-950 text-pink-300 text-[10px] px-2 py-0.5 rounded-full border border-pink-800 font-extrabold">
                    {bookings.length}
                  </span>
                )}
              </div>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                activeTab === 'settings' ? 'bg-pink-700 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Shop Settings</span>
            </button>
          </nav>

        </div>

        {/* User Info & Logout at Bottom */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="px-2">
            <span className="text-[10px] text-slate-500 uppercase block font-bold">Authenticated Admin</span>
            <span className="text-xs font-bold text-slate-200 truncate block">{adminUser?.email || 'admin@jaithuthiksha.com'}</span>
          </div>

          <button
            onClick={logout}
            className="w-full py-2.5 rounded-xl bg-red-950/80 text-red-300 hover:bg-red-900 border border-red-800/60 font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

      </aside>

      {/* Mobile Top Navigation */}
      <header className="md:hidden bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-30 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={logoImg} alt="JTF" className="w-7 h-7 object-contain" />
            <span className="font-bold text-white font-serif text-sm">JTF Admin</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-pink-400 font-semibold px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 flex items-center gap-1"
            >
              <span>Website</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg bg-red-950 text-red-300 border border-red-800"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Tab Slider */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition ${
              activeTab === 'overview' ? 'bg-pink-700 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" /> Overview
          </button>
          <button
            onClick={() => setActiveTab('dresses')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition ${
              activeTab === 'dresses' ? 'bg-pink-700 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Inventory
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition ${
              activeTab === 'categories' ? 'bg-pink-700 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Tag className="w-3.5 h-3.5" /> Categories
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition ${
              activeTab === 'bookings' ? 'bg-pink-700 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Bookings
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition ${
              activeTab === 'settings' ? 'bg-pink-700 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Settings className="w-3.5 h-3.5" /> Settings
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto min-h-screen">
        
        {/* Desktop Top Header Bar */}
        <header className="hidden md:flex bg-slate-900/80 border-b border-slate-800 p-6 justify-between items-center sticky top-0 z-20 backdrop-blur-md">
          <div>
            <h1 className="text-xl font-bold font-serif text-white uppercase tracking-wider">
              {activeTab === 'overview' && 'Management Dashboard Overview'}
              {activeTab === 'dresses' && 'Dress Inventory & Pricing'}
              {activeTab === 'categories' && 'Category Management'}
              {activeTab === 'bookings' && 'Customer Rental Enquiries'}
              {activeTab === 'settings' && 'Boutique & Website Configuration'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-pink-400' : ''}`} />
            </button>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-pink-400 hover:text-pink-300 font-semibold px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 transition flex items-center gap-1.5"
            >
              <span>Open Public Site</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </header>

        {/* Status Toasts */}
        {statusMessage && (
          <div className="fixed top-6 right-6 z-50 bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500 text-xs font-bold flex items-center gap-2 animate-bounce">
            <Check className="w-4 h-4 text-emerald-300" />
            <span>{statusMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mx-6 mt-4 p-4 rounded-xl bg-amber-950/80 border border-amber-700 text-amber-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-amber-400 hover:text-white font-bold ml-4">
              Dismiss
            </button>
          </div>
        )}

        {/* Tab Content Area */}
        <main className="p-4 sm:p-8 space-y-8 flex-1">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-3">
              <RefreshCw className="w-8 h-8 text-pink-500 animate-spin" />
              <span className="text-xs font-bold">Loading Admin Management Console...</span>
            </div>
          ) : (
            <>
              {/* 1. OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-2">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-xs font-bold uppercase tracking-wider">Total Inventory</span>
                        <ShoppingBag className="w-5 h-5 text-pink-400" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-extrabold text-white font-serif">{dresses.length}</div>
                      <p className="text-[11px] text-slate-400">Designer outfits in database</p>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-2">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-xs font-bold uppercase tracking-wider">Categories</span>
                        <Tag className="w-5 h-5 text-amber-400" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-extrabold text-white font-serif">{categories.length}</div>
                      <p className="text-[11px] text-slate-400">Active collection sections</p>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-2">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-xs font-bold uppercase tracking-wider">Rental Enquiries</span>
                        <Calendar className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-extrabold text-white font-serif">{bookings.length}</div>
                      <p className="text-[11px] text-slate-400">Customer booking requests</p>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-2">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-xs font-bold uppercase tracking-wider">Hidden Outfits</span>
                        <EyeOff className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-extrabold text-white font-serif">
                        {dresses.filter(d => (d as any).isHidden).length}
                      </div>
                      <p className="text-[11px] text-slate-400">Hidden from public website</p>
                    </div>
                  </div>

                  {/* Quick Actions & Recent Enquiries */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Quick Action Box */}
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                      <h3 className="text-base font-bold font-serif text-white">Quick Admin Actions</h3>
                      <div className="space-y-2.5">
                        <button
                          onClick={handleOpenAddDress}
                          className="w-full py-3 px-4 rounded-xl gradient-btn text-white text-xs font-bold flex items-center justify-between shadow-lg"
                        >
                          <span className="flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add New Designer Dress
                          </span>
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setActiveTab('bookings')}
                          className="w-full py-3 px-4 rounded-xl bg-slate-800 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold flex items-center justify-between"
                        >
                          <span className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-emerald-400" /> View Rental Bookings
                          </span>
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setActiveTab('settings')}
                          className="w-full py-3 px-4 rounded-xl bg-slate-800 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold flex items-center justify-between"
                        >
                          <span className="flex items-center gap-2">
                            <Settings className="w-4 h-4 text-amber-400" /> Edit Shop Contact Info
                          </span>
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Recent Bookings List */}
                    <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold font-serif text-white">Recent Customer Enquiries</h3>
                        <button
                          onClick={() => setActiveTab('bookings')}
                          className="text-xs text-pink-400 font-bold hover:underline"
                        >
                          View All ({bookings.length})
                        </button>
                      </div>

                      {bookings.length === 0 ? (
                        <p className="text-xs text-slate-500 italic py-6 text-center">No rental enquiries logged yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {bookings.slice(0, 4).map(b => (
                            <div key={b.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                              <div>
                                <span className="font-bold text-white block">{b.customerName}</span>
                                <span className="text-[11px] text-slate-400">{b.dressName} ({b.startDate} to {b.returnDate})</span>
                              </div>
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                b.status === 'Confirmed' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                                b.status === 'Pending' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                                'bg-slate-800 text-slate-300 border-slate-700'
                              }`}>
                                {b.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 2. DRESS MANAGEMENT TAB */}
              {activeTab === 'dresses' && (
                <div className="space-y-6">
                  {/* Top Header Controls & Search Bar */}
                  <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-800">
                    <div className="flex-1 flex flex-col sm:flex-row gap-3">
                      {/* Search Bar */}
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search dress by name, designer, description..."
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs outline-none focus:border-pink-500"
                        />
                      </div>

                      {/* Category Dropdown Filter */}
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs outline-none focus:border-pink-500 font-semibold"
                      >
                        <option value="ALL">All Categories ({dresses.length})</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={handleOpenAddDress}
                      className="px-5 py-2.5 rounded-xl gradient-btn text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Add New Dress</span>
                    </button>
                  </div>

                  {/* Dresses Grid */}
                  {filteredDresses.length === 0 ? (
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
                      <p className="text-sm font-bold">No dresses match your search criteria.</p>
                      <button
                        onClick={handleOpenAddDress}
                        className="px-4 py-2 rounded-xl gradient-btn text-white text-xs font-bold inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" /> Add Dress
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {filteredDresses.map((dress) => {
                        const gallery = dress.galleryImages && dress.galleryImages.length > 0
                          ? dress.galleryImages
                          : dress.images && dress.images.length > 0
                          ? dress.images
                          : dress.image ? [dress.image] : [];
                        const isHidden = (dress as any).isHidden;
                        const priceDisplay = (dress as any).price || dress.rentalPrice4Days || dress.retailPrice || 0;

                        return (
                          <div key={dress.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden p-4 flex flex-col justify-between space-y-4 hover:border-slate-700 transition">
                            <div className="space-y-3">
                              
                              {/* Primary Cover Image */}
                              <div className="relative h-56 bg-slate-950 rounded-2xl overflow-hidden">
                                <img
                                  src={dress.image || gallery[0]}
                                  alt={dress.name}
                                  className={`w-full h-full object-cover transition ${isHidden ? 'opacity-40 grayscale' : ''}`}
                                />
                                
                                {/* Category Badge */}
                                <div className="absolute top-2 left-2 bg-slate-900/90 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-slate-700 backdrop-blur-sm">
                                  {dress.categoryLabel || (dress as any).categoryName || dress.category}
                                </div>

                                {/* Images Badge */}
                                {gallery.length > 1 && (
                                  <div className="absolute top-2 right-2 bg-pink-950/90 text-pink-200 text-[10px] font-bold px-2.5 py-1 rounded-full border border-pink-800 backdrop-blur-sm">
                                    {gallery.length} Images
                                  </div>
                                )}

                                {isHidden && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 font-bold text-xs text-red-400 uppercase tracking-widest">
                                    Hidden from Public
                                  </div>
                                )}
                              </div>

                              {/* Title, Prices & Gallery Strip */}
                              <div>
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="font-bold text-white text-base font-serif line-clamp-1">{dress.name}</h4>
                                  <span className="text-amber-400 font-extrabold text-sm shrink-0">
                                    ₹{priceDisplay.toLocaleString('en-IN')}
                                  </span>
                                </div>

                                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                                  <span>Retail: ₹{(dress.retailPrice || priceDisplay * 8).toLocaleString('en-IN')}</span>
                                  <span>•</span>
                                  <span>Deposit: ₹{((dress as any).advanceAmount || 1000).toLocaleString('en-IN')}</span>
                                </div>

                                {/* Thumbnails Strip */}
                                {gallery.length > 0 && (
                                  <div className="flex gap-1.5 mt-2.5 overflow-x-auto pb-1">
                                    {gallery.map((img, idx) => (
                                      <img
                                        key={idx}
                                        src={img}
                                        alt=""
                                        className="w-9 h-11 object-cover rounded-lg bg-slate-950 border border-slate-800 shrink-0"
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>

                            </div>

                            {/* Action Controls */}
                            <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleToggleDressVisibility(dress.id, isHidden)}
                                  className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition"
                                  title={isHidden ? 'Unhide dress' : 'Hide dress'}
                                >
                                  {isHidden ? <EyeOff className="w-4 h-4 text-red-400" /> : <Eye className="w-4 h-4 text-emerald-400" />}
                                </button>

                                <button
                                  onClick={() => handleEditDress(dress)}
                                  className="px-3 py-1.5 rounded-xl bg-amber-950/80 text-amber-300 hover:bg-amber-900 border border-amber-800/60 font-bold flex items-center gap-1.5 transition"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Edit</span>
                                </button>
                              </div>

                              <button
                                onClick={() => handleDeleteDress(dress.id)}
                                className="p-2 rounded-xl bg-red-950 text-red-400 hover:bg-red-900 border border-red-800/60 transition"
                                title="Delete Dress"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* 3. CATEGORIES TAB */}
              {activeTab === 'categories' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-800">
                    <div>
                      <h3 className="text-lg font-bold font-serif text-white">Categories</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Manage categories displayed on the public website (Photoshoot, Reception, Bridesmaid, etc.)
                      </p>
                    </div>
                    <button
                      onClick={handleOpenAddCategory}
                      className="px-5 py-2.5 rounded-xl gradient-btn text-white text-xs font-bold flex items-center gap-2 shadow-lg shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Add Category</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((cat) => (
                      <div key={cat.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between hover:border-slate-700 transition">
                        <div>
                          <h4 className="font-bold text-white text-base font-serif">{cat.name}</h4>
                          <span className="text-[11px] text-slate-400 block mt-0.5">{cat.tagline || 'Exclusive Collection'}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditCategory(cat)}
                            className="p-2 rounded-xl bg-slate-800 text-amber-300 hover:bg-slate-700 border border-slate-700 transition"
                            title="Edit Category"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="p-2 rounded-xl bg-red-950 text-red-400 hover:bg-red-900 border border-red-800/60 transition"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. BOOKINGS TAB */}
              {activeTab === 'bookings' && (
                <div className="space-y-6">
                  <div className="bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold font-serif text-white">Rental Enquiries & Bookings</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Track, confirm, and update rental dates and notes for customer enquiries logged from WhatsApp or online.
                      </p>
                    </div>
                  </div>

                  {bookings.length === 0 ? (
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-2">
                      <p className="text-sm font-bold">No customer booking enquiries recorded yet.</p>
                    </div>
                  ) : (
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider">
                            <tr>
                              <th className="p-4">Customer</th>
                              <th className="p-4">Dress</th>
                              <th className="p-4">Dates</th>
                              <th className="p-4">Rental Amount</th>
                              <th className="p-4">Status</th>
                              <th className="p-4">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {bookings.map((b) => (
                              <tr key={b.id} className="hover:bg-slate-800/50">
                                <td className="p-4">
                                  <span className="font-bold text-white block">{b.customerName}</span>
                                  <span className="text-[11px] text-slate-400">{b.customerPhone}</span>
                                </td>
                                <td className="p-4">
                                  <span className="font-bold text-slate-200 block">{b.dressName}</span>
                                  <span className="text-[11px] text-amber-400">{b.category}</span>
                                </td>
                                <td className="p-4">
                                  <span className="text-slate-300 block">{b.startDate} to {b.returnDate}</span>
                                  <span className="text-[10px] text-slate-500">({b.durationDays || 4} Days)</span>
                                </td>
                                <td className="p-4 font-bold text-amber-300">
                                  ₹{Number(b.rentalPrice || 0).toLocaleString('en-IN')}
                                </td>
                                <td className="p-4">
                                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                    b.status === 'Confirmed' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                                    b.status === 'Pending' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                                    b.status === 'Cancelled' ? 'bg-red-950 text-red-300 border-red-800' :
                                    'bg-slate-800 text-slate-300 border-slate-700'
                                  }`}>
                                    {b.status}
                                  </span>
                                </td>
                                <td className="p-4 space-x-2">
                                  <button
                                    onClick={() => handleEditBooking(b)}
                                    className="p-1.5 rounded-lg bg-amber-950 text-amber-300 border border-amber-800"
                                    title="Edit Booking"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteBooking(b.id)}
                                    className="p-1.5 rounded-lg bg-red-950 text-red-400 border border-red-800"
                                    title="Delete Booking"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 5. SHOP SETTINGS TAB */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
                    <h3 className="text-lg font-bold font-serif text-white">Boutique & Contact Information</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Update shop address, phone number, WhatsApp contact, and homepage headline texts.
                    </p>
                  </div>

                  <form onSubmit={handleSaveSettings} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-300 font-bold mb-1.5">Shop Name</label>
                        <input
                          type="text"
                          value={settingsForm.shopName}
                          onChange={(e) => setSettingsForm({ ...settingsForm, shopName: e.target.value })}
                          className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-pink-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1.5">Display Phone Number</label>
                        <input
                          type="text"
                          value={settingsForm.phoneDisplay}
                          onChange={(e) => setSettingsForm({ ...settingsForm, phoneDisplay: e.target.value })}
                          className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-pink-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1.5">WhatsApp Number (10 Digits)</label>
                        <input
                          type="text"
                          value={settingsForm.whatsappNumber}
                          onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                          className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-pink-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1.5">Contact Email</label>
                        <input
                          type="email"
                          value={settingsForm.contactEmail}
                          onChange={(e) => setSettingsForm({ ...settingsForm, contactEmail: e.target.value })}
                          className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-pink-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1.5">Boutique Address</label>
                      <input
                        type="text"
                        value={settingsForm.shopAddress}
                        onChange={(e) => setSettingsForm({ ...settingsForm, shopAddress: e.target.value })}
                        className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-pink-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1.5">Homepage Hero Title</label>
                      <input
                        type="text"
                        value={settingsForm.heroTitle}
                        onChange={(e) => setSettingsForm({ ...settingsForm, heroTitle: e.target.value })}
                        className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-pink-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1.5">Homepage Hero Subtitle</label>
                      <textarea
                        rows={3}
                        value={settingsForm.heroSubtitle}
                        onChange={(e) => setSettingsForm({ ...settingsForm, heroSubtitle: e.target.value })}
                        className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-pink-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="gradient-btn text-white px-8 py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs shadow-lg disabled:opacity-50"
                    >
                      {isSubmitting ? 'Saving Settings...' : 'Save Settings & Content'}
                    </button>
                  </form>
                </div>
              )}
            </>
          )}

        </main>
      </div>

      {/* Add / Edit Dress Modal */}
      {showDressModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 space-y-5 my-8 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-xl font-bold font-serif text-white">
                {editingDressId ? 'Edit Dress Details' : 'Add New Designer Dress'}
              </h3>
              <button
                onClick={() => setShowDressModal(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDress} className="space-y-4 text-xs">
              {/* Dress Name */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  Dress Name <span className="text-pink-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={dressForm.name}
                  onChange={(e) => setDressForm({ ...dressForm, name: e.target.value })}
                  placeholder="e.g. Royal Red Reception Lehenga"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none focus:border-pink-500 transition"
                />
              </div>

              {/* Price & Category Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    Category <span className="text-pink-400">*</span>
                  </label>
                  <select
                    value={dressForm.categoryId}
                    onChange={(e) => {
                      const selectedCat = categories.find(c => c.id === e.target.value);
                      setDressForm({
                        ...dressForm,
                        categoryId: e.target.value,
                        categoryName: selectedCat ? selectedCat.name : 'Photoshoot'
                      });
                    }}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none focus:border-pink-500 transition"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    Rental Price 4 Days (₹) <span className="text-pink-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={dressForm.price}
                    onChange={(e) => setDressForm({ ...dressForm, price: Number(e.target.value), rentalPrice4Days: Number(e.target.value) })}
                    placeholder="e.g. 2500"
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none focus:border-pink-500 transition font-bold text-amber-300"
                  />
                </div>
              </div>

              {/* Additional Pricing Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    Rental Price 8 Days (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={dressForm.rentalPrice8Days}
                    onChange={(e) => setDressForm({ ...dressForm, rentalPrice8Days: Number(e.target.value) })}
                    placeholder="e.g. 4000"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    Advance Security Deposit (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={dressForm.advanceAmount}
                    onChange={(e) => setDressForm({ ...dressForm, advanceAmount: Number(e.target.value) })}
                    placeholder="e.g. 1000"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Description</label>
                <textarea
                  rows={2}
                  value={dressForm.description}
                  onChange={(e) => setDressForm({ ...dressForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-pink-500"
                />
              </div>

              {/* Multi-Image Upload */}
              <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <label className="block text-slate-300 font-bold">
                  Dress Images (Upload multiple images for ONE dress)
                </label>

                <div className="flex flex-col gap-2">
                  <label className="cursor-pointer bg-slate-900 border border-slate-700 hover:border-pink-500 p-3 rounded-xl flex items-center justify-center gap-2 text-slate-300 font-bold hover:text-white transition">
                    <Upload className="w-4 h-4 text-pink-400" />
                    <span>{uploadingImages ? 'Uploading Images...' : '+ Upload Multiple Images from Device'}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImages}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="url"
                    placeholder="Or paste image URL (https://...)..."
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    className="flex-1 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs outline-none focus:border-pink-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomImageUrl}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-200 hover:text-white font-bold border border-slate-700"
                  >
                    Add URL
                  </button>
                </div>

                {dressForm.images.length > 0 ? (
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] text-slate-400 font-bold block">
                      Attached Images ({dressForm.images.length}) — Click "Set Main" to pick primary cover:
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-52 overflow-y-auto p-1">
                      {dressForm.images.map((imgUrl, idx) => (
                        <div key={idx} className={`relative aspect-[3/4] rounded-xl overflow-hidden border transition bg-slate-900 ${idx === 0 ? 'border-pink-500 ring-2 ring-pink-500/50' : 'border-slate-700'}`}>
                          <img src={imgUrl} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" />
                          
                          {idx === 0 ? (
                            <span className="absolute bottom-1.5 left-1.5 bg-pink-700 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow">
                              Main Cover
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImage(idx)}
                              className="absolute bottom-1.5 left-1.5 bg-slate-900/90 text-amber-300 hover:text-white text-[9px] font-bold px-1.5 py-0.5 rounded border border-slate-700"
                            >
                              Set Main
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1.5 right-1.5 bg-red-600/90 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shadow-md hover:bg-red-700 transition"
                            title="Remove image"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 italic text-center py-2">
                    No images added yet. Click above to upload or add image URLs.
                  </p>
                )}
              </div>

              {/* Visibility Option */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300 font-bold">Hide dress from public website</span>
                <input
                  type="checkbox"
                  checked={dressForm.isHidden}
                  onChange={(e) => setDressForm({ ...dressForm, isHidden: e.target.checked })}
                  className="w-4 h-4 accent-red-600 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full gradient-btn text-white py-3.5 rounded-xl font-bold shadow-lg text-sm mt-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving Dress Changes...' : (editingDressId ? 'Save Dress Changes' : 'Create & Save Dress')}
              </button>

            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-xl font-bold font-serif text-white">
                {editingCatId ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  Category Name <span className="text-pink-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  placeholder="e.g. Photoshoot, Reception, Bridesmaid"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none focus:border-pink-500 transition"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Tagline / Subtitle</label>
                <input
                  type="text"
                  value={catForm.tagline}
                  onChange={(e) => setCatForm({ ...catForm, tagline: e.target.value })}
                  placeholder="e.g. Dramatic Trails & Flared Outfits"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-pink-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full gradient-btn text-white py-3.5 rounded-xl font-bold text-sm shadow-lg mt-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving Category...' : 'Save Category'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Booking Modal */}
      {showBookingModal && editingBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-xl font-bold font-serif text-white">Update Rental Booking</h3>
              <button onClick={() => setShowBookingModal(false)} className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBooking} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Booking Status</label>
                <select
                  value={bookingForm.status}
                  onChange={(e) => setBookingForm({ ...bookingForm, status: e.target.value as Booking['status'] })}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold outline-none focus:border-pink-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Ready for Pickup">Ready for Pickup</option>
                  <option value="Rented">Rented</option>
                  <option value="Returned">Returned</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Internal Admin Notes</label>
                <textarea
                  rows={3}
                  value={bookingForm.internalNotes}
                  onChange={(e) => setBookingForm({ ...bookingForm, internalNotes: e.target.value })}
                  placeholder="e.g. Alterations completed, deposit collected..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-pink-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full gradient-btn text-white py-3.5 rounded-xl font-bold text-sm shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? 'Saving Changes...' : 'Update Booking Record'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
