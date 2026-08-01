import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TopAppBar from '../components/TopAppBar';
import BottomNavBar from '../components/BottomNavBar';

const Alerts = () => {
  const [activeCategory, setActiveCategory] = useState('All Alerts');
  const [alerts, setAlerts] = useState([]);
  const [markedRead, setMarkedRead] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/alerts')
      .then(res => res.json())
      .then(data => setAlerts(data))
      .catch(err => console.error("Error fetching alerts:", err));
  }, []);

  const handleDismiss = (id) => {
    fetch(`http://localhost:5000/api/alerts/${id}/dismiss`, { method: 'POST' })
      .then(() => {
        setAlerts(alerts.filter(alert => alert.id !== id));
      })
      .catch(err => console.error("Error dismissing alert:", err));
  };

  const handleMarkAllRead = () => {
    setMarkedRead(true);
    // Ideally we would send a batch dismiss to the backend here,
    // but for now we'll just clear the local UI.
    alerts.forEach(a => handleDismiss(a.id));
    setTimeout(() => {
      setMarkedRead(false);
    }, 2000);
  };

  const filteredAlerts = activeCategory === 'All Alerts' ? alerts : alerts.filter(a => a.category === activeCategory);

  const getAlertStyles = (type) => {
    switch(type) {
      case 'critical': return 'border-error text-error bg-error-container';
      case 'warning': return 'border-tertiary text-on-tertiary-fixed-variant bg-tertiary-fixed';
      case 'weather': return 'border-secondary text-on-secondary-fixed-variant bg-secondary-fixed';
      case 'advisory': return 'border-primary text-on-primary-fixed-variant bg-primary-fixed';
      default: return '';
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-32">
      <TopAppBar />

      <main className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-lg grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Header & Category Chips */}
        <section className="lg:col-span-12 space-y-md">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-label-lg font-label-lg text-primary uppercase tracking-wider mb-xs">Active Monitoring</p>
              <h2 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg text-on-surface">Alerts & Notifications</h2>
            </div>
            <button 
              onClick={handleMarkAllRead}
              className={`flex items-center gap-2 text-on-secondary px-lg py-sm rounded-full font-label-lg hover:opacity-90 active:scale-95 transition-all ${markedRead ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-secondary'}`}
            >
              <span translate="no" className="material-symbols-outlined notranslate text-[20px]">done_all</span>
              {markedRead ? 'All Marked Read' : 'Mark All as Read'}
            </button>
          </div>
          <div className="flex gap-sm overflow-x-auto pb-2 custom-scrollbar" style={{ scrollbarWidth: 'thin' }}>
            {['All Alerts', 'Irrigation', 'Pest/Disease', 'Weather'].map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-lg py-2 rounded-full font-label-lg whitespace-nowrap active:scale-95 transition-transform ${activeCategory === cat ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Notification Feed */}
        <section className="lg:col-span-8 space-y-md">
          {filteredAlerts.length === 0 ? (
             <div className="text-center p-12 text-on-surface-variant">
               No alerts in this category.
             </div>
          ) : filteredAlerts.map(alert => {
            const styles = getAlertStyles(alert.type);
            const borderColor = styles.split(' ')[0];
            const textColor = styles.split(' ')[1];
            const bgColor = styles.split(' ')[2];
            
            return (
              <div key={alert.id} className={`bg-surface-container-lowest border-l-4 ${borderColor} p-md rounded-xl shadow-[0px_4px_20px_rgba(78,52,46,0.08)] flex gap-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[0px_8px_30px_rgba(78,52,46,0.12)]`}>
                <div className={`flex-shrink-0 w-12 h-12 rounded-full ${bgColor} flex items-center justify-center ${textColor}`}>
                  <span translate="no" className="material-symbols-outlined notranslate">{alert.icon}</span>
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-xs">
                    <h3 className="text-label-lg font-bold text-on-surface">{alert.title}</h3>
                    <span className="text-label-md text-on-surface-variant">{alert.time}</span>
                  </div>
                  <p className="text-body-md text-on-surface-variant mb-md">{alert.message}</p>
                  
                  {alert.type === 'critical' && (
                    <div className="flex gap-sm">
                      <button className="bg-error text-on-error px-md py-xs rounded-lg text-label-md font-semibold">View Diagnostics</button>
                      <button onClick={() => handleDismiss(alert.id)} className="border border-outline-variant text-on-surface px-md py-xs rounded-lg text-label-md hover:bg-surface-container-low transition-colors">Dismiss</button>
                    </div>
                  )}
                  {alert.type === 'warning' && (
                    <div className="flex gap-sm">
                      <button className="bg-tertiary text-on-tertiary px-md py-xs rounded-lg text-label-md font-semibold">Open Report</button>
                      <button onClick={() => handleDismiss(alert.id)} className="border border-outline-variant text-on-surface px-md py-xs rounded-lg text-label-md hover:bg-surface-container-low transition-colors">Mute Sector</button>
                    </div>
                  )}
                  {alert.type === 'weather' && (
                    <div className="flex gap-sm">
                      <button className="bg-secondary text-on-secondary px-md py-xs rounded-lg text-label-md font-semibold">View Forecast</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </section>

        {/* Delivery Preferences Sidebar */}
        <aside className="lg:col-span-4 space-y-gutter">
          <div className="bg-surface-container-low p-lg rounded-2xl border border-outline-variant/10 shadow-sm">
            <div className="flex items-center gap-2 mb-lg">
              <span translate="no" className="material-symbols-outlined notranslate text-primary">settings</span>
              <h3 className="text-headline-md font-headline-md text-on-surface">Delivery Preferences</h3>
            </div>
            <div className="space-y-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-label-lg font-bold text-on-surface">Push Notifications</p>
                  <p className="text-label-md text-on-surface-variant">Real-time alerts on your device</p>
                </div>
                <label className="relative inline-block w-[52px] h-[32px]">
                  <input defaultChecked type="checkbox" className="peer opacity-0 w-0 h-0" />
                  <span className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-[#c0c9bb] transition-all duration-400 rounded-[34px] peer-checked:bg-[#1b5e20] before:absolute before:content-[''] before:h-[24px] before:w-[24px] before:left-[4px] before:bottom-[4px] before:bg-white before:transition-all before:duration-400 before:rounded-full peer-checked:before:translate-x-[20px]"></span>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-label-lg font-bold text-on-surface">SMS Alerts</p>
                  <p className="text-label-md text-on-surface-variant">Critical notifications via text</p>
                </div>
                <label className="relative inline-block w-[52px] h-[32px]">
                  <input type="checkbox" className="peer opacity-0 w-0 h-0" />
                  <span className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-[#c0c9bb] transition-all duration-400 rounded-[34px] peer-checked:bg-[#1b5e20] before:absolute before:content-[''] before:h-[24px] before:w-[24px] before:left-[4px] before:bottom-[4px] before:bg-white before:transition-all before:duration-400 before:rounded-full peer-checked:before:translate-x-[20px]"></span>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-label-lg font-bold text-on-surface">Email Reports</p>
                  <p className="text-label-md text-on-surface-variant">Daily summaries and advisory</p>
                </div>
                <label className="relative inline-block w-[52px] h-[32px]">
                  <input defaultChecked type="checkbox" className="peer opacity-0 w-0 h-0" />
                  <span className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-[#c0c9bb] transition-all duration-400 rounded-[34px] peer-checked:bg-[#1b5e20] before:absolute before:content-[''] before:h-[24px] before:w-[24px] before:left-[4px] before:bottom-[4px] before:bg-white before:transition-all before:duration-400 before:rounded-full peer-checked:before:translate-x-[20px]"></span>
                </label>
              </div>
            </div>
            
            <hr className="my-lg border-outline-variant/20" />
            
            <div className="space-y-md">
              <h4 className="text-label-lg font-bold text-on-surface">Quiet Hours</h4>
              <p className="text-label-md text-on-surface-variant">Mute non-critical alerts during specific times.</p>
              <div className="flex gap-2 items-center">
                <input className="bg-surface rounded-lg border-outline-variant text-label-md p-2 w-full focus:outline-none focus:border-secondary focus:border-2" type="time" defaultValue="22:00" />
                <span className="text-on-surface-variant">to</span>
                <input className="bg-surface rounded-lg border-outline-variant text-label-md p-2 w-full focus:outline-none focus:border-secondary focus:border-2" type="time" defaultValue="06:00" />
              </div>
            </div>
            
            <button className="w-full mt-lg bg-primary-container text-on-primary-container py-md rounded-xl font-bold hover:brightness-110 active:scale-95 transition-all">
              Save Preferences
            </button>
          </div>

          {/* Ad/Insight Card */}
          <div className="relative overflow-hidden rounded-2xl aspect-video group">
            <img 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              alt="Predictive Pest Modeling"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1BVVvHi600MDGXH7OhblEoEy9dRxoZDlWDIqsGkKexkzPeOrD0MG6fCwCh1A1Pe6xpc9RVfD8K91JEH8BUKsT71pS5yvTBD0WSHh5NejSpMUUO86CNBdx2VI1eQgff6JOuLRnqT7JJXymtn6dSsML3UTKTty1QF65n9DKyjZulJbtInVkosJn63RMRqavqOt7Xu0A8G9bXfwq_DCjrR69q3wdYHCCa3mjaQTO4RdzTMsObFt__xH_k4_8ex7Beei3QMW_a5b3qfPR"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 to-transparent p-lg flex flex-col justify-end">
              <p className="text-surface-variant text-label-md font-bold mb-xs">Pro Feature</p>
              <h4 className="text-surface text-label-lg font-bold">Predictive Pest Modeling</h4>
              <p className="text-surface/80 text-label-md">Get alerts up to 48 hours before an outbreak.</p>
            </div>
          </div>
        </aside>
      </main>

      <BottomNavBar />
    </div>
  );
};

export default Alerts;
