import React from 'react';
import { TextField, Autocomplete, CircularProgress, Typography } from '@mui/material';

export interface City {
  id: string;
  name: string;
  displayName: string;
  coordinates: [number, number]; // [longitude, latitude]
  country: string;
  type: string; // Added to distinguish between city, area, neighborhood, etc.
  rawData: any;
}

interface CityAutocompleteProps {
  onSelect: (city: City | null) => void;
  placeholder?: string;
  value?: string;
  disabled?: boolean;
}

const CityAutocomplete: React.FC<CityAutocompleteProps> = ({
  onSelect,
  placeholder = "Search for a city or area",
  value = '',
  disabled = false
}: CityAutocompleteProps) => {
  const [inputValue, setInputValue] = React.useState<string>(value);
  const [options, setOptions] = React.useState<City[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [selectedOption, setSelectedOption] = React.useState<City | null>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  const searchCities = async (query: string): Promise<void> => {
    if (!query || query.length < 2) {
      setOptions([]);
      return;
    }

    setLoading(true);
    try {
      console.log('Searching for:', query);

      // Enhanced search query to include areas, neighborhoods, districts, and cities
      // Include more place types for comprehensive area search
      const searchParams = new URLSearchParams({
        q: query,
        format: 'json',
        limit: '10',
        'accept-language': 'en',
        countrycodes: 'ae,sa,qa,kw,bh,om,jo,lb,eg,tr,us,ca,gb,de,fr,it,es,in,pk',
        addressdetails: '1',
        extratags: '1',
        namedetails: '1',
        // Enhanced place types to include areas, neighborhoods, districts
        // city, town, village, hamlet, suburb, neighbourhood, district, quarter, residential, commercial
        'featureType': 'settlement'
      });

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${searchParams.toString()}`,
        {
          headers: {
            'User-Agent': 'InseatApp'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Search results:', data);

        const cities: City[] = data
          .filter((item: any) => {
            // Filter for various place types including areas and neighborhoods
            const placeType = item.type?.toLowerCase();
            const categoryType = item.category?.toLowerCase();
            const osmType = item.osm_type?.toLowerCase();
            
            // Include cities, towns, villages, neighborhoods, districts, suburbs, areas
            const validTypes = [
              'city', 'town', 'village', 'hamlet', 'suburb', 'neighbourhood', 
              'neighborhood', 'district', 'quarter', 'residential', 'administrative',
              'locality', 'sublocality', 'area'
            ];
            
            const validCategories = ['place', 'boundary', 'landuse'];
            
            return (
              validCategories.includes(categoryType) ||
              validTypes.includes(placeType) ||
              (osmType === 'relation' && item.address?.city) ||
              (osmType === 'relation' && item.address?.town) ||
              (osmType === 'way' && validTypes.includes(placeType))
            );
          })
          .map((item: any) => {
            const placeType = item.type || 'area';
            const displayName = item.display_name || item.name;
            
            // Determine the type for better display
            let typeLabel = 'Area';
            if (['city', 'town'].includes(placeType)) {
              typeLabel = 'City';
            } else if (['village', 'hamlet'].includes(placeType)) {
              typeLabel = 'Village';
            } else if (['suburb', 'neighbourhood', 'neighborhood'].includes(placeType)) {
              typeLabel = 'Neighborhood';
            } else if (['district', 'quarter'].includes(placeType)) {
              typeLabel = 'District';
            }

            return {
              id: `${item.osm_type}-${item.osm_id}`,
              name: item.name || item.display_name?.split(',')[0] || 'Unknown',
              displayName: displayName,
              coordinates: [parseFloat(item.lon), parseFloat(item.lat)] as [number, number],
              country: item.address?.country || 'Unknown',
              type: typeLabel,
              rawData: item
            };
          })
          .filter((city: City) => !isNaN(city.coordinates[0]) && !isNaN(city.coordinates[1]));

        console.log('Processed cities:', cities);
        setOptions(cities);
      } else {
        console.error('Search request failed:', response.status, response.statusText);
        setOptions([]);
      }
    } catch (error) {
      console.error('Error searching cities:', error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (_: any, newInputValue: string): void => {
    setInputValue(newInputValue);
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout for 2 seconds (2000ms)
    timeoutRef.current = setTimeout(() => {
      searchCities(newInputValue);
    }, 2000);
  };

  const handleOptionSelect = (_: any, newValue: City | null): void => {
    setSelectedOption(newValue);
    onSelect(newValue);
    
    if (newValue) {
      setInputValue(newValue.name);
    }
  };

  // Clean up timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <Autocomplete
      options={options}
      getOptionLabel={(option: City) => option.displayName}
      renderOption={(props, option: City) => (
        <li {...props} key={option.id}>
          <div>
            <Typography variant="body1">
              {option.name}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {option.type} • {option.country}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {option.displayName}
            </Typography>
          </div>
        </li>
      )}
      loading={loading}
      disabled={disabled}
      value={selectedOption}
      onChange={handleOptionSelect}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      filterOptions={(x) => x} // Disable built-in filtering since we use external API
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
          variant="outlined"
          fullWidth
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      noOptionsText={
        inputValue.length < 2 
          ? "Type at least 2 characters to search" 
          : loading 
          ? "Searching..." 
          : "No locations found"
      }
    />
  );
};

export default CityAutocomplete; 