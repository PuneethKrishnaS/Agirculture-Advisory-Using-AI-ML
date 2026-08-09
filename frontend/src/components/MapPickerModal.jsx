import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMapEvents, useMap, LayersControl, LayerGroup } from 'react-leaflet';
import * as turf from '@turf/turf';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet marker icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapEventHandler = ({ points, setPoints }) => {
  useMapEvents({
    click(e) {
      setPoints((prev) => [...prev, [e.latlng.lat, e.latlng.lng]]);
    },
  });
  return null;
};

const MapSearchControl = () => {
  const map = useMap();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      L.DomEvent.disableClickPropagation(containerRef.current);
      L.DomEvent.disableScrollPropagation(containerRef.current);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&countrycodes=in&addressdetails=1&limit=5`);
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error(err);
      }
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (result) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    map.flyTo([lat, lon], 16, { animate: true, duration: 1.5 });
    setResults([]);
    setQuery('');
  };

  return (
    <div 
      ref={containerRef}
      className="absolute top-4 left-1/2 -translate-x-1/2" 
      style={{ zIndex: 1000, pointerEvents: 'auto' }}
    >
      <div className="flex flex-col bg-white rounded-xl shadow-md overflow-hidden border border-slate-200 w-72 md:w-96">
        <div className="flex items-center">
          <input 
            type="text" 
            placeholder="Search locations in India..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-4 py-2 outline-none text-slate-800 text-sm bg-transparent"
          />
          <div className="p-2 bg-slate-50 text-slate-600 flex items-center justify-center border-l border-slate-200">
            <span className={`material-symbols-outlined text-sm ${isSearching ? 'animate-spin' : ''}`}>
              {isSearching ? 'refresh' : 'search'}
            </span>
          </div>
        </div>
        {results.length > 0 && (
          <div className="max-h-60 overflow-y-auto bg-white border-t border-slate-200 shadow-inner">
            {results.map((res, i) => (
              <div 
                key={i} 
                onClick={() => handleSelect(res)}
                className="px-4 py-3 hover:bg-slate-100 cursor-pointer text-sm text-slate-700 border-b border-slate-100 last:border-0 transition-colors flex flex-col gap-0.5"
              >
                <span className="font-semibold text-slate-900 truncate">{res.name || res.display_name.split(',')[0]}</span>
                <span className="text-xs text-slate-500 truncate">{res.display_name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const MapPickerModal = ({ isOpen, onClose, onSave, isMandatory = false }) => {
  const [points, setPoints] = useState([]);
  const [calculatedArea, setCalculatedArea] = useState(0); // in Acres
  const [plotName, setPlotName] = useState('');

  useEffect(() => {
    if (points.length > 2) {
      // Turf.js requires the first and last point to be identical to close the polygon
      const turfPolygon = turf.polygon([[...points.map(p => [p[1], p[0]]), [points[0][1], points[0][0]]]]);
      const areaSqMeters = turf.area(turfPolygon);
      const areaAcres = areaSqMeters * 0.000247105;
      setCalculatedArea(areaAcres);
    } else {
      setCalculatedArea(0);
    }
  }, [points]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (points.length === 0) {
      alert("Please select at least one point.");
      return;
    }
    if (!plotName.trim()) {
      alert("Please enter a name for this plot.");
      return;
    }
    // Return the center of the points for weather API fetching
    const lats = points.map(p => p[0]);
    const lngs = points.map(p => p[1]);
    const center = {
      lat: lats.reduce((a, b) => a + b, 0) / points.length,
      lng: lngs.reduce((a, b) => a + b, 0) / points.length,
    };
    onSave({ center, points, areaAcres: calculatedArea, name: plotName });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8">
      <div className="bg-surface w-full max-w-6xl h-full max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface">
          <div>
            <h2 className="text-headline-sm font-headline-sm text-on-surface">Select Field Location</h2>
            <p className="text-body-sm text-on-surface-variant">Click to place points. Draw a shape (3+ points) to calculate acres.</p>
          </div>
          <div className="flex items-center gap-4">
            <input 
              type="text" 
              placeholder="Enter Plot Name (e.g. North Field)" 
              value={plotName} 
              onChange={e => setPlotName(e.target.value)}
              className="border border-outline-variant rounded-xl px-4 py-2 w-64 focus:ring-2 focus:ring-primary focus:outline-none"
            />
            {!isMandatory && (
              <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors">
                <span translate="no" className="material-symbols-outlined notranslate">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative bg-surface-container-lowest">
          <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
            <LayersControl position="topright">
              <LayersControl.BaseLayer checked name="Google Satellite (High Res)">
                <TileLayer
                  url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                  attribution="&copy; Google Maps"
                  maxNativeZoom={20}
                  maxZoom={22}
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="ESRI Satellite">
                <LayerGroup>
                  <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution="Tiles &copy; Esri &mdash; Source: Esri"
                    maxNativeZoom={18}
                    maxZoom={22}
                  />
                  <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                    maxNativeZoom={18}
                    maxZoom={22}
                  />
                </LayerGroup>
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Street Map">
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  maxNativeZoom={19}
                  maxZoom={22}
                />
              </LayersControl.BaseLayer>
            </LayersControl>
            <MapSearchControl />
            <MapEventHandler points={points} setPoints={setPoints} />
            
            {points.map((pos, idx) => (
              <Marker 
                key={idx} 
                position={pos} 
                draggable={true} 
                eventHandlers={{
                  dragend: (e) => {
                    const newPos = [e.target.getLatLng().lat, e.target.getLatLng().lng];
                    setPoints(prev => prev.map((p, i) => i === idx ? newPos : p));
                  }
                }}
              >
                <Popup>Point {idx + 1}</Popup>
              </Marker>
            ))}
            
            {points.length > 2 && (
              <Polygon positions={points} pathOptions={{ className: 'fill-primary stroke-primary', color: '#2463eb', fillColor: '#2463eb', fillOpacity: 0.4 }} />
            )}
          </MapContainer>



          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[400] bg-white/90 backdrop-blur-md px-6 py-3 rounded-xl shadow-lg border border-outline-variant text-center">
            <p className="text-label-sm text-on-surface-variant uppercase tracking-widest">Calculated Area</p>
            <p className="text-display-sm font-display-sm text-primary">
              {calculatedArea > 0 ? calculatedArea.toFixed(2) : '0.00'} <span className="text-headline-sm text-on-surface">Acres</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-outline-variant flex justify-between items-center bg-surface">
          <button 
            onClick={() => setPoints([])} 
            className="px-6 py-2 rounded-lg font-label-lg text-error hover:bg-error-container transition-colors flex items-center gap-2"
          >
            <span translate="no" className="material-symbols-outlined notranslate text-sm">delete</span> Clear Points
          </button>
          <div className="flex gap-3">
            {!isMandatory && (
              <button onClick={onClose} className="px-6 py-2 rounded-lg font-label-lg text-primary hover:bg-primary-container transition-colors">
                Cancel
              </button>
            )}
            <button onClick={handleSave} className="px-8 py-2 rounded-lg font-label-lg text-white bg-primary hover:brightness-110 transition-all shadow-md">
              Save Plot
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPickerModal;
