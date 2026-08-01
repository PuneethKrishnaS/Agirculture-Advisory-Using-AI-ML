import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, useMapEvents } from 'react-leaflet';
import * as turf from '@turf/turf';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapInteraction({ points, setPoints }) {
  useMapEvents({
    click(e) {
      setPoints([...points, [e.latlng.lat, e.latlng.lng]]);
    },
  });
  return null;
}

export default function MapSelector({ onConfirm }) {
  const [points, setPoints] = useState([]);
  const [areaHectares, setAreaHectares] = useState(0);
  const [locationName, setLocationName] = useState('');
  const [centerPoint, setCenterPoint] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (points.length >= 3) {
      // Calculate Area
      try {
        // Turf requires the first and last point to be identical to close the polygon
        const closedPoints = [...points, points[0]];
        // Turf expects [longitude, latitude]! Our points are [lat, lng]
        const turfCoordinates = closedPoints.map(p => [p[1], p[0]]);
        
        const polygon = turf.polygon([turfCoordinates]);
        const areaSqMeters = turf.area(polygon);
        const hectares = areaSqMeters / 10000;
        setAreaHectares(hectares);

        const centroid = turf.centroid(polygon);
        const centroidCoords = centroid.geometry.coordinates; // [lng, lat]
        setCenterPoint([centroidCoords[1], centroidCoords[0]]);
      } catch (err) {
        console.error("Area calculation error:", err);
      }
    } else {
      setAreaHectares(0);
      setCenterPoint(null);
      setLocationName('');
    }
  }, [points]);

  const fetchLocationData = async () => {
    if (!centerPoint) return;
    setIsProcessing(true);
    try {
      // Free Reverse Geocoding
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${centerPoint[0]}&lon=${centerPoint[1]}`);
      const data = await res.json();
      
      const place = data.address.city || data.address.town || data.address.village || data.address.county || data.name || "Unknown Region";
      setLocationName(place);
      
      // Pass the data up to App.jsx
      onConfirm({
        areaHectares: areaHectares.toFixed(2),
        locationName: place,
        lat: centerPoint[0],
        lng: centerPoint[1]
      });
      
    } catch (err) {
      console.error(err);
      alert("Failed to fetch location data. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const clearMap = () => {
    setPoints([]);
  }

  return (
    <div className="glass-panel" style={{ marginBottom: '2rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Farm Map & Weather Sync</h2>
          <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
            Click on the map to draw the boundaries of your farm (minimum 3 points). We will calculate the acreage and automatically fetch live weather data for this region.
          </p>
        </div>
        <button onClick={clearMap} style={{ padding: '0.5rem 1rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#f87171', borderRadius: '0.5rem', cursor: 'pointer' }}>
          Clear Map
        </button>
      </div>

      <div style={{ height: '400px', width: '100%', borderRadius: '1rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
        <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          <MapInteraction points={points} setPoints={setPoints} />
          
          {points.map((p, i) => (
            <Marker key={i} position={p} />
          ))}
          
          {points.length >= 3 && (
            <Polygon positions={points} pathOptions={{ color: '#34d399', fillColor: '#34d399', fillOpacity: 0.4 }} />
          )}
        </MapContainer>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.5rem' }}>
        <div>
          <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Calculated Area</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#34d399' }}>{areaHectares.toFixed(2)} Hectares</div>
        </div>
        <div>
          <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Polygon Points</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{points.length}</div>
        </div>
        <button 
          className="primary-btn" 
          disabled={points.length < 3 || isProcessing}
          onClick={fetchLocationData}
        >
          {isProcessing ? 'Fetching Weather & Geo Data...' : 'Confirm Boundaries & Sync Weather'}
        </button>
      </div>
    </div>
  );
}
