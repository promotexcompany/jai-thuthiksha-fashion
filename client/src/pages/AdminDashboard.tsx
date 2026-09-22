import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { api } from '../services/api';
import type { Product, Category } from '../types/fashion';
import {
  LogOut, Plus, Trash2, Edit3, ShoppingBag, X, LayoutDashboard, Tag, SlidersHorizontal,
  Image as ImageIcon, Calendar, Settings, Eye, EyeOff, Check, AlertTriangle, Upload
} from 'lucide-react';
import logoImg from '../assets/logo.png';

export const AdminDashboard: React.FC = () => {
  const { logout, adminUser } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'dresses' | 'categories' | 'filters' | 'images' | 'bookings' | 'settings'>('overview');

  // Server Data States
  const [dresses, setDresses] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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
    isHidden: false
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

  // Filter Form State
  const [newSize, setNewSize] = useState('');

  // Load backend data
  const fetchData = async () => {
    try {
      const [dressesData, catsData, filtersData, bkgsData, settingsData] = await Promise.all([
        api.getAllAdminDresses(),
        api.getAllAdminCategories(),
        api.getFilters(),
        api.getAllAdminBookings(),
        api.getSettings()
      ]);

      if (dressesData) setDresses(dressesData);
      if (catsData) setCategories(catsData);
      if (filtersData) setFilters(filtersData);
      if (bkgsData) setBookings(bkgsData);
      if (settingsData) setSettings(settingsData);
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
        notify('New dress created successfully!');
      }
      setShowDressModal(false);
      setEditingDressId(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to save dress');
    }
  };

  const handleEditDress = (dress: Product) => {
    setEditingDressId(dress.id);
    setDressForm({
      name: dress.name,
      categoryId: (dress as any).categoryId || '',
      categoryName: dress.categoryLabel,
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
      sizes: dress.sizes,
      colors: dress.colors,
      occasion: dress.occasion,
      isAvailable: (dress as any).isAvailable !== undefined ? (dress as any).isAvailable : true,
      isHidden: (dress as any).isHidden || false
    });
    setShowDressModal(true);
  };

  const handleToggleDressStatus = async (id: string, updates: { isAvailable?: boolean; isHidden?: boolean }) => {
    try {
      await api.toggleDressStatus(id, updates);
      notify('Dress status updated');
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
      notify('Website content & settings updated live!');
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
              <span>Website Content</span>
            </button>
          </nav>

        </div>

        {/* User Info & Logout */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="px-2">
            <span className="text-[10px] text-slate-500 uppercase block font-bold">Admin Account</span>
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header */}
        <header className="bg-slate-900/80 border-b border-slate-800 p-4 sm:p-6 flex justify-between items-center sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold font-serif text-white uppercase tracking-wider">
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
                  <span className="text-xs text-slate-400 block font-bold">WhatsApp Enquiries</span>
                  <span className="text-3xl font-extrabold text-emerald-400 mt-1 block">{bookings.length}</span>
                </div>
                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
                  <span className="text-xs text-slate-400 block font-bold">Backend Security Status</span>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800 mt-2 inline-block">
                    RBAC Active (403 Forbidden Enforced)
                  </span>
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
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-400">Add, edit, upload multiple images, or temporarily hide dresses.</p>
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
                      fabric: 'Silk & Embroidery',
                      workType: 'Zardozi Handcraft',
                      sizes: ['S', 'M', 'L'],
                      colors: ['Red'],
                      occasion: 'Wedding Day',
                      isAvailable: true,
                      isHidden: false
                    });
                    setShowDressModal(true);
                  }}
                  className="px-5 py-2.5 rounded-xl gradient-btn text-white font-bold text-xs flex items-center gap-2 shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Dress</span>
                </button>
              </div>

              {/* Table */}
              <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 uppercase font-bold text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-4">Dress</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Advance</th>
                        <th className="p-4">4-Day Rent</th>
                        <th className="p-4">Availability</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {dresses.map((d) => (
                        <tr key={d.id} className="hover:bg-slate-800/40">
                          <td className="p-4 flex items-center gap-3">
                            <img src={d.image} alt={d.name} className="w-12 h-14 object-cover rounded-lg border border-slate-700" />
                            <div>
                              <span className="font-bold text-white text-sm block">{d.name}</span>
                              <span className="text-[10px] text-pink-400">{d.designer}</span>
                            </div>
                          </td>
                          <td className="p-4 font-semibold text-amber-300">{d.categoryLabel}</td>
                          <td className="p-4 font-bold text-emerald-400">₹{(d as any).advanceAmount || 1500}</td>
                          <td className="p-4 font-bold text-pink-400">₹{d.rentalPrice4Days.toLocaleString('en-IN')}</td>
                          <td className="p-4">
                            <button
                              onClick={() => handleToggleDressStatus(d.id, { isAvailable: !(d as any).isAvailable })}
                              className={`px-3 py-1 rounded-full font-bold text-[10px] ${
                                (d as any).isAvailable !== false ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-300 border border-red-800'
                              }`}
                            >
                              {(d as any).isAvailable !== false ? 'Available' : 'Unavailable'}
                            </button>
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => handleToggleDressStatus(d.id, { isHidden: !(d as any).isHidden })}
                              className={`px-3 py-1 rounded-full font-bold text-[10px] flex items-center gap-1 ${
                                (d as any).isHidden ? 'bg-slate-800 text-slate-400' : 'bg-pink-950 text-pink-300 border border-pink-800'
                              }`}
                            >
                              {(d as any).isHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              {(d as any).isHidden ? 'Hidden' : 'Visible'}
                            </button>
                          </td>
                          <td className="p-4 flex items-center gap-2">
                            <button
                              onClick={() => handleEditDress(d)}
                              className="p-2 text-slate-300 hover:text-white bg-slate-800 rounded-lg"
                              title="Edit dress"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteDress(d.id)}
                              className="p-2 text-red-400 hover:text-red-300 bg-red-950/60 rounded-lg"
                              title="Delete dress"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 3. CATEGORIES TAB */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-400">Manage categories (Bride Dresses, Maternity Wear, Photoshoot, Traditional, Party Wear, Custom).</p>
                <button
                  onClick={() => {
                    setEditingCatId(null);
                    setCatForm({ name: '', tagline: '', image: '', order: categories.length + 1, enabled: true });
                    setShowCategoryModal(true);
                  }}
                  className="px-5 py-2.5 rounded-xl gradient-btn text-white font-bold text-xs flex items-center gap-2 shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((c) => (
                  <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 relative">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] text-amber-400 font-bold uppercase">Order #{c.order || 1}</span>
                        <h4 className="text-lg font-bold text-white font-serif">{c.name}</h4>
                        <p className="text-xs text-slate-400">{c.tagline}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(c.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. FILTERS MANAGEMENT TAB */}
          {activeTab === 'filters' && (
            <div className="space-y-6 max-w-3xl">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
                <h3 className="text-lg font-bold font-serif text-white">Size Options Filter</h3>
                <div className="flex flex-wrap gap-2">
                  {(filters.sizes || []).map((s: string) => (
                    <span key={s} className="bg-slate-800 text-slate-200 border border-slate-700 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2">
                      {s}
                      <button onClick={() => handleRemoveSizeFilter(s)} className="text-red-400 hover:text-red-300">
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="New size e.g. 3XL"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none"
                  />
                  <button onClick={handleAddSizeFilter} className="px-4 py-2.5 rounded-xl bg-pink-700 text-white font-bold text-xs">
                    Add Size
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 5. IMAGE MANAGEMENT TAB */}
          {activeTab === 'images' && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
              <h3 className="text-lg font-bold font-serif text-white">Upload New Dress Images</h3>
              <p className="text-xs text-slate-400">Supported formats: JPG, PNG, WEBP. Max size: 10MB per file.</p>

              <label className="border-2 border-dashed border-slate-700 hover:border-pink-500 p-8 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition">
                <Upload className="w-8 h-8 text-pink-400 mb-2" />
                <span className="text-xs font-bold text-white">Click to Select & Upload Files</span>
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
          )}

          {/* 6. BOOKINGS MANAGEMENT TAB */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4">
                <h3 className="text-lg font-bold font-serif text-white">WhatsApp Enquiry & Rental Bookings</h3>
                
                <div className="space-y-4">
                  {bookings.map((b) => (
                    <div key={b.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                      {b.hasDateOverlapWarning && (
                        <div className="p-3 bg-red-950/80 border border-red-700/60 rounded-xl text-red-200 text-xs flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                          <span>DATE OVERLAP WARNING: Another active booking exists for this dress on overlapping dates!</span>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <h4 className="font-bold text-white text-base font-serif">{b.dressName}</h4>
                          <p className="text-xs text-slate-400">Customer: <strong className="text-pink-400">{b.customerName}</strong> ({b.customerPhone})</p>
                          <p className="text-xs text-slate-400 mt-0.5">Rental Dates: <span className="text-amber-300 font-bold">{b.startDate} → {b.returnDate}</span> ({b.durationDays} Days)</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="text-xs text-slate-400 font-bold">Status:</label>
                          <select
                            value={b.status}
                            onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value)}
                            className="bg-slate-900 border border-slate-700 text-xs font-bold text-amber-300 p-2 rounded-xl outline-none"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Ready for Pickup">Ready for Pickup</option>
                            <option value="Rented">Rented</option>
                            <option value="Returned">Returned</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 7. WEBSITE CONTENT SETTINGS TAB */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6 max-w-4xl">
              <h3 className="text-lg font-bold font-serif text-white">Website Content & Shop Configuration</h3>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Shop Name</label>
                  <input
                    type="text"
                    value={settings.shopName || ''}
                    onChange={(e) => setSettings({ ...settings, shopName: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">WhatsApp Number</label>
                  <input
                    type="text"
                    value={settings.whatsappNumber || ''}
                    onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="block text-slate-400 font-bold mb-1">Boutique Physical Address</label>
                <input
                  type="text"
                  value={settings.shopAddress || ''}
                  onChange={(e) => setSettings({ ...settings, shopAddress: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none"
                />
              </div>

              <div className="text-xs">
                <label className="block text-slate-400 font-bold mb-1">Homepage Hero Title</label>
                <input
                  type="text"
                  value={settings.heroTitle || ''}
                  onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none"
                />
              </div>

              <button
                type="submit"
                className="px-8 py-3.5 rounded-xl gradient-btn text-white font-bold text-xs shadow-lg"
              >
                Save & Update Website Live
              </button>
            </form>
          )}

        </main>
      </div>

      {/* Add / Edit Dress Modal */}
      {showDressModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-xl font-bold font-serif text-white">
                {editingDressId ? 'Edit Dress' : 'Add New Dress'}
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

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-bold">
                  <input
                    type="checkbox"
                    checked={dressForm.isAvailable}
                    onChange={(e) => setDressForm({ ...dressForm, isAvailable: e.target.checked })}
                  />
                  <span>Available for Rent</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-bold">
                  <input
                    type="checkbox"
                    checked={dressForm.isHidden}
                    onChange={(e) => setDressForm({ ...dressForm, isHidden: e.target.checked })}
                  />
                  <span>Hide from Public Catalogue</span>
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

    </div>
  );
};

export default AdminDashboard;
