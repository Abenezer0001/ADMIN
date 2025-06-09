import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { Box, Typography } from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { City } from './CityAutocomplete';

// Import leaflet marker assets (Vite-compatible way)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default icon issue in Leaflet (Vite-compatible)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface RestaurantMapProps {
  selectedCity: City | null;
  markerPosition: [number, number] | null;
  onLocationSelect: (coordinates: [number, number]) => void;
  isDisabled?: boolean;
}

// Component to update map center and zoom when city is selected
const MapController: React.FC<{ selectedCity: City | null; isDisabled: boolean }> = ({ 
  selectedCity, 
  isDisabled 
}) => {
  const map = useMap();

  useEffect(() => {
    if (selectedCity?.coordinates) {
      const [lng, lat] = selectedCity.coordinates;
      map.setView([lat, lng], 13);
    }

    // Handle map interactions based on disabled state
    if (isDisabled) {
      map.dragging.disable();
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      map.scrollWheelZoom.disable();
      map.boxZoom.disable();
      map.keyboard.disable();
      if (map.tap) map.tap.disable();
    } else {
      map.dragging.enable();
      map.touchZoom.enable();
      map.doubleClickZoom.enable();
      map.scrollWheelZoom.enable();
      map.boxZoom.enable();
      map.keyboard.enable();
      if (map.tap) map.tap.enable();
    }
  }, [selectedCity, map, isDisabled]);

  return null;
};

// Component to center the map on the marker position when it changes
const MarkerController: React.FC<{ 
  markerPosition: [number, number] | null; 
  isDisabled: boolean 
}> = ({ markerPosition, isDisabled }) => {
  const map = useMap();

  useEffect(() => {
    if (markerPosition && !isDisabled) {
      // Center the map on the marker position with animation
      map.flyTo(markerPosition, 15, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  }, [markerPosition, map, isDisabled]);

  return null;
};

// Component to handle map click events
const MapEventsHandler: React.FC<{ 
  onLocationSelect: (coordinates: [number, number]) => void; 
  isDisabled: boolean 
}> = ({ onLocationSelect, isDisabled }) => {
  useMapEvents({
    click: (event) => {
      if (!isDisabled) {
        const { lat, lng } = event.latlng;
        onLocationSelect([lat, lng]);
      }
    },
  });
  return null;
};

const RestaurantMap: React.FC<RestaurantMapProps> = ({
  selectedCity,
  markerPosition,
  onLocationSelect,
  isDisabled = false
}) => {
  const defaultCenter: [number, number] = [40.7128, -74.006]; // Default center (New York)
  const defaultZoom = 8;

  return (
    <Box sx={{ position: 'relative', mt: 2 }}>
      {!selectedCity && (
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            borderRadius: 1,
          }}
        >
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Please select a city first
          </Typography>
          <Typography variant="body2" color="textSecondary">
            The map will be enabled once you select a city
          </Typography>
        </Box>
      )}
      
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ 
          height: '400px', 
          width: '100%',
          filter: isDisabled || !selectedCity ? 'grayscale(40%)' : 'none',
          opacity: isDisabled || !selectedCity ? 0.6 : 1,
          transition: 'all 0.3s ease',
          borderRadius: '8px'
        }}
        scrollWheelZoom={!isDisabled && !!selectedCity}
        zoomControl={!isDisabled && !!selectedCity}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {/* Add the controller component to handle map updates */}
        <MapController selectedCity={selectedCity} isDisabled={isDisabled || !selectedCity} />
        
        {/* Add marker controller to center map on marker position */}
        <MarkerController markerPosition={markerPosition} isDisabled={isDisabled || !selectedCity} />

        {/* Add click event handler - conditionally based on disabled state */}
        <MapEventsHandler onLocationSelect={onLocationSelect} isDisabled={isDisabled || !selectedCity} />

        {/* Show marker at selected location */}
        {markerPosition && (
          <Marker 
            position={markerPosition}
            draggable={!isDisabled && !!selectedCity}
            eventHandlers={{
              dragend: (e) => {
                if (!isDisabled && selectedCity) {
                  const marker = e.target;
                  const position = marker.getLatLng();
                  onLocationSelect([position.lat, position.lng]);
                }
              },
            }}
          />
        )}
      </MapContainer>
      
      {selectedCity && (
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
          Click anywhere on the map to select a location, or drag the marker to adjust the position.
        </Typography>
      )}
    </Box>
  );
};

export default RestaurantMap; 