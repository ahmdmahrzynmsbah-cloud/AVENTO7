export interface Governorate {
  id: string;
  nameAr: string;
  nameEn: string;
  defaultPrice: number;
}

export const EGYPT_GOVERNORATES: Governorate[] = [
  { id: 'cairo', nameAr: 'القاهرة', nameEn: 'Cairo', defaultPrice: 50 },
  { id: 'giza', nameAr: 'الجيزة', nameEn: 'Giza', defaultPrice: 50 },
  { id: 'alexandria', nameAr: 'الإسكندرية', nameEn: 'Alexandria', defaultPrice: 60 },
  { id: 'qalyubia', nameAr: 'القليوبية', nameEn: 'Qalyubia', defaultPrice: 55 },
  { id: 'sharqia', nameAr: 'الشرقية', nameEn: 'Sharqia', defaultPrice: 65 },
  { id: 'dakahlia', nameAr: 'الدقهلية', nameEn: 'Dakahlia', defaultPrice: 65 },
  { id: 'monufia', nameAr: 'المنوفية', nameEn: 'Monufia', defaultPrice: 60 },
  { id: 'gharbia', nameAr: 'الغربية', nameEn: 'Gharbia', defaultPrice: 60 },
  { id: 'kafr_el_sheikh', nameAr: 'كفر الشيخ', nameEn: 'Kafr El Sheikh', defaultPrice: 65 },
  { id: 'beheira', nameAr: 'البحيرة', nameEn: 'Beheira', defaultPrice: 65 },
  { id: 'damietta', nameAr: 'دمياط', nameEn: 'Damietta', defaultPrice: 70 },
  { id: 'port_said', nameAr: 'بورسعيد', nameEn: 'Port Said', defaultPrice: 70 },
  { id: 'ismailia', nameAr: 'الإسماعيلية', nameEn: 'Ismailia', defaultPrice: 65 },
  { id: 'suez', nameAr: 'السويس', nameEn: 'Suez', defaultPrice: 65 },
  { id: 'faiyum', nameAr: 'الفيوم', nameEn: 'Faiyum', defaultPrice: 70 },
  { id: 'beni_suef', nameAr: 'بني سويف', nameEn: 'Beni Suef', defaultPrice: 75 },
  { id: 'minya', nameAr: 'المنيا', nameEn: 'Minya', defaultPrice: 80 },
  { id: 'asyut', nameAr: 'أسيوط', nameEn: 'Asyut', defaultPrice: 85 },
  { id: 'sohag', nameAr: 'سوهاج', nameEn: 'Sohag', defaultPrice: 90 },
  { id: 'qena', nameAr: 'قنا', nameEn: 'Qena', defaultPrice: 95 },
  { id: 'luxor', nameAr: 'الأقصر', nameEn: 'Luxor', defaultPrice: 100 },
  { id: 'aswan', nameAr: 'أسوان', nameEn: 'Aswan', defaultPrice: 110 },
  { id: 'red_sea', nameAr: 'البحر الأحمر', nameEn: 'Red Sea', defaultPrice: 110 },
  { id: 'new_valley', nameAr: 'الوادي الجديد', nameEn: 'New Valley', defaultPrice: 120 },
  { id: 'matrouh', nameAr: 'مطروح', nameEn: 'Matrouh', defaultPrice: 100 },
  { id: 'north_sinai', nameAr: 'شمال سيناء', nameEn: 'North Sinai', defaultPrice: 120 },
  { id: 'south_sinai', nameAr: 'جنوب سيناء', nameEn: 'South Sinai', defaultPrice: 120 }
];

export function getDefaultShippingRates(): Record<string, number> {
  const rates: Record<string, number> = {};
  EGYPT_GOVERNORATES.forEach(gov => {
    rates[gov.nameAr] = gov.defaultPrice;
  });
  return rates;
}
