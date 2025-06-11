import React from 'react';
import { TextField, Typography } from '@mui/material';
import { City } from './CityAutocomplete';

interface AddressData {
  displayName: string;
  lat: number;
  lon: number;
  coordinates: [number, number]; // [longitude, latitude]
  rawData: any;
}

interface AddressAutocompleteProps {
  selectedCity: City | null;
  onSelect: (addressData: AddressData | null) => void;
  value?: string;
  placeholder?: string;
  disabled?: boolean;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  selectedCity,
  onSelect,
  value = "",
  placeholder = "Search for an address",
  disabled = false
}: AddressAutocompleteProps) => {
  const [inputValue, setInputValue] = React.useState<string>(value);
  const [results, setResults] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [showDropdown, setShowDropdown] = React.useState<boolean>(false);

  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  React.useEffect(() => {
    if (inputValue && selectedCity && inputValue.length > 2) {
      const fetchAddressResults = async (): Promise<void> => {
        setIsLoading(true);
        try {
          // Build the query - include city if provided
          const query = `${inputValue}, ${selectedCity.name}`;
          
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
            {
              headers: {
                'Accept-Language': 'en',
                'User-Agent': 'InseatApp'
              }
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            setResults(data);
            setShowDropdown(data.length > 0);
          } else {
            setResults([]);
            setShowDropdown(false);
          }
        } catch (error) {
          console.error("Error fetching address suggestions:", error);
          setResults([]);
          setShowDropdown(false);
        } finally {
          setIsLoading(false);
        }
      };

      // Debounce the API call
      const timeoutId = setTimeout(() => {
        fetchAddressResults();
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      setResults([]);
      setShowDropdown(false);
    }
  }, [inputValue, selectedCity]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (!newValue.trim()) {
      onSelect(null);
      setResults([]);
      setShowDropdown(false);
    }
  };

  const handleAddressSelect = (location: any): void => {
    const displayAddress = location.display_name;
    setInputValue(displayAddress);
    setResults([]);
    setShowDropdown(false);
    
    onSelect({
      displayName: displayAddress,
      lat: parseFloat(location.lat),
      lon: parseFloat(location.lon),
      coordinates: [parseFloat(location.lon), parseFloat(location.lat)],
      rawData: location
    });
  };

  const handleBlur = (): void => {
    // Delay hiding dropdown to allow clicking on options
    setTimeout(() => {
      setShowDropdown(false);
    }, 200);
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <TextField
        fullWidth
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        placeholder={disabled ? "Please select a city first" : placeholder}
        disabled={disabled}
        variant="outlined"
      />
      
      {!selectedCity && (
        <Typography variant="caption" color="textSecondary" style={{ marginTop: '4px', display: 'block' }}>
          Select a city first to enable address search
        </Typography>
      )}
      
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderTop: 'none',
          borderRadius: '0 0 4px 4px',
          padding: '12px 16px',
          zIndex: 1000,
        }}>
          Loading address suggestions...
        </div>
      )}
      
      {showDropdown && results.length > 0 && !isLoading && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderTop: 'none',
            borderRadius: '0 0 4px 4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            zIndex: 1000,
            maxHeight: '200px',
            overflowY: 'auto',
          }}
        >
          {results.map((result: any, index: number) => (
            <div
              key={result.place_id || index}
              onClick={() => handleAddressSelect(result)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                borderBottom: index < results.length - 1 ? '1px solid #f0f0f0' : 'none',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e: React.MouseEvent<HTMLDivElement>) => {
                (e.currentTarget as HTMLDivElement).style.backgroundColor = '#f5f5f5';
              }}
              onMouseOut={(e: React.MouseEvent<HTMLDivElement>) => {
                (e.currentTarget as HTMLDivElement).style.backgroundColor = 'white';
              }}
            >
              <div style={{ fontWeight: 500, marginBottom: '2px' }}>
                {result.display_name.split(',')[0]}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {result.display_name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete; 