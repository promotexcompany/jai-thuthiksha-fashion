import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { api } from '../services/api';
import type { Product, Category } from '../types/fashion';
import {
  LogOut, Plus, Trash2, Edit3, ShoppingBag, X, Tag,
  Eye, EyeOff, Check, Upload
} from 'lucide-react';
import logoImg from '../assets/logo.png';

export const AdminDashboard: React.FC = () => {
  const { logout, adminUser } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<'dresses' | 'categories'>('dresses');

  // Server Data States
  const [dresses, setDresses] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dress Form State
  const [showDressModal, setShowDressModal] = useState(false);
  const [editingDressId, setEditingDressId] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [dressForm, setDressForm] = useState({
    name: '',
    price: 2500,
    categoryId: '',
    categoryName: 'Photoshoot',
    images: [] as string[],
    primaryImage: '',
    isHidden: false,
    // System fallbacks for database compatibility
    designer: 'Jai Thuthiksha Couture',
    retailPrice: 2500,
    rentalPrice4Days: 2500,
    rentalPrice8Days: 2500,
    advanceAmount: 0,
    description: 'Designer fashion dress',
    fabric: 'Premium Fabric',
    workType: 'Handcraft',
    sizes: ['S', 'M', 'L'],
    colors: ['Multi'],
    occasion: 'Special Occasion',
    isAvailable: true,
    showOnHomepage: true
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

  // Load backend data efficiently
  const fetchData = async () => {
    try {
      const [dressesData, catsData] = await Promise.all([
        api.getAllAdminDresses(),
        api.getAllAdminCategories()
      ]);

      if (dressesData && Array.isArray(dressesData)) setDresses(dressesData);
      if (catsData && Array.isArray(catsData)) setCategories(catsData);
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
  const handleOpenAddDress = () => {
    setEditingDressId(null);
    const defaultCat = categories[0] || { id: 'cat-1', name: 'Photoshoot' };
    setDressForm({
      name: '',
      price: 2500,
      categoryId: defaultCat.id,
      categoryName: defaultCat.name,
      images: [],
      primaryImage: '',
      isHidden: false,
      designer: 'Jai Thuthiksha Couture',
      retailPrice: 2500,
      rentalPrice4Days: 2500,
      rentalPrice8Days: 2500,
      advanceAmount: 0,
      description: 'Designer fashion dress',
      fabric: 'Premium Fabric',
      workType: 'Handcraft',
      sizes: ['S', 'M', 'L'],
      colors: ['Multi'],
      occasion: 'Special Occasion',
      isAvailable: true,
      showOnHomepage: true
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
      categoryId: (dress as any).categoryId || matchedCat?.id || categories[0]?.id || 'cat-1',
      categoryName: dress.categoryLabel || matchedCat?.name || dress.category || 'Photoshoot',
      images: existingImages,
      primaryImage: dress.image || existingImages[0] || '',
      isHidden: (dress as any).isHidden || false,
      designer: dress.designer || 'Jai Thuthiksha Couture',
      retailPrice: dressPrice,
      rentalPrice4Days: dressPrice,
      rentalPrice8Days: dressPrice,
      advanceAmount: (dress as any).advanceAmount || 0,
      description: dress.description || 'Designer fashion dress',
      fabric: dress.fabric || 'Premium Fabric',
      workType: dress.workType || 'Handcraft',
      sizes: dress.sizes || ['S', 'M', 'L'],
      colors: dress.colors || ['Multi'],
      occasion: dress.occasion || 'Special Occasion',
      isAvailable: (dress as any).isAvailable !== undefined ? (dress as any).isAvailable : true,
      showOnHomepage: true
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
        rentalPrice4Days: priceVal,
        retailPrice: priceVal,
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
      notify(`Dress ${!currentIsHidden ? 'hidden from' : 'shown in'} catalogue.`);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update dress status');
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

  // Image Upload & Management Handlers
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
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                Admin Panel
              </span>
            </div>
          </div>

          {/* Navigation Links (ONLY 2 SECTIONS) */}
          <nav className="space-y-1 text-xs font-bold">
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
          </nav>

        </div>

        {/* User Info & Logout at Bottom */}
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

      {/* Mobile Top Navigation & Header */}
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
              className="text-[11px] text-pink-400 font-semibold px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700"
            >
              Website ↗
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

        {/* Mobile Tab Switcher */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('dresses')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
              activeTab === 'dresses' ? 'bg-pink-700 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Dress Management</span>
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
              activeTab === 'categories' ? 'bg-pink-700 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Categories</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto min-h-screen">
        
        {/* Desktop Top Bar */}
        <header className="hidden md:flex bg-slate-900/80 border-b border-slate-800 p-6 justify-between items-center sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold font-serif text-white uppercase tracking-wider capitalize">
              {activeTab === 'dresses' ? 'Dress Management' : 'Category Management'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-pink-400 hover:text-pink-300 font-semibold px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 transition"
            >
              Open Website ↗
            </a>
          </div>
        </header>

        {/* Floating Notification Toast */}
        {statusMessage && (
          <div className="fixed top-6 right-6 z-50 bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500 text-xs font-bold flex items-center gap-2 animate-bounce">
            <Check className="w-4 h-4 text-emerald-300" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Tab Content Area */}
        <main className="p-4 sm:p-8 space-y-8 flex-1">
          
          {/* 1. DRESS MANAGEMENT TAB */}
          {activeTab === 'dresses' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-800">
                <div>
                  <h3 className="text-lg font-bold font-serif text-white">Dress Inventory</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Add new dresses, set prices, upload multiple images, edit details, or change categories.
                  </p>
                </div>
                <button
                  onClick={handleOpenAddDress}
                  className="px-5 py-2.5 rounded-xl gradient-btn text-white text-xs font-bold flex items-center gap-2 shadow-lg shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Dress</span>
                </button>
              </div>

              {dresses.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
                  <p className="text-sm font-bold">No dresses in inventory yet.</p>
                  <button
                    onClick={handleOpenAddDress}
                    className="px-4 py-2 rounded-xl gradient-btn text-white text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add First Dress
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {dresses.map((dress) => {
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
                          
                          {/* Primary Image & Multi-Image Badges */}
                          <div className="relative h-56 bg-slate-950 rounded-2xl overflow-hidden">
                            <img
                              src={dress.image || gallery[0]}
                              alt={dress.name}
                              className={`w-full h-full object-cover transition ${isHidden ? 'opacity-40 grayscale' : ''}`}
                            />
                            
                            {/* Category Tag */}
                            <div className="absolute top-2 left-2 bg-slate-900/90 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-slate-700 backdrop-blur-sm">
                              {dress.categoryLabel || (dress as any).categoryName || dress.category}
                            </div>

                            {/* Images Counter Badge */}
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

                          {/* Title, Price & Multi-Image Gallery Strip */}
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-bold text-white text-base font-serif line-clamp-1">{dress.name}</h4>
                              <span className="text-amber-400 font-extrabold text-sm shrink-0">
                                ₹{priceDisplay.toLocaleString('en-IN')}
                              </span>
                            </div>
                            
                            {/* Image Thumbnails Strip */}
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

                        {/* Controls Bar */}
                        <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleDressVisibility(dress.id, isHidden)}
                              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition"
                              title={isHidden ? 'Unhide from public site' : 'Hide from public site'}
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

          {/* 2. CATEGORIES TAB */}
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
                      <span className="text-[11px] text-slate-400 block mt-0.5">ID: {cat.id}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditCategory(cat)}
                        className="p-2 rounded-xl bg-slate-800 text-amber-300 hover:bg-slate-700 border border-slate-700 transition"
                        title="Edit Category Name"
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

        </main>
      </div>

      {/* Add / Edit Dress Modal */}
      {showDressModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 space-y-5 my-8 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-xl font-bold font-serif text-white">
                {editingDressId ? 'Edit Dress' : 'Add New Dress'}
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
                  className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none focus:border-pink-500 transition"
                />
              </div>

              {/* Price & Category Controls Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Category Selector */}
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
                    className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none focus:border-pink-500 transition"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Price (₹) Field */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    Price (₹) <span className="text-pink-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={dressForm.price}
                    onChange={(e) => setDressForm({ ...dressForm, price: Number(e.target.value) })}
                    placeholder="e.g. 2500"
                    className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none focus:border-pink-500 transition font-bold text-amber-300"
                  />
                </div>
              </div>

              {/* Multi-Image Management */}
              <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <label className="block text-slate-300 font-bold">
                  Dress Images (Upload multiple images for ONE dress)
                </label>

                {/* File Upload Input */}
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

                {/* Optional Image URL Input */}
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

                {/* Image Previews, Set Main Image & Individual Deletion */}
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

              {/* Hide Toggle Option */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300 font-bold">Hide dress from public website</span>
                <input
                  type="checkbox"
                  checked={dressForm.isHidden}
                  onChange={(e) => setDressForm({ ...dressForm, isHidden: e.target.checked })}
                  className="w-4 h-4 accent-red-600 cursor-pointer"
                />
              </div>

              {/* Save Button */}
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
                  className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none focus:border-pink-500 transition"
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

    </div>
  );
};

export default AdminDashboard;
