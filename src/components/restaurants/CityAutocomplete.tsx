import React, { useState, useEffect } from 'react';
import { TextField } from '@mui/material';

// Static city data for demo purposes
const CITIES = [
  { id: '1', name: 'New York', coordinates: [-74.006, 40.7128] },
  { id: '2', name: 'Los Angeles', coordinates: [-118.2437, 34.0522] },
  { id: '3', name: 'Chicago', coordinates: [-87.6298, 41.8781] },
  { id: '4', name: 'Houston', coordinates: [-95.3698, 29.7604] },
  { id: '5', name: 'Miami', coordinates: [-80.1918, 25.7617] },
  { id: '6', name: 'San Francisco', coordinates: [-122.4194, 37.7749] },
  { id: '7', name: 'Boston', coordinates: [-71.0589, 42.3601] },
  { id: '8', name: 'Seattle', coordinates: [-122.3321, 47.6062] },
];

export interface City {
  id: string;
  name: string;
  coordinates: [number, number]; // [longitude, latitude]
}

interface CityAutocompleteProps {
  onSelect: (city: City | null) => void;
  placeholder?: string;
  value?: string;
}

const CityAutocomplete: React.FC<CityAutocompleteProps> = ({ 
  onSelect, 
  placeholder = "Search for a city",
  value = ""
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setInputValue(searchValue);

    if (searchValue.trim()) {
      const filtered = CITIES.filter(city =>
        city.name.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredCities(filtered);
      setShowDropdown(true);
    } else {
      setFilteredCities([]);
      setShowDropdown(false);
      onSelect(null);
    }
  };

  const handleCitySelect = (city: City) => {
    setInputValue(city.name);
    setShowDropdown(false);
    setFilteredCities([]);
    onSelect(city);
  };

  const handleBlur = () => {
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
        onFocus={() => {
          if (filteredCities.length > 0) {
            setShowDropdown(true);
          }
        }}
        onBlur={handleBlur}
        placeholder={placeholder}
        variant="outlined"
      />
      
      {showDropdown && filteredCities.length > 0 && (
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
          {filteredCities.map((city) => (
            <div
              key={city.id}
              onClick={() => handleCitySelect(city)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                borderBottom: '1px solid #f0f0f0',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              {city.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CityAutocomplete; 