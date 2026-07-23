export interface SubService {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  icon: string;
  description: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  icon: string;
  description: string;
  hasSubOptions?: boolean;
  subOptions?: SubService[];
  hasDynamicField?: boolean;
  dynamicFieldLabel?: string;
  popular?: boolean;
  priceNote?: string;
}

export const carServices: ServiceItem[] = [
  { id: 'wheel-alignment', name: 'Wheel Alignment', price: 699, durationMinutes: 45, icon: '🔧', description: 'Precision alignment' },
  { id: 'car-service', name: 'General Service', price: 2499, durationMinutes: 120, icon: '⚙️', description: 'Complete health check', popular: true },
  {
    id: 'washing', name: 'Washing', price: 399, durationMinutes: 30, icon: '🧽', description: 'Choose wash type',
    hasSubOptions: true,
    subOptions: [
      { id: 'body-wash', name: 'Body Wash', price: 399, durationMinutes: 30, icon: '🚿', description: 'Exterior foam wash' },
      { id: 'full-car-wash', name: 'Full Car Wash', price: 699, durationMinutes: 45, icon: '💦', description: 'Interior + exterior' },
      { id: 'deep-interior-wash', name: 'Deep Interior Wash', price: 1299, durationMinutes: 60, icon: '✨', description: 'Deep shampoo' },
    ],
  },
  { id: 'interior-cleaning', name: 'Interior Cleaning', price: 1499, durationMinutes: 60, icon: '🧹', description: 'Dashboard & seats' },
  { id: 'ppf', name: 'PPF Coating', price: 4999, durationMinutes: 180, icon: '🛡️', description: 'Paint protection', hasDynamicField: true, dynamicFieldLabel: 'PPF Requirements' },
  { id: 'teflon', name: 'Teflon Coating', price: 1999, durationMinutes: 90, icon: '💎', description: 'Premium shine' },
  { id: 'anti-rust', name: 'Anti Rust', price: 2999, durationMinutes: 120, icon: '🔒', description: 'Underbody protection' },
  { id: 'decors', name: 'Decors', price: 0, durationMinutes: 60, icon: '🎨', description: 'Custom styling', hasDynamicField: true, dynamicFieldLabel: 'Decor Requirements', priceNote: 'Contact team for pricing' },
];

export const bikeServices: ServiceItem[] = [
  { id: 'bike-service', name: 'General Service', price: 1299, durationMinutes: 90, icon: '⚙️', description: 'Complete check', popular: true },
  {
    id: 'bike-washing', name: 'Washing', price: 299, durationMinutes: 25, icon: '🧽', description: 'Choose wash type',
    hasSubOptions: true,
    subOptions: [
      { id: 'full-bike-wash', name: 'Full Bike Wash', price: 399, durationMinutes: 30, icon: '💦', description: 'Complete wash' },
      { id: 'diesel-wash', name: 'Diesel Wash', price: 299, durationMinutes: 25, icon: '⛽', description: 'Degreaser wash' },
      { id: 'bike-anti-rust', name: 'Anti Rust', price: 499, durationMinutes: 30, icon: '🔒', description: 'Chain protection' },
    ],
  },
  { id: 'accessories', name: 'Accessories', price: 0, durationMinutes: 30, icon: '🎒', description: 'Custom gear', hasDynamicField: true, dynamicFieldLabel: 'Accessory Requirements', priceNote: 'Contact team' },
];

export const generateBookingCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'XC-';
  for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
};

export const formatDuration = (mins: number): string => {
  if (mins === 0) return '0 Min';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} Min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};