import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const BottomNavBar = () => {
  const location = useLocation();

  const getLinkClasses = (path) => {
    const isActive = location.pathname.startsWith(path);
    return `flex flex-col items-center justify-center px-4 py-1 transition-all ${
      isActive 
        ? 'bg-primary-container text-on-primary-container rounded-full scale-105 duration-150' 
        : 'text-on-surface-variant hover:bg-surface-container-high hover:rounded-xl'
    }`;
  };

  const getIconClasses = (path) => {
    const isActive = location.pathname.startsWith(path);
    return `material-symbols-outlined ${isActive ? 'text-primary' : ''}`;
  };
  
  const getIconFill = (path) => {
    return location.pathname.startsWith(path) ? { fontVariationSettings: "'FILL' 1" } : {};
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 pb-safe bg-background rounded-t-xl shadow-lg border-t border-border">
      <Link to="/dashboard" className={getLinkClasses('/dashboard')}>
        <span className={getIconClasses('/dashboard')} style={getIconFill('/dashboard')}>home</span>
        <span className="text-xs font-medium mt-1">Home</span>
      </Link>
      
      <Link to="/input" className={getLinkClasses('/input')}>
        <span className={getIconClasses('/input')} style={getIconFill('/input')}>edit_document</span>
        <span className="text-xs font-medium mt-1">Input</span>
      </Link>
      
      <Link to="/advisory" className={getLinkClasses('/advisory')}>
        <span className={getIconClasses('/advisory')} style={getIconFill('/advisory')}>psychology</span>
        <span className="text-xs font-medium mt-1">Advisory</span>
      </Link>
      
      <Link to="/alerts" className={`${getLinkClasses('/alerts')} relative`}>
        <span className={getIconClasses('/alerts')} style={getIconFill('/alerts')}>notifications</span>
        <span className="text-xs font-medium mt-1">Alerts</span>
        <span className="absolute top-1 right-3 w-2 h-2 bg-destructive rounded-full shadow-sm"></span>
      </Link>
      
      <Link to="/reports" className={getLinkClasses('/reports')}>
        <span className={getIconClasses('/reports')} style={getIconFill('/reports')}>analytics</span>
        <span className="text-xs font-medium mt-1">Reports</span>
      </Link>
    </nav>
  );
};

export default BottomNavBar;
