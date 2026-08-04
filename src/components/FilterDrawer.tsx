import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  SlidersHorizontal, 
  ChevronDown, 
  RotateCcw, 
  Check, 
  Tag, 
  DollarSign, 
  PackageCheck, 
  Ruler, 
  Palette, 
  Scissors, 
  ShieldCheck, 
  Star, 
  Percent, 
  Sparkles, 
  FolderKanban,
  Filter,
  CheckSquare,
  Square
} from 'lucide-react';
import { Product } from '../types';

export interface FilterState {
  category: string;
  collections: string[];
  minPrice: number | '';
  maxPrice: number | '';
  selectedSizes: string[];
  selectedColors: string[];
  selectedMaterials: string[];
  selectedFits: string[];
  selectedBrands: string[];
  availability: 'all' | 'in-stock' | 'pre-order' | 'sale';
  minRating: number | '';
  minDiscount: number | '';
  newArrivalsOnly: boolean;
  searchQuery: string;
}

export const DEFAULT_FILTER_STATE: FilterState = {
  category: 'All',
  collections: [],
  minPrice: '',
  maxPrice: '',
  selectedSizes: [],
  selectedColors: [],
  selectedMaterials: [],
  selectedFits: [],
  selectedBrands: [],
  availability: 'all',
  minRating: '',
  minDiscount: '',
  newArrivalsOnly: false,
  searchQuery: ''
};

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onResetFilters: () => void;
  allProducts: Product[];
  lang?: 'en' | 'ar';
}

export default function FilterDrawer({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onResetFilters,
  allProducts = [],
  lang = 'en'
}: FilterDrawerProps) {
  const isRTL = lang === 'ar';
  
  // Temporary state while drawer is open
  const [tempFilters, setTempFilters] = useState<FilterState>(filters);

  // Accordion collapsed state for each section (true = open, false = collapsed)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    category: true,
    collection: true,
    price: true,
    size: true,
    color: true,
    material: false,
    fit: false,
    brand: false,
    availability: true,
    rating: false,
    discount: false,
    newArrivals: true
  });

  // Keep local temp filters in sync when main filters change externally
  useEffect(() => {
    setTempFilters(filters);
  }, [filters, isOpen]);

  // Handle ESC key press to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Toggle helpers for array fields
  const toggleArrayItem = (key: keyof FilterState, value: string) => {
    const currentList = (tempFilters[key] as string[]) || [];
    const index = currentList.indexOf(value);
    let updated: string[];
    if (index > -1) {
      updated = currentList.filter(item => item !== value);
    } else {
      updated = [...currentList, value];
    }
    setTempFilters({ ...tempFilters, [key]: updated });
  };

  // Pre-defined option sets
  const categoriesList = ['All', 'Men', 'Women', 'Unisex', 'OUTERWEAR', 'TOPS', 'BOTTOMS'];
  const collectionsList = ['Core Essentials', 'Obsidian Drop', 'Velvet Night', 'Summer Atelier', 'Winter Luxe'];
  const sizesList = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36'];
  const colorsList = [
    { name: 'Onyx Black', hex: '#121212', border: '#333' },
    { name: 'Pure Ivory', hex: '#F8F9FA', border: '#ccc' },
    { name: 'Burgundy Rose', hex: '#30001A', border: '#5a0030' },
    { name: 'Slate Grey', hex: '#4A5568', border: '#666' },
    { name: 'Midnight Navy', hex: '#0B132B', border: '#1c2d5a' },
    { name: 'Champagne Gold', hex: '#D4AF37', border: '#b89628' },
    { name: 'Emerald Silk', hex: '#064E3B', border: '#0d7358' }
  ];
  const materialsList = ['100% Egyptian Cotton', 'Heavyweight Fleece', 'Silk Blend', 'Wool Gabardine', 'Nylon Blend', 'Vegan Leather', 'Velvet Blend'];
  const fitsList = ['Over-sized', 'Tailored', 'Boxy Fit', 'Slim Fit', 'Regular Fit'];
  const brandsList = ['AVENTO7 Mainline', 'AVENTO7 Atelier', 'AVENTO7 Sport'];

  // Dynamic counts for each option based on allProducts
  const getCategoryCount = (cat: string) => {
    if (cat === 'All') return allProducts.length;
    return allProducts.filter(p => p.gender === cat || p.category === cat).length;
  };

  const getCollectionCount = (coll: string) => {
    return allProducts.filter(p => p.collectionName === coll).length;
  };

  const getSizeCount = (size: string) => {
    return allProducts.filter(p => p.sizes?.includes(size)).length;
  };

  const getColorCount = (colorName: string) => {
    return allProducts.filter(p => p.colorName === colorName).length;
  };

  const getMaterialCount = (mat: string) => {
    return allProducts.filter(p => p.material === mat).length;
  };

  const getFitCount = (fit: string) => {
    return allProducts.filter(p => p.fit === fit).length;
  };

  const getBrandCount = (brand: string) => {
    return allProducts.filter(p => p.brand === brand).length;
  };

  // Calculate matching items for the current tempFilters
  const matchingCount = useMemo(() => {
    return allProducts.filter(p => {
      // Category / Gender
      if (tempFilters.category !== 'All') {
        if (p.gender !== tempFilters.category && p.category !== tempFilters.category) {
          return false;
        }
      }

      // Collections
      if (tempFilters.collections.length > 0) {
        if (!p.collectionName || !tempFilters.collections.includes(p.collectionName)) {
          return false;
        }
      }

      // Min Price
      if (tempFilters.minPrice !== '' && p.price < Number(tempFilters.minPrice)) {
        return false;
      }

      // Max Price
      if (tempFilters.maxPrice !== '' && p.price > Number(tempFilters.maxPrice)) {
        return false;
      }

      // Selected Sizes
      if (tempFilters.selectedSizes.length > 0) {
        if (!p.sizes || !p.sizes.some(s => tempFilters.selectedSizes.includes(s))) {
          return false;
        }
      }

      // Selected Colors
      if (tempFilters.selectedColors.length > 0) {
        if (!p.colorName || !tempFilters.selectedColors.includes(p.colorName)) {
          return false;
        }
      }

      // Selected Materials
      if (tempFilters.selectedMaterials.length > 0) {
        if (!p.material || !tempFilters.selectedMaterials.includes(p.material)) {
          return false;
        }
      }

      // Selected Fits
      if (tempFilters.selectedFits.length > 0) {
        if (!p.fit || !tempFilters.selectedFits.includes(p.fit)) {
          return false;
        }
      }

      // Selected Brands
      if (tempFilters.selectedBrands.length > 0) {
        if (!p.brand || !tempFilters.selectedBrands.includes(p.brand)) {
          return false;
        }
      }

      // Availability
      if (tempFilters.availability === 'in-stock' && p.isSoldOut) {
        return false;
      }
      if (tempFilters.availability === 'pre-order' && !p.isPreOrder) {
        return false;
      }
      if (tempFilters.availability === 'sale' && !p.discountPercentage && !p.originalPrice) {
        return false;
      }

      // Rating
      if (tempFilters.minRating !== '' && (p.rating || 0) < Number(tempFilters.minRating)) {
        return false;
      }

      // Discount
      if (tempFilters.minDiscount !== '' && (p.discountPercentage || 0) < Number(tempFilters.minDiscount)) {
        return false;
      }

      // New Arrivals Only
      if (tempFilters.newArrivalsOnly && !p.isNew) {
        return false;
      }

      // Search
      if (tempFilters.searchQuery.trim()) {
        const q = tempFilters.searchQuery.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(q) || (p.nameAr && p.nameAr.toLowerCase().includes(q));
        const matchCat = p.category?.toLowerCase().includes(q);
        if (!matchName && !matchCat) return false;
      }

      return true;
    }).length;
  }, [allProducts, tempFilters]);

  // Active filter count in tempFilters
  const tempActiveCount = useMemo(() => {
    let count = 0;
    if (tempFilters.category !== 'All') count++;
    if (tempFilters.collections.length > 0) count += tempFilters.collections.length;
    if (tempFilters.minPrice !== '' || tempFilters.maxPrice !== '') count++;
    if (tempFilters.selectedSizes.length > 0) count += tempFilters.selectedSizes.length;
    if (tempFilters.selectedColors.length > 0) count += tempFilters.selectedColors.length;
    if (tempFilters.selectedMaterials.length > 0) count += tempFilters.selectedMaterials.length;
    if (tempFilters.selectedFits.length > 0) count += tempFilters.selectedFits.length;
    if (tempFilters.selectedBrands.length > 0) count += tempFilters.selectedBrands.length;
    if (tempFilters.availability !== 'all') count++;
    if (tempFilters.minRating !== '') count++;
    if (tempFilters.minDiscount !== '') count++;
    if (tempFilters.newArrivalsOnly) count++;
    return count;
  }, [tempFilters]);

  const handleApply = () => {
    onFilterChange(tempFilters);
    onClose();
  };

  const handleReset = () => {
    setTempFilters(DEFAULT_FILTER_STATE);
    onResetFilters();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label={isRTL ? "لوحة التصفية" : "Filter Drawer"}>
          
          {/* Backdrop with Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md cursor-pointer"
          />

          {/* Drawer Container (Slide in from Left for LTR, Right for RTL) */}
          <motion.div
            initial={{ x: isRTL ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRTL ? '100%' : '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            drag="x"
            dragConstraints={{ left: isRTL ? 0 : -300, right: isRTL ? 300 : 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              if (!isRTL && info.offset.x < -80) onClose();
              if (isRTL && info.offset.x > 80) onClose();
            }}
            className={`relative w-full max-w-[380px] sm:max-w-[420px] h-full bg-white dark:bg-[#0c060a] shadow-2xl flex flex-col z-10 border-r border-black/10 dark:border-white/10 ${
              isRTL ? 'mr-auto border-r-0 border-l' : 'ml-0'
            }`}
          >
            
            {/* STICKY HEADER */}
            <div className="px-5 py-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between bg-zinc-50/90 dark:bg-[#080307]/90 backdrop-blur-md sticky top-0 z-20 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#30001A] text-white dark:bg-rose-300 dark:text-[#30001A] flex items-center justify-center shadow-md">
                  <SlidersHorizontal size={18} />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-black uppercase luxury-tracking text-zinc-900 dark:text-white tracking-[0.18em]">
                    {isRTL ? 'تصفية التشكيلة' : 'FILTER COLLECTION'}
                  </h2>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                    {matchingCount} {isRTL ? 'منتج مطابق' : 'MATCHING PRODUCTS'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {tempActiveCount > 0 && (
                  <button
                    onClick={handleReset}
                    className="p-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[11px] font-bold uppercase luxury-tracking transition-colors flex items-center gap-1 cursor-pointer min-h-[44px]"
                    aria-label={isRTL ? "إلغاء التصفية" : "Reset filters"}
                  >
                    <RotateCcw size={13} />
                    <span className="hidden sm:inline">{isRTL ? 'مسح' : 'Clear'}</span>
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl bg-zinc-200/60 dark:bg-white/10 hover:bg-zinc-300 dark:hover:bg-white/20 text-zinc-800 dark:text-white transition-colors flex items-center justify-center cursor-pointer min-h-[44px] min-w-[44px]"
                  aria-label={isRTL ? "إغلاق" : "Close"}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* SCROLLABLE BODY CONTENT */}
            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-800">

              {/* 1. NEW ARRIVALS TOGGLE SWITCH */}
              <div className="bg-zinc-100/80 dark:bg-white/5 border border-black/5 dark:border-white/10 p-3.5 rounded-2xl flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2.5">
                  <Sparkles size={16} className="text-amber-500 animate-pulse" />
                  <div>
                    <span className="text-xs font-bold uppercase luxury-tracking text-zinc-900 dark:text-white block">
                      {isRTL ? 'وصل حديثاً فقط' : 'NEW ARRIVALS ONLY'}
                    </span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      {isRTL ? 'عرض أحدث التصاميم لآخر 30 يوماً' : 'Show last 30 days releases'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setTempFilters({ ...tempFilters, newArrivalsOnly: !tempFilters.newArrivalsOnly })}
                  className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer min-h-[44px] flex items-center ${
                    tempFilters.newArrivalsOnly
                      ? 'bg-[#30001A] dark:bg-rose-300'
                      : 'bg-zinc-300 dark:bg-white/20'
                  }`}
                  aria-label="Toggle New Arrivals Only"
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white dark:bg-[#30001A] shadow-md transform transition-transform duration-200 ${
                      tempFilters.newArrivalsOnly ? (isRTL ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* 2. CATEGORY / GENDER ACCORDION */}
              <div className="border-b border-black/10 dark:border-white/10 pb-5">
                <button
                  type="button"
                  onClick={() => toggleSection('category')}
                  className="w-full flex items-center justify-between py-2 text-xs font-bold uppercase luxury-tracking text-zinc-900 dark:text-white tracking-[0.15em] cursor-pointer min-h-[44px]"
                >
                  <span className="flex items-center gap-2">
                    <Tag size={15} className="text-amber-500" />
                    {isRTL ? 'القسم / الفئة' : 'CATEGORY / GENDER'}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-zinc-400 transition-transform duration-300 ${openSections.category ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {openSections.category && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pt-3"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        {categoriesList.map((cat) => {
                          const isSelected = tempFilters.category === cat;
                          const count = getCategoryCount(cat);
                          let label = cat;
                          if (isRTL) {
                            if (cat === 'All') label = 'الكل';
                            if (cat === 'Men') label = 'رجالي';
                            if (cat === 'Women') label = 'نسائي';
                            if (cat === 'Unisex') label = 'للجنسين';
                            if (cat === 'OUTERWEAR') label = 'ملابس خارجية';
                            if (cat === 'TOPS') label = 'تيشيرتات وتوب';
                            if (cat === 'BOTTOMS') label = 'بنطال وبنطلونات';
                          }
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setTempFilters({ ...tempFilters, category: cat })}
                              className={`min-h-[44px] px-3 py-2.5 rounded-xl text-xs font-bold uppercase luxury-tracking flex items-center justify-between border cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-[#30001A] text-white border-[#30001A] dark:bg-rose-300 dark:text-[#30001A] dark:border-rose-300 shadow-md'
                                  : 'bg-zinc-100/80 dark:bg-white/5 text-zinc-700 dark:text-zinc-300 border-black/10 dark:border-white/10 hover:border-amber-500/50'
                              }`}
                            >
                              <span className="truncate">{label}</span>
                              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                isSelected ? 'bg-white/20 text-white dark:bg-[#30001A]/20 dark:text-[#30001A]' : 'bg-black/5 dark:bg-white/10 text-zinc-500 dark:text-zinc-400'
                              }`}>
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 3. COLLECTION ACCORDION */}
              <div className="border-b border-black/10 dark:border-white/10 pb-5">
                <button
                  type="button"
                  onClick={() => toggleSection('collection')}
                  className="w-full flex items-center justify-between py-2 text-xs font-bold uppercase luxury-tracking text-zinc-900 dark:text-white tracking-[0.15em] cursor-pointer min-h-[44px]"
                >
                  <span className="flex items-center gap-2">
                    <FolderKanban size={15} className="text-amber-500" />
                    {isRTL ? 'التشكيلة / الإصدارات' : 'COLLECTION / DROPS'}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-zinc-400 transition-transform duration-300 ${openSections.collection ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {openSections.collection && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pt-3 space-y-2"
                    >
                      {collectionsList.map((coll) => {
                        const isChecked = tempFilters.collections.includes(coll);
                        const count = getCollectionCount(coll);
                        return (
                          <button
                            key={coll}
                            type="button"
                            onClick={() => toggleArrayItem('collections', coll)}
                            className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between border transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-[#30001A]/10 border-[#30001A] dark:bg-rose-300/10 dark:border-rose-300 text-zinc-900 dark:text-white font-bold'
                                : 'bg-zinc-100/50 dark:bg-white/5 border-black/5 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:border-amber-500/30'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              {isChecked ? (
                                <CheckSquare size={16} className="text-[#30001A] dark:text-rose-300 shrink-0" />
                              ) : (
                                <Square size={16} className="text-zinc-400 shrink-0" />
                              )}
                              <span>{coll}</span>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-zinc-400 bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-full">
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 4. PRICE RANGE ACCORDION */}
              <div className="border-b border-black/10 dark:border-white/10 pb-5">
                <button
                  type="button"
                  onClick={() => toggleSection('price')}
                  className="w-full flex items-center justify-between py-2 text-xs font-bold uppercase luxury-tracking text-zinc-900 dark:text-white tracking-[0.15em] cursor-pointer min-h-[44px]"
                >
                  <span className="flex items-center gap-2">
                    <DollarSign size={15} className="text-amber-500" />
                    {isRTL ? 'نطاق السعر (جنيه مصري)' : 'PRICE RANGE (EGP)'}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-zinc-400 transition-transform duration-300 ${openSections.price ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {openSections.price && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pt-3 space-y-3"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-bold block mb-1">
                            {isRTL ? 'الأدنى (ج.م)' : 'MIN (EGP)'}
                          </label>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={tempFilters.minPrice}
                            onChange={(e) => setTempFilters({ ...tempFilters, minPrice: e.target.value === '' ? '' : Number(e.target.value) })}
                            className="w-full h-11 bg-zinc-100 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 text-xs font-mono font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-bold block mb-1">
                            {isRTL ? 'الأقصى (ج.م)' : 'MAX (EGP)'}
                          </label>
                          <input
                            type="number"
                            min="0"
                            placeholder="Unlimited"
                            value={tempFilters.maxPrice}
                            onChange={(e) => setTempFilters({ ...tempFilters, maxPrice: e.target.value === '' ? '' : Number(e.target.value) })}
                            className="w-full h-11 bg-zinc-100 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 text-xs font-mono font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      {/* Range presets */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {[
                          { label: isRTL ? 'أقل من 300' : '< 300 EGP', min: '', max: 300 },
                          { label: isRTL ? '300 - 600' : '300 - 600 EGP', min: 300, max: 600 },
                          { label: isRTL ? 'أكثر من 600' : '> 600 EGP', min: 600, max: '' }
                        ].map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setTempFilters({ ...tempFilters, minPrice: preset.min, maxPrice: preset.max })}
                            className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-300 transition-colors border border-black/5 dark:border-white/10 cursor-pointer min-h-[36px]"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 5. SIZE ACCORDION */}
              <div className="border-b border-black/10 dark:border-white/10 pb-5">
                <button
                  type="button"
                  onClick={() => toggleSection('size')}
                  className="w-full flex items-center justify-between py-2 text-xs font-bold uppercase luxury-tracking text-zinc-900 dark:text-white tracking-[0.15em] cursor-pointer min-h-[44px]"
                >
                  <span className="flex items-center gap-2">
                    <Ruler size={15} className="text-amber-500" />
                    {isRTL ? 'المقاسات المتوفرة' : 'SIZES AVAILABLE'}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-zinc-400 transition-transform duration-300 ${openSections.size ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {openSections.size && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pt-3"
                    >
                      <div className="flex flex-wrap gap-2">
                        {sizesList.map((size) => {
                          const isSelected = tempFilters.selectedSizes.includes(size);
                          const count = getSizeCount(size);
                          return (
                            <button
                              key={size}
                              type="button"
                              onClick={() => toggleArrayItem('selectedSizes', size)}
                              className={`relative min-w-[44px] h-11 px-3 rounded-xl text-xs font-mono font-black transition-all cursor-pointer border flex items-center justify-center gap-1.5 ${
                                isSelected
                                  ? 'bg-[#30001A] text-white border-[#30001A] dark:bg-rose-300 dark:text-[#30001A] dark:border-rose-300 shadow-md scale-[1.03]'
                                  : 'bg-zinc-100/80 dark:bg-white/5 text-zinc-700 dark:text-zinc-300 border-black/10 dark:border-white/10 hover:border-amber-500/50'
                              }`}
                            >
                              <span>{size}</span>
                              {count > 0 && (
                                <span className={`text-[9px] font-mono opacity-80 ${isSelected ? 'text-amber-300 dark:text-[#30001A]' : 'text-zinc-400'}`}>
                                  ({count})
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 6. COLOR SWATCHES ACCORDION */}
              <div className="border-b border-black/10 dark:border-white/10 pb-5">
                <button
                  type="button"
                  onClick={() => toggleSection('color')}
                  className="w-full flex items-center justify-between py-2 text-xs font-bold uppercase luxury-tracking text-zinc-900 dark:text-white tracking-[0.15em] cursor-pointer min-h-[44px]"
                >
                  <span className="flex items-center gap-2">
                    <Palette size={15} className="text-amber-500" />
                    {isRTL ? 'الألوان والتدرجات' : 'COLORS & SWATCHES'}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-zinc-400 transition-transform duration-300 ${openSections.color ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {openSections.color && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pt-3"
                    >
                      <div className="grid grid-cols-2 gap-2.5">
                        {colorsList.map((colorObj) => {
                          const isSelected = tempFilters.selectedColors.includes(colorObj.name);
                          const count = getColorCount(colorObj.name);
                          return (
                            <button
                              key={colorObj.name}
                              type="button"
                              onClick={() => toggleArrayItem('selectedColors', colorObj.name)}
                              className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#30001A] text-white border-[#30001A] dark:bg-rose-300 dark:text-[#30001A] dark:border-rose-300 shadow-md'
                                  : 'bg-zinc-100/80 dark:bg-white/5 text-zinc-700 dark:text-zinc-300 border-black/10 dark:border-white/10 hover:border-amber-500/50'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className="w-5 h-5 rounded-full shrink-0 border shadow-xs relative flex items-center justify-center"
                                  style={{ backgroundColor: colorObj.hex, borderColor: colorObj.border }}
                                >
                                  {isSelected && (
                                    <Check size={11} className={colorObj.name === 'Pure Ivory' ? 'text-black' : 'text-white'} />
                                  )}
                                </span>
                                <span className="truncate text-[11px]">{colorObj.name}</span>
                              </div>
                              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                isSelected ? 'bg-white/20 text-white dark:bg-[#30001A]/20 dark:text-[#30001A]' : 'text-zinc-400'
                              }`}>
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 7. MATERIAL ACCORDION */}
              <div className="border-b border-black/10 dark:border-white/10 pb-5">
                <button
                  type="button"
                  onClick={() => toggleSection('material')}
                  className="w-full flex items-center justify-between py-2 text-xs font-bold uppercase luxury-tracking text-zinc-900 dark:text-white tracking-[0.15em] cursor-pointer min-h-[44px]"
                >
                  <span className="flex items-center gap-2">
                    <Scissors size={15} className="text-amber-500" />
                    {isRTL ? 'نوع القماش والمادة' : 'FABRIC & MATERIAL'}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-zinc-400 transition-transform duration-300 ${openSections.material ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {openSections.material && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pt-3 space-y-1.5"
                    >
                      {materialsList.map((mat) => {
                        const isChecked = tempFilters.selectedMaterials.includes(mat);
                        const count = getMaterialCount(mat);
                        return (
                          <button
                            key={mat}
                            type="button"
                            onClick={() => toggleArrayItem('selectedMaterials', mat)}
                            className={`w-full min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between border transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-[#30001A] text-white border-[#30001A] dark:bg-rose-300 dark:text-[#30001A] dark:border-rose-300 font-bold'
                                : 'bg-zinc-100/50 dark:bg-white/5 border-black/5 dark:border-white/10 text-zinc-600 dark:text-zinc-400'
                            }`}
                          >
                            <span>{mat}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/5 dark:bg-white/10">
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 8. FIT ACCORDION */}
              <div className="border-b border-black/10 dark:border-white/10 pb-5">
                <button
                  type="button"
                  onClick={() => toggleSection('fit')}
                  className="w-full flex items-center justify-between py-2 text-xs font-bold uppercase luxury-tracking text-zinc-900 dark:text-white tracking-[0.15em] cursor-pointer min-h-[44px]"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck size={15} className="text-amber-500" />
                    {isRTL ? 'القصة والتفصيل' : 'FIT & SILHOUETTE'}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-zinc-400 transition-transform duration-300 ${openSections.fit ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {openSections.fit && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pt-3"
                    >
                      <div className="flex flex-wrap gap-2">
                        {fitsList.map((fit) => {
                          const isSelected = tempFilters.selectedFits.includes(fit);
                          const count = getFitCount(fit);
                          return (
                            <button
                              key={fit}
                              type="button"
                              onClick={() => toggleArrayItem('selectedFits', fit)}
                              className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center gap-2 ${
                                isSelected
                                  ? 'bg-[#30001A] text-white border-[#30001A] dark:bg-rose-300 dark:text-[#30001A] dark:border-rose-300 shadow-sm'
                                  : 'bg-zinc-100/80 dark:bg-white/5 text-zinc-700 dark:text-zinc-300 border-black/10 dark:border-white/10'
                              }`}
                            >
                              <span>{fit}</span>
                              <span className="text-[10px] font-mono opacity-80">({count})</span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 9. BRAND / LINE ACCORDION */}
              <div className="border-b border-black/10 dark:border-white/10 pb-5">
                <button
                  type="button"
                  onClick={() => toggleSection('brand')}
                  className="w-full flex items-center justify-between py-2 text-xs font-bold uppercase luxury-tracking text-zinc-900 dark:text-white tracking-[0.15em] cursor-pointer min-h-[44px]"
                >
                  <span className="flex items-center gap-2">
                    <Filter size={15} className="text-amber-500" />
                    {isRTL ? 'خط الإنتاج' : 'BRAND LINE'}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-zinc-400 transition-transform duration-300 ${openSections.brand ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {openSections.brand && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pt-3 space-y-2"
                    >
                      {brandsList.map((brand) => {
                        const isChecked = tempFilters.selectedBrands.includes(brand);
                        const count = getBrandCount(brand);
                        return (
                          <button
                            key={brand}
                            type="button"
                            onClick={() => toggleArrayItem('selectedBrands', brand)}
                            className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase luxury-tracking flex items-center justify-between border cursor-pointer transition-all ${
                              isChecked
                                ? 'bg-[#30001A] text-white border-[#30001A] dark:bg-rose-300 dark:text-[#30001A] dark:border-rose-300'
                                : 'bg-zinc-100/50 dark:bg-white/5 border-black/5 dark:border-white/10 text-zinc-700 dark:text-zinc-300'
                            }`}
                          >
                            <span>{brand}</span>
                            <span className="text-[10px] font-mono opacity-80">({count})</span>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 10. AVAILABILITY ACCORDION */}
              <div className="border-b border-black/10 dark:border-white/10 pb-5">
                <button
                  type="button"
                  onClick={() => toggleSection('availability')}
                  className="w-full flex items-center justify-between py-2 text-xs font-bold uppercase luxury-tracking text-zinc-900 dark:text-white tracking-[0.15em] cursor-pointer min-h-[44px]"
                >
                  <span className="flex items-center gap-2">
                    <PackageCheck size={15} className="text-amber-500" />
                    {isRTL ? 'حالة التوفر' : 'AVAILABILITY'}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-zinc-400 transition-transform duration-300 ${openSections.availability ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {openSections.availability && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pt-3 space-y-2"
                    >
                      {[
                        { id: 'all', label: isRTL ? 'جميع المنتجات' : 'All Items' },
                        { id: 'in-stock', label: isRTL ? 'متوفر في المخزون' : 'In Stock Only' },
                        { id: 'pre-order', label: isRTL ? 'الحجز المسبق' : 'Pre-Order Available' },
                        { id: 'sale', label: isRTL ? 'خصومات وعروض مميزة' : 'On Sale / Discounts' }
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setTempFilters({ ...tempFilters, availability: opt.id as any })}
                          className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase luxury-tracking flex items-center justify-between border cursor-pointer transition-all ${
                            tempFilters.availability === opt.id
                              ? 'bg-[#30001A] text-white border-[#30001A] dark:bg-rose-300 dark:text-[#30001A] dark:border-rose-300 shadow-sm'
                              : 'bg-zinc-100/60 dark:bg-white/5 text-zinc-700 dark:text-zinc-300 border-black/5 dark:border-white/10'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {tempFilters.availability === opt.id && <Check size={16} className="text-amber-400 dark:text-[#30001A]" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 11. RATING ACCORDION */}
              <div className="border-b border-black/10 dark:border-white/10 pb-5">
                <button
                  type="button"
                  onClick={() => toggleSection('rating')}
                  className="w-full flex items-center justify-between py-2 text-xs font-bold uppercase luxury-tracking text-zinc-900 dark:text-white tracking-[0.15em] cursor-pointer min-h-[44px]"
                >
                  <span className="flex items-center gap-2">
                    <Star size={15} className="text-amber-500 fill-amber-500" />
                    {isRTL ? 'تقييم العملاء' : 'CUSTOMER RATING'}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-zinc-400 transition-transform duration-300 ${openSections.rating ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {openSections.rating && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pt-3 space-y-2"
                    >
                      {[
                        { val: '', label: isRTL ? 'جميع التقييمات' : 'Any Rating' },
                        { val: 4.8, label: isRTL ? '4.8 فأعلى (ممتاز)' : '4.8 & Above' },
                        { val: 4.5, label: isRTL ? '4.5 فأعلى' : '4.5 & Above' },
                        { val: 4.0, label: isRTL ? '4.0 فأعلى' : '4.0 & Above' }
                      ].map((item) => (
                        <button
                          key={String(item.val)}
                          type="button"
                          onClick={() => setTempFilters({ ...tempFilters, minRating: item.val })}
                          className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase luxury-tracking flex items-center justify-between border cursor-pointer transition-all ${
                            tempFilters.minRating === item.val
                              ? 'bg-[#30001A] text-white border-[#30001A] dark:bg-rose-300 dark:text-[#30001A] dark:border-rose-300'
                              : 'bg-zinc-100/60 dark:bg-white/5 text-zinc-700 dark:text-zinc-300 border-black/5 dark:border-white/10'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <Star size={13} className="fill-amber-400 text-amber-400" />
                            {item.label}
                          </span>
                          {tempFilters.minRating === item.val && <Check size={16} className="text-amber-400 dark:text-[#30001A]" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 12. DISCOUNT ACCORDION */}
              <div className="pb-5">
                <button
                  type="button"
                  onClick={() => toggleSection('discount')}
                  className="w-full flex items-center justify-between py-2 text-xs font-bold uppercase luxury-tracking text-zinc-900 dark:text-white tracking-[0.15em] cursor-pointer min-h-[44px]"
                >
                  <span className="flex items-center gap-2">
                    <Percent size={15} className="text-amber-500" />
                    {isRTL ? 'الخصومات والعروض' : 'MINIMUM DISCOUNT'}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-zinc-400 transition-transform duration-300 ${openSections.discount ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {openSections.discount && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pt-3 grid grid-cols-2 gap-2"
                    >
                      {[
                        { val: '', label: isRTL ? 'بدون حد أدنى' : 'All Discounts' },
                        { val: 10, label: isRTL ? '10% فأكثر' : '10%+ Off' },
                        { val: 20, label: isRTL ? '20% فأكثر' : '20%+ Off' },
                        { val: 30, label: isRTL ? '30% فأكثر' : '30%+ Off' }
                      ].map((item) => (
                        <button
                          key={String(item.val)}
                          type="button"
                          onClick={() => setTempFilters({ ...tempFilters, minDiscount: item.val })}
                          className={`min-h-[44px] px-3 py-2.5 rounded-xl text-xs font-bold uppercase luxury-tracking text-center border cursor-pointer transition-all ${
                            tempFilters.minDiscount === item.val
                              ? 'bg-[#30001A] text-white border-[#30001A] dark:bg-rose-300 dark:text-[#30001A] dark:border-rose-300 shadow-sm'
                              : 'bg-zinc-100/60 dark:bg-white/5 text-zinc-700 dark:text-zinc-300 border-black/5 dark:border-white/10'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>

            {/* STICKY FOOTER ACTIONS */}
            <div className="p-4 sm:p-5 border-t border-black/10 dark:border-white/10 bg-zinc-50/90 dark:bg-[#080307]/90 backdrop-blur-md sticky bottom-0 z-20 flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 min-h-[48px] rounded-xl text-xs font-bold uppercase luxury-tracking border border-black/15 dark:border-white/15 text-zinc-800 dark:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw size={14} />
                <span>{isRTL ? 'إلغاء الكل' : 'CLEAR ALL'}</span>
              </button>

              <button
                type="button"
                onClick={handleApply}
                className="flex-[2] min-h-[48px] rounded-xl text-xs font-bold uppercase luxury-tracking bg-[#30001A] text-white hover:bg-[#1f0011] dark:bg-rose-300 dark:text-[#30001A] dark:hover:bg-rose-200 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check size={16} />
                <span>
                  {isRTL ? `تطبيق (${matchingCount})` : `APPLY FILTERS (${matchingCount})`}
                </span>
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
