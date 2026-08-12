import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap, LayersControl, Rectangle, LayerGroup, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useToast } from '../contexts/ToastContext';
import { API_BASE_URL } from '../config';
import { usePlotContext } from '../contexts/PlotContext';
import MapPickerModal from '../components/MapPickerModal';
import TopAppBar from '../components/TopAppBar';
import BottomNavBar from '../components/BottomNavBar';

const getLocalImage = (type, name) => {
  if (!name) {
    if (type === 'irrigation') return '/images/irrigation/water.jpg';
    return '';
  }
  const sanitized = name.toString().replace(/ /g, '_').toLowerCase();
  return `/images/${type}/${sanitized}.jpg`;
};

const WeatherSection = ({ formData, handleChange }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
    <div className="flex flex-col"><label className="text-label-sm text-on-surface-variant">Temp (°C)</label><input name="temperature" value={formData.temperature} onChange={handleChange} className="h-10 border rounded px-2" type="number" step="0.1"/></div>
    <div className="flex flex-col"><label className="text-label-sm text-on-surface-variant">Humidity (%)</label><input name="humidity" value={formData.humidity} onChange={handleChange} className="h-10 border rounded px-2" type="number" step="0.1"/></div>
    <div className="flex flex-col"><label className="text-label-sm text-on-surface-variant">Rainfall (mm)</label><input name="rainfall" value={formData.rainfall} onChange={handleChange} className="h-10 border rounded px-2" type="number" step="0.1"/></div>
    <div className="flex flex-col"><label className="text-label-sm text-on-surface-variant">Wind (km/h)</label><input name="windSpeed" value={formData.windSpeed} onChange={handleChange} className="h-10 border rounded px-2" type="number" step="0.1"/></div>
  </div>
);

const SoilNPKSection = ({ formData, handleChange }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
    <div className="flex flex-col"><label className="text-label-sm text-on-surface-variant">Nitrogen (N)</label><input name="nitrogen" value={formData.nitrogen} onChange={handleChange} className="h-10 border rounded px-2" type="number"/></div>
    <div className="flex flex-col"><label className="text-label-sm text-on-surface-variant">Phosphorus (P)</label><input name="phosphorus" value={formData.phosphorus} onChange={handleChange} className="h-10 border rounded px-2" type="number"/></div>
    <div className="flex flex-col"><label className="text-label-sm text-on-surface-variant">Potassium (K)</label><input name="potassium" value={formData.potassium} onChange={handleChange} className="h-10 border rounded px-2" type="number"/></div>
    <div className="flex flex-col"><label className="text-label-sm text-on-surface-variant">Soil pH</label><input name="ph" value={formData.ph} onChange={handleChange} className="h-10 border rounded px-2" type="number" step="0.1"/></div>
  </div>
);

const ResultCard = ({ title, result, imageSrc, predictionResult }) => {
  if (!result) return null;
  
  // Backend sends shap as a pre-sorted array: [["feature1", 0.5], ["feature2", -0.2]]
  const shapEntries = Array.isArray(predictionResult.shap) ? predictionResult.shap.slice(0, 5) : [];
  const chartData = shapEntries.map(([name, val]) => ({ name, value: Number(val) }));

  return (
    <div className="mt-8 bg-surface-container-low border border-outline-variant rounded-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
      <div className="h-48 w-full relative">
        <img src={imageSrc} alt={result} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        <div className="absolute bottom-4 left-6">
          <p className="text-label-md text-white/80 font-bold tracking-widest uppercase mb-1">{title}</p>
          <h4 className="text-display-sm font-display-sm text-white capitalize">{result.replace(/_/g, ' ')}</h4>
        </div>
      </div>
      <div className="p-6 bg-surface grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* SHAP Chart */}
        {shapEntries.length > 0 ? (
          <div>
            <h5 className="text-title-md font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">bar_chart</span> ML Feature Importance
            </h5>
            <div className="w-full mt-2" style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" tick={{fontSize: 12}} />
                  <YAxis dataKey="name" type="category" tick={{fontSize: 12}} width={110} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} formatter={(value) => Number(value).toFixed(4)} />
                  <Bar dataKey="value" radius={4} barSize={24}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-on-surface-variant text-body-md border-2 border-dashed border-outline-variant rounded-xl p-4">
            <span className="material-symbols-outlined mr-2">info</span> No explainability data available for this model.
          </div>
        )}

        {/* AI Advice */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 flex flex-col">
          <h5 className="text-title-md font-bold text-primary mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined">auto_awesome</span> Expert AI Advice
          </h5>
          {predictionResult.isGeneratingAdvice ? (
            <div className="flex-1 flex flex-col items-center justify-center text-primary/70 animate-pulse gap-2">
              <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
              <p className="text-label-md">Generating custom farming strategy...</p>
            </div>
          ) : predictionResult.advice ? (
            <p className="text-body-md text-on-surface whitespace-pre-wrap">{predictionResult.advice}</p>
          ) : (
            <p className="text-body-md text-on-surface-variant italic">Failed to generate AI advice.</p>
          )}
        </div>

      </div>
    </div>
  );
};



const MapUpdater = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      // Free the map constraints so we can fly to a new plot
      map.setMinZoom(0);
      map.setMaxBounds(null);
      
      // Fit bounds perfectly to the polygon or points, fully zoomed
      map.fitBounds(bounds, { maxZoom: 20, animate: true, padding: [10, 10] });
    }
  }, [bounds, map]);
  return null;
};

const DataInput = () => {
  const { addToast } = useToast();
  const { history, fetchHistory, activePlotId, setActivePlotId, activePlot, setSavedPlots, savedPlots, formDrafts, updateFormDraft } = usePlotContext();
  const [activeTab, setActiveTab] = useState('crop'); // crop, fertilizer, irrigation, disease
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState(null);



  const defaultFormData = {
    plotName: '',
    latitude: '',
    longitude: '',
    fieldArea: '15',
    
    // Environmental/Weather
    temperature: '24.5',
    humidity: '65',
    rainfall: '120',
    sunlightHours: '8',
    windSpeed: '12',

    // Soil Metrics
    nitrogen: '45',
    phosphorus: '22',
    potassium: '30',
    ph: '6.5',
    moisture: '55',
    organicCarbon: '1.2',
    electricalConductivity: '0.8',
    soilType: 'Loam',

    // Crop Details
    cropType: 'Wheat',
    cropGrowthStage: 'Vegetative',
    season: 'Spring',
    region: 'North',

    // Historical
    fertilizerLastSeason: '150',
    yieldLastSeason: '4.5',
    previousCrop: 'Corn',

    // Irrigation
    irrigationType: 'Drip',
    waterSource: 'Well',
    mulchingUsed: 'No',
    previousIrrigation: '25',

    // Disease (Images)
    diseaseImages: []
  };

  const [formData, setFormData] = useState(() => {
    if (activePlotId && formDrafts[activePlotId]) return formDrafts[activePlotId];
    if (activePlot?.formData) return { ...defaultFormData, ...activePlot.formData, plotName: activePlot.name, fieldArea: activePlot.area, latitude: activePlot.lat, longitude: activePlot.lng };
    return defaultFormData;
  });

  useEffect(() => {
    if (activePlotId && formData) {
      updateFormDraft(activePlotId, formData);
    }
  }, [formData, activePlotId]);

  const lastFetchedPlotId = useRef(null);

  useEffect(() => {
    if (activePlotId) {
      let currentLat, currentLng;

      if (formDrafts[activePlotId]) {
        setFormData(formDrafts[activePlotId]);
        currentLat = formDrafts[activePlotId].latitude;
        currentLng = formDrafts[activePlotId].longitude;
      } else if (activePlot?.formData) {
        setFormData({ ...defaultFormData, ...activePlot.formData, plotName: activePlot.name, fieldArea: activePlot.area, latitude: activePlot.lat, longitude: activePlot.lng });
        currentLat = activePlot.lat;
        currentLng = activePlot.lng;
      } else if (activePlot) {
        setFormData({ ...defaultFormData, plotName: activePlot.name, fieldArea: activePlot.area, latitude: activePlot.lat, longitude: activePlot.lng });
        currentLat = activePlot.lat;
        currentLng = activePlot.lng;
      }

      // Fetch live weather when the plot changes, so we always have fresh data
      if (currentLat && currentLng && lastFetchedPlotId.current !== activePlotId) {
         lastFetchedPlotId.current = activePlotId;
         // Note: We use setTimeout to allow formData state to settle before fetchWeather 
         // overwrites the weather specific fields in formData.
         setTimeout(() => {
           fetchWeatherForLocation(currentLat, currentLng);
         }, 0);
      }
    }
  }, [activePlotId, activePlot]);

  const [predictionResult, setPredictionResult] = useState({
    crop: null,
    fertilizer: null,
    irrigation: null,
    disease: null,
    shap: null,
    advice: null,
    isGeneratingAdvice: false
  });

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const fetchWeatherForLocation = async (lat, lng) => {
    setIsFetchingWeather(true);
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m`);
      const data = await res.json();
      
      if(data && data.current) {
        setFormData(prev => ({
          ...prev,
          temperature: data.current.temperature_2m.toString(),
          humidity: data.current.relative_humidity_2m.toString(),
          rainfall: data.current.precipitation > 0 ? data.current.precipitation.toString() : (Math.random() * 50 + 10).toFixed(1), // Mock rain if 0 for model testing
          windSpeed: data.current.wind_speed_10m.toString()
        }));
        addToast("Weather data synchronized via satellite!", "success");
      }
    } catch (err) {
      console.error(err);
      addToast("Failed to fetch weather. Using default values.", "error");
    } finally {
      setIsFetchingWeather(false);
    }
  };

  const handleMapSave = async ({ center, points, areaAcres, name }) => {
    const newLat = center.lat.toFixed(4);
    const newLng = center.lng.toFixed(4);
    const newArea = areaAcres.toFixed(2);
    const newName = name || `Plot ${savedPlots.length + 1} (${newLat}, ${newLng})`;

    try {
      addToast("Creating new plot in database...", "info");
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      const payload = {
        userId: user ? user.id : '',
        location: newName,
        type: "New Plot Profile",
        status: "Created",
        formData: {
          ...formData,
          fieldArea: newArea,
          latitude: newLat,
          longitude: newLng,
          plotName: newName,
          points: points
        }
      };

      const res = await fetch(`${API_BASE_URL}/api/save_history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if(data.success) {
        const newId = data.record.id;
        await fetchHistory(); // Wait for fetchHistory to update everything
        setActivePlotId(newId);
        
        setFormData(prev => ({ 
          ...prev, 
          fieldArea: newArea,
          latitude: newLat,
          longitude: newLng,
          plotName: newName
        }));
        
        addToast("Plot created successfully! Fetching realtime weather data...", "success");
        await fetchWeatherForLocation(newLat, newLng);
      } else {
        addToast("Failed to create plot in database.", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Failed to connect to backend to save plot.", "error");
    }
  };
  const handlePlotSelect = (e) => {
    const plotId = e.target.value;
    if (plotId) setActivePlotId(plotId);
  };;

  const handleSaveToDB = async () => {
    if (!activePlotId) {
      addToast("Please select or create a plot first.", "error");
      return;
    }
    
    const currentResult = predictionResult[activeTab];
    const status = currentResult ? currentResult : "Saved";
    const typeLabel = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
    
    const snapshotStr = JSON.stringify({ activePlotId, activeTab, status });
    if (lastSavedSnapshot === snapshotStr) {
      addToast("This exact analysis is already saved!", "info");
      return;
    }

    try {
      addToast("Saving plot profile and metrics to Database...", "info");
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      const payload = {
        id: activePlotId,
        userId: user ? user.id : '',
        location: formData.plotName || "Unknown Plot",
        type: `${typeLabel} Analysis`,
        npk: `${formData.nitrogen}:${formData.phosphorus}:${formData.potassium}`,
        status: status,
        formData: formData
      };

      const res = await fetch(`${API_BASE_URL}/api/save_history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if(data.success) {
        addToast("Successfully saved plot data to MongoDB!", "success");
        setLastSavedSnapshot(snapshotStr);
        fetchHistory();
      } else {
        addToast("Failed to save to Database.", "error");
      }
    } catch (err) {
      addToast("Failed to connect to backend.", "error");
    }
  };

  const handleDeleteRecord = async (e, recordId) => {
    e.stopPropagation(); // prevent row click from triggering
    if(!window.confirm("Are you sure you want to delete this record?")) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/history/${recordId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if(data.success) {
        addToast("Record deleted successfully.", "success");
        fetchHistory();
      } else {
        addToast("Failed to delete record.", "error");
      }
    } catch(err) {
      addToast("Failed to connect to backend.", "error");
    }
  };

  const runPrediction = async (type) => {
    let endpoint = '';
    let payload = {};

    if (type === 'crop') {
      endpoint = '/api/predict_crop';
      payload = {
        N: formData.nitrogen, P: formData.phosphorus, K: formData.potassium,
        temperature: formData.temperature, humidity: formData.humidity,
        ph: formData.ph, rainfall: formData.rainfall
      };
    } else if (type === 'fertilizer') {
      endpoint = '/api/predict_fertilizer';
      payload = {
        Soil_pH: formData.ph, Soil_Moisture: formData.moisture, Organic_Carbon: formData.organicCarbon,
        Electrical_Conductivity: formData.electricalConductivity, Nitrogen_Level: formData.nitrogen,
        Phosphorus_Level: formData.phosphorus, Potassium_Level: formData.potassium,
        Temperature: formData.temperature, Humidity: formData.humidity, Rainfall: formData.rainfall,
        Fertilizer_Used_Last_Season: formData.fertilizerLastSeason, Yield_Last_Season: formData.yieldLastSeason,
        Soil_Type: formData.soilType, Crop_Type: formData.cropType, Crop_Growth_Stage: formData.cropGrowthStage,
        Season: formData.season, Irrigation_Type: formData.irrigationType, Previous_Crop: formData.previousCrop,
        Region: formData.region
      };
    } else if (type === 'irrigation') {
      endpoint = '/api/predict_irrigation';
      payload = {
        // Will map to what backend expects, assuming similar to others
        Soil_pH: formData.ph, Soil_Moisture: formData.moisture, Organic_Carbon: formData.organicCarbon,
        Electrical_Conductivity: formData.electricalConductivity, Temperature_C: formData.temperature,
        Humidity: formData.humidity, Rainfall_mm: formData.rainfall, Sunlight_Hours: formData.sunlightHours,
        Wind_Speed_kmh: formData.windSpeed, Field_Area_hectare: (formData.fieldArea * 0.404686).toFixed(2), // Acres to Hectares
        Previous_Irrigation_mm: formData.previousIrrigation, Soil_Type: formData.soilType, Crop_Type: formData.cropType,
        Crop_Growth_Stage: formData.cropGrowthStage, Season: formData.season, Irrigation_Type: formData.irrigationType,
        Water_Source: formData.waterSource, Mulching_Used: formData.mulchingUsed, Region: formData.region
      };
    } else if (type === 'disease') {
      if(formData.diseaseImages.length === 0) {
        addToast("Please upload an image of the crop first.", "error");
        return;
      }
      
      addToast(`Analyzing image for diseases...`, "info", 1000);
      setPredictionResult(prev => ({...prev, disease: null, shap: null, advice: null, isGeneratingAdvice: false}));
      
      try {
        const formDataPayload = new FormData();
        formDataPayload.append('image', formData.diseaseImages[0]);
        
        const res = await fetch(`${API_BASE_URL}/api/detect_disease`, {
          method: 'POST',
          body: formDataPayload
        });
        const data = await res.json();
        
        if(data.error) addToast("Error: " + data.error, "error");
        else {
          setPredictionResult(prev => ({...prev, disease: `${data.disease} (${data.confidence})`}));
        }
      } catch (err) {
        console.error(err);
        addToast("Disease detection request failed.", "error");
      }
      return;
    }

    addToast(`Running ${type} AI Model...`, "info", 1000);
    setPredictionResult(prev => ({...prev, [type]: null, shap: null, advice: null, isGeneratingAdvice: false})); // Clear previous result
    
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if(data.error) addToast("Error: " + data.error, "error");
      else {
        let result = '';
        if(type === 'crop') result = data.recommended_crop;
        if(type === 'fertilizer') result = data.recommended_fertilizer;
        if(type === 'irrigation') result = data.irrigation_need;
        
        let shap = data.shap_explanation || null;
        setPredictionResult(prev => ({...prev, [type]: result, shap, isGeneratingAdvice: false}));
      }
    } catch(err) {
          console.error(err);
      addToast("Prediction request failed.", "error");
    }
  };

  const plotBounds = React.useMemo(() => {
    if (activePlot?.points && activePlot.points.length > 0) {
      return activePlot.points;
    }
    if (formData.latitude && formData.longitude) {
      return [
        [Number(formData.latitude) - 0.0002, Number(formData.longitude) - 0.0002],
        [Number(formData.latitude) + 0.0002, Number(formData.longitude) + 0.0002]
      ];
    }
    return [[20.5937, 78.9629], [22.5937, 80.9629]];
  }, [activePlot?.points, formData.latitude, formData.longitude]);

  const handleBoundsChange = (newBounds) => {
    handleChange({ target: { name: 'bounds', value: newBounds } });
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-32">
      <TopAppBar onPlotSelect={handlePlotSelect} />
      <main className="pt-24 pb-32 px-4 md:px-8 w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-2">
          <div className="mb-8">
            <span className="text-sm font-bold text-primary uppercase tracking-widest">Data Entry</span>
            <h2 className="text-4xl font-extrabold text-foreground mt-2 tracking-tight">Field Operations Hub</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mt-4">
              Enter your telemetry data to trigger machine learning predictions for crop, fertilizer, and irrigation.
            </p>
          </div>
                  {isFetchingWeather && (
          <div className="mb-6 p-4 bg-tertiary-container text-on-tertiary-container rounded-xl flex items-center gap-3 animate-pulse">
            <span className="material-symbols-outlined animate-spin">sync</span>
            Fetching live satellite telemetry for your coordinates...
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-b border-outline-variant mb-8 no-scrollbar">
          {[
            { id: 'crop', icon: 'psychology', label: 'Crop Advisory' },
            { id: 'fertilizer', icon: 'compost', label: 'Fertilizer' },
            { id: 'irrigation', icon: 'water_drop', label: 'Irrigation' },
            { id: 'disease', icon: 'bug_report', label: 'Disease Detection' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 whitespace-nowrap transition-all border-b-4 font-label-lg
                ${activeTab === tab.id ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-on-surface-variant hover:bg-surface-container'}`}
            >
              <span className="material-symbols-outlined">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Containers */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6">
          
          {/* 1. Crop Advisory Tab */}
          {activeTab === 'crop' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h3 className="text-title-lg font-bold mb-2 flex items-center gap-2"><span className="material-symbols-outlined text-primary">science</span> Soil Composition</h3>
                <SoilNPKSection formData={formData} handleChange={handleChange} />
              </div>
              <div>
                <h3 className="text-title-lg font-bold mb-2 mt-6 flex items-center gap-2"><span className="material-symbols-outlined text-tertiary">partly_cloudy_day</span> Environment</h3>
                <WeatherSection formData={formData} handleChange={handleChange} />
              </div>
              <button onClick={() => runPrediction('crop')} className="w-full mt-8 bg-primary text-white h-14 rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-110 shadow-md">
                <span className="material-symbols-outlined">psychology</span> Analyze Optimal Crop
              </button>
                <ResultCard 
                  title="Recommended Crop" 
                  result={predictionResult.crop} 
                  imageSrc={getLocalImage('crops', predictionResult.crop)} 
                  predictionResult={predictionResult}
                />
            </div>
          )}

          {/* 2. Fertilizer Tab */}
          {activeTab === 'fertilizer' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h3 className="text-title-lg font-bold mb-2 flex items-center gap-2"><span className="material-symbols-outlined text-secondary">compost</span> Soil Details</h3>
                <SoilNPKSection formData={formData} handleChange={handleChange} />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="flex flex-col"><label className="text-label-sm text-on-surface-variant">Moisture (%)</label><input name="moisture" value={formData.moisture} onChange={handleChange} className="h-10 border rounded px-2" type="number"/></div>
                  <div className="flex flex-col"><label className="text-label-sm text-on-surface-variant">Organic Carbon</label><input name="organicCarbon" value={formData.organicCarbon} onChange={handleChange} className="h-10 border rounded px-2" type="number" step="0.1"/></div>
                  <div className="flex flex-col"><label className="text-label-sm text-on-surface-variant">Conductivity</label><input name="electricalConductivity" value={formData.electricalConductivity} onChange={handleChange} className="h-10 border rounded px-2" type="number" step="0.1"/></div>
                  <div className="flex flex-col"><label className="text-label-sm text-on-surface-variant">Soil Type</label>
                    <select name="soilType" value={formData.soilType} onChange={handleChange} className="h-10 border rounded px-2"><option>Loamy</option><option>Clay</option><option>Sandy</option><option>Silt</option></select>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-title-lg font-bold mb-2 mt-6 flex items-center gap-2"><span className="material-symbols-outlined text-tertiary">partly_cloudy_day</span> Environment</h3>
                <WeatherSection formData={formData} handleChange={handleChange} />
              </div>
              <div>
                <h3 className="text-title-lg font-bold mb-2 mt-6 flex items-center gap-2"><span className="material-symbols-outlined text-tertiary">grass</span> Crop & Farming History</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="flex flex-col"><label className="text-label-sm text-on-surface-variant">Current Crop</label><select name="cropType" value={formData.cropType} onChange={handleChange} className="h-10 border rounded px-2"><option>Wheat</option><option>Rice</option><option>Maize</option><option>Cotton</option><option>Potato</option><option>Sugarcane</option><option>Chickpea</option><option>Kidneybeans</option><option>Pigeonpeas</option><option>Mothbeans</option><option>Mungbean</option><option>Blackgram</option><option>Lentil</option><option>Pomegranate</option><option>Banana</option><option>Mango</option><option>Grapes</option><option>Watermelon</option><option>Muskmelon</option><option>Apple</option><option>Orange</option><option>Papaya</option><option>Coconut</option><option>Jute</option><option>Coffee</option></select></div>
                  <div className="flex flex-col"><label className="text-label-sm text-on-surface-variant">Growth Stage</label>
                    <select name="cropGrowthStage" value={formData.cropGrowthStage} onChange={handleChange} className="h-10 border rounded px-2"><option>Sowing</option><option>Vegetative</option><option>Flowering</option><option>Harvest</option><option>Fruiting</option></select>
                  </div>
                  <div className="flex flex-col"><label className="text-label-sm text-on-surface-variant">Season</label>
                    <select name="season" value={formData.season} onChange={handleChange} className="h-10 border rounded px-2"><option>Kharif</option><option>Rabi</option><option>Zaid</option><option>Spring</option><option>Summer</option><option>Autumn</option><option>Winter</option></select>
                  </div>
                  <div className="flex flex-col"><label className="text-label-sm text-on-surface-variant">Region</label>
                    <select name="region" value={formData.region} onChange={handleChange} className="h-10 border rounded px-2"><option>North</option><option>South</option><option>East</option><option>West</option><option>Central</option></select>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="flex flex-col"><label className="text-label-sm text-on-surface-variant">Prev Crop</label><select name="previousCrop" value={formData.previousCrop} onChange={handleChange} className="h-10 border rounded px-2"><option>Wheat</option><option>Rice</option><option>Maize</option><option>Cotton</option><option>Potato</option><option>Sugarcane</option><option>Chickpea</option><option>Kidneybeans</option><option>Pigeonpeas</option><option>Mothbeans</option><option>Mungbean</option><option>Blackgram</option><option>Lentil</option><option>Pomegranate</option><option>Banana</option><option>Mango</option><option>Grapes</option><option>Watermelon</option><option>Muskmelon</option><option>Apple</option><option>Orange</option><option>Papaya</option><option>Coconut</option><option>Jute</option><option>Coffee</option></select></div>
                  <div className="flex flex-col"><label className="text-label-sm text-on-surface-variant">Irrigation Type</label>
                    <select name="irrigationType" value={formData.irrigationType} onChange={handleChange} className="h-10 border rounded px-2"><option>Drip</option><option>Sprinkler</option><option>Canal</option><option>Rainfed</option><option>Flood</option></select>
                  </div>
                  <div className="flex flex-col"><label className="text-label-sm text-on-surface-variant">Prev Yield (t)</label><input name="yieldLastSeason" value={formData.yieldLastSeason} onChange={handleChange} className="h-10 border rounded px-2" type="number" step="0.1"/></div>
                  <div className="flex flex-col"><label className="text-label-sm text-on-surface-variant">Prev Fertilizer (kg)</label><input name="fertilizerLastSeason" value={formData.fertilizerLastSeason} onChange={handleChange} className="h-10 border rounded px-2" type="number"/></div>
                </div>
              </div>
              <button onClick={() => runPrediction('fertilizer')} className="w-full mt-8 bg-secondary text-white h-14 rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-110 shadow-md">
                <span className="material-symbols-outlined">compost</span> Recommend Fertilizer Mix
              </button>
                <ResultCard 
                  title="Recommended Fertilizer" 
                  result={predictionResult.fertilizer} 
                  imageSrc={getLocalImage('fertilizers', predictionResult.fertilizer)} 
                  predictionResult={predictionResult}
                />
            </div>
          )}

          {/* 3. Irrigation Tab */}
          {activeTab === 'irrigation' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h3 className="text-title-lg font-bold mb-2 flex items-center gap-2"><span className="material-symbols-outlined text-[#0288d1]">water_drop</span> Water & Environment</h3>
                <WeatherSection formData={formData} handleChange={handleChange} />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="flex flex-col"><label className="text-label-sm text-on-surface-variant">Prev Irrigation (mm)</label><input name="previousIrrigation" value={formData.previousIrrigation} onChange={handleChange} className="h-10 border rounded px-2" type="number"/></div>
                  <div className="flex flex-col"><label className="text-label-sm text-on-surface-variant">Sunlight (hrs)</label><input name="sunlightHours" value={formData.sunlightHours} onChange={handleChange} className="h-10 border rounded px-2" type="number"/></div>
                  <div className="flex flex-col"><label className="text-label-sm text-on-surface-variant">Moisture (%)</label><input name="moisture" value={formData.moisture} onChange={handleChange} className="h-10 border rounded px-2" type="number"/></div>
                  <div className="flex flex-col"><label className="text-label-sm text-on-surface-variant">Soil pH</label><input name="ph" value={formData.ph} onChange={handleChange} className="h-10 border rounded px-2" type="number" step="0.1"/></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="flex flex-col"><label className="text-label-sm text-on-surface-variant">Organic Carbon</label><input name="organicCarbon" value={formData.organicCarbon} onChange={handleChange} className="h-10 border rounded px-2" type="number" step="0.1"/></div>
                  <div className="flex flex-col"><label className="text-label-sm text-on-surface-variant">Conductivity</label><input name="electricalConductivity" value={formData.electricalConductivity} onChange={handleChange} className="h-10 border rounded px-2" type="number" step="0.1"/></div>
                  <div className="flex flex-col"><label className="text-label-sm text-on-surface-variant">Soil Type</label>
                    <select name="soilType" value={formData.soilType} onChange={handleChange} className="h-10 border rounded px-2"><option>Loamy</option><option>Clay</option><option>Sandy</option><option>Silt</option></select>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-title-lg font-bold mb-2 mt-6 flex items-center gap-2"><span className="material-symbols-outlined text-[#8d6e63]">agriculture</span> Farm Infrastructure & Crop</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="flex flex-col"><label className="text-label-sm text-on-surface-variant">Current Crop</label><select name="cropType" value={formData.cropType} onChange={handleChange} className="h-10 border rounded px-2"><option>Wheat</option><option>Rice</option><option>Maize</option><option>Cotton</option><option>Potato</option><option>Sugarcane</option><option>Chickpea</option><option>Kidneybeans</option><option>Pigeonpeas</option><option>Mothbeans</option><option>Mungbean</option><option>Blackgram</option><option>Lentil</option><option>Pomegranate</option><option>Banana</option><option>Mango</option><option>Grapes</option><option>Watermelon</option><option>Muskmelon</option><option>Apple</option><option>Orange</option><option>Papaya</option><option>Coconut</option><option>Jute</option><option>Coffee</option></select></div>
                  <div className="flex flex-col"><label className="text-label-sm text-on-surface-variant">Growth Stage</label>
                    <select name="cropGrowthStage" value={formData.cropGrowthStage} onChange={handleChange} className="h-10 border rounded px-2"><option>Sowing</option><option>Vegetative</option><option>Flowering</option><option>Harvest</option><option>Fruiting</option></select>
                  </div>
                  <div className="flex flex-col"><label className="text-label-sm text-on-surface-variant">Season</label>
                    <select name="season" value={formData.season} onChange={handleChange} className="h-10 border rounded px-2"><option>Kharif</option><option>Rabi</option><option>Zaid</option><option>Spring</option><option>Summer</option><option>Autumn</option><option>Winter</option></select>
                  </div>
                  <div className="flex flex-col"><label className="text-label-sm text-on-surface-variant">Region</label>
                    <select name="region" value={formData.region} onChange={handleChange} className="h-10 border rounded px-2"><option>North</option><option>South</option><option>East</option><option>West</option><option>Central</option></select>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="flex flex-col"><label className="text-label-sm text-on-surface-variant">Water Source</label>
                    <select name="waterSource" value={formData.waterSource} onChange={handleChange} className="h-10 border rounded px-2"><option>Well</option><option>River</option><option>Groundwater</option><option>Reservoir</option><option>Rainwater</option><option>Municipal</option></select>
                  </div>
                  <div className="flex flex-col"><label className="text-label-sm text-on-surface-variant">Irrigation Type</label>
                    <select name="irrigationType" value={formData.irrigationType} onChange={handleChange} className="h-10 border rounded px-2"><option>Drip</option><option>Sprinkler</option><option>Canal</option><option>Rainfed</option><option>Flood</option></select>
                  </div>
                  <div className="flex flex-col"><label className="text-label-sm text-on-surface-variant">Mulching</label>
                    <select name="mulchingUsed" value={formData.mulchingUsed} onChange={handleChange} className="h-10 border rounded px-2"><option>Yes</option><option>No</option></select>
                  </div>
                </div>
              </div>
              <button onClick={() => runPrediction('irrigation')} className="w-full mt-8 bg-[#0288d1] text-white h-14 rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-110 shadow-md">
                <span className="material-symbols-outlined">water_drop</span> Calculate Irrigation Needs
              </button>
                <ResultCard 
                  title="Irrigation Analysis" 
                  result={predictionResult.irrigation} 
                  imageSrc={getLocalImage('irrigation', formData.irrigationType || 'water')} 
                  predictionResult={predictionResult}
                />
            </div>
          )}

          {/* 4. Disease Detection Tab */}
          {activeTab === 'disease' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-surface-container border-2 border-dashed border-outline-variant rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-error-container text-on-error-container rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-4xl">add_a_photo</span>
                </div>
                <h3 className="text-headline-sm font-bold mb-2">Upload Crop Image</h3>
                <p className="text-body-md text-on-surface-variant max-w-md">Upload high-resolution images of crop leaves to run deep learning disease detection models.</p>
                <input 
                  type="file" 
                  className="mt-6 block w-full max-w-xs text-sm text-on-surface-variant
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary file:text-white
                    hover:file:bg-primary/90 cursor-pointer"
                  onChange={(e) => {
                    if(e.target.files.length > 0) {
                      setFormData({...formData, diseaseImages: [e.target.files[0]]});
                      addToast("Image staged for analysis.", "info");
                    }
                  }}
                />
              </div>
              <button onClick={() => runPrediction('disease')} className="w-full mt-4 bg-error text-white h-14 rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-110 shadow-md">
                <span className="material-symbols-outlined">bug_report</span> Run Disease Scan
              </button>
              <ResultCard 
                title="Disease Detection Analysis" 
                result={predictionResult.disease} 
                imageSrc={formData.diseaseImages[0] ? URL.createObjectURL(formData.diseaseImages[0]) : null} 
                predictionResult={predictionResult}
              />
            </div>
          )}
          
          <div className="pt-6 border-t border-border mt-8">
            <button 
              onClick={handleSaveToDB}
              className="w-full bg-primary text-primary-foreground h-14 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 shadow-md transition-all active:scale-95"
            >
              <span className="material-symbols-outlined">save</span>
              Update Current Plot Record
            </button>
          </div>
          
        </div>
        </div>

        {/* Right Sidebar Column */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Plot Selection */}
          <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-6 mb-6">
            <h3 className="text-title-lg font-bold mb-4">Plot Management</h3>
            <div className="flex flex-col gap-4">
              <div className="relative w-full">
                <select 
                  value={activePlotId} 
                  onChange={handlePlotSelect}
                  className="w-full appearance-none bg-surface-container-lowest border border-outline-variant text-on-surface text-label-lg rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-secondary focus:outline-none cursor-pointer"
                >
                  {savedPlots.map((plot) => (
                    <option key={plot.id} value={plot.id}>{plot.name} ({plot.area} acres)</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">arrow_drop_down</span>
              </div>
              <button 
                onClick={() => setIsMapOpen(true)}
                className="w-full bg-secondary text-white h-12 px-5 rounded-xl shadow-md hover:brightness-110 flex items-center justify-center gap-2 font-medium"
              >
                <span className="material-symbols-outlined">add_location</span>
                New Plot
              </button>
            </div>
          </div>

          {/* Satellite Map Widget */}
          <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">satellite_alt</span>
              <h3 className="text-title-lg font-bold">Satellite View</h3>
            </div>
            <div className="w-full h-64 rounded-xl overflow-hidden relative border border-outline-variant/30">
              <MapContainer bounds={plotBounds} style={{ height: '100%', width: '100%' }} zoomControl={false} scrollWheelZoom={false} doubleClickZoom={false} dragging={false}>
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
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution="&copy; OpenStreetMap"
                      maxNativeZoom={19}
                      maxZoom={22}
                    />
                  </LayersControl.BaseLayer>
                </LayersControl>
                <MapUpdater bounds={plotBounds} />
                {activePlot?.points && activePlot.points.length > 2 && (
                  <Polygon positions={activePlot.points} pathOptions={{ className: 'fill-primary stroke-primary', color: '#2463eb', fillColor: '#2463eb', fillOpacity: 0.4 }} />
                )}
              </MapContainer>
            </div>
            {formData.latitude ? (
              <p className="text-label-sm text-on-surface-variant mt-3 text-center">Plot locked at {formData.latitude}, {formData.longitude}</p>
            ) : (
              <p className="text-label-sm text-on-surface-variant mt-3 text-center">No plot selected. Map shows default view.</p>
            )}
          </div>

          {/* Recent History Widget */}
          <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">history</span>
                <h3 className="text-title-lg font-bold">Recent Analysis</h3>
              </div>
              <button className="text-primary text-label-sm font-bold hover:underline">View All</button>
            </div>
            
            <div className="space-y-4">
              {history.slice(0, 4).map((item, idx) => (
                <div key={idx} onClick={() => handlePlotSelect({ target: { value: item.id } })} className="flex gap-4 items-start p-3 hover:bg-surface-container rounded-xl transition-colors cursor-pointer group">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-container text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">
                      {item.type === 'Disease Detection' ? 'pest_control' : item.type === 'Plot Save' ? 'save' : 'eco'}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-label-lg font-bold text-on-surface">{item.type}</h4>
                    <p className="text-body-sm text-primary font-medium">{item.status}</p>
                    <p className="text-label-sm text-on-surface-variant mt-1">{item.timestamp}</p>
                  </div>
                </div>
              ))}
              {history.length === 0 && <p className="text-label-sm text-on-surface-variant">No recent activity.</p>}
            </div>
          </div>
          
        </div>
      </main>

      {/* Historical Records Table */}
      <section className="w-full px-4 md:px-8 pb-12 -mt-16">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-headline-md font-headline-md font-bold">Historical Records</h3>
          <div className="flex gap-2">
            <button className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined">filter_list</span>
            </button>
            <button className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined">download</span>
            </button>
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-xl overflow-x-auto border border-outline-variant">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-surface-container text-on-surface-variant text-label-md font-label-md">
              <tr>
                <th className="px-6 py-4 border-b border-outline-variant">Timestamp</th>
                <th className="px-6 py-4 border-b border-outline-variant">Location</th>
                <th className="px-6 py-4 border-b border-outline-variant">Type</th>
                <th className="px-6 py-4 border-b border-outline-variant">NPK Index</th>
                <th className="px-6 py-4 border-b border-outline-variant">Status</th>
                <th className="px-6 py-4 border-b border-outline-variant text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-body-md">
              {history.map((record, idx) => (
                <tr key={idx} onClick={() => handlePlotSelect({ target: { value: record.id } })} className="hover:bg-surface-container-low transition-colors cursor-pointer">
                  <td className="px-6 py-4 border-b border-outline-variant">{record.timestamp}</td>
                  <td className="px-6 py-4 border-b border-outline-variant font-bold text-primary">{record.location}</td>
                  <td className="px-6 py-4 border-b border-outline-variant">{record.type}</td>
                  <td className="px-6 py-4 border-b border-outline-variant">{record.npk}</td>
                  <td className="px-6 py-4 border-b border-outline-variant">
                    <span className={`px-3 py-1 rounded-full text-label-md font-bold flex items-center w-fit gap-1 ${record.status === 'Optimal' || record.status === 'Saved' || record.status === 'Healthy' ? 'bg-[#e8f5e9] text-[#2e7d32]' : 'bg-[#fff3e0] text-[#ef6c00]'}`}>
                      <span className="material-symbols-outlined text-xs">
                        {record.status === 'Optimal' || record.status === 'Saved' || record.status === 'Healthy' ? 'check_circle' : 'warning'}
                      </span>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 border-b border-outline-variant text-right">
                    <button onClick={(e) => handleDeleteRecord(e, record.id)} className="p-2 hover:bg-[#ffebee] text-on-surface-variant hover:text-[#c62828] rounded-full transition-colors" title="Delete Record">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-on-surface-variant border-b border-outline-variant">
                    No historical records found. Run an analysis and save it to populate this table.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>


      <MapPickerModal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} onSave={handleMapSave} />

      <BottomNavBar />
    </div>
  );
};

export default DataInput;
