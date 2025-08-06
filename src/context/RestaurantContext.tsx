import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

interface RestaurantContextType {
  selectedRestaurantId: string | null;
  selectedVenueId: string | null;
  selectedBusinessId: string | null;
  setSelectedRestaurant: (restaurantId: string | null) => void;
  setSelectedVenue: (venueId: string | null) => void;
  setSelectedBusiness: (businessId: string | null) => void;
  clearSelections: () => void;
  isLoading: boolean;
  error: string | null;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

interface RestaurantProviderProps {
  children: React.ReactNode;
}

const STORAGE_KEYS = {
  RESTAURANT_ID: 'inseat_selected_restaurant_id',
  VENUE_ID: 'inseat_selected_venue_id',
  BUSINESS_ID: 'inseat_selected_business_id',
};

export const RestaurantProvider: React.FC<RestaurantProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [selectedRestaurantId, setSelectedRestaurantIdState] = useState<string | null>(null);
  const [selectedVenueId, setSelectedVenueIdState] = useState<string | null>(null);
  const [selectedBusinessId, setSelectedBusinessIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load selections from localStorage on mount
  useEffect(() => {
    try {
      setIsLoading(true);
      
      if (user) {
        // For restaurant admins, use their business ID
        if (user.role === 'restaurant_admin' && user.businessId) {
          setSelectedBusinessIdState(user.businessId);
          // Don't auto-restore restaurant for restaurant admins - let them choose
        } else {
          // For system admins, restore previous selections
          const savedRestaurantId = localStorage.getItem(STORAGE_KEYS.RESTAURANT_ID);
          const savedVenueId = localStorage.getItem(STORAGE_KEYS.VENUE_ID);
          const savedBusinessId = localStorage.getItem(STORAGE_KEYS.BUSINESS_ID);

          if (savedBusinessId) setSelectedBusinessIdState(savedBusinessId);
          if (savedRestaurantId) setSelectedRestaurantIdState(savedRestaurantId);
          if (savedVenueId) setSelectedVenueIdState(savedVenueId);
        }
      }
    } catch (err) {
      console.error('Error loading restaurant selections from localStorage:', err);
      setError('Failed to load previous restaurant selections');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Persist selections to localStorage
  const persistSelection = useCallback((key: string, value: string | null) => {
    try {
      if (value) {
        localStorage.setItem(key, value);
      } else {
        localStorage.removeItem(key);
      }
    } catch (err) {
      console.error('Error saving to localStorage:', err);
    }
  }, []);

  const setSelectedRestaurant = useCallback((restaurantId: string | null) => {
    setSelectedRestaurantIdState(restaurantId);
    persistSelection(STORAGE_KEYS.RESTAURANT_ID, restaurantId);
    
    // Clear venue selection when restaurant changes
    if (selectedVenueId) {
      setSelectedVenueIdState(null);
      persistSelection(STORAGE_KEYS.VENUE_ID, null);
    }
    
    setError(null);
  }, [persistSelection, selectedVenueId]);

  const setSelectedVenue = useCallback((venueId: string | null) => {
    setSelectedVenueIdState(venueId);
    persistSelection(STORAGE_KEYS.VENUE_ID, venueId);
    setError(null);
  }, [persistSelection]);

  const setSelectedBusiness = useCallback((businessId: string | null) => {
    setSelectedBusinessIdState(businessId);
    persistSelection(STORAGE_KEYS.BUSINESS_ID, businessId);
    
    // Clear restaurant and venue selections when business changes
    if (selectedRestaurantId) {
      setSelectedRestaurantIdState(null);
      persistSelection(STORAGE_KEYS.RESTAURANT_ID, null);
    }
    if (selectedVenueId) {
      setSelectedVenueIdState(null);
      persistSelection(STORAGE_KEYS.VENUE_ID, null);
    }
    
    setError(null);
  }, [persistSelection, selectedRestaurantId, selectedVenueId]);

  const clearSelections = useCallback(() => {
    setSelectedRestaurantIdState(null);
    setSelectedVenueIdState(null);
    setSelectedBusinessIdState(null);
    
    localStorage.removeItem(STORAGE_KEYS.RESTAURANT_ID);
    localStorage.removeItem(STORAGE_KEYS.VENUE_ID);
    localStorage.removeItem(STORAGE_KEYS.BUSINESS_ID);
    
    setError(null);
  }, []);

  const contextValue: RestaurantContextType = {
    selectedRestaurantId,
    selectedVenueId,
    selectedBusinessId,
    setSelectedRestaurant,
    setSelectedVenue,
    setSelectedBusiness,
    clearSelections,
    isLoading,
    error,
  };

  return (
    <RestaurantContext.Provider value={contextValue}>
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = (): RestaurantContextType => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};

export default RestaurantContext;