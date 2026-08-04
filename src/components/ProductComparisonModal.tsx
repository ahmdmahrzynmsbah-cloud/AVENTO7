import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ArrowLeftRight, 
  Trash2, 
  Plus, 
  Check, 
  Star, 
  ShoppingBag, 
  Tag, 
  Sparkles, 
  ShieldCheck, 
  Eye, 
  DollarSign, 
  Ruler, 
  Palette, 
  Scissors, 
  PackageCheck, 
  Info,
  SlidersHorizontal,
  Layers,
  ChevronRight,
  Search
} from 'lucide-react';
import { Product, User } from '../types';

interface ProductComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  comparedProducts: Product[];
  allProducts: Product[];
  onRemoveProduct: (id: string) => void;
  onAddProduct: (product: Product) => void;
  onClearAll: () => void;
  onAddToCart: (product: Product, size: string, quantity: number) => void;
  onViewProduct: (product: Product) => void;
  currentUser?: User | null;
  onViewAdmin?: () => void;
  lang?: 'en' | 'ar';
}

export default function ProductComparisonModal({
  isOpen,
  onClose,
  comparedProducts,
  allProducts,
  onRemoveProduct,
  onAddProduct,
  onClearAll,
  onAddToCart,
  onViewProduct,
  lang = 'en'
}: ProductComparisonModalProps) {
  const [highlightDifferences, setHighlightDifferences] = useState<boolean>(false);
  const [isAddPickerOpen, setIsAddPickerOpen] = useState<boolean>(false);
  const [pickerSearch, setPickerSearch] = useState<string>('');
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});

  const isRTL = lang === 'ar';

  if (!isOpen) return null;

  // Available products in catalog that aren't already compared
  const availableToCompare = allProducts.filter(
    p => !comparedProducts.some(cp => cp.id === p.id) &&
    (pickerSearch.trim() === '' || 
     p.name.toLowerCase().includes(pickerSearch.toLowerCase()) || 
     (p.category && p.category.toLowerCase().includes(pickerSearch.toLowerCase())) ||
     (p.colorName && p.colorName.toLowerCase().includes(pickerSearch.toLowerCase())))
  );

  // Find lowest price item
  const lowestPrice = comparedProducts.length > 0
    ? Math.min(...comparedProducts.map(p => p.price))
    : 0;

  // Find highest rating item
  const highestRating = comparedProducts.length > 0
    ? Math.max(...comparedProducts.map(p => p.rating || 0))
    : 0;

  // Helper function to check if row values differ across compared items
  const checkRowDiffers = (getValue: (p: Product) => string | number | boolean | undefined) => {
    if (comparedProducts.length < 2) return false;
    const values = comparedProducts.map(getValue);
    return !values.every(v => JSON.stringify(v) === JSON.stringify(values[0]));
  };

  const isPriceDiff = checkRowDiffers(p => p.price);
  const isSizesDiff = checkRowDiffers(p => (p.sizes || []).sort().join(','));
  const isColorDiff = checkRowDiffers(p => p.colorName);
  const isMaterialDiff = checkRowDiffers(p => p.material);
  const isFitDiff = checkRowDiffers(p => p.fit);
  const isRatingDiff = checkRowDiffers(p => p.rating);
  const isAvailabilityDiff = checkRowDiffers(p => p.isSoldOut ? 'Sold Out' : p.isPreOrder ? 'Pre-Order' : 'In Stock');

  const handleSizeSelect = (productId: string, size: string) => {
    setSelectedSizes(prev => ({ ...prev, [productId]: size }));
  };

  const handleQuickAddToCart = (product: Product) => {
    const chosenSize = selectedSizes[product.id] || product.sizes?.[0] || 'M';
    onAddToCart(product, chosenSize, 1);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn">
        
        {/* Main Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-7xl max-h-[92vh] bg-white dark:bg-[#0c060a] border border-black/10 dark:border-white/15 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* TOP BAR / HEADER */}
          <div className="sticky top-0 z-30 bg-white/95 dark:bg-[#0c060a]/95 backdrop-blur-md px-4 sm:px-8 py-4 border-b border-black/10 dark:border-white/10 flex flex-wrap items-center justify-between gap-4">
            
            {/* Title & Counter */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#30001A] text-amber-300 dark:bg-rose-300 dark:text-[#30001A] flex items-center justify-center shadow-md shrink-0">
                <ArrowLeftRight size={20} />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-black uppercase luxury-tracking tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                  <span>{isRTL ? 'مقارنة المنتجات' : 'Product Comparison'}</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-400 text-zinc-950">
                    {comparedProducts.length} / 4
                  </span>
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {isRTL ? 'قارن بين المواصفات والأسعار والمقاسات جنباً إلى جنب' : 'Side-by-side spec, size, and price breakdown'}
                </p>
              </div>
            </div>

            {/* Controls Row */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              
              {/* Highlight Differences Toggle */}
              {comparedProducts.length >= 2 && (
                <button
                  type="button"
                  onClick={() => setHighlightDifferences(!highlightDifferences)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold uppercase luxury-tracking flex items-center gap-2 border transition-all cursor-pointer min-h-[40px] ${
                    highlightDifferences
                      ? 'bg-amber-400 text-zinc-950 border-amber-400 shadow-sm font-extrabold'
                      : 'bg-zinc-100 text-zinc-700 border-black/10 hover:bg-zinc-200 dark:bg-white/10 dark:text-zinc-300 dark:border-white/10'
                  }`}
                >
                  <Sparkles size={14} className={highlightDifferences ? 'text-zinc-950 animate-pulse' : 'text-amber-500'} />
                  <span>{isRTL ? 'تظليل الاختلافات' : 'Highlight Differences'}</span>
                </button>
              )}

              {/* Add Product Button */}
              {comparedProducts.length < 4 && (
                <button
                  type="button"
                  onClick={() => setIsAddPickerOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#30001A] text-white dark:bg-rose-300 dark:text-[#30001A] hover:opacity-90 text-xs font-bold uppercase luxury-tracking flex items-center gap-1.5 transition-all cursor-pointer shadow-md min-h-[40px]"
                >
                  <Plus size={16} />
                  <span>{isRTL ? 'إضافة منتج' : 'Add Item'}</span>
                </button>
              )}

              {/* Clear All Button */}
              {comparedProducts.length > 0 && (
                <button
                  type="button"
                  onClick={onClearAll}
                  className="px-3 py-2 rounded-xl text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 hover:bg-rose-500/10 text-xs font-bold uppercase luxury-tracking flex items-center gap-1.5 transition-colors cursor-pointer min-h-[40px]"
                  title={isRTL ? 'إزالة كل المنتجات' : 'Clear all products'}
                >
                  <Trash2 size={15} />
                  <span className="hidden sm:inline">{isRTL ? 'مسح' : 'Clear'}</span>
                </button>
              )}

              {/* Close Modal Button */}
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
                aria-label="Close comparison view"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* MAIN COMPARISON CONTENT BODY */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
            
            {/* EMPTY STATE */}
            {comparedProducts.length === 0 ? (
              <div className="py-16 px-4 text-center max-w-md mx-auto flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-500 flex items-center justify-center mb-4">
                  <ArrowLeftRight size={36} />
                </div>
                <h3 className="text-xl font-bold uppercase luxury-tracking text-zinc-900 dark:text-white mb-2">
                  {isRTL ? 'لم يتم اختيار منتجات للمقارنة' : 'No Products Selected for Comparison'}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
                  {isRTL 
                    ? 'اختر حتى 4 منتجات من تشكيلة افينتو 7 لمقارنة الأسعار والمواد والألوان والمقاسات جنبًا إلى جنب.'
                    : 'Select up to 4 products from the AVENTO7 collection to compare prices, fabrics, colors, and fit side-by-side.'}
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddPickerOpen(true)}
                  className="px-6 py-3 rounded-2xl bg-[#30001A] text-white dark:bg-rose-300 dark:text-[#30001A] font-bold uppercase text-xs luxury-tracking flex items-center gap-2 hover:opacity-90 shadow-xl cursor-pointer"
                >
                  <Plus size={16} />
                  <span>{isRTL ? 'اختر منتجات للمقارنة' : 'Browse Catalog & Add Items'}</span>
                </button>
              </div>
            ) : (
              
              /* SIDE BY SIDE MATRIX TABLE */
              <div className="w-full overflow-x-auto pb-4">
                <table className="w-full min-w-[700px] border-collapse text-left rtl:text-right">
                  
                  {/* HEADER ROW: PRODUCT CARDS */}
                  <thead>
                    <tr>
                      {/* Attribute Label Column Header */}
                      <th className="w-48 p-3 bg-zinc-100/80 dark:bg-white/5 rounded-2xl align-bottom border-b border-black/10 dark:border-white/10">
                        <div className="text-xs font-mono font-extrabold text-zinc-400 uppercase tracking-widest pb-1">
                          {isRTL ? 'المواصفات' : 'ATTRIBUTES'}
                        </div>
                      </th>

                      {/* Product Columns */}
                      {comparedProducts.map((product) => {
                        const isCheapest = product.price === lowestPrice && comparedProducts.length > 1;
                        const isTopRated = (product.rating || 0) === highestRating && highestRating > 0 && comparedProducts.length > 1;

                        return (
                          <th key={product.id} className="p-3 align-top min-w-[220px] max-w-[280px]">
                            <div className="relative group bg-zinc-50 dark:bg-[#120810] border border-black/10 dark:border-white/10 rounded-2xl p-3 flex flex-col h-full hover:border-amber-500/50 transition-all shadow-sm">
                              
                              {/* Remove Button */}
                              <button
                                type="button"
                                onClick={() => onRemoveProduct(product.id)}
                                className="absolute top-2 right-2 rtl:right-auto rtl:left-2 z-20 w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center hover:bg-rose-700 transition-colors shadow-md cursor-pointer"
                                aria-label={`Remove ${product.name} from comparison`}
                              >
                                <X size={14} />
                              </button>

                              {/* Image Container */}
                              <div 
                                className="relative aspect-[3/4] rounded-xl overflow-hidden bg-zinc-200 dark:bg-black/40 mb-3 cursor-pointer group/img"
                                onClick={() => onViewProduct(product)}
                              >
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                                  referrerPolicy="no-referrer"
                                />

                                {/* Best Value / Top Rated Badge Overlays */}
                                {isCheapest && (
                                  <div className="absolute top-2 left-2 z-10 bg-amber-400 text-zinc-950 font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md shadow-md flex items-center gap-1">
                                    <Sparkles size={10} />
                                    <span>{isRTL ? 'أقل سعر' : 'Best Price'}</span>
                                  </div>
                                )}

                                {isTopRated && !isCheapest && (
                                  <div className="absolute top-2 left-2 z-10 bg-rose-300 text-[#30001A] font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md shadow-md flex items-center gap-1">
                                    <Star size={10} className="fill-[#30001A]" />
                                    <span>{isRTL ? 'الأعلى تقييماً' : 'Top Rated'}</span>
                                  </div>
                                )}

                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white">
                                  <span className="px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md text-[10px] font-bold uppercase luxury-tracking flex items-center gap-1">
                                    <Eye size={12} />
                                    {isRTL ? 'عرض' : 'Quick View'}
                                  </span>
                                </div>
                              </div>

                              {/* Title & Category */}
                              <span className="text-[10px] font-bold uppercase luxury-tracking text-amber-600 dark:text-amber-400 mb-0.5">
                                {product.gender || 'UNISEX'} • {product.category}
                              </span>
                              <h3 
                                onClick={() => onViewProduct(product)}
                                className="text-sm font-bold uppercase luxury-tracking text-zinc-900 dark:text-white line-clamp-2 hover:text-amber-600 dark:hover:text-rose-300 cursor-pointer transition-colors mb-2"
                              >
                                {isRTL && product.nameAr ? product.nameAr : product.name}
                              </h3>

                              {/* Price */}
                              <div className="mt-auto pt-2 border-t border-black/5 dark:border-white/10 flex items-baseline gap-2">
                                <span className="text-base font-mono font-black text-zinc-900 dark:text-white">
                                  {product.price.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}
                                </span>
                                {product.originalPrice && product.originalPrice > product.price && (
                                  <span className="text-xs font-mono text-zinc-400 line-through">
                                    {product.originalPrice.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </th>
                        );
                      })}

                      {/* Empty Slots Columns to reach 4 if applicable */}
                      {Array.from({ length: 4 - comparedProducts.length }).map((_, idx) => (
                        <th key={`slot-${idx}`} className="p-3 align-top min-w-[200px]">
                          <button
                            type="button"
                            onClick={() => setIsAddPickerOpen(true)}
                            className="w-full h-full min-h-[320px] rounded-2xl border-2 border-dashed border-black/15 dark:border-white/15 bg-zinc-50/50 dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 flex flex-col items-center justify-center gap-3 text-zinc-400 hover:text-amber-500 transition-all cursor-pointer p-6 text-center group"
                          >
                            <div className="w-12 h-12 rounded-full border border-black/10 dark:border-white/10 group-hover:border-amber-500 flex items-center justify-center group-hover:scale-110 transition-all">
                              <Plus size={24} />
                            </div>
                            <span className="text-xs font-bold uppercase luxury-tracking">
                              {isRTL ? 'إضافة منتج آخر' : 'Add Item to Compare'}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-normal">
                              {isRTL ? 'متبقي ' + (4 - comparedProducts.length) : (4 - comparedProducts.length) + ' slots remaining'}
                            </span>
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  {/* MATRIX DATA ROWS */}
                  <tbody className="divide-y divide-black/10 dark:divide-white/10 text-xs">
                    
                    {/* ROW 1: PRICE & DISCOUNT */}
                    <tr className={highlightDifferences && isPriceDiff ? 'bg-amber-400/10 dark:bg-amber-400/15' : ''}>
                      <td className="p-3.5 font-bold uppercase luxury-tracking text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-white/5 flex items-center gap-2">
                        <DollarSign size={14} className="text-amber-500" />
                        <span>{isRTL ? 'السعر والخصم' : 'Price & Value'}</span>
                      </td>
                      {comparedProducts.map((p) => {
                        const discount = p.discountPercentage || 
                          (p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0);
                        
                        return (
                          <td key={p.id} className="p-3.5 font-mono">
                            <div className="font-extrabold text-sm text-zinc-900 dark:text-white">
                              {p.price.toLocaleString()} EGP
                            </div>
                            {discount > 0 ? (
                              <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                                <Tag size={10} />
                                <span>{discount}% OFF</span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-zinc-400 block mt-0.5">Regular Price</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>

                    {/* ROW 2: SIZES AVAILABLE */}
                    <tr className={highlightDifferences && isSizesDiff ? 'bg-amber-400/10 dark:bg-amber-400/15' : ''}>
                      <td className="p-3.5 font-bold uppercase luxury-tracking text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-white/5 flex items-center gap-2">
                        <Ruler size={14} className="text-amber-500" />
                        <span>{isRTL ? 'المقاسات المتاحة' : 'Sizes Available'}</span>
                      </td>
                      {comparedProducts.map((p) => (
                        <td key={p.id} className="p-3.5">
                          <div className="flex flex-wrap gap-1">
                            {p.sizes && p.sizes.length > 0 ? (
                              p.sizes.map((s) => (
                                <span 
                                  key={s} 
                                  className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-zinc-200 dark:bg-white/15 text-zinc-800 dark:text-zinc-200 border border-black/5 dark:border-white/10"
                                >
                                  {s}
                                </span>
                              ))
                            ) : (
                              <span className="text-zinc-400 italic">One Size / Standard</span>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* ROW 3: COLOR */}
                    <tr className={highlightDifferences && isColorDiff ? 'bg-amber-400/10 dark:bg-amber-400/15' : ''}>
                      <td className="p-3.5 font-bold uppercase luxury-tracking text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-white/5 flex items-center gap-2">
                        <Palette size={14} className="text-amber-500" />
                        <span>{isRTL ? 'اللون' : 'Color'}</span>
                      </td>
                      {comparedProducts.map((p) => (
                        <td key={p.id} className="p-3.5">
                          <div className="flex items-center gap-2">
                            <span 
                              className="w-4 h-4 rounded-full border border-black/20 dark:border-white/20 shadow-xs shrink-0" 
                              style={{ backgroundColor: p.colorHex || '#111' }} 
                            />
                            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                              {p.colorName || 'Classic Black'}
                            </span>
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* ROW 4: MATERIAL & FABRIC */}
                    <tr className={highlightDifferences && isMaterialDiff ? 'bg-amber-400/10 dark:bg-amber-400/15' : ''}>
                      <td className="p-3.5 font-bold uppercase luxury-tracking text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-white/5 flex items-center gap-2">
                        <Scissors size={14} className="text-amber-500" />
                        <span>{isRTL ? 'الخامة والقماش' : 'Material & Fabric'}</span>
                      </td>
                      {comparedProducts.map((p) => (
                        <td key={p.id} className="p-3.5 font-medium text-zinc-800 dark:text-zinc-200">
                          {p.material || '100% Premium Egyptian Cotton'}
                        </td>
                      ))}
                    </tr>

                    {/* ROW 5: FIT & SILHOUETTE */}
                    <tr className={highlightDifferences && isFitDiff ? 'bg-amber-400/10 dark:bg-amber-400/15' : ''}>
                      <td className="p-3.5 font-bold uppercase luxury-tracking text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-white/5 flex items-center gap-2">
                        <ShieldCheck size={14} className="text-amber-500" />
                        <span>{isRTL ? 'قصة المنتج' : 'Fit & Silhouette'}</span>
                      </td>
                      {comparedProducts.map((p) => (
                        <td key={p.id} className="p-3.5 font-medium text-zinc-800 dark:text-zinc-200">
                          {p.fit || 'Relaxed Oversized Fit'}
                        </td>
                      ))}
                    </tr>

                    {/* ROW 6: RATING & REVIEWS */}
                    <tr className={highlightDifferences && isRatingDiff ? 'bg-amber-400/10 dark:bg-amber-400/15' : ''}>
                      <td className="p-3.5 font-bold uppercase luxury-tracking text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-white/5 flex items-center gap-2">
                        <Star size={14} className="text-amber-500 fill-amber-500" />
                        <span>{isRTL ? 'التقييم' : 'Customer Rating'}</span>
                      </td>
                      {comparedProducts.map((p) => (
                        <td key={p.id} className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            <div className="flex text-amber-400">
                              <Star size={14} className="fill-amber-400" />
                            </div>
                            <span className="font-bold text-zinc-900 dark:text-white">
                              {p.rating ? p.rating.toFixed(1) : '4.9'}
                            </span>
                            <span className="text-zinc-400 text-[10px]">
                              ({p.reviews || 24} {isRTL ? 'تقييم' : 'reviews'})
                            </span>
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* ROW 7: AVAILABILITY / STOCK */}
                    <tr className={highlightDifferences && isAvailabilityDiff ? 'bg-amber-400/10 dark:bg-amber-400/15' : ''}>
                      <td className="p-3.5 font-bold uppercase luxury-tracking text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-white/5 flex items-center gap-2">
                        <PackageCheck size={14} className="text-amber-500" />
                        <span>{isRTL ? 'حالة التوفر' : 'Availability'}</span>
                      </td>
                      {comparedProducts.map((p) => (
                        <td key={p.id} className="p-3.5">
                          {p.isSoldOut ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-rose-500/15 text-rose-500 border border-rose-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              {isRTL ? 'غير متوفر' : 'Sold Out'}
                            </span>
                          ) : p.isPreOrder ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              {isRTL ? 'حجز مسبق' : 'Pre-Order'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <Check size={12} />
                              {isRTL ? 'متوفر بالمخزون' : 'In Stock'}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>

                    {/* ROW 8: FEATURES / HIGHLIGHTS */}
                    <tr>
                      <td className="p-3.5 font-bold uppercase luxury-tracking text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-white/5 flex items-center gap-2">
                        <Info size={14} className="text-amber-500" />
                        <span>{isRTL ? 'المميزات' : 'Key Highlights'}</span>
                      </td>
                      {comparedProducts.map((p) => (
                        <td key={p.id} className="p-3.5">
                          <ul className="space-y-1 text-[11px] text-zinc-600 dark:text-zinc-300">
                            {p.isNew && (
                              <li className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                                <Sparkles size={11} />
                                {isRTL ? 'من التشكيلة الجديدة' : 'New Season Release'}
                              </li>
                            )}
                            {p.collectionName && (
                              <li className="flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-amber-400" />
                                Collection: {p.collectionName}
                              </li>
                            )}
                            <li className="flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-amber-400" />
                              Pre-shrunk & Color-fast
                            </li>
                            <li className="flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-amber-400" />
                              Signature AVENTO7 Hardware
                            </li>
                          </ul>
                        </td>
                      ))}
                    </tr>

                    {/* ROW 9: QUICK ADD TO CART ACTION */}
                    <tr className="bg-zinc-50/50 dark:bg-white/5">
                      <td className="p-3.5 font-bold uppercase luxury-tracking text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-white/10 flex items-center gap-2">
                        <ShoppingBag size={14} className="text-amber-500" />
                        <span>{isRTL ? 'إضافة للسلة' : 'Action'}</span>
                      </td>
                      {comparedProducts.map((p) => {
                        const currentChosenSize = selectedSizes[p.id] || p.sizes?.[0] || 'M';

                        return (
                          <td key={p.id} className="p-3.5">
                            <div className="flex flex-col gap-2">
                              {/* Size Selector */}
                              {p.sizes && p.sizes.length > 0 && !p.isSoldOut && (
                                <select
                                  value={currentChosenSize}
                                  onChange={(e) => handleSizeSelect(p.id, e.target.value)}
                                  className="w-full bg-white dark:bg-[#180a14] border border-black/10 dark:border-white/15 rounded-lg px-2 py-1.5 text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
                                >
                                  {p.sizes.map((s) => (
                                    <option key={s} value={s}>
                                      {isRTL ? `المقاس: ${s}` : `Size: ${s}`}
                                    </option>
                                  ))}
                                </select>
                              )}

                              {/* Add to Cart Button */}
                              <button
                                type="button"
                                disabled={p.isSoldOut}
                                onClick={() => handleQuickAddToCart(p)}
                                className={`w-full py-2.5 px-3 rounded-xl font-bold uppercase text-[10px] luxury-tracking flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md min-h-[38px] ${
                                  p.isSoldOut
                                    ? 'bg-zinc-200 text-zinc-400 dark:bg-white/10 dark:text-zinc-500 cursor-not-allowed'
                                    : 'bg-[#30001A] text-white hover:bg-[#1d0010] dark:bg-rose-300 dark:text-[#30001A] hover:opacity-90 active:scale-95'
                                }`}
                              >
                                <ShoppingBag size={13} />
                                <span>{p.isSoldOut ? (isRTL ? 'نفذت الكمية' : 'Sold Out') : (isRTL ? 'أضف للسلة' : 'Add to Cart')}</span>
                              </button>
                            </div>
                          </td>
                        );
                      })}
                    </tr>

                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>

        {/* QUICK ADD PRODUCT SELECTION DRAWER / POPOVER OVERLAY */}
        <AnimatePresence>
          {isAddPickerOpen && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-xl bg-white dark:bg-[#120610] border border-black/10 dark:border-white/15 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[85vh]"
              >
                {/* Picker Header */}
                <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10 mb-4">
                  <div>
                    <h3 className="text-base font-bold uppercase luxury-tracking text-zinc-900 dark:text-white">
                      {isRTL ? 'اختر منتجاً للمقارنة' : 'Select Product to Compare'}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {isRTL ? 'اختر من الكتالوج لإضافته لجدول المقارنة' : 'Choose a product from your catalog'}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAddPickerOpen(false)}
                    className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative mb-4">
                  <input
                    type="text"
                    value={pickerSearch}
                    onChange={(e) => setPickerSearch(e.target.value)}
                    placeholder={isRTL ? 'ابحث باسم المنتج أو اللون...' : 'Search product name, category or color...'}
                    className="w-full h-10 bg-zinc-100 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 pl-9 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                  <Search size={15} className="absolute left-3 top-3 text-zinc-400 pointer-events-none" />
                </div>

                {/* Products List */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {availableToCompare.length === 0 ? (
                    <div className="py-8 text-center text-zinc-400 text-xs">
                      {isRTL ? 'لا توجد منتجات مطابقة للبحث' : 'No available products match search'}
                    </div>
                  ) : (
                    availableToCompare.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          onAddProduct(item);
                          setIsAddPickerOpen(false);
                          setPickerSearch('');
                        }}
                        className="flex items-center justify-between p-2.5 rounded-2xl bg-zinc-50 dark:bg-white/5 hover:bg-amber-400/10 border border-black/5 dark:border-white/5 hover:border-amber-500/50 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-14 object-cover rounded-xl border border-black/5 dark:border-white/10"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="text-[9px] font-bold uppercase luxury-tracking text-amber-500 block">
                              {item.gender} • {item.category}
                            </span>
                            <h4 className="text-xs font-bold text-zinc-900 dark:text-white group-hover:text-amber-500 transition-colors">
                              {isRTL && item.nameAr ? item.nameAr : item.name}
                            </h4>
                            <span className="text-xs font-mono font-black text-zinc-700 dark:text-zinc-300">
                              {item.price.toLocaleString()} EGP
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-xl bg-[#30001A] text-white dark:bg-rose-300 dark:text-[#30001A] text-[10px] font-bold uppercase luxury-tracking flex items-center gap-1 shadow-xs group-hover:scale-105 transition-transform"
                        >
                          <Plus size={12} />
                          <span>{isRTL ? 'إضافة' : 'Select'}</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </AnimatePresence>
  );
}
