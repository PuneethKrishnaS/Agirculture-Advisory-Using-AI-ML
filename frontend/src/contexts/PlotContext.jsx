import React, { createContext, useState, useEffect, useContext } from 'react';

export const PlotContext = createContext();

export const usePlotContext = () => useContext(PlotContext);

export const PlotProvider = ({ children }) => {
  const [history, setHistory] = useState([]);
  const [savedPlots, setSavedPlots] = useState([]);
  const [activePlotId, setActivePlotId] = useState(null);
  const [activePlot, setActivePlot] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formDrafts, setFormDrafts] = useState({});
  const [advisoryResults, setAdvisoryResults] = useState({});

  const updateAdvisoryResult = (plotId, result) => {
    if (!plotId) return;
    setAdvisoryResults(prev => ({ ...prev, [plotId]: result }));
  };

  const updateFormDraft = (plotId, newFormData) => {
    if (!plotId) return;
    setFormDrafts(prev => ({ ...prev, [plotId]: newFormData }));
  };

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/history');
      const data = await res.json();
      if (Array.isArray(data)) {
        setHistory(data);
        
        const loadedPlots = data.map(h => ({
          id: h.id || Math.random().toString(),
          name: h.location,
          lat: h.formData?.latitude || '',
          lng: h.formData?.longitude || '',
          area: h.formData?.fieldArea || '',
          formData: h.formData || null
        }));
        setSavedPlots(loadedPlots);

        const savedAdvisories = {};
        data.forEach(h => {
          if (h.advisoryResults && h.id) {
            savedAdvisories[h.id] = h.advisoryResults;
          }
        });
        if (Object.keys(savedAdvisories).length > 0) {
          setAdvisoryResults(prev => ({...prev, ...savedAdvisories}));
        }

        // If we have an activePlotId, update the activePlot object
        if (activePlotId) {
          const found = loadedPlots.find(p => p.id === activePlotId);
          setActivePlot(found || null);
        } else if (loadedPlots.length > 0) {
          // Default to the first plot if none selected
          setActivePlotId(loadedPlots[0].id);
          setActivePlot(loadedPlots[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch plot history", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // When activePlotId changes manually, update the activePlot object
  useEffect(() => {
    if (savedPlots.length > 0) {
      const found = savedPlots.find(p => p.id === activePlotId);
      setActivePlot(found || null);
    }
  }, [activePlotId, savedPlots]);

  return (
    <PlotContext.Provider value={{
      history,
      activePlotId,
      activePlot,
      savedPlots,
      setSavedPlots,
      setActivePlotId,
      fetchHistory,
      isLoading,
      formDrafts,
      updateFormDraft,
      advisoryResults,
      updateAdvisoryResult
    }}>
      {children}
    </PlotContext.Provider>
  );
};
