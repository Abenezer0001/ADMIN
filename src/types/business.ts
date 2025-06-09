export interface BusinessContactInfo {
  email: string;
  phone?: string;
  address?: string;

}


export interface BusinessSettings {
  multiRestaurant?: boolean;
  allowStaffManagement?: boolean;
  requireApprovalForNewStaff?: boolean;
  defaultCurrency?: string;
  defaultTimezone?: string;
}

export interface Business {
  _id: string;
  name: string;
  legalName?: string;
  registrationNumber?: string;
  contactInfo: BusinessContactInfo;
  ownerId: string | {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  owner?: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  isActive: boolean;
  settings?: BusinessSettings;
  restaurantCount?: number;
  restaurants?: {
    _id: string;
    name: string;
    businessId: string;
  }[];
  createdAt: string;
  updatedAt: string;
  
}

export interface CreateBusinessData {
  name: string;
  legalName?: string;
  registrationNumber?: string;
  contactInfo: BusinessContactInfo;
  ownerEmail: string;
  settings?: BusinessSettings;
}

export interface UpdateBusinessData {
  name?: string;
  legalName?: string;
  registrationNumber?: string;
  contactInfo?: BusinessContactInfo;
  settings?: BusinessSettings;
}

export interface BusinessListResponse {
  businesses: Business[];
  count: number;
}

export interface BusinessResponse {
  business: Business;
  message?: string;
}

// Currency options
export const CURRENCY_OPTIONS = [
  { value: 'SAR', label: 'Saudi Riyal (SAR)' },
  { value: 'AED', label: 'UAE Dirham (AED)' },
  { value: 'USD', label: 'US Dollar (USD)' }
];

// Timezone options
export const TIMEZONE_OPTIONS = [
  { value: 'Asia/Riyadh', label: 'Asia/Riyadh (Saudi Arabia)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (UAE)' },
  { value: 'America/New_York', label: 'America/New_York (EST)' },
  { value: 'Europe/London', label: 'Europe/London (GMT)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST)' }
]; 