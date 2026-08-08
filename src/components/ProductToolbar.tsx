import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  ArrowUpDown, 
  Search, 
  X, 
  RotateCcw, 
  Tag, 
  DollarSign, 
  PackageCheck, 
  Ruler, 
  Palette, 
  FolderKanban, 
  Scissors, 
  ShieldCheck, 
  Star, 
  Percent, 
  Sparkles, 
  Filter
} from 'lucide-react';
import FilterDrawer, { FilterState, DEFAULT_FILTER_STATE } from './FilterDrawer';
import { Product } from '../types';

export { DEFAULT_FILTER_STATE };
export type { FilterState };

export type ViewMode = '2' | '3' | '4' | '5' | 'list';

export type SortOption = 
  | 'featured' 
  | 'newest' 
  | 'price-asc' 
  | 'price-desc' 
  | 'best-selling' 
  | 'rating' 
  | 'discount';

interface ProductToolbarProps {
  totalCount: number;
  filteredCount: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onResetFilters: () => void;
  allProducts?: Product[];
  lang?: 'en' | 'ar';
}

export default function ProductToolbar({
  totalCount,
  filteredCount,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  filters,
  onFilterChange,
  onResetFilters,
  allProducts = [],
  lang = 'en'
}: ProductToolbarProps) {
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const isRTL = lang === 'ar';

  // Calculate active filter count
  const activeFilterCount = [
    filters.category && filters.category !== 'All' ? 1 : 0,
    (filters.collections && filters.collections.length > 0) ? filters.collections.length : 0,
    (filters.minPrice !== '' || filters.maxPrice !== '') ? 1 : 0,
    (filters.selectedSizes && filters.selectedSizes.length > 0) ? filters.selectedSizes.length : 0,
    (filters.selectedColors && filters.selectedColors.length > 0) ? filters.selectedColors.length : 0,
    (filters.selectedMaterials && filters.selectedMaterials.length > 0) ? filters.selectedMaterials.length : 0,
    (filters.selectedFits && filters.selectedFits.length > 0) ? filters.selectedFits.length : 0,
    (filters.selectedBrands && filters.selectedBrands.length > 0) ? filters.selectedBrands.length : 0,
    filters.availability && filters.availability !== 'all' ? 1 : 0,
    filters.minRating !== '' ? 1 : 0,
    filters.minDiscount !== '' ? 1 : 0,
    filters.newArrivalsOnly ? 1 : 0,
    (filters.searchQuery && filters.searchQuery.trim() !== '') ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  const handleReset = () => {
    onResetFilters();
  };

  return (
    <div className="w-full mb-6 sm:mb-8" role="toolbar" aria-label={isRTL ? "شريط أداة تحكم المنتجات" : "Product grid toolbar"}>
      {/* MAIN TOOLBAR CONTAINER */}
      <div className="w-full bg-white/90 dark:bg-[#0c060a]/90 backdrop-blur-xl border border-wine/10 dark:border-white/10 rounded-[22px] p-2 sm:p-3.5 shadow-lg transition-all duration-300">
        
        {/* TOP ROW: SEARCH, FILTER BUTTON & SORT */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3">
          
          {/* LEFT GROUP: FILTER BUTTON & SEARCH BAR */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 w-full md:w-auto">
            
            {/* Filter Drawer Toggle Button */}
            <button
              type="button"
              onClick={() => setIsFilterOpen(true)}
              aria-expanded={isFilterOpen}
              aria-label={isRTL ? "تصفية المنتجات" : "Filter products"}
              className={`relative min-h-[44px] w-auto min-w-[40%] px-2 sm:px-4 rounded-xl text-xs font-bold uppercase luxury-tracking flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer select-none shrink-0 border focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                activeFilterCount > 0
                  ? 'bg-[#30001A] text-white border-[#30001A] dark:bg-rose-300 dark:text-[#30001A] dark:border-rose-300 shadow-md scale-[1.02]'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-wine border-wine/10 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white dark:border-white/15'
              }`}
            >
              <SlidersHorizontal size={16} className={activeFilterCount > 0 ? "animate-pulse text-amber-300 dark:text-[#30001A]" : "text-amber-500"} />
              <span className="tracking-widest">
                {isRTL ? 'تصفية' : 'FILTER'}
              </span>
              {activeFilterCount > 0 && (
                <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-amber-400 text-wine font-mono font-black text-[10px] flex items-center justify-center shadow-xs">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Quick Search Input */}
            <div className="relative flex-1 min-h-[44px] flex items-center">
              <input
                type="text"
                value={filters.searchQuery || ''}
                onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
                placeholder={isRTL ? 'ابحث عن منتج أو نوع...' : 'Search collection...'}
                className="w-full h-11 bg-zinc-100/80 dark:bg-white/5 border border-wine/10 dark:border-white/10 rounded-xl px-3.5 pl-9 rtl:pl-3.5 rtl:pr-9 text-xs font-semibold text-wine dark:text-white placeholder-zinc-400 focus:outline-none focus:border-amber-500 dark:focus:border-rose-400 transition-colors"
                aria-label={isRTL ? 'البحث عن منتج' : 'Search products'}
              />
              <Search size={15} className="absolute left-3 rtl:left-auto rtl:right-3 text-zinc-400 pointer-events-none" />
              {filters.searchQuery && (
                <button
                  onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
                  className="absolute right-2.5 rtl:right-auto rtl:left-2.5 p-1 rounded-full text-zinc-400 hover:text-wine dark:hover:text-white cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Item Count Display (Desktop / Tablet) */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-[11px] font-mono font-bold text-zinc-500 dark:text-zinc-400 shrink-0">
              <span className="text-wine dark:text-white">{filteredCount}</span>
              <span>/</span>
              <span>{totalCount}</span>
              <span className="text-[10px] luxury-tracking uppercase ml-1 rtl:mr-1 rtl:ml-0 font-sans">
                {isRTL ? 'منتج' : 'ITEMS'}
              </span>
            </div>
          </div>

          {/* RIGHT GROUP: SORT DROPDOWN & VIEW SWITCHER */}
          <div className="flex flex-wrap md:flex-nowrap items-center justify-between md:justify-end gap-2 sm:gap-3 shrink-0">
            
            {/* Sort Dropdown */}
            <div className="relative w-full md:w-auto md:flex-none min-h-[44px] flex items-center bg-zinc-100/80 dark:bg-white/10 border border-wine/10 dark:border-white/15 rounded-xl px-3 py-1 hover:border-amber-500/50 transition-colors">
              <ArrowUpDown size={14} className="text-amber-500 shrink-0 mr-2 rtl:mr-0 rtl:ml-2" />
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                aria-label={isRTL ? "ترتيب المنتجات" : "Sort products"}
                className="w-full bg-transparent text-xs font-bold uppercase text-wine dark:text-white focus:outline-none cursor-pointer pr-5 rtl:pr-0 rtl:pl-5 py-2.5 appearance-none"
              >
                <option value="featured" className="bg-white text-wine dark:bg-[#120810] dark:text-white">
                  {isRTL ? 'المميزة / الافتراضي' : 'Featured'}
                </option>
                <option value="newest" className="bg-white text-wine dark:bg-[#120810] dark:text-white">
                  {isRTL ? 'وصل حديثاً' : 'Newest First'}
                </option>
                <option value="price-asc" className="bg-white text-wine dark:bg-[#120810] dark:text-white">
                  {isRTL ? 'السعر: من الأقل للأعلى' : 'Price: Low → High'}
                </option>
                <option value="price-desc" className="bg-white text-wine dark:bg-[#120810] dark:text-white">
                  {isRTL ? 'السعر: من الأعلى للأقل' : 'Price: High → Low'}
                </option>
                <option value="best-selling" className="bg-white text-wine dark:bg-[#120810] dark:text-white">
                  {isRTL ? 'الأكثر مبيعاً' : 'Best Selling'}
                </option>
                <option value="rating" className="bg-white text-wine dark:bg-[#120810] dark:text-white">
                  {isRTL ? 'أعلى تقييم' : 'Highest Rated'}
                </option>
                <option value="discount" className="bg-white text-wine dark:bg-[#120810] dark:text-white">
                  {isRTL ? 'أعلى خصم' : 'Biggest Discount'}
                </option>
              </select>
            </div>

            {/* View Mode Switcher Buttons */}
            <div className="flex items-center gap-1 bg-zinc-100/80 dark:bg-white/10 p-1 rounded-xl border border-wine/10 dark:border-white/15 shrink-0 ml-auto rtl:mr-auto rtl:ml-0" role="radiogroup" aria-label={isRTL ? "نمط العرض" : "Grid layout view mode"}>
              
              {/* 2 Grid Mode */}
              <button
                type="button"
                role="radio"
                aria-checked={viewMode === '2'}
                aria-label={isRTL ? "عرض عامودين" : "2 Column Grid"}
                onClick={() => onViewModeChange('2')}
                className={`min-w-[44px] min-h-[44px] h-[44px] px-2 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                  viewMode === '2'
                    ? 'bg-[#30001A] text-white dark:bg-rose-300 dark:text-[#30001A] shadow-md font-bold scale-[1.05]'
                    : 'text-zinc-500 hover:text-wine dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                <svg width="15" height="15" viewBox="0 0 18 18" fill="currentColor">
                  <rect x="2" y="2" width="6" height="14" rx="1" />
                  <rect x="10" y="2" width="6" height="14" rx="1" />
                </svg>
              </button>

              {/* 3 Grid Mode (Desktop / Tablet) */}
              <button
                type="button"
                role="radio"
                aria-checked={viewMode === '3'}
                aria-label={isRTL ? "عرض 3 أعمدة" : "3 Column Grid"}
                onClick={() => onViewModeChange('3')}
                className={`hidden sm:flex min-w-[44px] min-h-[44px] h-[44px] px-2 rounded-lg items-center justify-center transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                  viewMode === '3'
                    ? 'bg-[#30001A] text-white dark:bg-rose-300 dark:text-[#30001A] shadow-md font-bold scale-[1.05]'
                    : 'text-zinc-500 hover:text-wine dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                <svg width="15" height="15" viewBox="0 0 18 18" fill="currentColor">
                  <rect x="1" y="2" width="4" height="14" rx="1" />
                  <rect x="7" y="2" width="4" height="14" rx="1" />
                  <rect x="13" y="2" width="4" height="14" rx="1" />
                </svg>
              </button>

              {/* 4 Grid Mode */}
              <button
                type="button"
                role="radio"
                aria-checked={viewMode === '4'}
                aria-label={isRTL ? "عرض 4 أعمدة" : "4 Column Grid"}
                onClick={() => onViewModeChange('4')}
                className={`hidden md:flex min-w-[44px] min-h-[44px] h-[44px] px-2 rounded-lg items-center justify-center transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                  viewMode === '4'
                    ? 'bg-[#30001A] text-white dark:bg-rose-300 dark:text-[#30001A] shadow-md font-bold scale-[1.05]'
                    : 'text-zinc-500 hover:text-wine dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                <svg width="15" height="15" viewBox="0 0 18 18" fill="currentColor">
                  <rect x="1" y="2" width="3" height="14" rx="0.8" />
                  <rect x="5.5" y="2" width="3" height="14" rx="0.8" />
                  <rect x="10" y="2" width="3" height="14" rx="0.8" />
                  <rect x="14.5" y="2" width="3" height="14" rx="0.8" />
                </svg>
              </button>

              {/* List View Mode */}
              <button
                type="button"
                role="radio"
                aria-checked={viewMode === 'list'}
                aria-label={isRTL ? "عرض القائمة" : "List View"}
                onClick={() => onViewModeChange('list')}
                className={`min-w-[44px] min-h-[44px] h-[44px] px-2 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                  viewMode === 'list'
                    ? 'bg-[#30001A] text-white dark:bg-rose-300 dark:text-[#30001A] shadow-md font-bold scale-[1.05]'
                    : 'text-zinc-500 hover:text-wine dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                <svg width="15" height="15" viewBox="0 0 18 18" fill="currentColor">
                  <rect x="2" y="3" width="14" height="3" rx="1" />
                  <rect x="2" y="8" width="14" height="3" rx="1" />
                  <rect x="2" y="13" width="14" height="3" rx="1" />
                </svg>
              </button>

            </div>
          </div>
        </div>

        {/* ACTIVE FILTER REMOVABLE CHIPS BAR */}
        {activeFilterCount > 0 && (
          <div className="mt-3 pt-3 border-t border-wine/10 dark:border-white/10 flex flex-wrap items-center gap-2 animate-fadeIn">
            <span className="text-[10px] font-bold uppercase luxury-tracking text-zinc-500 dark:text-zinc-400 mr-1 rtl:ml-1 rtl:mr-0 flex items-center gap-1">
              <Filter size={11} className="text-amber-500" />
              {isRTL ? 'التصفيات النشطة:' : 'Active Filters:'}
            </span>

            {/* New Arrivals Only */}
            {filters.newArrivalsOnly && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 min-h-[44px] rounded-lg text-[10px] font-bold bg-[#30001A]/10 text-[#30001A] dark:bg-rose-400/20 dark:text-rose-200 border border-[#30001A]/20 dark:border-rose-300/30">
                <Sparkles size={11} className="text-amber-500 animate-spin" />
                <span>{isRTL ? 'وصل حديثاً' : 'New Arrivals'}</span>
                <button 
                  onClick={() => onFilterChange({ ...filters, newArrivalsOnly: false })}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center -my-3 -mr-2 rtl:-mr-0 rtl:-ml-2 hover:text-rose-500 cursor-pointer ml-1 rtl:mr-1 rtl:ml-0"
                  aria-label="Remove new arrivals filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {/* Category Tag */}
            {filters.category && filters.category !== 'All' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 min-h-[44px] rounded-lg text-[10px] font-bold bg-[#30001A]/10 text-[#30001A] dark:bg-rose-400/20 dark:text-rose-200 border border-[#30001A]/20 dark:border-rose-300/30">
                <Tag size={11} className="text-amber-500" />
                <span>{filters.category}</span>
                <button 
                  onClick={() => onFilterChange({ ...filters, category: 'All' })}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center -my-3 -mr-2 rtl:-mr-0 rtl:-ml-2 hover:text-rose-500 cursor-pointer ml-1 rtl:mr-1 rtl:ml-0"
                  aria-label="Remove category filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {/* Collections Tags */}
            {filters.collections && filters.collections.map(coll => (
              <span key={coll} className="inline-flex items-center gap-1.5 px-2.5 py-1 min-h-[44px] rounded-lg text-[10px] font-bold bg-[#30001A]/10 text-[#30001A] dark:bg-rose-400/20 dark:text-rose-200 border border-[#30001A]/20 dark:border-rose-300/30">
                <FolderKanban size={11} className="text-amber-500" />
                <span>{coll}</span>
                <button 
                  onClick={() => onFilterChange({ ...filters, collections: filters.collections.filter(c => c !== coll) })}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center -my-3 -mr-2 rtl:-mr-0 rtl:-ml-2 hover:text-rose-500 cursor-pointer ml-1 rtl:mr-1 rtl:ml-0"
                  aria-label={`Remove ${coll} collection filter`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}

            {/* Price Tag */}
            {(filters.minPrice !== '' || filters.maxPrice !== '') && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 min-h-[44px] rounded-lg text-[10px] font-bold bg-[#30001A]/10 text-[#30001A] dark:bg-rose-400/20 dark:text-rose-200 border border-[#30001A]/20 dark:border-rose-300/30">
                <DollarSign size={11} className="text-amber-500" />
                <span>
                  {filters.minPrice !== '' ? `${filters.minPrice} EGP` : '0'} - {filters.maxPrice !== '' ? `${filters.maxPrice} EGP` : '∞'}
                </span>
                <button 
                  onClick={() => onFilterChange({ ...filters, minPrice: '', maxPrice: '' })}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center -my-3 -mr-2 rtl:-mr-0 rtl:-ml-2 hover:text-rose-500 cursor-pointer ml-1 rtl:mr-1 rtl:ml-0"
                  aria-label="Remove price filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {/* Selected Sizes Tags */}
            {filters.selectedSizes && filters.selectedSizes.map(size => (
              <span key={size} className="inline-flex items-center gap-1 px-2.5 py-1 min-h-[44px] rounded-lg text-[10px] font-bold bg-[#30001A]/10 text-[#30001A] dark:bg-rose-400/20 dark:text-rose-200 border border-[#30001A]/20 dark:border-rose-300/30">
                <Ruler size={11} className="text-amber-500" />
                <span>{size}</span>
                <button 
                  onClick={() => onFilterChange({ ...filters, selectedSizes: filters.selectedSizes.filter(s => s !== size) })}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center -my-3 -mr-2 rtl:-mr-0 rtl:-ml-2 hover:text-rose-500 cursor-pointer ml-1 rtl:mr-1 rtl:ml-0"
                  aria-label={`Remove size ${size} filter`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}

            {/* Selected Colors Tags */}
            {filters.selectedColors && filters.selectedColors.map(color => (
              <span key={color} className="inline-flex items-center gap-1 px-2.5 py-1 min-h-[44px] rounded-lg text-[10px] font-bold bg-[#30001A]/10 text-[#30001A] dark:bg-rose-400/20 dark:text-rose-200 border border-[#30001A]/20 dark:border-rose-300/30">
                <Palette size={11} className="text-amber-500" />
                <span>{color}</span>
                <button 
                  onClick={() => onFilterChange({ ...filters, selectedColors: filters.selectedColors.filter(c => c !== color) })}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center -my-3 -mr-2 rtl:-mr-0 rtl:-ml-2 hover:text-rose-500 cursor-pointer ml-1 rtl:mr-1 rtl:ml-0"
                  aria-label={`Remove color ${color} filter`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}

            {/* Selected Materials Tags */}
            {filters.selectedMaterials && filters.selectedMaterials.map(mat => (
              <span key={mat} className="inline-flex items-center gap-1 px-2.5 py-1 min-h-[44px] rounded-lg text-[10px] font-bold bg-[#30001A]/10 text-[#30001A] dark:bg-rose-400/20 dark:text-rose-200 border border-[#30001A]/20 dark:border-rose-300/30">
                <Scissors size={11} className="text-amber-500" />
                <span>{mat}</span>
                <button 
                  onClick={() => onFilterChange({ ...filters, selectedMaterials: filters.selectedMaterials.filter(m => m !== mat) })}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center -my-3 -mr-2 rtl:-mr-0 rtl:-ml-2 hover:text-rose-500 cursor-pointer ml-1 rtl:mr-1 rtl:ml-0"
                  aria-label={`Remove material ${mat} filter`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}

            {/* Selected Fits Tags */}
            {filters.selectedFits && filters.selectedFits.map(fit => (
              <span key={fit} className="inline-flex items-center gap-1 px-2.5 py-1 min-h-[44px] rounded-lg text-[10px] font-bold bg-[#30001A]/10 text-[#30001A] dark:bg-rose-400/20 dark:text-rose-200 border border-[#30001A]/20 dark:border-rose-300/30">
                <ShieldCheck size={11} className="text-amber-500" />
                <span>{fit}</span>
                <button 
                  onClick={() => onFilterChange({ ...filters, selectedFits: filters.selectedFits.filter(f => f !== fit) })}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center -my-3 -mr-2 rtl:-mr-0 rtl:-ml-2 hover:text-rose-500 cursor-pointer ml-1 rtl:mr-1 rtl:ml-0"
                  aria-label={`Remove fit ${fit} filter`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}

            {/* Selected Brands Tags */}
            {filters.selectedBrands && filters.selectedBrands.map(brand => (
              <span key={brand} className="inline-flex items-center gap-1 px-2.5 py-1 min-h-[44px] rounded-lg text-[10px] font-bold bg-[#30001A]/10 text-[#30001A] dark:bg-rose-400/20 dark:text-rose-200 border border-[#30001A]/20 dark:border-rose-300/30">
                <span>{brand}</span>
                <button 
                  onClick={() => onFilterChange({ ...filters, selectedBrands: filters.selectedBrands.filter(b => b !== brand) })}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center -my-3 -mr-2 rtl:-mr-0 rtl:-ml-2 hover:text-rose-500 cursor-pointer ml-1 rtl:mr-1 rtl:ml-0"
                  aria-label={`Remove brand ${brand} filter`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}

            {/* Availability Tag */}
            {filters.availability && filters.availability !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 min-h-[44px] rounded-lg text-[10px] font-bold bg-[#30001A]/10 text-[#30001A] dark:bg-rose-400/20 dark:text-rose-200 border border-[#30001A]/20 dark:border-rose-300/30">
                <PackageCheck size={11} className="text-amber-500" />
                <span>
                  {filters.availability === 'in-stock' ? (isRTL ? 'المتوفر بالمخزون' : 'In Stock Only') :
                   filters.availability === 'pre-order' ? (isRTL ? 'حجز مسبق' : 'Pre-Order') : (isRTL ? 'تخفيضات' : 'On Sale')}
                </span>
                <button 
                  onClick={() => onFilterChange({ ...filters, availability: 'all' })}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center -my-3 -mr-2 rtl:-mr-0 rtl:-ml-2 hover:text-rose-500 cursor-pointer ml-1 rtl:mr-1 rtl:ml-0"
                  aria-label="Remove availability filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {/* Rating Tag */}
            {filters.minRating !== '' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 min-h-[44px] rounded-lg text-[10px] font-bold bg-[#30001A]/10 text-[#30001A] dark:bg-rose-400/20 dark:text-rose-200 border border-[#30001A]/20 dark:border-rose-300/30">
                <Star size={11} className="text-amber-500 fill-amber-500" />
                <span>{filters.minRating}+ Stars</span>
                <button 
                  onClick={() => onFilterChange({ ...filters, minRating: '' })}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center -my-3 -mr-2 rtl:-mr-0 rtl:-ml-2 hover:text-rose-500 cursor-pointer ml-1 rtl:mr-1 rtl:ml-0"
                  aria-label="Remove rating filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {/* Discount Tag */}
            {filters.minDiscount !== '' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 min-h-[44px] rounded-lg text-[10px] font-bold bg-[#30001A]/10 text-[#30001A] dark:bg-rose-400/20 dark:text-rose-200 border border-[#30001A]/20 dark:border-rose-300/30">
                <Percent size={11} className="text-amber-500" />
                <span>{filters.minDiscount}%+ Off</span>
                <button 
                  onClick={() => onFilterChange({ ...filters, minDiscount: '' })}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center -my-3 -mr-2 rtl:-mr-0 rtl:-ml-2 hover:text-rose-500 cursor-pointer ml-1 rtl:mr-1 rtl:ml-0"
                  aria-label="Remove discount filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {/* Clear All Button */}
            <button
              type="button"
              onClick={handleReset}
              className="text-[10px] font-bold uppercase luxury-tracking text-rose-600 dark:text-rose-400 hover:underline cursor-pointer ml-auto rtl:mr-auto rtl:ml-0 flex items-center gap-1 min-h-[44px] px-2"
            >
              <RotateCcw size={11} />
              <span>{isRTL ? 'إعادة ضبط الكل' : 'Clear All'}</span>
            </button>
          </div>
        )}
      </div>

      {/* LUXURY FILTER DRAWER */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onFilterChange={onFilterChange}
        onResetFilters={onResetFilters}
        allProducts={allProducts}
        lang={lang}
      />
    </div>
  );
}
