import React, { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { api } from '../services/api';
import type { Product, Category } from '../types/fashion';
import {
  LogOut, Plus, Trash2, Edit3, X, Tag,
  Eye, EyeOff, Upload,
  Search, AlertCircle, Shirt,
  Menu, Info
} from 'lucide-react';
import logoImg from '../assets/logo.png';

export const AdminDashboard: React.FC = () => {
  const { logout, adminUser } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<'dresses' | 'categories'>('dresses');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Server Data States
  const [loading, setLoading] = useState(true);
  const [dresses, setDresses] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filters for Dresses
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLIC' | 'HIDDEN' | 'AVAILABLE' | 'UNAVAILABLE'>('ALL');

  // Dress Form State
  const [showDressModal, setShowDressModal] = useState(false);
  const [editingDressId, setEditingDressId] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [dressDeleteConfirmId, setDressDeleteConfirmId] = useState<string | null>(null);

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
    description: 'Exquisite luxury designer outfit crafted with handcrafted detailing.',
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
  const [catDeleteWarning, setCatDeleteWarning] = useState<{ catName: string; dressCount: number } | null>(null);
  const [catDeleteConfirmId, setCatDeleteConfirmId] = useState<string | null>(null);

  const [catForm, setCatForm] = useState({
    name: '',
    tagline: '',
    image: '',
    order: 1,
    enabled: true
  });

  // Load backend data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [dressesData, catsData] = await Promise.all([
        api.getAllAdminDresses().catch(() => []),
        api.getAllAdminCategories().catch(() => [])
      ]);

      if (Array.isArray(dressesData)) setDresses(dressesData);
      if (Array.isArray(catsData)) setCategories(catsData);
    } catch (err: any) {
      console.error('Error fetching admin data:', err);
      setErrorMessage('Failed to connect to backend server. Retrying...');
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
    const defaultCat = categories[0] || { id: 'cat-1', name: 'Photoshoot' };
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
      description: 'Exquisite luxury designer outfit crafted with handcrafted detailing.',
      fabric: 'Micro Velvet & Organza',
      workType: 'Heavy Zardozi Embroidery',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Crimson Red', 'Royal Gold'],
      occasion: defaultCat.name,
      isAvailable: true,
      isHidden: false,
      images: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800'],
      primaryImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800'
    });
    setCustomImageUrl('');
    setShowDressModal(true);
  };

  const handleEditDress = (dress: Product) => {
    setEditingDressId(dress.id);
    const rawImgs = dress.images && dress.images.length > 0
      ? dress.images
      : (dress.image ? [dress.image] : ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800']);

    setDressForm({
      name: dress.name || '',
      price: Number((dress as any).price || dress.rentalPrice4Days || 2500),
      retailPrice: Number(dress.retailPrice || 25000),
      rentalPrice4Days: Number(dress.rentalPrice4Days || 2500),
      rentalPrice8Days: Number(dress.rentalPrice8Days || 4000),
      advanceAmount: Number(dress.advanceAmount || 1000),
      categoryId: (dress as any).categoryId || dress.category || categories[0]?.id || '',
      categoryName: dress.categoryLabel || (dress as any).categoryName || categories[0]?.name || 'Photoshoot',
      designer: dress.designer || 'Jai Thuthiksha Couture',
      description: dress.description || '',
      fabric: dress.fabric || 'Micro Velvet & Organza',
      workType: dress.workType || 'Heavy Zardozi Embroidery',
      sizes: dress.sizes || ['S', 'M', 'L', 'XL'],
      colors: dress.colors || ['Crimson Red', 'Royal Gold'],
      occasion: dress.occasion || 'Photoshoot',
      isAvailable: (dress as any).isAvailable !== false,
      isHidden: (dress as any).isHidden === true,
      images: rawImgs,
      primaryImage: dress.primaryImage || dress.image || rawImgs[0] || ''
    });
    setCustomImageUrl('');
    setShowDressModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingImages(true);
    try {
      const res = await api.uploadImages(e.target.files);
      if (res && res.urls && Array.isArray(res.urls)) {
        setDressForm(prev => {
          const updatedImgs = [...prev.images, ...res.urls];
          return {
            ...prev,
            images: updatedImgs,
            primaryImage: prev.primaryImage || updatedImgs[0] || ''
          };
        });
        notify(`Uploaded ${res.urls.length} photo(s) successfully!`);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to upload image(s)');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleAddCustomImageUrl = () => {
    if (!customImageUrl.trim()) return;
    const cleanUrl = customImageUrl.trim();
    setDressForm(prev => {
      const updated = [...prev.images, cleanUrl];
      return {
        ...prev,
        images: updated,
        primaryImage: prev.primaryImage || updated[0] || ''
      };
    });
    setCustomImageUrl('');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setDressForm(prev => {
      const updated = prev.images.filter((_, idx) => idx !== indexToRemove);
      const newPrimary = prev.primaryImage === prev.images[indexToRemove]
        ? (updated[0] || '')
        : prev.primaryImage;
      return {
        ...prev,
        images: updated,
        primaryImage: newPrimary
      };
    });
  };

  const handleSetPrimaryImage = (index: number) => {
    setDressForm(prev => {
      const selected = prev.images[index];
      if (!selected) return prev;
      const filtered = prev.images.filter((_, idx) => idx !== index);
      const updated = [selected, ...filtered];
      return {
        ...prev,
        images: updated,
        primaryImage: selected
      };
    });
  };

  const handleSaveDress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dressForm.name.trim()) {
      alert('Please enter a dress name');
      return;
    }
    setIsSubmitting(true);
    try {
      const selectedCat = categories.find(c => c.id === dressForm.categoryId);
      const catName = selectedCat ? selectedCat.name : dressForm.categoryName;

      const payload = {
        ...dressForm,
        category: dressForm.categoryId,
        categoryName: catName,
        categoryLabel: catName,
        rentalPrice4Days: Number(dressForm.price),
        primaryImage: dressForm.primaryImage || dressForm.images[0] || '',
        images: dressForm.images
      };

      if (editingDressId) {
        await api.updateDress(editingDressId, payload);
        notify(`Dress "${dressForm.name}" updated successfully!`);
      } else {
        await api.addDress(payload);
        notify(`New dress "${dressForm.name}" created successfully!`);
      }

      setShowDressModal(false);
      setEditingDressId(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to save dress record');
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

  const handleToggleDressAvailability = async (id: string, currentIsAvailable: boolean) => {
    try {
      setDresses(prev => prev.map(d => d.id === id ? ({ ...d, isAvailable: !currentIsAvailable } as any) : d));
      await api.toggleDressStatus(id, { isAvailable: !currentIsAvailable });
      notify(`Dress availability marked as ${!currentIsAvailable ? 'Available' : 'Out of Stock / Rented'}.`);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update dress availability');
      fetchData();
    }
  };

  const handleConfirmDeleteDress = async (id: string) => {
    try {
      const res = await api.deleteDress(id);
      if (res.isArchived) {
        notify(res.message || 'Dress hidden from public catalogue due to booking history.');
        setDresses(prev => prev.map(d => d.id === id ? ({ ...d, isHidden: true } as any) : d));
      } else {
        notify('Dress deleted permanently');
        setDresses(prev => prev.filter(d => d.id !== id));
      }
      setDressDeleteConfirmId(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete dress');
      setDressDeleteConfirmId(null);
    }
  };

  // Category Handlers
  const handleOpenAddCategory = () => {
    setEditingCatId(null);
    setCatForm({
      name: '',
      tagline: 'Exclusive Luxury Collection',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800',
      order: categories.length + 1,
      enabled: true
    });
    setShowCategoryModal(true);
  };

  const handleEditCategory = (cat: Category) => {
    setEditingCatId(cat.id);
    setCatForm({
      name: cat.name || '',
      tagline: cat.tagline || 'Exclusive Luxury Collection',
      image: cat.image || '',
      order: Number(cat.order || 1),
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
        await api.updateCategory(editingCatId, catForm);
        notify(`Category "${catForm.name}" updated successfully!`);
      } else {
        await api.addCategory(catForm);
        notify(`New category "${catForm.name}" created successfully!`);
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

  const handleAttemptDeleteCategory = (cat: Category) => {
    const assignedCount = dresses.filter(d => {
      const cId = (d as any).categoryId || d.category;
      return cId === cat.id || d.categoryLabel?.toLowerCase() === cat.name.toLowerCase() || (d as any).categoryName?.toLowerCase() === cat.name.toLowerCase();
    }).length;

    if (assignedCount > 0) {
      setCatDeleteWarning({
        catName: cat.name,
        dressCount: assignedCount
      });
      return;
    }

    setCatDeleteConfirmId(cat.id);
  };

  const handleConfirmDeleteCategory = async (id: string) => {
    try {
      await api.deleteCategory(id);
      notify('Category deleted successfully');
      setCategories(prev => prev.filter(c => c.id !== id));
      setCatDeleteConfirmId(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete category');
      setCatDeleteConfirmId(null);
    }
  };

  // Filtered Dresses List
  const filteredDresses = dresses.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.designer && d.designer.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.description && d.description.toLowerCase().includes(searchQuery.toLowerCase()));

    // Category filter
    let matchesCat = true;
    if (categoryFilter !== 'ALL') {
      const cId = (d as any).categoryId || d.category;
      matchesCat = cId === categoryFilter || d.categoryLabel === categoryFilter || (d as any).categoryName === categoryFilter;
    }

    // Status filter
    let matchesStatus = true;
    if (statusFilter === 'PUBLIC') matchesStatus = !(d as any).isHidden;
    if (statusFilter === 'HIDDEN') matchesStatus = (d as any).isHidden === true;
    if (statusFilter === 'AVAILABLE') matchesStatus = (d as any).isAvailable !== false;
    if (statusFilter === 'UNAVAILABLE') matchesStatus = (d as any).isAvailable === false;

    return matchesSearch && matchesCat && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row">
      
      {/* Sidebar Navigation - Desktop */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex-col justify-between p-4 shrink-0 hidden md:flex min-h-screen">
        <div className="space-y-6">
          
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-2 pt-2 border-b border-slate-800/80 pb-4">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 p-1 flex items-center justify-center shrink-0 shadow-md">
              <img src={logoImg} alt="JTF Admin" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="font-bold font-serif text-white text-base tracking-tight">Jai Thuthiksha</h2>
              <span className="text-[10px] text-rose-400 font-bold bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800/80 uppercase tracking-widest block mt-0.5">
                Rental Admin
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 text-xs font-bold">
            <button
              onClick={() => setActiveTab('dresses')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                activeTab === 'dresses'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Shirt className="w-4 h-4 text-rose-400 group-hover:text-white" />
              <div className="flex items-center justify-between flex-1">
                <span>Dress Inventory</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">
                  {dresses.length}
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                activeTab === 'categories'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Tag className="w-4 h-4 text-rose-400" />
              <div className="flex items-center justify-between flex-1">
                <span>Categories</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">
                  {categories.length}
                </span>
              </div>
            </button>
          </nav>

        </div>

        {/* User Info & Logout at Bottom */}
        <div className="pt-4 border-t border-slate-800/80 space-y-3">
          <div className="px-2">
            <span className="text-[10px] text-slate-500 uppercase block font-bold tracking-wider">Logged Admin</span>
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

      {/* Mobile Top Navigation Header */}
      <header className="md:hidden bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="JTF Logo" className="w-8 h-8 object-contain" />
          <h2 className="font-bold font-serif text-white text-sm">Jai Thuthiksha Admin</h2>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Dropdown Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-2 text-xs font-bold">
          <button
            onClick={() => { setActiveTab('dresses'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-2.5 rounded-xl ${activeTab === 'dresses' ? 'bg-rose-600 text-white' : 'text-slate-300'}`}
          >
            Dress Inventory ({dresses.length})
          </button>
          <button
            onClick={() => { setActiveTab('categories'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-2.5 rounded-xl ${activeTab === 'categories' ? 'bg-rose-600 text-white' : 'text-slate-300'}`}
          >
            Categories ({categories.length})
          </button>
          <button
            onClick={() => { logout(); setMobileMenuOpen(false); }}
            className="w-full text-left px-4 py-2.5 rounded-xl text-red-400 bg-red-950/40"
          >
            Sign Out
          </button>
        </div>
      )}

      {/* Main Dashboard Workspace */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-h-screen">
        
        {/* Status Notification Banner */}
        {statusMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-950/90 border border-emerald-800 text-emerald-200 text-xs font-bold flex items-center justify-between shadow-lg backdrop-blur-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{statusMessage}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="text-emerald-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-950/90 border border-red-800 text-red-200 text-xs font-bold flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4 text-slate-400">
            <div className="w-10 h-10 border-4 border-rose-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold tracking-wider uppercase text-slate-500">Loading Rental System...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: DRESS INVENTORY */}
            {activeTab === 'dresses' && (
              <div className="space-y-6">
                
                {/* Header & Main Controls Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400 bg-rose-950/60 px-3 py-1 rounded-full border border-rose-800/80">
                      Catalogue Management
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-white tracking-tight mt-2">
                      Dress Inventory
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                      Manage website outfits, rental pricing, image galleries, and catalogue visibility.
                    </p>
                  </div>

                  <button
                    onClick={handleOpenAddDress}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950/50 transition border border-rose-500/50"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Dress</span>
                  </button>
                </div>

                {/* Filter & Search Toolbar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search dresses by name or fabric..."
                      className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl pl-9 pr-3 py-3 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  {/* Category Filter */}
                  <div>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-rose-500"
                    >
                      <option value="ALL">All Categories ({dresses.length})</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-rose-500"
                    >
                      <option value="ALL">All Visibility & Stock</option>
                      <option value="PUBLIC">Public Only</option>
                      <option value="HIDDEN">Hidden Only</option>
                      <option value="AVAILABLE">Available Only</option>
                      <option value="UNAVAILABLE">Out of Stock Only</option>
                    </select>
                  </div>
                </div>

                {/* Dress Cards Grid */}
                {filteredDresses.length === 0 ? (
                  <div className="bg-slate-900 rounded-3xl p-12 text-center border border-slate-800 max-w-md mx-auto my-8 space-y-3">
                    <Shirt className="w-12 h-12 text-slate-600 mx-auto" />
                    <h3 className="text-base font-bold font-serif text-white">No Dresses Found</h3>
                    <p className="text-xs text-slate-400">
                      No outfits match your search parameters. Try adjusting filters or create a new dress.
                    </p>
                    <button
                      onClick={handleOpenAddDress}
                      className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md"
                    >
                      Add New Dress
                    </button>
                  </div>
                ) : (
                  /* Responsive Dress Inventory Cards Grid */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDresses.map((dress) => {
                      const primaryImg = dress.primaryImage || dress.image || (dress.images && dress.images[0]) || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800';
                      const isHidden = (dress as any).isHidden === true;
                      const isAvailable = (dress as any).isAvailable !== false;
                      const rentalPrice = Number((dress as any).price || dress.rentalPrice4Days || dress.retailPrice || 0);
                      const galleryCount = dress.galleryImages?.length || dress.images?.length || 1;

                      return (
                        <div
                          key={dress.id}
                          className={`bg-slate-900 rounded-3xl overflow-hidden border transition duration-300 flex flex-col justify-between ${
                            isHidden ? 'border-amber-900/60 opacity-80' : 'border-slate-800 hover:border-rose-900/60'
                          }`}
                        >
                          {/* Image & Status Badges Header */}
                          <div className="relative h-64 bg-slate-950 overflow-hidden">
                            <img
                              src={primaryImg}
                              alt={dress.name}
                              className="w-full h-full object-cover"
                            />

                            {/* Top Badges */}
                            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                              <span className="bg-slate-950/90 text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-slate-700 backdrop-blur-sm">
                                {dress.categoryLabel || dress.category}
                              </span>
                              {galleryCount > 1 && (
                                <span className="bg-rose-950/90 text-rose-200 text-[9px] font-bold px-2 py-0.5 rounded-full border border-rose-800 backdrop-blur-sm">
                                  {galleryCount} Photos
                                </span>
                              )}
                            </div>

                            {/* Visibility & Availability Pill Badges */}
                            <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
                              {isHidden ? (
                                <span className="bg-amber-950/90 text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-800 flex items-center gap-1 backdrop-blur-sm">
                                  <EyeOff className="w-3 h-3" />
                                  Hidden
                                </span>
                              ) : (
                                <span className="bg-emerald-950/90 text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-800 flex items-center gap-1 backdrop-blur-sm">
                                  <Eye className="w-3 h-3" />
                                  Public
                                </span>
                              )}

                              <button
                                onClick={() => handleToggleDressAvailability(dress.id, isAvailable)}
                                title={isAvailable ? 'Mark Out of Stock' : 'Mark Available'}
                                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border backdrop-blur-sm cursor-pointer transition ${
                                  isAvailable
                                    ? 'bg-slate-900/90 text-emerald-300 border-emerald-800/80 hover:bg-emerald-950'
                                    : 'bg-red-950/90 text-red-300 border-red-800 hover:bg-red-900'
                                }`}
                              >
                                {isAvailable ? 'Available' : 'Rented / Out of Stock'}
                              </button>
                            </div>
                          </div>

                          {/* Dress Body Content */}
                          <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                            <div>
                              <h3 className="font-serif font-bold text-white text-base line-clamp-1">
                                {dress.name}
                              </h3>
                              <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                                {dress.designer || 'Jai Thuthiksha Couture'} &bull; {dress.fabric || 'Luxury Fabric'}
                              </p>
                              <div className="mt-3 flex items-baseline justify-between pt-2 border-t border-slate-800">
                                <span className="text-xs text-slate-400 font-bold">Rental Rate:</span>
                                <span className="text-base font-extrabold text-rose-400">
                                  ₹{rentalPrice.toLocaleString('en-IN')}
                                </span>
                              </div>
                            </div>

                            {/* Card Quick Action Buttons */}
                            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
                              <button
                                onClick={() => handleToggleDressVisibility(dress.id, isHidden)}
                                className={`py-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 border transition ${
                                  isHidden
                                    ? 'bg-amber-950/40 text-amber-300 border-amber-800 hover:bg-amber-900/60'
                                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                                }`}
                                title={isHidden ? 'Publish to Public Website' : 'Hide from Public Catalogue'}
                              >
                                {isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                <span>{isHidden ? 'Show' : 'Hide'}</span>
                              </button>

                              <button
                                onClick={() => handleEditDress(dress)}
                                className="py-2 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 hover:bg-rose-950/80 hover:text-rose-300 hover:border-rose-800 text-[11px] font-bold flex items-center justify-center gap-1 transition"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-rose-400" />
                                <span>Edit</span>
                              </button>

                              <button
                                onClick={() => setDressDeleteConfirmId(dress.id)}
                                className="py-2 rounded-xl bg-red-950/50 text-red-300 border border-red-900/60 hover:bg-red-900 text-[11px] font-bold flex items-center justify-center gap-1 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: CATEGORIES MANAGEMENT */}
            {activeTab === 'categories' && (
              <div className="space-y-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400 bg-rose-950/60 px-3 py-1 rounded-full border border-rose-800/80">
                      Collection Structure
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-white tracking-tight mt-2">
                      Occasion Categories
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                      Manage rental categories, titles, taglines, banner images, and display ordering.
                    </p>
                  </div>

                  <button
                    onClick={handleOpenAddCategory}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950/50 transition border border-rose-500/50"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Category</span>
                  </button>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((cat) => {
                    const assignedCount = dresses.filter(d => {
                      const cId = (d as any).categoryId || d.category;
                      return cId === cat.id || d.categoryLabel?.toLowerCase() === cat.name.toLowerCase() || (d as any).categoryName?.toLowerCase() === cat.name.toLowerCase();
                    }).length;

                    return (
                      <div
                        key={cat.id}
                        className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 hover:border-rose-900/60 transition flex flex-col justify-between"
                      >
                        {/* Banner Image */}
                        <div className="relative h-44 bg-slate-950 overflow-hidden">
                          <img
                            src={cat.image || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800'}
                            alt={cat.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                          
                          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                            <h3 className="font-serif font-bold text-white text-xl">{cat.name}</h3>
                            <span className="bg-rose-950/90 text-rose-300 text-[10px] font-extrabold px-3 py-1 rounded-full border border-rose-800 backdrop-blur-sm">
                              {assignedCount} Outfits Assigned
                            </span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-5 space-y-4">
                          <p className="text-xs text-slate-400 line-clamp-2">
                            {cat.tagline || 'Exclusive Luxury Collection'}
                          </p>

                          <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800">
                            <span className="text-slate-500 font-bold">Display Order: #{cat.order || 1}</span>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              cat.enabled !== false
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}>
                              {cat.enabled !== false ? 'Active' : 'Disabled'}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                            <button
                              onClick={() => handleEditCategory(cat)}
                              className="py-2 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 hover:bg-rose-950/80 hover:text-rose-300 hover:border-rose-800 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-rose-400" />
                              <span>Edit Category</span>
                            </button>

                            <button
                              onClick={() => handleAttemptDeleteCategory(cat)}
                              className="py-2 rounded-xl bg-red-950/50 text-red-300 border border-red-900/60 hover:bg-red-900 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* DRESS MODAL FORM */}
      {showDressModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="font-serif font-bold text-white text-lg">
                {editingDressId ? 'Edit Dress Details' : 'Add New Luxury Dress'}
              </h3>
              <button onClick={() => setShowDressModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDress} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-300 mb-1">Dress Name *</label>
                <input
                  type="text"
                  required
                  value={dressForm.name}
                  onChange={(e) => setDressForm({ ...dressForm, name: e.target.value })}
                  placeholder="e.g. Maharani Crimson Bridal Lehenga"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1">Category *</label>
                  <select
                    value={dressForm.categoryId}
                    onChange={(e) => {
                      const cat = categories.find(c => c.id === e.target.value);
                      setDressForm({
                        ...dressForm,
                        categoryId: e.target.value,
                        categoryName: cat ? cat.name : dressForm.categoryName
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 focus:outline-none focus:border-rose-500"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Rental Price in INR (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={dressForm.price}
                    onChange={(e) => setDressForm({ ...dressForm, price: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Visibility & Availability Checkboxes */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={!dressForm.isHidden}
                    onChange={(e) => setDressForm({ ...dressForm, isHidden: !e.target.checked })}
                    className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4 bg-slate-900 border-slate-700"
                  />
                  <span>Show in Public Catalogue</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={dressForm.isAvailable}
                    onChange={(e) => setDressForm({ ...dressForm, isAvailable: e.target.checked })}
                    className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4 bg-slate-900 border-slate-700"
                  />
                  <span>Available for Booking</span>
                </label>
              </div>

              {/* Image Manager */}
              <div className="space-y-2">
                <label className="block text-slate-300">Dress Images (Upload or URL)</label>
                
                <div className="flex items-center gap-2">
                  <label className="flex-1 cursor-pointer bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 p-3 rounded-xl flex items-center justify-center gap-2 transition">
                    <Upload className="w-4 h-4 text-rose-400" />
                    <span>{uploadingImages ? 'Uploading Images...' : 'Upload Photos from Device'}</span>
                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    placeholder="Or paste image URL..."
                    className="flex-1 bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:outline-none focus:border-rose-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomImageUrl}
                    className="px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold"
                  >
                    Add URL
                  </button>
                </div>

                {/* Thumbnails list */}
                {dressForm.images.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-2">
                    {dressForm.images.map((imgUrl, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square bg-slate-950 border border-slate-800">
                        <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 bg-rose-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                            Primary
                          </span>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1">
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImage(idx)}
                              className="p-1 bg-rose-600 text-white rounded text-[9px] font-bold"
                              title="Make Primary Cover"
                            >
                              Top
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="p-1 bg-red-600 text-white rounded"
                            title="Remove"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={dressForm.description}
                  onChange={(e) => setDressForm({ ...dressForm, description: e.target.value })}
                  placeholder="Describe fabric, embroidery, occasion detail..."
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDressModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg"
                >
                  {isSubmitting ? 'Saving...' : 'Save Dress'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY MODAL FORM */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="font-serif font-bold text-white text-lg">
                {editingCatId ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-300 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  placeholder="e.g. Sangeet Wear"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Tagline</label>
                <input
                  type="text"
                  value={catForm.tagline}
                  onChange={(e) => setCatForm({ ...catForm, tagline: e.target.value })}
                  placeholder="e.g. Flared Outfits for Pre-Wedding Shoots"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Banner Image URL</label>
                <input
                  type="text"
                  value={catForm.image}
                  onChange={(e) => setCatForm({ ...catForm, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={catForm.order}
                    onChange={(e) => setCatForm({ ...catForm, order: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="flex items-end pb-3">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={catForm.enabled}
                      onChange={(e) => setCatForm({ ...catForm, enabled: e.target.checked })}
                      className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4 bg-slate-900 border-slate-700"
                    />
                    <span>Category Active</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg"
                >
                  {isSubmitting ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DRESS DELETE CONFIRMATION MODAL */}
      {dressDeleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
            <h3 className="font-serif font-bold text-white text-base">Delete Dress Record?</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to remove this outfit? If booking history exists, it will be safely hidden from the public catalogue instead of lost.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDressDeleteConfirmId(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmDeleteDress(dressDeleteConfirmId)}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-md"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY DELETE WARNING MODAL */}
      {catDeleteWarning && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl">
            <Info className="w-12 h-12 text-amber-400 mx-auto" />
            <h3 className="font-serif font-bold text-white text-base">Cannot Delete Category</h3>
            <p className="text-xs text-slate-300">
              Category <span className="font-bold text-amber-300">"{catDeleteWarning.catName}"</span> cannot be deleted because <span className="font-bold text-white">{catDeleteWarning.dressCount} dress(es)</span> are currently assigned to it.
            </p>
            <p className="text-[11px] text-slate-400">
              Please reassign or delete those outfits first before deleting this category.
            </p>
            <button
              onClick={() => setCatDeleteWarning(null)}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold mt-2"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* CATEGORY DELETE CONFIRMATION MODAL */}
      {catDeleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
            <h3 className="font-serif font-bold text-white text-base">Delete Category?</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to delete this category? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setCatDeleteConfirmId(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmDeleteCategory(catDeleteConfirmId)}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold"
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
