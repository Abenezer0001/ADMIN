interface Translations {
  [key: string]: {
    en: string;
    ar: string;
  };
}

export const menuTranslations: Translations = {
  // Overview
  'dashboard': { en: 'Dashboard', ar: 'لوحة التحكم' },
  'analytics': { en: 'Analytics', ar: 'التحليلات' },
  'analytics/menu-report': { en: 'Menu Report', ar: 'تقرير القائمة' },
  'analytics/order-performance': { en: 'Order Performance', ar: 'أداء الطلبات' },
  'analytics/customer-insight': { en: 'Customer Insight', ar: 'رؤى العملاء' },
  'sales': { en: 'Sales', ar: 'المبيعات' },
  
  // Business Management
  'business/list': { en: 'All Businesses', ar: 'جميع الأعمال' },
  'business/dashboard': { en: 'My Business', ar: 'عملي' },
  
  // Restaurant Management
  'restaurants/list': { en: 'Restaurants', ar: 'المطاعم' },
  'tables/list': { en: 'Tables', ar: 'الطاولات' },
  'venues/list': { en: 'Venues', ar: 'الأماكن' },
  'zones/list': { en: 'Zones', ar: 'المناطق' },
  'menu': { en: 'Menu & Categories', ar: 'القائمة والفئات' },
  'menu/items': { en: 'Menu Items', ar: 'عناصر القائمة' },
  'modifiers': { en: 'Modifiers', ar: 'المعدّلات' },
  'categories': { en: 'Categories', ar: 'الفئات' },
  'subcategories/list': { en: 'Sub-Categories', ar: 'الفئات الفرعية' },
  'subsubcategories/list': { en: 'Sub-Subcategories', ar: 'الفئات الفرعية الثانوية' },
  'menus/list': { en: 'Menus', ar: 'القوائم' },
  
  // Order Management
  'orders': { en: 'Orders', ar: 'الطلبات' },
  'orders/live': { en: 'Live Orders', ar: 'الطلبات المباشرة' },
  'orders/history': { en: 'Order History', ar: 'تاريخ الطلبات' },
  'invoices': { en: 'Invoices', ar: 'الفواتير' },
  'inventory': { en: 'Inventory Management', ar: 'إدارة المخزون' },
  'customers': { en: 'Customers', ar: 'العملاء' },
  'loyalty': { en: 'Loyalty Program', ar: 'برنامج الولاء' },
  'loyalty/analytics': { en: 'Loyalty Analytics', ar: 'تحليلات الولاء' },
  'loyalty/settings': { en: 'Loyalty Settings', ar: 'إعدادات الولاء' },
  
  // Rating Management
  'ratings': { en: 'Rating & Reviews', ar: 'التقييم والمراجعات' },
  'ratings/analytics': { en: 'Rating Analytics', ar: 'تحليلات التقييم' },
  'ratings/reviews': { en: 'Review Management', ar: 'إدارة المراجعات' },
  'ratings/menu-performance': { en: 'Menu Performance', ar: 'أداء القائمة' },
  'ratings/customer-insights': { en: 'Customer Insights', ar: 'رؤى العملاء' },
  
  // Staff Management
  'promotions': { en: 'Promotions', ar: 'العروض الترويجية' },
  'kitchen-management': { en: 'Kitchen Management', ar: 'إدارة المطبخ' },
  'cashier-management': { en: 'Cashier Management', ar: 'إدارة الكاشير' },
  'schedule-management': { en: 'Schedule Management', ar: 'إدارة الجدولة' },
  'group-ordering/dashboard': { en: 'Group Ordering', ar: 'الطلبات الجماعية' },
  'tipping/management': { en: 'Tipping Management', ar: 'إدارة البقشيش' },
  'payments/stripe-connect': { en: 'Stripe Connect', ar: 'ستريب كونكت' },
  
  // Settings & Administration
  'settings/admins': { en: 'Administrator Management', ar: 'إدارة المديرين' },
  'settings/rbac': { en: 'Access Control', ar: 'التحكم في الوصول' },
  'settings/system': { en: 'System Settings', ar: 'إعدادات النظام' },
  'settings/integration': { en: 'Integration', ar: 'التكامل' },
  'settings/notifications': { en: 'Notifications', ar: 'الإشعارات' },
  
  // Categories
  'overview': { en: 'Overview', ar: 'نظرة عامة' },
  'business-management': { en: 'Business Management', ar: 'إدارة الأعمال' },
  'restaurant-management': { en: 'Restaurant Management', ar: 'إدارة المطعم' },
  'order-management': { en: 'Order Management', ar: 'إدارة الطلبات' },
  'staff-management': { en: 'Staff Management', ar: 'إدارة الموظفين' },
  'settings-administration': { en: 'Settings & Administration', ar: 'الإعدادات والإدارة' }
};

export const getTranslation = (key: string, language: string = 'en'): string => {
  const translation = menuTranslations[key];
  if (!translation) return key;
  
  return translation[language] || translation.en || key;
};

export const getCategoryTranslation = (category: string, language: string = 'en'): string => {
  const categoryKey = category.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '');
  return getTranslation(categoryKey, language);
};