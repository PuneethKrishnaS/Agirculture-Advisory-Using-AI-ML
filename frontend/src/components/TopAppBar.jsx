import React from 'react';
import { usePlotContext } from '../contexts/PlotContext';

const TopAppBar = ({ onPlotSelect }) => {
  const { history, savedPlots, activePlotId, setActivePlotId } = usePlotContext();

  const plots = savedPlots && savedPlots.length > 0 ? savedPlots : history || [];

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-background border-b border-border shadow-sm h-16 flex justify-between items-center px-4 md:px-8">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
        <h1 className="text-xl font-bold text-primary tracking-tight hidden md:block">AgriSmart AI Labs</h1>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        {plots && plots.length > 0 ? (
          <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full border border-border">
            <span className="material-symbols-outlined text-muted-foreground text-sm">location_on</span>
            <select 
              value={activePlotId || ''} 
              onChange={(e) => {
                if (onPlotSelect) {
                  onPlotSelect(e);
                } else {
                  setActivePlotId(e.target.value);
                }
              }}
              className="bg-transparent border-none outline-none text-sm font-medium text-foreground cursor-pointer pr-4 appearance-none"
              style={{ WebkitAppearance: 'none', background: 'transparent' }}
            >
              <option value="" disabled>Select Location...</option>
              {plots.map(plot => (
                <option key={plot.id} value={plot.id}>
                  {plot.name || plot.location}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined text-muted-foreground text-sm pointer-events-none -ml-4">arrow_drop_down</span>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground italic hidden md:block">No plots available</div>
        )}
      </div>
    </header>
  );
};

export default TopAppBar;
