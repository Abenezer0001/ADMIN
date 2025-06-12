// import React from 'react';
// import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
// import { Box, Typography } from '@mui/material';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';
// import { City } from './CityAutocomplete';

// // Import leaflet marker assets (Vite-compatible way)
// import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
// import markerIcon from 'leaflet/dist/images/marker-icon.png';
// import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// // Fix for default icon issue in Leaflet (Vite-compatible)
// delete (L.Icon.Default.prototype as any)._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: markerIcon2x,
//   iconUrl: markerIcon,
//   shadowUrl: markerShadow,
// });

// interface RestaurantMapProps {
//   selectedCity: City | null;
//   markerPosition: [number, number] | null;
//   onLocationSelect: (coordinates: [number, number]) => void;
//   isDisabled?: boolean;
// }

// // Component to update map center and zoom when city is selected
// const MapController: React.FC<{ selectedCity: City | null; isDisabled: boolean }> = ({ 
//   selectedCity, 
//   isDisabled 
// }: { selectedCity: City | null; isDisabled: boolean }) => {
//   const map = useMap();

//   React.useEffect(() => {
//     if (selectedCity?.coordinates) {
//       const [lng, lat] = selectedCity.coordinates;
//       map.setView([lat, lng], 13);
//     }

//     // Handle map interactions based on disabled state
//     if (isDisabled) {
//       map.dragging.disable();
//       map.touchZoom.disable();
//       map.doubleClickZoom.disable();
//       map.scrollWheelZoom.disable();
//       map.boxZoom.disable();
//       map.keyboard.disable();
//       // Remove tap handling since it's not available in all Leaflet versions
//     } else {
//       map.dragging.enable();
//       map.touchZoom.enable();
//       map.doubleClickZoom.enable();
//       map.scrollWheelZoom.enable();
//       map.boxZoom.enable();
//       map.keyboard.enable();
//     }
//   }, [selectedCity, map, isDisabled]);

//   return null;
// };

// // Component to center the map on the marker position when it changes
// const MarkerController: React.FC<{ 
//   markerPosition: [number, number] | null; 
//   isDisabled: boolean 
// }> = ({ markerPosition, isDisabled }: { markerPosition: [number, number] | null; isDisabled: boolean }) => {
//   const map = useMap();

//   React.useEffect(() => {
//     if (markerPosition && !isDisabled) {
//       // Center the map on the marker position with animation
//       map.flyTo(markerPosition, 15, {
//         duration: 1.5,
//         easeLinearity: 0.25
//       });
//     }
//   }, [markerPosition, map, isDisabled]);

//   return null;
// };

// // Component to handle map click events
// const MapEventsHandler: React.FC<{ 
//   onLocationSelect: (coordinates: [number, number]) => void; 
//   isDisabled: boolean 
// }> = ({ onLocationSelect, isDisabled }: { onLocationSelect: (coordinates: [number, number]) => void; isDisabled: boolean }) => {
//   useMapEvents({
//     click: (event: any) => {
//       if (!isDisabled) {
//         const { lat, lng } = event.latlng;
//         onLocationSelect([lat, lng]);
//       }
//     },
//   });
//   return null;
// };

// const RestaurantMap: React.FC<RestaurantMapProps> = ({
//   selectedCity,
//   markerPosition,
//   onLocationSelect,
//   isDisabled = false
// }: RestaurantMapProps) => {
//   const defaultCenter: [number, number] = [25.276987, 55.296249]; // Default center (Dubai)
//   const defaultZoom = 8;
  
//   // The map should be enabled when a city is selected
//   const mapDisabled = isDisabled || !selectedCity;

//   return (
//     <Box sx={{ position: 'relative', mt: 2 }}>
//       {!selectedCity && (
//         <Box 
//           sx={{
//             position: 'absolute',
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             backgroundColor: 'rgba(255, 255, 255, 0.9)',
//             display: 'flex',
//             flexDirection: 'column',
//             alignItems: 'center',
//             justifyContent: 'center',
//             zIndex: 1000,
//             borderRadius: 1,
//           }}
//         >
//           <Typography variant="h6" color="textSecondary" gutterBottom>
//             Please select a city or area first
//           </Typography>
//           <Typography variant="body2" color="textSecondary">
//             The map will be enabled once you select a location
//           </Typography>
//         </Box>
//       )}
      
//       <MapContainer
//         center={selectedCity?.coordinates ? [selectedCity.coordinates[1], selectedCity.coordinates[0]] : defaultCenter}
//         zoom={selectedCity ? 13 : defaultZoom}
//         style={{ 
//           height: '400px', 
//           width: '100%',
//           filter: mapDisabled ? 'grayscale(40%)' : 'none',
//           opacity: mapDisabled ? 0.6 : 1,
//           transition: 'all 0.3s ease',
//           borderRadius: '8px'
//         }}
//         scrollWheelZoom={!mapDisabled}
//         zoomControl={!mapDisabled}
//         key={selectedCity?.id || 'default'} // Force re-render when city changes
//       >
//         {/* Use CartoDB tile layer for better English language support */}
//         <TileLayer
//   url="https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=h35MxsAmF0Laz2IYnp6j"
//   attribution='<a href="https://www.maptiler.com/copyright/" target="_blank">© MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>'
//   tileSize={512}
//   zoomOffset={-1}
// />

//         {/* Add the controller component to handle map updates */}
//         <MapController selectedCity={selectedCity} isDisabled={mapDisabled} />
        
//         {/* Add marker controller to center map on marker position */}
//         <MarkerController markerPosition={markerPosition} isDisabled={mapDisabled} />

//         {/* Add click event handler - conditionally based on disabled state */}
//         <MapEventsHandler onLocationSelect={onLocationSelect} isDisabled={mapDisabled} />

//         {/* Show marker at selected location */}
//         {markerPosition && (
//           <Marker 
//             position={markerPosition}
//             draggable={!mapDisabled}
//             eventHandlers={{
//               dragend: (e: any) => {
//                 if (!mapDisabled) {
//                   const marker = e.target;
//                   const position = marker.getLatLng();
//                   onLocationSelect([position.lat, position.lng]);
//                 }
//               },
//             }}
//           />
//         )}
//       </MapContainer>
      
//       {selectedCity && (
//         <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
//           Click anywhere on the map to select a location, or drag the marker to adjust the position.
//         </Typography>
//       )}
//     </Box>
//   );
// };

// export default RestaurantMap; 
import React from 'react';
// Import Circle to draw the geofence
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, Circle } from 'react-leaflet'; 
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
}: { selectedCity: City | null; isDisabled: boolean }) => {
  const map = useMap();

  React.useEffect(() => {
    if (selectedCity?.coordinates) {
      const [lng, lat] = selectedCity.coordinates;
      // --- CHANGE 1: Zoom in closer (e.g., to level 14) ---
      map.setView([lat, lng], 14); 
    }

    // Handle map interactions based on disabled state
    if (isDisabled) {
      map.dragging.disable();
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      map.scrollWheelZoom.disable();
      map.boxZoom.disable();
      map.keyboard.disable();
    } else {
      map.dragging.enable();
      map.touchZoom.enable();
      map.doubleClickZoom.enable();
      map.scrollWheelZoom.enable();
      map.boxZoom.enable();
      map.keyboard.enable();
    }
  }, [selectedCity, map, isDisabled]);

  return null;
};

// Component to center the map on the marker position when it changes
const MarkerController: React.FC<{ 
  markerPosition: [number, number] | null; 
  isDisabled: boolean 
}> = ({ markerPosition, isDisabled }: { markerPosition: [number, number] | null; isDisabled: boolean }) => {
  const map = useMap();

  React.useEffect(() => {
    if (markerPosition && !isDisabled) {
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
}> = ({ onLocationSelect, isDisabled }: { onLocationSelect: (coordinates: [number, number]) => void; isDisabled: boolean }) => {
  useMapEvents({
    click: (event: any) => {
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
}: RestaurantMapProps) => {
  const defaultCenter: [number, number] = [25.276987, 55.296249]; // Default center (Dubai)
  const defaultZoom = 8;
  
  const mapDisabled = isDisabled || !selectedCity;

  // --- CHANGE 2: Define visual options for the geofence circle ---
  const geofenceOptions = {
    color: '#1976d2',       // A nice blue color
    fillColor: '#1976d2',  // Matching fill color
    fillOpacity: 0.1,    // A subtle fill
    weight: 2,           // Border thickness
  };

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
            Please select a city or area first
          </Typography>
          <Typography variant="body2" color="textSecondary">
            The map will be enabled once you select a location
          </Typography>
        </Box>
      )}
      
      <MapContainer
        center={selectedCity?.coordinates ? [selectedCity.coordinates[1], selectedCity.coordinates[0]] : defaultCenter}
        zoom={selectedCity ? 14 : defaultZoom} // Updated default zoom for when city is selected
        style={{ 
          height: '400px', 
          width: '100%',
          filter: mapDisabled ? 'grayscale(40%)' : 'none',
          opacity: mapDisabled ? 0.6 : 1,
          transition: 'all 0.3s ease',
          borderRadius: '8px'
        }}
        scrollWheelZoom={!mapDisabled}
        zoomControl={!mapDisabled}
        key={selectedCity?.id || 'default'} 
      >
        <TileLayer
          url="https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=h35MxsAmF0Laz2IYnp6j" // Remember to use an environment variable for the key!
          attribution='<a href="https://www.maptiler.com/copyright/" target="_blank">© MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>'
          tileSize={512}
          zoomOffset={-1}
        />

        <MapController selectedCity={selectedCity} isDisabled={mapDisabled} />
        <MarkerController markerPosition={markerPosition} isDisabled={mapDisabled} />
        <MapEventsHandler onLocationSelect={onLocationSelect} isDisabled={mapDisabled} />

        {markerPosition && (
          <Marker 
            position={markerPosition}
            draggable={!mapDisabled}
            eventHandlers={{
              dragend: (e: any) => {
                if (!mapDisabled) {
                  const marker = e.target;
                  const position = marker.getLatLng();
                  onLocationSelect([position.lat, position.lng]);
                }
              },
            }}
          />
        )}

        {/* --- CHANGE 3: Add the Circle component for the geofence --- */}
        {selectedCity && selectedCity.coordinates && (
          <Circle
            center={[selectedCity.coordinates[1], selectedCity.coordinates[0]]}
            pathOptions={geofenceOptions}
            radius={2000} // Radius in meters (2000m = 2km). Adjust as you see fit.
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