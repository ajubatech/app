import React, { useRef, useEffect, useState } from 'react';
import { MapPin, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

interface PropertyMapProps {
  properties: any[];
  loading: boolean;
}

interface PropertyPreviewProps {
  property: any;
  onClose: () => void;
}

// Google Maps script loader
const loadGoogleMapsScript = (callback: () => void) => {
  const existingScript = document.getElementById('googleMapsScript');
  if (!existingScript) {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.id = 'googleMapsScript';
    document.body.appendChild(script);
    script.onload = () => {
      if (callback) callback();
    };
  } else if (callback) {
    callback();
  }
};

function PropertyPreview({ property, onClose }: PropertyPreviewProps) {
  const mainImage = property.media?.find((m: any) => m.tag === 'Main Photo')?.url || 
                    property.media?.[0]?.url || 
                    'https://via.placeholder.com/300x200';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="bg-white rounded-lg shadow-lg overflow-hidden w-72"
    >
      <div className="relative">
        <img 
          src={mainImage} 
          alt={property.title} 
          className="w-full h-36 object-cover"
        />
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 bg-white/80 rounded-full hover:bg-white"
        >
          <X className="w-4 h-4" />
        </button>
        
        {/* Banner */}
        {property.status === 'sold' && (
          <div className="absolute top-3 left-0 bg-red-600 text-white px-4 py-1 text-sm font-medium">
            Sold
          </div>
        )}
        
        {property.metadata?.banner && (
          <div className={`absolute top-3 left-0 ${
            property.metadata.banner.style === 'primary' 
              ? 'bg-blue-600 text-white' 
              : property.metadata.banner.style === 'success'
              ? 'bg-green-600 text-white'
              : property.metadata.banner.style === 'warning'
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-800 text-white'
          } px-4 py-1 text-sm font-medium`}>
            {property.metadata.banner.text}
          </div>
        )}
      </div>
      
      <div className="p-3">
        <h3 className="font-medium text-lg mb-1 line-clamp-1">{property.title}</h3>
        <p className="text-blue-600 font-bold mb-2">${property.price.toLocaleString()}</p>
        
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <span className="font-medium">{property.real_estate_metadata?.bedrooms || 0}</span>
            <span>Beds</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium">{property.real_estate_metadata?.bathrooms || 0}</span>
            <span>Baths</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium">{property.real_estate_metadata?.parking || 0}</span>
            <span>Cars</span>
          </div>
        </div>
        
        <Link
          to={`/real-estate/${property.id}`}
          className="block w-full text-center mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  );
}

export default function PropertyMap({ properties, loading }: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Load Google Maps script
  useEffect(() => {
    loadGoogleMapsScript(() => {
      setMapLoaded(true);
    });
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    const newMap = new google.maps.Map(mapRef.current, {
      center: { lat: -41.2865, lng: 174.7762 }, // Wellington, NZ
      zoom: 12,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    setMap(newMap);
    setInfoWindow(new google.maps.InfoWindow());

    return () => {
      setMap(null);
      setInfoWindow(null);
    };
  }, [mapLoaded]);

  // Update markers when properties change
  useEffect(() => {
    if (!map || !infoWindow) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);

    if (properties.length === 0) return;

    // Create marker cluster
    const bounds = new google.maps.LatLngBounds();
    const newMarkers: google.maps.Marker[] = [];

    properties.forEach(property => {
      if (!property.location?.lat || !property.location?.lng) return;

      const position = {
        lat: property.location.lat,
        lng: property.location.lng
      };

      // Create marker
      const marker = new google.maps.Marker({
        position,
        map,
        title: property.title,
        label: {
          text: `$${Math.round(property.price / 1000)}k`,
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold'
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 14,
          fillColor: '#3b82f6',
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 2
        }
      });

      // Add click event
      marker.addListener('click', () => {
        setSelectedProperty(property);
      });

      newMarkers.push(marker);
      bounds.extend(position);
    });

    setMarkers(newMarkers);

    // Fit map to bounds
    if (newMarkers.length > 0) {
      map.fitBounds(bounds);
      
      // Don't zoom in too far
      const listener = google.maps.event.addListener(map, 'idle', () => {
        if (map.getZoom() > 16) {
          map.setZoom(16);
        }
        google.maps.event.removeListener(listener);
      });
    }
  }, [properties, map, infoWindow]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <div ref={mapRef} className="h-full w-full"></div>
      
      {/* Property Preview */}
      <AnimatePresence>
        {selectedProperty && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
            <PropertyPreview 
              property={selectedProperty} 
              onClose={() => setSelectedProperty(null)} 
            />
          </div>
        )}
      </AnimatePresence>
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md">
        <button
          onClick={() => map?.setZoom((map?.getZoom() || 0) + 1)}
          className="p-2 hover:bg-gray-100 border-b"
        >
          +
        </button>
        <button
          onClick={() => map?.setZoom((map?.getZoom() || 0) - 1)}
          className="p-2 hover:bg-gray-100"
        >
          -
        </button>
      </div>
    </div>
  );
}