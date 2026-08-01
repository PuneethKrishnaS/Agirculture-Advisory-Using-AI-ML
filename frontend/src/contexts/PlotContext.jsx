import React, { createContext, useState, useEffect, useContext } from 'react';

export const PlotContext = createContext();

export const usePlotContext = () => useContext(PlotContext);

export const PlotProvider = ({ children }) => {
  const [history, setHistory] = useState([]);
  const [savedPlots, setSavedPlots] = useState([]);
  const [activePlotId, setActivePlotId] = useState(null);
  const [activePlot, setActivePlot] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

        // If we have an activePlotId, update the activePlot object
        if (activePlotId) {
          const found = data.find(p => p.id === activePlotId);
          setActivePlot(found || null);
        } else if (data.length > 0) {
          // Default to the first plot if none selected
          setActivePlotId(data[0].id);
          setActivePlot(data[0]);
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
    if (history.length > 0) {
      const found = history.find(p => p.id === activePlotId);
      setActivePlot(found || null);
    }
  }, [activePlotId, history]);

  return (
    <PlotContext.Provider value={{
      history,
      activePlotId,
      activePlot,
      savedPlots,
      setSavedPlots,
      setActivePlotId,
      fetchHistory,
      isLoading
    }}>
      {children}
    </PlotContext.Provider>
  );
};
