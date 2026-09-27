import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { api } from '../services/api';
import type { Product, Category, CategoryOffer } from '../types/fashion';
import {
  LogOut, Plus, Trash2, Edit3, ShoppingBag, X, LayoutDashboard, Tag, SlidersHorizontal,
  Image as ImageIcon, Calendar, Settings, Eye, EyeOff, Check, Percent, AlertCircle, Home, MapPin, Sparkles
} from 'lucide-react';
import logoImg from '../assets/logo.png';

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size', 'Custom Fit'];

export const AdminDashboard: React.FC = () => {
  const { logout, adminUser } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'dresses' | 'categories' | 'offers' | 'homepage' | 'filters' | 'images' | 'bookings' | 'settings'>('overview');

  // Server Data States
  const [dresses, setDresses] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [offers, setOffers] = useState<CategoryOffer[]>([]);
  const [filters, setFilters] = useState<any>({ sizes: [], colors: [], occasions: [] });
  const [bookings, setBookings] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Dress Form State
  const [showDressModal, setShowDressModal] = useState(false);
  const [editingDressId, setEditingDressId] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [dressForm, setDressForm] = useState({
    name: '',
    categoryId: '',
    categoryName: 'Bride Dresses',
    designer: 'Jai Thuthiksha Couture',
    retailPrice: 45000,
    rentalPrice4Days: 3999,
    rentalPrice8Days: 6499,
    advanceAmount: 1500,
    images: [] as string[],
    primaryImage: '',
    description: '',
    fabric: 'Silk & Embroidery',
    workType: 'Zardozi Handcraft',
    sizes: ['S', 'M', 'L'],
    colors: ['Red'],
    occasion: 'Wedding Day',
    isAvailable: true,
    isHidden: false,
    showOnHomepage: true,
    isTrending: false,
    isNewArrival: false,
    displayOrder: 1
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

  // Offer Form State
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [offerModalError, setOfferModalError] = useState<string | null>(null);
  const [offerForm, setOfferForm] = useState({
    name: '',
    categoryId: '',
    categoryName: '',
    discountPercentage: 20,
    isActive: true,
  });

  // Filter Form State
  const [newSize, setNewSize] = useState('');

  // Load backend data
  const fetchData = async () => {
    try {
      const [dressesData, catsData, filtersData, bkgsData, settingsData, offersData] = await Promise.all([
        api.getAllAdminDresses(),
        api.getAllAdminCategories(),
        api.getFilters(),
        api.getAllAdminBookings(),
        api.getSettings(),
        api.getAllAdminOffers()
      ]);

      if (dressesData) setDresses(dressesData);
      if (catsData) setCategories(catsData);
      if (filtersData) setFilters(filtersData);
      if (bkgsData) setBookings(bkgsData);
      if (settingsData) setSettings(settingsData);
      if (offersData && Array.isArray(offersData)) setOffers(offersData);
    } catch (err: any) {
      console.error('Error fetching admin data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const notify = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Dress Handlers
  const handleSaveDress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDressId) {
        await api.updateDress(editingDressId, dressForm);
        notify('Dress updated successfully!');
      } else {
        await api.addDress(dressForm);
        notify('New dress added to inventory!');
      }
      setShowDressModal(false);
      setEditingDressId(null);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEditDress = (dress: Product) => {
    setEditingDressId(dress.id);
    setDressForm({
      name: dress.name,
      categoryId: (dress as any).categoryId || dress.category,
      categoryName: dress.categoryLabel || dress.category,
      designer: dress.designer,
      retailPrice: dress.retailPrice,
      rentalPrice4Days: dress.rentalPrice4Days,
      rentalPrice8Days: dress.rentalPrice8Days,
      advanceAmount: (dress as any).advanceAmount || 1500,
      images: dress.galleryImages || [dress.image],
      primaryImage: dress.image,
      description: dress.description,
      fabric: dress.fabric,
      workType: dress.workType,
      sizes: dress.sizes || ['S', 'M', 'L'],
      colors: dress.colors || ['Red'],
      occasion: dress.occasion || 'Wedding Day',
      isAvailable: (dress as any).isAvailable !== undefined ? (dress as any).isAvailable : true,
      isHidden: (dress as any).isHidden || false,
      showOnHomepage: (dress as any).showOnHomepage !== undefined ? (dress as any).showOnHomepage : true,
      isTrending: (dress as any).isTrending || false,
      isNewArrival: (dress as any).isNewArrival || false,
      displayOrder: (dress as any).displayOrder || 1
    });
    setShowDressModal(true);
  };

  const handleToggleDressStatus = async (id: string, updates: { isAvailable?: boolean; isHidden?: boolean; showOnHomepage?: boolean; isTrending?: boolean; isNewArrival?: boolean }) => {
    try {
      await api.toggleDressStatus(id, updates);
      notify('Dress settings updated!');
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteDress = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this dress from inventory?')) {
      try {
        await api.deleteDress(id);
        notify('Dress deleted');
        fetchData();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleToggleSize = (size: string) => {
    const currentSizes = dressForm.sizes || [];
    if (currentSizes.includes(size)) {
      setDressForm({ ...dressForm, sizes: currentSizes.filter((s) => s !== size) });
    } else {
      setDressForm({ ...dressForm, sizes: [...currentSizes, size] });
    }
  };

  // Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    try {
      const res = await api.uploadImages(files);
      if (res.urls) {
        const newImages = [...dressForm.images, ...res.urls];
        setDressForm({
          ...dressForm,
          images: newImages,
          primaryImage: dressForm.primaryImage || newImages[0]
        });
        notify('Images uploaded successfully');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const updated = dressForm.images.filter((_, i) => i !== index);
    setDressForm({
      ...dressForm,
      images: updated,
      primaryImage: updated[0] || ''
    });
  };

  // Category Handlers
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCatId) {
        await api.updateCategory(editingCatId, catForm);
        notify('Category updated');
      } else {
        await api.addCategory(catForm);
        notify('Category added');
      }
      setShowCategoryModal(false);
      setEditingCatId(null);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('Delete category? Outfits in this category will remain safe.')) {
      try {
        await api.deleteCategory(id);
        notify('Category deleted');
        fetchData();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  // Offer Handlers
  const handleOpenAddOffer = () => {
    setEditingOfferId(null);
    setOfferModalError(null);
    const initialCat = categories[0] || { id: 'cat-1', name: 'Bride Dresses' };
    setOfferForm({
      name: '',
      categoryId: initialCat.id,
      categoryName: initialCat.name,
      discountPercentage: 20,
      isActive: true,
    });
    setShowOfferModal(true);
  };

  const handleOpenEditOffer = (offer: CategoryOffer) => {
    setEditingOfferId(offer.id);
    setOfferModalError(null);
    setOfferForm({
      name: offer.name,
      categoryId: offer.categoryId,
      categoryName: offer.categoryName,
      discountPercentage: offer.discountPercentage,
      isActive: offer.isActive,
    });
    setShowOfferModal(true);
  };

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setOfferModalError(null);

    if (!offerForm.name.trim()) {
      setOfferModalError('Offer Name is required.');
      return;
    }

    if (offerForm.discountPercentage <= 0 || offerForm.discountPercentage > 100) {
      setOfferModalError('Discount Percentage must be between 1% and 100%.');
      return;
    }

    try {
      if (editingOfferId) {
        await api.updateOffer(editingOfferId, offerForm);
        notify('Offer updated successfully!');
      } else {
        await api.addOffer(offerForm);
        notify('New offer created and published!');
      }
      setShowOfferModal(false);
      setEditingOfferId(null);
      fetchData();
    } catch (err: any) {
      setOfferModalError(err.message || 'Failed to save offer.');
    }
  };

  const handleToggleOfferStatus = async (id: string, currentStatus: boolean) => {
    try {
      await api.toggleOfferStatus(id, !currentStatus);
      notify(`Offer ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteOffer = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      try {
        await api.deleteOffer(id);
        notify('Offer deleted');
        fetchData();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  // Filter Handlers
  const handleAddSizeFilter = async () => {
    if (!newSize.trim()) return;
    const updated = [...(filters.sizes || []), newSize.trim()];
    try {
      await api.updateFilters({ sizes: updated });
      setNewSize('');
      notify('Size filter added');
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRemoveSizeFilter = async (sizeToRemove: string) => {
    const updated = (filters.sizes || []).filter((s: string) => s !== sizeToRemove);
    try {
      await api.updateFilters({ sizes: updated });
      notify('Size filter removed');
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Booking Status Handler
  const handleUpdateBookingStatus = async (id: string, status: string, internalNotes?: string) => {
    try {
      await api.updateBooking(id, { status, internalNotes });
      notify('Booking status updated');
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Settings Handler
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateSettings(settings);
      notify('Website business info & settings updated live!');
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 shrink-0 hidden md:flex">
        <div className="space-y-6">
          
          {/* Logo & Header */}
          <div className="flex items-center gap-3 px-2 pt-2">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 p-1 flex items-center justify-center shrink-0">
              <img src={logoImg} alt="JTF Admin" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="font-bold font-serif text-white text-base">JTF Control</h2>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                RBAC Admin
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs font-bold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                activeTab === 'overview' ? 'bg-pink-700 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('dresses')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                activeTab === 'dresses' ? 'bg-pink-700 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Dress Management</span>
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
              onClick={() => setActiveTab('homepage')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                activeTab === 'homepage' ? 'bg-pink-700 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Home className="w-4 h-4 text-amber-400" />
              <span>Homepage Outfits</span>
            </button>

            <button
              onClick={() => setActiveTab('offers')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition ${
                activeTab === 'offers' ? 'bg-pink-700 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Percent className="w-4 h-4 text-amber-400" />
                <span>Offers & Discounts</span>
              </div>
              {offers.filter(o => o.isActive).length > 0 && (
                <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {offers.filter(o => o.isActive).length} Active
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('filters')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                activeTab === 'filters' ? 'bg-pink-700 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters Manager</span>
            </button>

            <button
              onClick={() => setActiveTab('images')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                activeTab === 'images' ? 'bg-pink-700 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Image Uploads</span>
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition ${
                activeTab === 'bookings' ? 'bg-pink-700 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4" />
                <span>Bookings</span>
              </div>
              {bookings.length > 0 && (
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {bookings.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                activeTab === 'settings' ? 'bg-pink-700 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Business & Trial Settings</span>
            </button>
          </nav>

        </div>

        {/* User Info & Logout */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="px-2">
            <span className="text-[10px] text-slate-500 uppercase block font-bold">Admin Account</span>
            <span className="text-xs font-bold text-slate-200 truncate block">{adminUser?.email || 'admin@jaithuthikshafashion.online'}</span>
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header */}
        <header className="bg-slate-900/80 border-b border-slate-800 p-4 sm:p-6 flex justify-between items-center sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold font-serif text-white uppercase tracking-wider capitalize">
              {activeTab} Management
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-pink-400 hover:text-pink-300 font-semibold px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700"
            >
              Open Website ↗
            </a>

            <button
              onClick={logout}
              className="md:hidden p-2 rounded-lg bg-red-950 text-red-300 border border-red-800"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Floating Notification Toast */}
        {statusMessage && (
          <div className="fixed top-6 right-6 z-50 bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500 text-xs font-bold flex items-center gap-2 animate-bounce">
            <Check className="w-4 h-4 text-emerald-300" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Tab Content Rendering */}
        <main className="p-4 sm:p-8 space-y-8 flex-1">
          
          {/* 1. OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
                  <span className="text-xs text-slate-400 block font-bold">Total Rental Outfits</span>
                  <span className="text-3xl font-extrabold text-white mt-1 block">{dresses.length}</span>
                </div>
                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
                  <span className="text-xs text-slate-400 block font-bold">Categories</span>
                  <span className="text-3xl font-extrabold text-amber-400 mt-1 block">{categories.length}</span>
                </div>
                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
                  <span className="text-xs text-slate-400 block font-bold">Active Category Offers</span>
                  <span className="text-3xl font-extrabold text-pink-400 mt-1 block">
                    {offers.filter((o) => o.isActive).length}
                  </span>
                </div>
                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
                  <span className="text-xs text-slate-400 block font-bold">WhatsApp Enquiries</span>
                  <span className="text-3xl font-extrabold text-emerald-400 mt-1 block">{bookings.length}</span>
                </div>
              </div>

              {/* Recent WhatsApp Bookings Overview */}
              <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4">
                <h3 className="text-lg font-bold font-serif text-white">Recent WhatsApp Rental Inquiries</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 uppercase font-bold text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Dress</th>
                        <th className="p-3">Dates</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {bookings.slice(0, 5).map((b) => (
                        <tr key={b.id} className="hover:bg-slate-800/40">
                          <td className="p-3 font-bold text-white">{b.customerName}</td>
                          <td className="p-3 text-pink-400">{b.dressName}</td>
                          <td className="p-3 text-slate-400">{b.startDate} → {b.returnDate}</td>
                          <td className="p-3">
                            <span className="bg-amber-950 text-amber-300 px-2.5 py-1 rounded-full font-bold">
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 2. DRESSES MANAGEMENT TAB */}
          {activeTab === 'dresses' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <p className="text-xs text-slate-400">Manage rental outfits, upload images, set sizes, prices, and homepage visibility.</p>
                <button
                  onClick={() => {
                    setEditingDressId(null);
                    setDressForm({
                      name: '',
                      categoryId: categories[0]?.id || '',
                      categoryName: categories[0]?.name || 'Bride Dresses',
                      designer: 'Jai Thuthiksha Couture',
                      retailPrice: 45000,
                      rentalPrice4Days: 3999,
                      rentalPrice8Days: 6499,
                      advanceAmount: 1500,
                      images: [],
                      primaryImage: '',
                      description: '',
                      fabric: 'Micro Velvet',
                      workType: 'Zardozi Handcraft',
                      sizes: ['S', 'M', 'L'],
                      colors: ['Crimson Red'],
                      occasion: 'Wedding Day',
                      isAvailable: true,
                      isHidden: false,
                      showOnHomepage: true,
                      isTrending: false,
                      isNewArrival: false,
                      displayOrder: 1
                    });
                    setShowDressModal(true);
                  }}
                  className="px-4 py-2.5 rounded-xl gradient-btn text-white text-xs font-bold flex items-center gap-2 shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Dress</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dresses.map((dress) => (
                  <div key={dress.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden space-y-4 p-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="relative h-48 bg-slate-950 rounded-2xl overflow-hidden">
                        <img src={dress.image} alt={dress.name} className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2 bg-slate-900/90 text-amber-300 text-[10px] font-bold px-2 py-1 rounded-full border border-slate-700">
                          {dress.categoryLabel || dress.category}
                        </div>
                        {(dress as any).showOnHomepage !== false && (
                          <div className="absolute top-2 right-2 bg-pink-900/90 text-pink-200 text-[10px] font-bold px-2 py-1 rounded-full border border-pink-700 flex items-center gap-1">
                            <Home className="w-3 h-3" /> Homepage
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="font-bold text-white text-base font-serif line-clamp-1">{dress.name}</h4>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                          <span>4-Day: <strong className="text-pink-400">₹{dress.rentalPrice4Days}</strong></span>
                          <span>Retail: ₹{dress.retailPrice}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(dress.sizes || []).map((sz: string) => (
                            <span key={sz} className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono font-bold">
                              {sz}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleDressStatus(dress.id, { isHidden: !(dress as any).isHidden })}
                          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                          title={(dress as any).isHidden ? 'Unhide' : 'Hide from catalogue'}
                        >
                          {(dress as any).isHidden ? <EyeOff className="w-4 h-4 text-red-400" /> : <Eye className="w-4 h-4 text-emerald-400" />}
                        </button>

                        <button
                          onClick={() => handleEditDress(dress)}
                          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                          title="Edit Dress"
                        >
                          <Edit3 className="w-4 h-4 text-amber-400" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleDeleteDress(dress.id)}
                        className="p-2 rounded-lg bg-red-950 text-red-400 hover:bg-red-900"
                        title="Delete Dress"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. CATEGORIES TAB */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-400">Manage dress categories displayed across website and navigation filters.</p>
                <button
                  onClick={() => {
                    setEditingCatId(null);
                    setCatForm({ name: '', tagline: '', image: '', order: categories.length + 1, enabled: true });
                    setShowCategoryModal(true);
                  }}
                  className="px-4 py-2.5 rounded-xl gradient-btn text-white text-xs font-bold flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <div key={cat.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{cat.name}</h4>
                      <p className="text-xs text-slate-400">{cat.tagline || 'Category'}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-2 rounded-lg bg-red-950 text-red-400 hover:bg-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HOMEPAGE DRESSES MANAGEMENT TAB */}
          {activeTab === 'homepage' && (
            <div className="space-y-6">
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
                <h3 className="text-lg font-bold font-serif text-white flex items-center gap-2">
                  <Home className="w-5 h-5 text-amber-400" />
                  <span>Homepage Outfits & Featured Collection</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Control exactly which outfits appear on the front page. Toggle homepage display or feature status without deleting dresses from catalogue.
                </p>
              </div>

              <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 uppercase font-bold text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-4">Outfit</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">4-Day Rent</th>
                        <th className="p-4">Homepage Status</th>
                        <th className="p-4">Trending</th>
                        <th className="p-4">New Arrival</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {dresses.map((dress) => {
                        const isHomepage = (dress as any).showOnHomepage !== false && !(dress as any).isHidden;
                        const isTrending = !!(dress as any).isTrending;
                        const isNew = !!(dress as any).isNewArrival;

                        return (
                          <tr key={dress.id} className="hover:bg-slate-800/40">
                            <td className="p-4 flex items-center gap-3">
                              <img src={dress.image} alt={dress.name} className="w-10 h-12 object-cover rounded-lg bg-slate-950" />
                              <div>
                                <strong className="text-white text-sm block font-serif">{dress.name}</strong>
                                <span className="text-[10px] text-slate-500">ID: {dress.id}</span>
                              </div>
                            </td>
                            <td className="p-4 font-semibold text-amber-300">{dress.categoryLabel || dress.category}</td>
                            <td className="p-4 font-bold text-pink-400">₹{dress.rentalPrice4Days}</td>
                            <td className="p-4">
                              <button
                                onClick={() => handleToggleDressStatus(dress.id, { showOnHomepage: !isHomepage })}
                                className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition flex items-center gap-1.5 ${
                                  isHomepage
                                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                                }`}
                              >
                                {isHomepage ? <Check className="w-3.5 h-3.5" /> : null}
                                <span>{isHomepage ? 'Shown on Homepage' : 'Hidden from Homepage'}</span>
                              </button>
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() => handleToggleDressStatus(dress.id, { isTrending: !isTrending })}
                                className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition ${
                                  isTrending
                                    ? 'bg-amber-950 text-amber-300 border-amber-800'
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                                }`}
                              >
                                {isTrending ? '🔥 Trending' : 'Normal'}
                              </button>
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() => handleToggleDressStatus(dress.id, { isNewArrival: !isNew })}
                                className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition ${
                                  isNew
                                    ? 'bg-pink-950 text-pink-300 border-pink-800'
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                                }`}
                              >
                                {isNew ? '✨ New Arrival' : 'Standard'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 4. OFFERS & DISCOUNTS TAB */}
          {activeTab === 'offers' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800">
                <div>
                  <h3 className="text-xl font-bold font-serif text-white flex items-center gap-2">
                    <Percent className="w-5 h-5 text-amber-400" />
                    <span>Category Offers & Discounts</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl">
                    Create dynamic category-based rental discount offers (e.g. 20% OFF on Bride Dresses). 
                    Discounts apply automatically across customer prices and WhatsApp enquiries. 
                    <strong className="text-amber-400 block mt-0.5">Note: Only ONE active offer is allowed per category at a time.</strong>
                  </p>
                </div>

                <button
                  onClick={handleOpenAddOffer}
                  className="px-5 py-3 rounded-xl gradient-btn text-white text-xs font-bold flex items-center gap-2 shadow-lg shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Offer</span>
                </button>
              </div>

              {/* Offers Table List */}
              <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 uppercase font-bold text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-4">Offer Name</th>
                        <th className="p-4">Target Category</th>
                        <th className="p-4">Discount %</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {offers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-500 font-semibold">
                            No promotional offers created yet. Click "Create New Offer" to add one.
                          </td>
                        </tr>
                      ) : (
                        offers.map((offer) => (
                          <tr key={offer.id} className="hover:bg-slate-800/40 transition">
                            <td className="p-4 font-bold text-white text-sm">
                              {offer.name}
                            </td>
                            <td className="p-4 text-pink-400 font-semibold">
                              {offer.categoryName}
                            </td>
                            <td className="p-4">
                              <span className="bg-red-950 text-red-300 border border-red-800/80 px-2.5 py-1 rounded-full font-black text-xs">
                                {offer.discountPercentage}% OFF
                              </span>
                            </td>
                            <td className="p-4">
                              {offer.isActive ? (
                                <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-3 py-1 rounded-full font-bold inline-flex items-center gap-1.5 text-[11px]">
                                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                                  Active
                                </span>
                              ) : (
                                <span className="bg-slate-800 text-slate-400 border border-slate-700 px-3 py-1 rounded-full font-bold text-[11px]">
                                  Inactive
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleToggleOfferStatus(offer.id, offer.isActive)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                                    offer.isActive
                                      ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700'
                                      : 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                                  }`}
                                >
                                  {offer.isActive ? 'Deactivate' : 'Activate'}
                                </button>

                                <button
                                  onClick={() => handleOpenEditOffer(offer)}
                                  className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
                                  title="Edit Offer"
                                >
                                  <Edit3 className="w-4 h-4 text-amber-400" />
                                </button>

                                <button
                                  onClick={() => handleDeleteOffer(offer.id)}
                                  className="p-2 rounded-lg bg-red-950 text-red-400 hover:bg-red-900 border border-red-800/60"
                                  title="Delete Offer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 5. FILTERS MANAGER TAB */}
          {activeTab === 'filters' && (
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-6">
              <h3 className="text-lg font-bold font-serif text-white">Dynamic Size Filters</h3>

              <div className="flex gap-2 max-w-md">
                <input
                  type="text"
                  placeholder="Add new size option (e.g. 3XL)..."
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  className="flex-1 p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none"
                />
                <button
                  onClick={handleAddSizeFilter}
                  className="px-4 py-2.5 rounded-xl gradient-btn text-white text-xs font-bold"
                >
                  Add Size
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {(filters.sizes || []).map((size: string) => (
                  <span key={size} className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-2">
                    <span>{size}</span>
                    <button onClick={() => handleRemoveSizeFilter(size)} className="text-red-400 hover:text-red-300 font-bold">×</button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 6. BOOKINGS TAB */}
          {activeTab === 'bookings' && (
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-6">
              <h3 className="text-lg font-bold font-serif text-white">Rental Enquiries & Bookings</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 uppercase font-bold text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Outfit</th>
                      <th className="p-3">Duration</th>
                      <th className="p-3">Rental Dates</th>
                      <th className="p-3">Est. Rent</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {bookings.map((b) => (
                      <tr key={b.id}>
                        <td className="p-3 font-bold text-white">
                          {b.customerName}
                          <span className="block text-[10px] text-slate-500 font-normal">{b.customerPhone}</span>
                        </td>
                        <td className="p-3 text-pink-400">{b.dressName}</td>
                        <td className="p-3">{b.durationDays || 4} Days</td>
                        <td className="p-3 text-slate-400">{b.startDate} → {b.returnDate}</td>
                        <td className="p-3 font-bold text-amber-400">₹{b.rentalPrice}</td>
                        <td className="p-3">
                          <select
                            value={b.status}
                            onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value)}
                            className="bg-slate-950 border border-slate-800 text-xs font-bold text-amber-300 p-1.5 rounded-lg outline-none"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Ready for Pickup">Ready for Pickup</option>
                            <option value="Rented">Rented</option>
                            <option value="Returned">Returned</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 7. SETTINGS / BUSINESS & TRIAL INFO TAB */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-6 text-xs max-w-4xl">
              <div>
                <h3 className="text-xl font-bold font-serif text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-amber-400" />
                  <span>Business Information & Trial Appointment Settings</span>
                </h3>
                <p className="text-slate-400 text-xs mt-1">
                  Updates made here immediately propagate dynamically to the Navbar, Trial Popup, Contact Page, and WhatsApp booking links across the website.
                </p>
              </div>

              {/* Section A: Boutique Contact & Location */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h4 className="font-bold text-amber-300 text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Boutique Details & Location
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Shop Name</label>
                    <input
                      type="text"
                      value={settings.shopName || ''}
                      onChange={(e) => setSettings({ ...settings, shopName: e.target.value })}
                      placeholder="Jai Thuthiksha Fashion"
                      className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">WhatsApp Booking Number (e.g. 8489166899)</label>
                    <input
                      type="text"
                      value={settings.whatsappNumber || ''}
                      onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                      className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Phone Display Support (+91 84891 66899)</label>
                    <input
                      type="text"
                      value={settings.phoneDisplay || ''}
                      onChange={(e) => setSettings({ ...settings, phoneDisplay: e.target.value })}
                      className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={settings.contactEmail || ''}
                      onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                      className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-pink-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Street Address</label>
                  <input
                    type="text"
                    value={settings.shopAddress || ''}
                    onChange={(e) => setSettings({ ...settings, shopAddress: e.target.value })}
                    placeholder="No. 12, Park Road, Near Bus Stand"
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-pink-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">City</label>
                    <input
                      type="text"
                      value={settings.city || ''}
                      onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                      placeholder="Erode"
                      className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">State</label>
                    <input
                      type="text"
                      value={settings.state || ''}
                      onChange={(e) => setSettings({ ...settings, state: e.target.value })}
                      placeholder="Tamil Nadu"
                      className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Pincode</label>
                    <input
                      type="text"
                      value={settings.pincode || ''}
                      onChange={(e) => setSettings({ ...settings, pincode: e.target.value })}
                      placeholder="638001"
                      className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Google Maps URL</label>
                  <input
                    type="url"
                    value={settings.mapsUrl || ''}
                    onChange={(e) => setSettings({ ...settings, mapsUrl: e.target.value })}
                    placeholder="https://maps.google.com/?q=..."
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none"
                  />
                </div>
              </div>

              {/* Section B: Trial Appointment Popup Settings */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h4 className="font-bold text-amber-300 text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Trial Appointment Popup Content
                </h4>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Trial Title</label>
                  <input
                    type="text"
                    value={settings.trialTitle || ''}
                    onChange={(e) => setSettings({ ...settings, trialTitle: e.target.value })}
                    placeholder="Book In-Person Trial"
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Trial Description</label>
                  <textarea
                    rows={2}
                    value={settings.trialDescription || ''}
                    onChange={(e) => setSettings({ ...settings, trialDescription: e.target.value })}
                    placeholder="Visit our exclusive boutique for personalized fitting and trial sessions."
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Availability Hours</label>
                  <input
                    type="text"
                    value={settings.trialAvailabilityInfo || ''}
                    onChange={(e) => setSettings({ ...settings, trialAvailabilityInfo: e.target.value })}
                    placeholder="Monday - Saturday | 10:00 AM - 8:00 PM"
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none"
                  />
                </div>
              </div>

              {/* Section C: Homepage Hero */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h4 className="font-bold text-amber-300 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Homepage Hero Banner
                </h4>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Hero Title Heading</label>
                  <input
                    type="text"
                    value={settings.heroTitle || ''}
                    onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                    placeholder="Luxury Rental Couture for Your Special Moments"
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Hero Description Subtitle</label>
                  <textarea
                    rows={2}
                    value={settings.heroSubtitle || ''}
                    onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                    placeholder="Rent premium designer bridal lehengas, silk sarees, and traditional wear at affordable rental prices."
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="gradient-btn text-white font-bold py-3.5 px-8 rounded-xl shadow-lg w-full sm:w-auto"
              >
                Save & Publish Settings Live
              </button>
            </form>
          )}

        </main>
      </div>

      {/* Add / Edit Dress Modal */}
      {showDressModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 space-y-4 my-8 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-xl font-bold font-serif text-white">
                {editingDressId ? 'Edit Dress Details' : 'Add New Rental Dress'}
              </h3>
              <button onClick={() => setShowDressModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDress} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Dress Name</label>
                <input
                  type="text"
                  required
                  value={dressForm.name}
                  onChange={(e) => setDressForm({ ...dressForm, name: e.target.value })}
                  placeholder="e.g. Royal Crimson Zardozi Lehenga"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Category</label>
                  <select
                    value={dressForm.categoryId}
                    onChange={(e) => {
                      const selectedCat = categories.find(c => c.id === e.target.value);
                      setDressForm({
                        ...dressForm,
                        categoryId: e.target.value,
                        categoryName: selectedCat ? selectedCat.name : 'Bride Dresses'
                      });
                    }}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Advance Deposit (₹)</label>
                  <input
                    type="number"
                    required
                    value={dressForm.advanceAmount}
                    onChange={(e) => setDressForm({ ...dressForm, advanceAmount: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">4-Day Rental Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={dressForm.rentalPrice4Days}
                    onChange={(e) => setDressForm({ ...dressForm, rentalPrice4Days: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">8-Day Rental Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={dressForm.rentalPrice8Days}
                    onChange={(e) => setDressForm({ ...dressForm, rentalPrice8Days: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none"
                  />
                </div>
              </div>

              {/* Dress Sizes Checkbox Selector */}
              <div>
                <label className="block text-slate-400 font-bold mb-1">Available Sizes for this Dress</label>
                <div className="flex flex-wrap gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {AVAILABLE_SIZES.map((size) => {
                    const isSelected = (dressForm.sizes || []).includes(size);
                    return (
                      <button
                        type="button"
                        key={size}
                        onClick={() => handleToggleSize(size)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition border ${
                          isSelected
                            ? 'bg-pink-700 text-white border-pink-500 shadow'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {isSelected ? '✓ ' : ''}{size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Multi-Image Upload & Preview */}
              <div className="space-y-2">
                <label className="block text-slate-400 font-bold">Dress Images (Upload or add URL)</label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="text-xs text-slate-400"
                  />
                  {uploadingImages && <span className="text-pink-400 font-bold animate-pulse">Uploading...</span>}
                </div>

                {/* Previews */}
                <div className="flex gap-3 overflow-x-auto py-2">
                  {dressForm.images.map((imgUrl, idx) => (
                    <div key={idx} className="relative w-20 h-24 rounded-lg overflow-hidden border border-slate-700 shrink-0">
                      <img src={imgUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full text-[10px]"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Homepage & Visibility Options */}
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-bold">
                  <input
                    type="checkbox"
                    checked={dressForm.showOnHomepage}
                    onChange={(e) => setDressForm({ ...dressForm, showOnHomepage: e.target.checked })}
                    className="accent-pink-600 w-4 h-4"
                  />
                  <span>Show on Homepage</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-bold">
                  <input
                    type="checkbox"
                    checked={dressForm.isAvailable}
                    onChange={(e) => setDressForm({ ...dressForm, isAvailable: e.target.checked })}
                    className="accent-emerald-600 w-4 h-4"
                  />
                  <span>Available for Rent</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-bold">
                  <input
                    type="checkbox"
                    checked={dressForm.isTrending}
                    onChange={(e) => setDressForm({ ...dressForm, isTrending: e.target.checked })}
                    className="accent-amber-600 w-4 h-4"
                  />
                  <span>Mark as Trending</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-bold">
                  <input
                    type="checkbox"
                    checked={dressForm.isHidden}
                    onChange={(e) => setDressForm({ ...dressForm, isHidden: e.target.checked })}
                    className="accent-red-600 w-4 h-4"
                  />
                  <span>Hide from Catalogue</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full gradient-btn text-white py-3.5 rounded-xl font-bold shadow-lg"
              >
                {editingDressId ? 'Update Dress Details' : 'Create & Publish Dress'}
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
              <h3 className="text-xl font-bold font-serif text-white">Add / Edit Category</h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  placeholder="e.g. Bride Dresses, Maternity Wear..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Tagline</label>
                <input
                  type="text"
                  value={catForm.tagline}
                  onChange={(e) => setCatForm({ ...catForm, tagline: e.target.value })}
                  placeholder="e.g. Royal Zardozi Embroidery"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full gradient-btn text-white py-3 rounded-xl font-bold mt-2"
              >
                Save Category
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-xl font-bold font-serif text-white flex items-center gap-2">
                <Percent className="w-5 h-5 text-amber-400" />
                <span>{editingOfferId ? 'Edit Offer' : 'Create Category Offer'}</span>
              </h3>
              <button onClick={() => setShowOfferModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {offerModalError && (
              <div className="p-3 bg-red-950/90 border border-red-800 rounded-xl flex items-start gap-2 text-xs text-red-200">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{offerModalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveOffer} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  Offer Name <span className="text-pink-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={offerForm.name}
                  onChange={(e) => setOfferForm({ ...offerForm, name: e.target.value })}
                  placeholder="e.g. Festive Bridal Special 20% OFF"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  Category <span className="text-pink-400">*</span>
                </label>
                <select
                  value={offerForm.categoryId}
                  onChange={(e) => {
                    const selectedCat = categories.find((c) => c.id === e.target.value);
                    setOfferForm({
                      ...offerForm,
                      categoryId: e.target.value,
                      categoryName: selectedCat ? selectedCat.name : offerForm.categoryName,
                    });
                  }}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-pink-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  Discount Percentage (% OFF) <span className="text-pink-400">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={offerForm.discountPercentage}
                  onChange={(e) => setOfferForm({ ...offerForm, discountPercentage: Number(e.target.value) })}
                  placeholder="e.g. 20"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-pink-500"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-bold">
                  <input
                    type="checkbox"
                    checked={offerForm.isActive}
                    onChange={(e) => setOfferForm({ ...offerForm, isActive: e.target.checked })}
                    className="w-4 h-4 accent-pink-600 rounded"
                  />
                  <span>Active Offer (Enable discount for customers)</span>
                </label>
                <p className="text-[11px] text-slate-500 mt-1 pl-6">
                  Note: If activated, any existing active offer for this category must be deactivated first.
                </p>
              </div>

              <button
                type="submit"
                className="w-full gradient-btn text-white py-3.5 rounded-xl font-bold shadow-lg mt-2"
              >
                {editingOfferId ? 'Update Offer' : 'Publish Offer'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
