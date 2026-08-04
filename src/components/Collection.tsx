import { motion, AnimatePresence } from 'motion/react';
import { Product, User } from '../types';
import { useState, useMemo, useEffect, useRef } from 'react';
import { Heart, Bell, Layers, Star, ArrowRight, Eye, ArrowLeftRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ProductToolbar, { ViewMode, SortOption } from './ProductToolbar';
import { FilterState, DEFAULT_FILTER_STATE } from './FilterDrawer';

gsap.registerPlugin(ScrollTrigger);

interface CollectionProps {
  products: Product[];
  onViewProduct?: (product: Product) => void;
  wishlistIds?: string[];
  onToggleWishlist?: (productId: string) => void;
  comparedIds?: string[];
  onToggleCompare?: (product: Product) => void;
  currentUser?: User | null;
  onViewAdmin?: () => void;
  lang?: 'en' | 'ar';
}

const STORAGE_VIEW_KEY = 'avento7_product_view';
const STORAGE_FILTERS_KEY = 'avento7_saved_filters';

export default function Collection({
  products,
  onViewProduct,
  wishlistIds = [],
  onToggleWishlist,
  comparedIds = [],
  onToggleCompare,
  lang = 'en'
}: CollectionProps) {
  // Load saved view mode or default to '4'
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_VIEW_KEY);
      if (saved && ['2', '3', '4', '5', 'list'].includes(saved)) {
        return saved as ViewMode;
      }
    } catch {
      // ignore
    }
    return '4';
  });

  // Save view mode to localStorage
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    try {
      localStorage.setItem(STORAGE_VIEW_KEY, mode);
    } catch {
      // ignore
    }
  };

  // Filter State initialized from localStorage if present
  const [filters, setFilters] = useState<FilterState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_FILTERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_FILTER_STATE, ...parsed };
      }
    } catch {
      // fallback
    }
    return DEFAULT_FILTER_STATE;
  });

  // Save filters to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_FILTERS_KEY, JSON.stringify(filters));
    } catch {
      // ignore
    }
  }, [filters]);

  // Sort State
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const resetFilters = () => {
    setFilters(DEFAULT_FILTER_STATE);
    setSortBy('featured');
    try {
      localStorage.removeItem(STORAGE_FILTERS_KEY);
    } catch {
      // ignore
    }
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category / Gender
    if (filters.category === 'New Arrivals') {
      result = result.filter(p => p.isNew);
    } else if (filters.category && filters.category !== 'All') {
      result = result.filter(p => p.gender === filters.category || p.category === filters.category);
    }

    // Collections
    if (filters.collections && filters.collections.length > 0) {
      result = result.filter(p => p.collectionName && filters.collections.includes(p.collectionName));
    }

    // Min Price
    if (filters.minPrice !== '') {
      result = result.filter(p => p.price >= Number(filters.minPrice));
    }

    // Max Price
    if (filters.maxPrice !== '') {
      result = result.filter(p => p.price <= Number(filters.maxPrice));
    }

    // Selected Sizes
    if (filters.selectedSizes && filters.selectedSizes.length > 0) {
      result = result.filter(p =>
        p.sizes?.some(s => filters.selectedSizes.includes(s))
      );
    }

    // Selected Colors
    if (filters.selectedColors && filters.selectedColors.length > 0) {
      result = result.filter(p => p.colorName && filters.selectedColors.includes(p.colorName));
    }

    // Selected Materials
    if (filters.selectedMaterials && filters.selectedMaterials.length > 0) {
      result = result.filter(p => p.material && filters.selectedMaterials.includes(p.material));
    }

    // Selected Fits
    if (filters.selectedFits && filters.selectedFits.length > 0) {
      result = result.filter(p => p.fit && filters.selectedFits.includes(p.fit));
    }

    // Selected Brands
    if (filters.selectedBrands && filters.selectedBrands.length > 0) {
      result = result.filter(p => p.brand && filters.selectedBrands.includes(p.brand));
    }

    // Availability
    if (filters.availability === 'in-stock') {
      result = result.filter(p => !p.isSoldOut);
    } else if (filters.availability === 'pre-order') {
      result = result.filter(p => p.isPreOrder);
    } else if (filters.availability === 'sale') {
      result = result.filter(p => p.discountPercentage || p.originalPrice);
    }

    // Rating
    if (filters.minRating !== '') {
      result = result.filter(p => (p.rating || 0) >= Number(filters.minRating));
    }

    // Discount
    if (filters.minDiscount !== '') {
      result = result.filter(p => (p.discountPercentage || 0) >= Number(filters.minDiscount));
    }

    // New Arrivals Only
    if (filters.newArrivalsOnly) {
      result = result.filter(p => p.isNew);
    }

    // Search Query
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter(
        p => p.name.toLowerCase().includes(q) ||
             p.category?.toLowerCase().includes(q) ||
             p.description?.toLowerCase().includes(q) ||
             (p.nameAr && p.nameAr.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortBy === 'newest') {
      result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    } else if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'best-selling') {
      result.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
    } else if (sortBy === 'discount') {
      result.sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));
    }

    return result;
  }, [filters, sortBy, products]);

  // GSAP ScrollTrigger for section header
  useEffect(() => {
    if (!headerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 85%',
          },
        }
      );
    }, headerRef);

    return () => ctx.revert();
  }, []);

  const getGridClass = (mode: ViewMode) => {
    switch (mode) {
      case '2':
        return 'grid-cols-2 gap-3.5 sm:gap-6';
      case '3':
        return 'grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-6';
      case '4':
        return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6';
      case '5':
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5';
      case 'list':
        return 'grid-cols-1 gap-3.5 sm:gap-5';
      default:
        return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6';
    }
  };

  const isRTL = lang === 'ar';

  return (
    <section ref={sectionRef} className="w-full flex flex-col items-center px-4 sm:px-6 lg:px-8" id="collection">
      
      {/* SECTION HEADER */}
      <div 
        ref={headerRef}
        className="w-full mb-6 sm:mb-10 flex flex-col items-center text-center"
      >
        <span className="text-[10px] luxury-tracking uppercase text-[#30001A] dark:text-rose-300 mb-3 font-semibold tracking-[0.3em]">
          {isRTL ? 'أحدث الإصدارات الحصرية' : 'The Obsidian Drop'}
        </span>
        <h2 className="serif-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#30001A] dark:text-[#f8f1f5] tracking-wider font-light uppercase">
          {isRTL ? 'الأساسيات' : 'CORE'} <i className="opacity-70 font-serif italic font-normal">{isRTL ? 'الرئيسية' : 'ESSENTIALS'}</i>
        </h2>
      </div>

      {/* RESPONSIVE PRODUCT TOOLBAR */}
      <ProductToolbar
        totalCount={products.length}
        filteredCount={filteredProducts.length}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        sortBy={sortBy}
        onSortChange={setSortBy}
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={resetFilters}
        allProducts={products}
        lang={lang}
      />

      {/* PRODUCTS DISPLAY GRID OR LIST */}
      {filteredProducts.length === 0 ? (
        <div className="w-full py-20 text-center text-zinc-400 dark:text-white/40 bg-zinc-50 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 my-4">
          <p className="text-xs uppercase luxury-tracking tracking-[0.2em] font-bold">
            {isRTL ? 'لم يتم العثور على أي منتج يطابق خيارات البحث' : 'NO PRODUCTS FOUND MATCHING YOUR FILTERS'}
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-bold uppercase luxury-tracking bg-[#30001A] text-white dark:bg-rose-300 dark:text-[#30001A] shadow-md hover:opacity-90 transition-opacity"
          >
            {isRTL ? 'تفريغ خيارات التصفية' : 'RESET ALL FILTERS'}
          </button>
        </div>
      ) : (
        <motion.div 
          layout 
          className={`w-full grid transition-all duration-500 ease-out ${getGridClass(viewMode)}`}
        >
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, idx) => {
              const isWishlisted = wishlistIds.includes(product.id);
              const isCompared = comparedIds.includes(product.id);

              // LIST VIEW RENDER
              if (viewMode === 'list') {
                return (
                  <motion.div
                    layout
                    key={`${product.id}-list-${idx}`}
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="group w-full flex flex-row items-center gap-3 sm:gap-5 bg-white dark:bg-[#0c060a]/80 border border-black/10 dark:border-white/10 p-2.5 sm:p-4 rounded-2xl hover:border-amber-500/50 hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden"
                    onClick={() => onViewProduct?.(product)}
                  >
                    {/* List Item Image */}
                    <div className="relative w-28 sm:w-44 md:w-52 aspect-[3/4] shrink-0 overflow-hidden bg-zinc-100 dark:bg-black/40 rounded-xl border border-black/5 dark:border-white/5">
                      <img 
                        src={product.images && product.images.length > 0 ? product.images[0] : product.image} 
                        alt={product.name} 
                        className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                          product.isSoldOut ? 'grayscale-[20%] opacity-80' : 'opacity-95 group-hover:opacity-100'
                        }`} 
                        referrerPolicy="no-referrer" 
                      />

                      {product.images && product.images.length > 1 && (
                        <img 
                          src={product.images[1]} 
                          alt={`${product.name} alt`} 
                          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 opacity-0 group-hover:opacity-100 hidden sm:block" 
                          referrerPolicy="no-referrer" 
                        />
                      )}

                      {/* Sold Out / New Badge */}
                      {product.isSoldOut ? (
                        <div className="absolute top-2 left-2 z-10 text-[8px] luxury-tracking px-1.5 py-0.5 border border-rose-500/40 bg-rose-950/85 text-rose-200 backdrop-blur-md uppercase font-bold rounded shadow-xs">
                          {isRTL ? 'نفذت' : 'SOLD OUT'}
                        </div>
                      ) : product.isNew ? (
                        <div className="absolute top-2 left-2 rtl:left-auto rtl:right-2 z-10 text-[8px] luxury-tracking px-1.5 py-0.5 border border-black/10 dark:border-white/20 bg-black/70 text-white uppercase font-semibold rounded">
                          {isRTL ? 'جديد' : 'NEW'}
                        </div>
                      ) : null}

                      {/* Photo Count */}
                      {product.images && product.images.length > 1 && (
                        <div className="absolute bottom-2 left-2 z-10 text-[8px] font-mono font-bold px-1.5 py-0.5 bg-black/60 text-white backdrop-blur-md rounded-md border border-white/20 flex items-center gap-1">
                          <Layers size={10} className="text-amber-400" />
                          <span>{product.images.length}</span>
                        </div>
                      )}
                    </div>

                    {/* List Item Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
                      <div>
                        {/* Top Meta Header */}
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[9px] sm:text-[10px] font-bold uppercase luxury-tracking text-amber-600 dark:text-amber-400 truncate">
                            {product.gender || 'UNISEX'} {product.category ? `• ${product.category}` : ''}
                          </span>

                          <div className="flex items-center gap-1 shrink-0">
                            {/* Compare Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleCompare?.(product);
                              }}
                              className={`p-2 rounded-full transition-all min-w-[44px] min-h-[44px] flex items-center justify-center ${
                                isCompared
                                  ? 'bg-amber-400 text-zinc-950 shadow-xs font-bold'
                                  : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                              }`}
                              title={isRTL ? 'مقارنة' : 'Compare'}
                              aria-label="Compare product"
                            >
                              <ArrowLeftRight size={16} />
                            </button>

                            {/* Wishlist Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleWishlist?.(product.id);
                              }}
                              className={`p-2 rounded-full transition-all shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center ${
                                isWishlisted
                                  ? 'bg-[#30001A] text-white shadow-xs'
                                  : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                              }`}
                              aria-label="Wishlist"
                            >
                              <Heart size={16} className={isWishlisted ? 'fill-white' : ''} />
                            </button>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-xs sm:text-base font-bold uppercase luxury-tracking text-zinc-900 dark:text-white mb-1 line-clamp-2 leading-snug group-hover:text-amber-600 dark:group-hover:text-rose-300 transition-colors">
                          {isRTL && product.nameAr ? product.nameAr : product.name}
                        </h3>

                        {/* Description Preview */}
                        {product.description && (
                          <p className="hidden sm:block text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-2 leading-relaxed">
                            {isRTL && product.descriptionAr ? product.descriptionAr : product.description}
                          </p>
                        )}
                      </div>

                      {/* Bottom Price & Action Row */}
                      <div className="pt-2 border-t border-black/5 dark:border-white/10 flex items-center justify-between gap-2 mt-auto">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xs sm:text-base font-mono font-extrabold text-zinc-900 dark:text-white">
                            {product.price.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}
                          </span>
                          {product.rating && (
                            <div className="hidden sm:flex items-center text-[#d4af37] gap-1 ml-2 rtl:mr-2 rtl:ml-0">
                              <Star size={11} className="fill-amber-400 text-amber-400" />
                              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{product.rating}</span>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewProduct?.(product);
                          }}
                          className={`px-3 sm:px-5 py-2 rounded-xl text-[10px] sm:text-xs font-bold uppercase luxury-tracking tracking-wider flex items-center gap-1.5 cursor-pointer transition-all shadow-md min-h-[36px] ${
                            product.isSoldOut
                              ? 'bg-zinc-900 text-amber-300 border border-amber-500/30'
                              : 'bg-[#30001A] text-white hover:bg-[#1b000f] dark:bg-rose-300 dark:text-[#30001A]'
                          }`}
                        >
                          {product.isSoldOut ? (
                            <>
                              <Bell size={12} className="text-amber-400" />
                              <span>{isRTL ? 'أبلغني' : 'NOTIFY'}</span>
                            </>
                          ) : (
                            <>
                              <Eye size={12} />
                              <span>{isRTL ? 'عرض' : 'VIEW'}</span>
                              <ArrowRight size={12} className="rtl:rotate-180" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              }

              // GRID VIEW RENDER (2, 3, 4, 5 columns)
              return (
                <motion.div
                  layout
                  key={`${product.id}-grid-${idx}`}
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="group h-full flex flex-col justify-between bg-white dark:bg-[#0c060a]/80 border border-black/10 dark:border-white/10 rounded-2xl p-2 sm:p-3 hover:border-amber-500/50 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden relative"
                  onClick={() => onViewProduct?.(product)}
                >
                  <div>
                    {/* Image Container with 3/4 aspect ratio */}
                    <div className="relative w-full aspect-[3/4] overflow-hidden bg-zinc-100 dark:bg-[#0A0A0A] mb-2.5 sm:mb-3 rounded-xl border border-black/5 dark:border-white/5">
                      {/* Primary Product Image */}
                      <img 
                        src={product.images && product.images.length > 0 ? product.images[0] : product.image} 
                        alt={product.name} 
                        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[0.16,1,0.3,1] group-hover:scale-105 ${
                          product.isSoldOut ? 'grayscale-[20%] opacity-80 group-hover:opacity-90' : 'opacity-95 group-hover:opacity-100'
                        }`} 
                        referrerPolicy="no-referrer" 
                      />

                      {/* Secondary Product Image Crossfade on Hover */}
                      {product.images && product.images.length > 1 && (
                        <img 
                          src={product.images[1]} 
                          alt={`${product.name} alternate`} 
                          className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out opacity-0 group-hover:opacity-100 group-hover:scale-105 hidden sm:block" 
                          referrerPolicy="no-referrer" 
                        />
                      )}

                      <div className="absolute inset-0 bg-black/5 dark:bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      
                      {/* Multi-Image Count Badge - Bottom Left */}
                      {product.images && product.images.length > 1 && (
                        <div className="absolute bottom-2 left-2 z-10 text-[8px] sm:text-[9px] font-mono font-bold px-1.5 py-0.5 sm:px-2 sm:py-0.5 bg-black/70 text-white backdrop-blur-md rounded-md border border-white/20 flex items-center gap-1 shadow-xs">
                          <Layers size={10} className="text-amber-400" />
                          <span>{product.images.length}</span>
                        </div>
                      )}

                      {/* Sold Out Badge or New Badge */}
                      {product.isSoldOut ? (
                        <div className="absolute top-2 left-2 z-10 text-[8px] sm:text-[9px] luxury-tracking px-2 py-0.5 border border-rose-500/40 bg-rose-950/85 text-rose-200 backdrop-blur-md uppercase font-bold tracking-widest shadow-md flex items-center gap-1 rounded-md">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                          {isRTL ? 'نفذت' : 'SOLD OUT'}
                        </div>
                      ) : product.isNew ? (
                        <div className="absolute top-2 left-2 rtl:left-auto rtl:right-2 z-10 text-[8px] sm:text-[9px] luxury-tracking px-2 py-0.5 border border-black/10 dark:border-white/20 bg-black/70 text-white backdrop-blur-md uppercase font-semibold rounded-md">
                          {isRTL ? 'جديد' : 'NEW'}
                        </div>
                      ) : null}

                      {/* Top Right Action Group: Compare & Wishlist */}
                      <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-20 flex items-center gap-1">
                        {/* Compare Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleCompare?.(product);
                          }}
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all ${
                            isCompared
                              ? 'bg-amber-400 text-zinc-950 font-bold shadow-md scale-105'
                              : 'bg-black/40 text-white hover:bg-amber-400 hover:text-zinc-950 backdrop-blur-md border border-white/20 active:scale-95'
                          }`}
                          title={isRTL ? 'مقارنة' : 'Compare'}
                          aria-label="Toggle compare"
                        >
                          <ArrowLeftRight size={14} />
                        </button>

                        {/* Wishlist Heart Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleWishlist?.(product.id);
                          }}
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all ${
                            isWishlisted
                              ? 'bg-[#30001A] text-white shadow-md scale-105'
                              : 'bg-black/40 text-white hover:bg-[#30001A] backdrop-blur-md border border-white/20 active:scale-95'
                          }`}
                          aria-label="Toggle wishlist"
                        >
                          <Heart size={14} className={isWishlisted ? 'fill-white' : ''} />
                        </button>
                      </div>

                      {/* Quick View / Notify Overlay Button */}
                      <div 
                        className="absolute bottom-1.5 inset-x-1.5 sm:bottom-2 sm:inset-x-2 z-10 transition-all duration-300 sm:opacity-0 sm:group-hover:opacity-100 sm:translate-y-2 sm:group-hover:translate-y-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewProduct?.(product);
                        }}
                      >
                        <button 
                          type="button"
                          className={`w-full py-1.5 sm:py-2 px-2 text-[8px] sm:text-[10px] luxury-tracking font-bold transition-all uppercase tracking-wider cursor-pointer shadow-md flex items-center justify-center gap-1 rounded-lg min-h-[32px] sm:min-h-[36px] ${
                            product.isSoldOut 
                              ? 'bg-zinc-900/95 text-amber-300 hover:bg-black border border-amber-500/30' 
                              : 'bg-[#30001A]/95 text-white dark:bg-rose-300/95 dark:text-[#30001A] hover:opacity-90 backdrop-blur-md'
                          }`}
                        >
                          {product.isSoldOut ? (
                            <>
                              <Bell size={11} className="text-amber-400 animate-bounce" />
                              <span className="truncate">{isRTL ? 'أبلغني بالتوفر' : 'NOTIFY ME'}</span>
                            </>
                          ) : (
                            <>
                              <Eye size={12} />
                              <span className="truncate">{isRTL ? 'نظرة سريعة' : 'QUICK VIEW'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Title & Category */}
                    <div className="px-1">
                      <h3 className="text-xs sm:text-sm font-semibold luxury-tracking text-zinc-900 dark:text-white mb-1 line-clamp-2 leading-tight group-hover:text-amber-600 dark:group-hover:text-rose-300 transition-colors min-h-[2rem]">
                        {isRTL && product.nameAr ? product.nameAr : product.name}
                      </h3>
                    </div>
                  </div>

                  {/* Price & Rating Section - Prominent & Aligned at bottom */}
                  <div className="px-1 pt-2 border-t border-black/5 dark:border-white/5 mt-2 flex items-center justify-between gap-1.5 w-full">
                    <span className="text-xs sm:text-sm font-mono font-extrabold text-zinc-900 dark:text-white tracking-tight">
                      {product.price.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}
                    </span>
                    {product.rating && (
                      <div className="flex items-center gap-0.5 text-[#d4af37] text-[10px] sm:text-xs font-bold shrink-0">
                        <Star size={11} className="fill-amber-400 text-amber-400" />
                        <span>{product.rating}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ARCHIVE FOOTER BUTTON */}
      <div className="w-full flex justify-center mt-12 md:mt-16">
        <button 
          onClick={resetFilters}
          className="text-[10px] luxury-tracking uppercase text-zinc-900 border-b border-zinc-900 dark:text-[#f5f5f7] dark:border-[#f5f5f7] pb-1 hover:text-amber-600 hover:border-amber-600 dark:hover:text-amber-400 dark:hover:border-amber-400 transition-colors tracking-[0.2em] cursor-pointer"
        >
          {isRTL ? 'عرض جميع المنتجات والأرشيف' : 'DISCOVER ALL ARCHIVE PRODUCTS'}
        </button>
      </div>

    </section>
  );
}
