import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TopAppBar from '../components/TopAppBar';
import BottomNavBar from '../components/BottomNavBar';
import { usePlotContext } from '../contexts/PlotContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const ShapChart = ({ shapData, title, icon }) => {
  if (!shapData || shapData.length === 0) return null;
  
  const shapEntries = Array.isArray(shapData) ? shapData.slice(0, 5) : [];
  const chartData = shapEntries.map(([name, val]) => ({ name: name.replace(/_/g, ' '), value: Number(val) }));

  return (
    <div className="bg-white rounded-xl p-6 border border-outline-variant/20 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-title-lg font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">{icon}</span>
          {title} Reasoning
        </h3>
        <div className="flex gap-2">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-primary-container text-on-primary-container">Pos</span>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-error-container text-on-error-container">Neg</span>
        </div>
      </div>
      <div className="flex-1 min-h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 30, left: 100, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis type="number" tick={{fontSize: 12}} hide />
            <YAxis dataKey="name" type="category" tick={{fontSize: 11}} width={90} axisLine={false} tickLine={false} />
            <Tooltip cursor={{fill: 'rgba(0,0,0,0.03)'}} formatter={(value) => Number(value).toFixed(4)} />
            <Bar dataKey="value" radius={4} barSize={20}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#10b981' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const Advisory = () => {
  const { activePlot, activePlotId } = usePlotContext();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (!activePlot || !activePlot.formData) {
      return;
    }

    const fetchData = async () => {
      setResults(null);
      setLoading(true);
      try {
        const formData = activePlot.formData;

        // Fetch Crop
        const cropRes = await fetch('http://localhost:5000/api/predict_crop', {
          method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(formData)
        }).then(r => r.json());

        // Fetch Fertilizer
        const fertPayload = {
          Soil_pH: formData.ph, Soil_Moisture: formData.moisture, Organic_Carbon: formData.organicCarbon,
          Electrical_Conductivity: formData.electricalConductivity, Nitrogen_Level: formData.nitrogen,
          Phosphorus_Level: formData.phosphorus, Potassium_Level: formData.potassium,
          Temperature: formData.temperature, Humidity: formData.humidity, Rainfall: formData.rainfall,
          Fertilizer_Used_Last_Season: formData.fertilizerLastSeason || 0, Yield_Last_Season: formData.yieldLastSeason || 0,
          Soil_Type: formData.soilType || 'Loam', Crop_Type: formData.cropType || 'Wheat', Crop_Growth_Stage: formData.cropGrowthStage || 'Vegetative',
          Season: formData.season || 'Kharif', Irrigation_Type: formData.irrigationType || 'Canal', Previous_Crop: formData.previousCrop || 'Corn',
          Region: formData.region || 'North'
        };
        const fertRes = await fetch('http://localhost:5000/api/predict_fertilizer', {
          method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(fertPayload)
        }).then(r => r.json());

        // Fetch Irrigation
        const irrPayload = {
          Soil_pH: formData.ph, Soil_Moisture: formData.moisture, Organic_Carbon: formData.organicCarbon,
          Electrical_Conductivity: formData.electricalConductivity, Temperature_C: formData.temperature,
          Humidity: formData.humidity, Rainfall_mm: formData.rainfall, Sunlight_Hours: formData.sunlightHours || 8,
          Wind_Speed_kmh: formData.windSpeed || 10, Field_Area_hectare: formData.fieldArea || 1, Previous_Irrigation_mm: formData.previousIrrigation || 0,
          Soil_Type: formData.soilType || 'Loam', Crop_Type: formData.cropType || 'Wheat', Crop_Growth_Stage: formData.cropGrowthStage || 'Vegetative',
          Season: formData.season || 'Kharif', Irrigation_Type: formData.irrigationType || 'Canal', Water_Source: formData.waterSource || 'Well',
          Mulching_Used: formData.mulchingUsed || 'No', Region: formData.region || 'North'
        };
        const irrRes = await fetch('http://localhost:5000/api/predict_irrigation', {
          method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(irrPayload)
        }).then(r => r.json());

        setResults({
          crop: cropRes.recommended_crop || 'Unknown',
          cropShap: cropRes.shap_explanation || [],
          fertilizer: fertRes.recommended_fertilizer || 'Unknown',
          fertilizerShap: fertRes.shap_explanation || [],
          irrigation: irrRes.irrigation_need || 'Unknown',
          irrigationShap: irrRes.shap_explanation || []
        });
        setLoading(false);

      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, [activePlotId, activePlot]);

  return (
    <div className="bg-[#f8fafc] text-on-surface min-h-screen pb-32 font-sans">
      <TopAppBar />

      <main className="pt-24 pb-32 px-4 md:px-8 w-full">
        <section className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-sm font-bold text-primary uppercase tracking-widest">Master Dashboard</span>
              <h2 className="text-4xl font-extrabold text-foreground mt-2 tracking-tight">Full Spectrum Advisory</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mt-4">
                A unified view of Crop, Fertilizer, and Irrigation models executing concurrently for your plot.
              </p>
            </div>
            {activePlot && (
              <div className="flex flex-col items-end">
                <div className="text-label-md font-bold opacity-70 uppercase tracking-widest">Active Plot</div>
                <div className="text-headline-sm font-black text-primary">{activePlot.name || activePlot.location}</div>
              </div>
            )}
          </div>
        </section>

        {!activePlot && (
          <div className="bg-white rounded-2xl p-16 text-center border border-outline-variant/20">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/50 mb-4">location_off</span>
            <h3 className="text-2xl font-bold text-on-surface mb-2">No Plot Selected</h3>
            <p className="text-body-lg text-on-surface-variant mb-8">Select a plot from the top navigation bar to run the full advisory suite.</p>
            <Link to="/input" className="bg-primary text-white px-8 py-4 rounded-full font-bold shadow-lg hover:brightness-110 transition-all">Go to Data Input</Link>
          </div>
        )}

        {activePlot && loading && (
          <div className="bg-white rounded-2xl p-16 text-center border border-outline-variant/20 flex flex-col items-center">
             <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
             <p className="text-xl font-bold text-on-surface">Executing Machine Learning Models...</p>
             <p className="text-on-surface-variant mt-2">Processing Crop, Fertilizer, and Irrigation telemetry</p>
          </div>
        )}

        {activePlot && !loading && results && (
          <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
            
            {/* CROP CARD */}
            <div className="bg-white rounded-2xl border border-outline-variant/20 overflow-hidden flex flex-col md:flex-row">
              <div className="md:w-1/3 bg-gradient-to-br from-[#e8f5e9] to-[#c8e6c9] p-8 flex flex-col justify-center border-r border-outline-variant/20">
                <div className="p-4 bg-white/50 backdrop-blur-sm rounded-full w-fit mb-6">
                  <span className="material-symbols-outlined text-4xl text-[#2e7d32]">grass</span>
                </div>
                <h3 className="text-label-lg font-bold text-[#2e7d32] uppercase tracking-widest mb-2">Crop Recommendation</h3>
                <div className="text-5xl font-black text-on-surface capitalize">{results.crop.replace(/_/g, ' ')}</div>
              </div>
              <div className="md:w-2/3 p-6 bg-slate-50/50">
                <ShapChart shapData={results.cropShap} title="Crop" icon="psychology" />
              </div>
            </div>

            {/* FERTILIZER CARD */}
            <div className="bg-white rounded-2xl border border-outline-variant/20 overflow-hidden flex flex-col md:flex-row">
              <div className="md:w-1/3 bg-gradient-to-br from-[#fff3e0] to-[#ffe0b2] p-8 flex flex-col justify-center border-r border-outline-variant/20">
                <div className="p-4 bg-white/50 backdrop-blur-sm rounded-full w-fit mb-6">
                  <span className="material-symbols-outlined text-4xl text-[#ef6c00]">science</span>
                </div>
                <h3 className="text-label-lg font-bold text-[#ef6c00] uppercase tracking-widest mb-2">Fertilizer Requirement</h3>
                <div className="text-5xl font-black text-on-surface capitalize">{results.fertilizer.replace(/_/g, ' ')}</div>
              </div>
              <div className="md:w-2/3 p-6 bg-slate-50/50">
                <ShapChart shapData={results.fertilizerShap} title="Fertilizer" icon="compost" />
              </div>
            </div>

            {/* IRRIGATION CARD */}
            <div className="bg-white rounded-2xl border border-outline-variant/20 overflow-hidden flex flex-col md:flex-row">
              <div className="md:w-1/3 bg-gradient-to-br from-[#e1f5fe] to-[#b3e5fc] p-8 flex flex-col justify-center border-r border-outline-variant/20">
                <div className="p-4 bg-white/50 backdrop-blur-sm rounded-full w-fit mb-6">
                  <span className="material-symbols-outlined text-4xl text-[#0277bd]">water_drop</span>
                </div>
                <h3 className="text-label-lg font-bold text-[#0277bd] uppercase tracking-widest mb-2">Irrigation Status</h3>
                <div className="text-5xl font-black text-on-surface capitalize">{results.irrigation.replace(/_/g, ' ')}</div>
              </div>
              <div className="md:w-2/3 p-6 bg-slate-50/50">
                <ShapChart shapData={results.irrigationShap} title="Irrigation" icon="waves" />
              </div>
            </div>

          </div>
        )}
      </main>
      <BottomNavBar />
    </div>
  );
};

export default Advisory;
