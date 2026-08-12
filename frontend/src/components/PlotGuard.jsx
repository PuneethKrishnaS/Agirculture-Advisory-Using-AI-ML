import React from 'react';
import { usePlotContext } from '../contexts/PlotContext';
import { API_BASE_URL } from '../config';
import MapPickerModal from './MapPickerModal';
import { useToast } from '../contexts/ToastContext';

const PlotGuard = ({ children }) => {
  const { savedPlots, isLoading, fetchHistory, setActivePlotId } = usePlotContext();
  const { addToast } = useToast();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleMandatorySave = async ({ center, areaAcres, name }) => {
    const newLat = center.lat.toFixed(4);
    const newLng = center.lng.toFixed(4);
    const newArea = areaAcres.toFixed(2);
    const newName = name || `My First Plot`;

    try {
      addToast("Creating your first plot...", "info");
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      const payload = {
        userId: user ? user.id : '',
        location: newName,
        type: "New Plot Profile",
        status: "Created",
        formData: {
          fieldArea: newArea,
          latitude: newLat,
          longitude: newLng,
          plotName: newName
        }
      };

      const res = await fetch(`${API_BASE_URL}/api/save_history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if(data.success) {
        await fetchHistory(); // Refetch plots to lift the guard
        setActivePlotId(data.record.id);
        addToast("Welcome aboard! Your first plot is ready.", "success");
      } else {
        addToast("Failed to create plot.", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Failed to connect to backend.", "error");
    }
  };

  // If no plots exist, force the user to create one
  if (savedPlots.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8 relative z-50">
          <span translate="no" className="material-symbols-outlined notranslate text-6xl text-primary mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>agriculture</span>
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to AgriSmart</h1>
          <p className="text-muted-foreground">To get started, you need to map your first field.</p>
        </div>
        <MapPickerModal 
          isOpen={true} 
          onClose={() => {}} 
          onSave={handleMandatorySave} 
          isMandatory={true}
        />
      </div>
    );
  }

  return <>{children}</>;
};

export default PlotGuard;
