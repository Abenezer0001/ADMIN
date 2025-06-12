import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Business } from '../types/business';
import BusinessService from '../services/BusinessService';
import { useAuth } from './AuthContext';

interface BusinessContextType {
  // Business state
  currentBusiness: Business | null;
  businesses: Business[];
  isLoading: boolean;
  error: string | null;

  // Business operations
  loadCurrentBusiness: () => Promise<void>;
  loadAllBusinesses: () => Promise<void>;
  createBusiness: (businessData: any) => Promise<void>;
  updateBusiness: (businessId: string, updateData: any) => Promise<void>;
  deactivateBusiness: (businessId: string) => Promise<void>;
  activateBusiness: (businessId: string) => Promise<void>;
  // Helper functions
  isSuperAdmin: () => boolean;
  isBusinessOwner: () => boolean;
  canManageBusinesses: () => boolean;
  canViewBusiness: (businessId: string) => boolean;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

interface BusinessProviderProps {
  children: ReactNode;
}

export const BusinessProvider: React.FC<BusinessProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load current user's business
  const loadCurrentBusiness = async () => {
    // Check if user has businessId or is a restaurant admin
    if (!user || (!user.businessId && !isBusinessOwner())) {
      console.log('No business to load for user:', user?.email, 'businessId:', user?.businessId, 'isBusinessOwner:', isBusinessOwner());
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const businessService = BusinessService.getInstance();
      const business = await businessService.getMyBusiness();
      setCurrentBusiness(business);
      console.log('Loaded current business:', business.name);
    } catch (err: any) {
      console.error('Failed to load current business:', err);
      // Try to get business by ID if we have businessId
      if (user?.businessId) {
        try {
          const businessService = BusinessService.getInstance();
          const business = await businessService.getBusinessById(user.businessId);
          setCurrentBusiness(business);
          console.log('Loaded business by ID:', business.name);
        } catch (err2: any) {
          console.error('Failed to load business by ID:', err2);
          setError(err2.response?.data?.message || err.response?.data?.message || 'Failed to load business');
        }
      } else {
      setError(err.response?.data?.message || 'Failed to load business');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load all businesses (SuperAdmin only)
  const loadAllBusinesses = async () => {
    if (!isSuperAdmin()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const businessService = BusinessService.getInstance();
      const response = await businessService.getAllBusinesses();
      setBusinesses(response.businesses);
    } catch (err: any) {
      console.error('Failed to load businesses:', err);
      setError(err.response?.data?.message || 'Failed to load businesses');
    } finally {
      setIsLoading(false);
    }
  };

  // Create new business
  const createBusiness = async (businessData: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const businessService = BusinessService.getInstance();
      await businessService.createBusiness(businessData);
      await loadAllBusinesses(); // Refresh the list
    } catch (err: any) {
      console.error('Failed to create business:', err);
      setError(err.response?.data?.message || 'Failed to create business');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update business
  const updateBusiness = async (businessId: string, updateData: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const businessService = BusinessService.getInstance();
      await businessService.updateBusiness(businessId, updateData);
      
      // Update current business if it's the one being updated
      if (currentBusiness?._id === businessId) {
        await loadCurrentBusiness();
      }
      
      // Refresh businesses list if SuperAdmin
      if (isSuperAdmin()) {
        await loadAllBusinesses();
      }
    } catch (err: any) {
      console.error('Failed to update business:', err);
      setError(err.response?.data?.message || 'Failed to update business');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Deactivate business
  const deactivateBusiness = async (businessId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const businessService = BusinessService.getInstance();
      await businessService.deactivateBusiness(businessId);
      await loadAllBusinesses(); // Refresh the list
    } catch (err: any) {
      console.error('Failed to deactivate business:', err);
      setError(err.response?.data?.message || 'Failed to deactivate business');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Activate business
  const activateBusiness = async (businessId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const businessService = BusinessService.getInstance();
      await businessService.activateBusiness(businessId);
      await loadAllBusinesses(); // Refresh the list
    } catch (err: any) {
      console.error('Failed to activate business:', err);
      setError(err.response?.data?.message || 'Failed to activate business');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions
  const isSuperAdmin = () => {
    return user?.role === 'system_admin' || user?.roles?.some((role: any) => 
      typeof role === 'string' ? role === 'system_admin' : role.name === 'system_admin'
    );
  };

  const isBusinessOwner = () => {
    return user?.role === 'restaurant_admin' || user?.roles?.some((role: any) => 
      typeof role === 'string' ? role === 'restaurant_admin' : role.name === 'restaurant_admin'
    );
  };

  const canManageBusinesses = () => {
    return isSuperAdmin();
  };

  const canViewBusiness = (businessId: string) => {
    return isSuperAdmin() || user?.businessId === businessId;
  };

  // Load initial data when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('User changed, loading business data for:', user.email, 'businessId:', user.businessId, 'role:', user.role);
      
      // Load current business for restaurant admins or users with businessId
      if (isBusinessOwner() || user.businessId) {
        loadCurrentBusiness();
      }
      
      // Load all businesses for super admins
      if (isSuperAdmin()) {
        loadAllBusinesses();
      }
    } else {
      console.log('User not authenticated, clearing business data');
      setCurrentBusiness(null);
      setBusinesses([]);
    }
  }, [isAuthenticated, user]);

  const value: BusinessContextType = {
    currentBusiness,
    businesses,
    isLoading,
    error,
    loadCurrentBusiness,
    loadAllBusinesses,
    createBusiness,
    updateBusiness,
    deactivateBusiness,
    activateBusiness,
    isSuperAdmin,
    isBusinessOwner,
    canManageBusinesses,
    canViewBusiness,
  };

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = (): BusinessContextType => {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};

export default BusinessContext; 